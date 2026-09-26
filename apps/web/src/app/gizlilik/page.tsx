'use client'

import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import Link from 'next/link'

export default function Gizlilik() {
    return (
        <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col">
            <Header />

            <main className="pt-24 pb-32 px-4 md:px-6 lg:px-10 max-w-4xl mx-auto w-full flex-grow">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary mb-4 no-underline">
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Ana Sayfaya Dön
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface mb-2">
                        Gizlilik Politikası
                    </h1>
                    <p className="text-sm text-on-surface-variant">
                        Son güncelleme: 1 Haziran 2026
                    </p>
                </div>

                <div className="prose prose-sm max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">info</span>
                            1. Genel Bilgi
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed mb-4">
                            Sahiplendir platformu olarak, kullanıcılarımızın gizliliğini korumak en önemli önceliklerimizden biridir. 
                            Bu gizlilik politikası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında, 
                            hangi kişisel verileri topladığımızı, bu verileri nasıl işlediğimizi ve haklarınızı açıklamaktadır.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">database</span>
                            2. Topladığımız Veriler
                        </h2>
                        <div className="bg-surface-container-low rounded-xl p-6 space-y-4">
                            <div>
                                <h3 className="font-bold text-on-surface mb-2">Kimlik ve İletişim Verileri</h3>
                                <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                                    <li>E-posta adresi</li>
                                    <li>Ad ve soyad</li>
                                    <li>Telefon numarası (opsiyonel)</li>
                                    <li>Profil fotoğrafı (opsiyonel)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-on-surface mb-2">İlan Verileri</h3>
                                <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                                    <li>Hayvan bilgileri (tür, ırk, yaş, cinsiyet)</li>
                                    <li>Sağlık durumu (aşı, kısırlaştırma, parazit tedavisi)</li>
                                    <li>Konum bilgisi (şehir, ilçe)</li>
                                    <li>İlan fotoğrafları</li>
                                    <li>İlan açıklamaları</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-on-surface mb-2">Mesajlaşma Verileri</h3>
                                <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                                    <li>Gönderilen ve alınan mesajlar</li>
                                    <li>Mesaj zaman damgaları</li>
                                    <li>Okunma durumu</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-on-surface mb-2">Teknik Veriler</h3>
                                <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                                    <li>IP adresi</li>
                                    <li>Tarayıcı ve cihaz bilgileri</li>
                                    <li>Çerezler (cookies)</li>
                                    <li>Platform kullanım istatistikleri</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">settings</span>
                            3. Verilerin Kullanım Amaçları
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-on-surface-variant">
                            <li>Hesap oluşturma ve yönetimi</li>
                            <li>İlan yayınlama ve görüntüleme</li>
                            <li>Kullanıcılar arası mesajlaşma</li>
                            <li>Güvenlik ve dolandırıcılık önleme</li>
                            <li>Platform iyileştirmeleri ve istatistikler</li>
                            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">share</span>
                            4. Veri Paylaşımı
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed mb-4">
                            Kişisel verileriniz aşağıdaki durumlarda üçüncü taraflarla paylaşılabilir:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-on-surface-variant">
                            <li><strong>Diğer kullanıcılar:</strong> İlanlarınızda paylaştığınız bilgiler (ad, fotoğraf, konum) herkese açıktır</li>
                            <li><strong>Hizmet sağlayıcılar:</strong> Supabase (veritabanı ve kimlik doğrulama), Vercel (hosting)</li>
                            <li><strong>Yasal zorunluluklar:</strong> Mahkeme kararları veya yasal talepler doğrultusunda</li>
                        </ul>
                        <p className="text-on-surface-variant leading-relaxed mt-4">
                            Verileriniz <strong>ticari amaçla satılmaz</strong> veya reklam amaçlı kullanılmaz.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">schedule</span>
                            5. Veri Saklama Süresi
                        </h2>
                        <div className="bg-surface-container-low rounded-xl p-6">
                            <ul className="space-y-2 text-on-surface-variant">
                                <li><strong>Hesap verileri:</strong> Hesabınız aktif olduğu sürece saklanır</li>
                                <li><strong>İlan verileri:</strong> İlan aktifken saklanır, silindiğinde 30 gün içinde tamamen kaldırılır</li>
                                <li><strong>Mesajlar:</strong> Tarafların hesabı aktifken saklanır</li>
                                <li><strong>Fotoğraflar:</strong> İlan veya hesap silindiğinde otomatik olarak silinir</li>
                                <li><strong>Log kayıtları:</strong> Güvenlik amacıyla 1 yıl saklanır</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">gavel</span>
                            6. KVKK Kapsamındaki Haklarınız
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed mb-4">
                            KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-on-surface-variant">
                            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                            <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                            <li>Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
                            <li>KVKK&apos;nın 7. maddesi kapsamında silinmesini veya yok edilmesini isteme</li>
                            <li>Düzeltme, silme veya yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                            <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                            <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">cookie</span>
                            7. Çerez (Cookie) Politikası
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed mb-4">
                            Platformumuz aşağıdaki çerezleri kullanmaktadır:
                        </p>
                        <div className="bg-surface-container-low rounded-xl p-6 space-y-3">
                            <div>
                                <h3 className="font-bold text-on-surface mb-1">Zorunlu Çerezler</h3>
                                <p className="text-sm text-on-surface-variant">
                                    Kimlik doğrulama (authentication) çerezleri - Platforma giriş yapabilmeniz için gereklidir.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-on-surface mb-1">Tercih Çerezleri</h3>
                                <p className="text-sm text-on-surface-variant">
                                    Çerez onay tercihinizi saklamak için kullanılır.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">security</span>
                            8. Veri Güvenliği
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed mb-4">
                            Verilerinizi korumak için aşağıdaki güvenlik önlemlerini uyguluyoruz:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-on-surface-variant">
                            <li>TLS/SSL şifreleme ile güvenli veri iletimi</li>
                            <li>Veritabanı erişim kontrolleri (Row Level Security)</li>
                            <li>Düzenli güvenlik güncellemeleri</li>
                            <li>Dolandırıcılık tespit sistemleri</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">mail</span>
                            9. İletişim
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed">
                            Gizlilik politikamız hakkında sorularınız veya KVKK kapsamındaki haklarınızı kullanmak için:
                        </p>
                        <div className="bg-primary-container/20 rounded-xl p-6 mt-4">
                            <p className="text-on-surface font-semibold mb-2">Sahiplendir Platformu</p>
                            <p className="text-on-surface-variant">
                                E-posta: gizlilik@sahiplendir.tr<br />
                                Web: sahiplendir.tr/gizlilik
                            </p>
                        </div>
                    </section>

                    <section className="border-t border-outline-variant/20 pt-8 mt-8">
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                            Bu gizlilik politikası, yürürlükteki yasal düzenlemelere uygun olarak güncellenebilir. 
                            Önemli değişiklikler durumunda kullanıcılarımıza bildirim yapılacaktır.
                        </p>
                    </section>
                </div>
            </main>

            <BottomNav />
        </div>
    )
}
