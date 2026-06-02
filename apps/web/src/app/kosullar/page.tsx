'use client'

import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import Link from 'next/link'

export default function Kosullar() {
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
                        Kullanım Koşulları
                    </h1>
                    <p className="text-sm text-on-surface-variant">
                        Son güncelleme: 1 Haziran 2026
                    </p>
                </div>

                <div className="prose prose-sm max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">description</span>
                            1. Genel Hükümler
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed mb-4">
                            Sahiplendir platformunu kullanarak, aşağıdaki kullanım koşullarını kabul etmiş olursunuz. 
                            Bu koşulları kabul etmiyorsanız, platformu kullanmayınız.
                        </p>
                        <div className="bg-surface-container-low rounded-xl p-6 space-y-3">
                            <p className="text-on-surface-variant">
                                <strong>Platform Tanımı:</strong> Sahiplendir, hayvan sahiplendirme ilanlarının yayınlandığı, 
                                kullanıcıların birbirleriyle iletişim kurabildiği bir aracı platformdur.
                            </p>
                            <p className="text-on-surface-variant">
                                <strong>Kullanıcı:</strong> Platforma kayıt olan ve/veya platformu kullanan gerçek veya tüzel kişiler.
                            </p>
                            <p className="text-on-surface-variant">
                                <strong>İlan:</strong> Kullanıcılar tarafından oluşturulan hayvan sahiplendirme ilanları.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">person_add</span>
                            2. Hesap Oluşturma ve Kullanıcı Sorumlulukları
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-on-surface-variant">
                            <li>Hesap oluştururken doğru ve güncel bilgi vermelisiniz</li>
                            <li>Hesap bilgilerinizin güvenliğinden siz sorumlusunuz</li>
                            <li>Hesabınızın üçüncü kişiler tarafından kullanılmasından siz sorumlusunuz</li>
                            <li>18 yaşından küçükler, veli veya vasi izni olmadan hesap oluşturamaz</li>
                            <li>Bir kişi birden fazla hesap oluşturamaz</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">pets</span>
                            3. İlan Kuralları
                        </h2>
                        <div className="bg-surface-container-low rounded-xl p-6 space-y-4">
                            <div>
                                <h3 className="font-bold text-on-surface mb-2">İlan Oluşturma Koşulları</h3>
                                <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                                    <li>Yalnızca <strong>ücretsiz sahiplendirme</strong> ilanları yayınlanabilir</li>
                                    <li>Ticari amaçlı hayvan satışı <strong>kesinlikle yasaktır</strong></li>
                                    <li>İlanlarda doğru ve eksiksiz bilgi verilmelidir</li>
                                    <li>Hayvanın sağlık durumu, yaşı ve özellikleri doğru beyan edilmelidir</li>
                                    <li>Minimum yaş sınırlamalarına uyulmalıdır (köpek: 2 ay, kedi: 3 ay)</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-on-surface mb-2">İlan Limitleri</h3>
                                <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                                    <li>Bireysel kullanıcılar: Maksimum 10 aktif ilan</li>
                                    <li>Kurumsal kullanıcılar: Maksimum 50 aktif ilan</li>
                                    <li>Limit aşımı durumunda yeni ilan oluşturulamaz</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-on-surface mb-2">Yasaklı İçerikler</h3>
                                <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                                    <li>Fiyat, ücret, kapora, depozito gibi ticari ifadeler</li>
                                    <li>Yasadışı veya tehlikeli hayvan türleri</li>
                                    <li>Yanıltıcı veya sahte bilgiler</li>
                                    <li>Müstehcen, saldırgan veya ayrımcı içerikler</li>
                                    <li>Başka kişilere ait fotoğraf veya bilgiler</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">chat</span>
                            4. Mesajlaşma Kuralları
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-on-surface-variant">
                            <li>Mesajlaşma yalnızca sahiplendirme süreciyle ilgili olmalıdır</li>
                            <li>Spam, reklam veya ticari teklifler göndermek yasaktır</li>
                            <li>Taciz, tehdit veya hakaret içeren mesajlar göndermek yasaktır</li>
                            <li>Kişisel bilgileri (TC kimlik, adres, banka bilgileri) paylaşmaktan kaçının</li>
                            <li>Ödeme talepleri dolandırıcılık göstergesidir - asla ödeme yapmayın</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">gavel</span>
                            5. Sorumluluk Reddi
                        </h2>
                        <div className="bg-error-container/30 rounded-xl p-6 space-y-4">
                            <p className="text-on-surface-variant leading-relaxed">
                                <strong>ÖNEMLİ:</strong> Sahiplendir platformu yalnızca bir <strong>aracı platformdur</strong>. 
                                Aşağıdaki konularda sorumluluk kabul etmiyoruz:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-on-surface-variant">
                                <li><strong>Hayvan sağlığı:</strong> İlanlarda beyan edilen sağlık durumunun doğruluğu</li>
                                <li><strong>Kullanıcı davranışları:</strong> Kullanıcıların birbirleriyle olan etkileşimleri</li>
                                <li><strong>Sahiplendirme sonuçları:</strong> Hayvanın yeni ortamda uyumu, davranışları</li>
                                <li><strong>Yasal uygunluk:</strong> Hayvanın mülkiyeti, aşı kayıtları, mikroçip durumu</li>
                                <li><strong>Dolandırıcılık:</strong> Platform dışında gerçekleşen dolandırıcılık vakaları</li>
                            </ul>
                            <p className="text-on-surface-variant leading-relaxed mt-4">
                                Kullanıcılar, sahiplendirme sürecini kendi sorumluluklarında yürütürler. 
                                Platform, taraflar arasında herhangi bir garanti veya teminat vermez.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">shield</span>
                            6. Güvenlik ve Dolandırıcılık Önleme
                        </h2>
                        <div className="bg-surface-container-low rounded-xl p-6 space-y-3">
                            <p className="text-on-surface-variant leading-relaxed">
                                Platformumuzda güvenlik önlemleri alınmaktadır:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-on-surface-variant">
                                <li>Otomatik dolandırıcılık tespit sistemleri</li>
                                <li>Güven skoru sistemi (şikayetlerle düşer)</li>
                                <li>İlan ve mesaj içerik kontrolleri</li>
                                <li>Şüpheli aktivite bildirimi</li>
                            </ul>
                            <p className="text-on-surface-variant leading-relaxed mt-4">
                                <strong>Önemli Uyarılar:</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-on-surface-variant">
                                <li>Hayvanı görmeden <strong>asla ödeme yapmayın</strong></li>
                                <li>Kapora, depozito veya ön ödeme taleplerine itibar etmeyin</li>
                                <li>Kişisel bilgilerinizi (TC kimlik, adres) paylaşmayın</li>
                                <li>İlk buluşmayı herkese açık bir yerde yapın</li>
                                <li>Şüpheli ilanları raporlayın</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">report</span>
                            7. Şikayet ve İhlal Bildirimi
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed mb-4">
                            Aşağıdaki durumlarda şikayet oluşturabilirsiniz:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-on-surface-variant">
                            <li>Ticari satış şüphesi</li>
                            <li>Yanıltıcı veya sahte ilan</li>
                            <li>Dolandırıcılık girişimi</li>
                            <li>Uygunsuz içerik</li>
                            <li>Taciz veya kötü muamele</li>
                        </ul>
                        <p className="text-on-surface-variant leading-relaxed mt-4">
                            Şikayetler incelenir ve ihlal tespit edilmesi durumunda:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-on-surface-variant">
                            <li>İlan kaldırılabilir</li>
                            <li>Güven skoru düşürülür</li>
                            <li>Hesap askıya alınabilir veya kapatılabilir</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">cancel</span>
                            8. Hesap Sonlandırma
                        </h2>
                        <div className="bg-surface-container-low rounded-xl p-6 space-y-3">
                            <p className="text-on-surface-variant leading-relaxed">
                                <strong>Kullanıcı tarafından:</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                                <li>İstediğiniz zaman hesabınızı silebilirsiniz</li>
                                <li>Hesap silindiğinde tüm verileriniz 30 gün içinde kaldırılır</li>
                            </ul>
                            <p className="text-on-surface-variant leading-relaxed mt-4">
                                <strong>Platform tarafından:</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                                <li>Kullanım koşullarının ihlali</li>
                                <li>Yasadışı faaliyet</li>
                                <li>3 veya daha fazla geçerli şikayet</li>
                                <li>Uzun süreli hareketsizlik (2 yıl)</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">copyright</span>
                            9. Fikri Mülkiyet
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed">
                            Platformun tasarımı, logosu, yazılımı ve içeriği Sahiplendir'e aittir. 
                            Kullanıcılar tarafından yüklenen ilanlar ve fotoğraflar, kullanıcıların mülkiyetindedir. 
                            Platform izinsiz kopyalanamaz veya çoğaltılamaz.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">balance</span>
                            10. Uyuşmazlık Çözümü
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed mb-4">
                            Bu kullanım koşullarından doğacak uyuşmazlıklarda:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-on-surface-variant">
                            <li>Türkiye Cumhuriyeti kanunları uygulanır</li>
                            <li>Yetkili mahkemeler Türkiye'deki mahkemelerdir</li>
                            <li>Uyuşmazlıklar öncelikle uzlaşma yoluyla çözülmeye çalışılır</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">update</span>
                            11. Değişiklikler
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed">
                            Sahiplendir, bu kullanım koşullarını önceden bildirimde bulunmaksızın değiştirme hakkını saklı tutar. 
                            Önemli değişiklikler platform üzerinden duyurulur. Değişikliklerden sonra platformu kullanmaya devam etmeniz, 
                            yeni koşulları kabul ettiğiniz anlamına gelir.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">mail</span>
                            12. İletişim
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed">
                            Kullanım koşulları hakkında sorularınız için:
                        </p>
                        <div className="bg-primary-container/20 rounded-xl p-6 mt-4">
                            <p className="text-on-surface font-semibold mb-2">Sahiplendir Platformu</p>
                            <p className="text-on-surface-variant">
                                E-posta: destek@sahiplendir.tr<br />
                                Web: sahiplendir.tr/kosullar
                            </p>
                        </div>
                    </section>

                    <section className="border-t border-outline-variant/20 pt-8 mt-8">
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                            Bu kullanım koşullarını kabul ederek, platformu yasalara uygun ve iyi niyet çerçevesinde kullanacağınızı beyan edersiniz.
                        </p>
                    </section>
                </div>
            </main>

            <BottomNav />
        </div>
    )
}
