import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'
import type { Database } from '@/lib/database.types'

async function removeStoragePrefix(
    client: SupabaseClient<Database, 'public'>,
    bucket: string,
    prefix: string,
): Promise<void> {
    const { data, error } = await client.storage.from(bucket).list(prefix, { limit: 1000 })
    if (error) throw error

    const files: string[] = []
    for (const entry of data ?? []) {
        const path = `${prefix}/${entry.name}`
        if (entry.id) {
            files.push(path)
        } else {
            await removeStoragePrefix(client, bucket, path)
        }
    }

    if (files.length > 0) {
        const { error: removeError } = await client.storage.from(bucket).remove(files)
        if (removeError) throw removeError
    }
}

export async function POST(request: Request) {
    const requestOrigin = request.headers.get('origin')
    const allowedOrigins = new Set<string>()
    for (const value of [process.env.NEXT_PUBLIC_SITE_URL, new URL(request.url).origin]) {
        if (!value) continue
        try { allowedOrigins.add(new URL(value).origin) } catch { /* invalid configuration is ignored */ }
    }
    if (!requestOrigin || !allowedOrigins.has(requestOrigin)) {
        return NextResponse.json({ error: 'Geçersiz istek kaynağı.' }, { status: 403 })
    }

    const supabase = await createServerSupabase()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 })
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        console.error('Hesap silme için SUPABASE_SERVICE_ROLE_KEY eksik.')
        return NextResponse.json({ error: 'Hesap silme servisi yapılandırılmamış.' }, { status: 500 })
    }

    const { error: rpcError } = await supabase.rpc('delete_user_account')
    if (rpcError) {
        console.error('Hesap silme RPC başarısız:', rpcError)
        return NextResponse.json({ error: 'Hesap silinemedi.' }, { status: 400 })
    }

    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    let storageCleanupPending = false
    try {
        await removeStoragePrefix(adminClient, 'listing-media', user.id)
        await removeStoragePrefix(adminClient, 'avatars', user.id)
    } catch (storageError) {
        storageCleanupPending = true
        console.error('Hesap silme sonrası Storage temizliği başarısız:', storageError)
    }

    const { error: adminError } = await adminClient.auth.admin.deleteUser(user.id)
    if (adminError) {
        console.error('Supabase Auth kullanıcı silme başarısız:', adminError)
        return NextResponse.json({ error: 'Hesap silinemedi.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, storageCleanupPending })
}
