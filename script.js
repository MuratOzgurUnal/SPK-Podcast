// Kodun, tüm HTML dökümanı yüklendikten sonra çalışmasını garantile
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DOM ELEMENTLERİNİ SEÇME ---
    // Gerekli tüm HTML elemanlarını seçip değişkenlere atayarak kodun ilerleyen
    // kısımlarında kolayca erişilebilir hale getiriyoruz.

    // Ana Görünümler (Views)
    const heroView = document.getElementById('hero-view');
    const examListView = document.getElementById('exam-list-view');
    const courseContentView = document.getElementById('course-content-view');

    // Butonlar ve Navigasyon Elemanları
    const showExamsBtn = document.getElementById('show-exams-btn');
    const backToHeroBtn = document.getElementById('back-to-hero-btn');
    const backToExamsBtn = document.getElementById('back-to-exams-btn');

    // Dinamik İçerik Alanları
    const examListContainer = document.querySelector('.exam-list');
    const courseContentContainer = document.getElementById('course-content-container');
    const courseTitleElement = document.getElementById('course-title');


    // --- 2. ANA FONKSİYONLAR ---
    // Uygulamanın temel mantığını oluşturan fonksiyonlar.

    /**
     * Belirtilen görünümü aktif hale getirir, diğerlerini gizler.
     * Bu fonksiyon, tek sayfa uygulamasının (SPA) temelini oluşturur.
     * @param {HTMLElement} viewToShow - Gösterilecek olan görünümün (div) elementi.
     */
    function showView(viewToShow) {
        // Önce tüm görünümleri gizleyerek temiz bir başlangıç yap
        heroView.classList.remove('active-view');
        examListView.classList.remove('active-view');
        courseContentView.classList.remove('active-view');
        
        // Sadece gösterilmek istenen görünüme 'active-view' class'ını ekle
        viewToShow.classList.add('active-view');
    }

    /**
     * Akordiyon menüye tıklama işlevselliği kazandırır.
     * Bu fonksiyon, ders içeriği `fetch` ile yüklendikten sonra çağrılmalıdır.
     * Olay delegasyonu (event delegation) tekniği kullanılmıştır.
     */
    function initAccordion() {
        // Akordiyonun ana kapsayıcısına tek bir 'click' dinleyicisi ekliyoruz.
        courseContentContainer.addEventListener('click', (event) => {
            // Tıklanan elemanın bir .accordion-header olup olmadığını kontrol et
            const header = event.target.closest('.accordion-header');

            // Eğer bir başlığa tıklanmadıysa, fonksiyondan çık
            if (!header) {
                return;
            }

            const accordionItem = header.parentElement;

            // Kullanıcı deneyimini iyileştirmek için:
            // Tıklanan akordiyon haricindeki tüm açık akordiyonları kapat.
            const allItems = courseContentContainer.querySelectorAll('.accordion-item');
            allItems.forEach(item => {
                if (item !== accordionItem) {
                    item.classList.remove('active');
                }
            });

            // Tıklanan akordiyonun 'active' class'ını değiştir (açıksa kapat, kapalıysa aç).
            accordionItem.classList.toggle('active');
        });
    }

    /**
     * Verilen URL'den ders içeriğini asenkron olarak çeker ve sayfaya yerleştirir.
     * @param {string} url - Yüklenecek HTML parçasının dosya yolu (örn: 'spk-level1.html').
     * @param {string} title - Ders sayfasında gösterilecek başlık.
     */
    async function loadCourseContent(url, title) {
        try {
            // 1. fetch API'si ile HTML içeriğini talep et
            const response = await fetch(url);
            
            // Eğer istek başarısız olursa (örn: dosya bulunamadı - 404), hata fırlat
            if (!response.ok) {
                throw new Error(`HTTP Hatası! Durum: ${response.status}`);
            }

            // 2. Gelen cevabı metin olarak al
            const contentHtml = await response.text();

            // 3. Ders başlığını ve içeriğini ilgili HTML elemanlarına yerleştir
            courseTitleElement.textContent = title;
            courseContentContainer.innerHTML = contentHtml;

            // 4. İçerik yüklendiğine göre, ders içeriği görünümünü aktif hale getir
            showView(courseContentView);

            // 5. ÇOK ÖNEMLİ: Yeni yüklenen dinamik HTML içeriği için akordiyon
            // işlevselliğini başlat. Bu adım olmadan akordiyonlar çalışmaz.
            initAccordion();

        } catch (error) {
            // Hata durumunda konsola detaylı bilgi yaz ve kullanıcıyı uyar
            console.error('Ders içeriği yüklenirken bir sorun oluştu:', error);
            alert('Ders içeriği yüklenemedi. Lütfen geliştirici konsolunu (F12) kontrol edin.');
        }
    }


    // --- 3. OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ---
    // Kullanıcı etkileşimlerini yakalayıp ilgili fonksiyonları tetikler.

    // "Sınavları Görüntüle" butonuna tıklandığında sınav listesi görünümüne geç
    showExamsBtn.addEventListener('click', () => {
        showView(examListView);
    });

    // "Ana Sayfaya Dön" linkine tıklandığında karşılama ekranına dön
    backToHeroBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Linkin varsayılan sayfa yenileme davranışını engelle
        showView(heroView);
    });

    // "Sınav Listesine Dön" butonuna tıklandığında sınav listesi görünümüne dön
    backToExamsBtn.addEventListener('click', () => {
        showView(examListView);
    });

    // Sınav listesindeki bir maddeye tıklandığında ilgili dersi yükle
    // (Olay delegasyonu kullanılıyor)
    examListContainer.addEventListener('click', (event) => {
        const listItem = event.target.closest('li'); // Tıklanan 'li' elemanını bul
        if (listItem) {
            const contentUrl = listItem.dataset.contentUrl;
            const examTitle = listItem.dataset.examTitle;
            
            // Eğer 'li' elemanında gerekli data- attributeları varsa dersi yükle
            if (contentUrl && examTitle) {
                loadCourseContent(contentUrl, examTitle);
            }
        }
    });


    // --- 4. BAŞLANGIÇ DURUMU ---
    // Uygulama ilk açıldığında Karşılama Ekranı'nı göstererek başla.
    showView(heroView);

});