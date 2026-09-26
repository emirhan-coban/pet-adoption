import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'
    const response = NextResponse.redirect(new URL('/', origin))

    if (code) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        )
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Yalnızca aynı origin'e ait, backslash içermeyen yollar kabul edilir.
            // Backslash, bazı URL ayrıştırıcılarında host ayracına dönüşebilir.
            const safeNext = next.startsWith('/') && !next.startsWith('//') && !next.includes('\\')
                ? next
                : '/'
            response.headers.set('Location', new URL(safeNext, origin).toString())
            return response
        }
    }

    return NextResponse.redirect(`${origin}/giris?error=auth_failed`)
}
