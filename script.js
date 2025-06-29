// Kodun, tüm HTML dökümanı yüklendikten sonra çalışmasını garantile
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DOM ELEMENTLERİNİ SEÇME ---
    const heroView = document.getElementById('hero-view');
    const examListView = document.getElementById('exam-list-view');
    const courseContentView = document.getElementById('course-content-view');
    const showExamsBtn = document.getElementById('show-exams-btn');
    const backToHeroBtn = document.getElementById('back-to-hero-btn');
    const backToExamsBtn = document.getElementById('back-to-exams-btn');
    const examListContainer = document.querySelector('.exam-list');
    const courseContentContainer = document.getElementById('course-content-container');
    const courseTitleElement = document.getElementById('course-title');

    // --- YENİ: İÇERİK ÖNBELLEĞİ (CACHE) ---
    // Yüklenen ders içeriklerini burada saklayarak tekrar tekrar fetch yapmayı önleyeceğiz.
    const courseContentCache = new Map();


    // --- 2. ANA FONKSİYONLAR ---
    
    function showView(viewToShow) {
        heroView.classList.remove('active-view');
        examListView.classList.remove('active-view');
        courseContentView.classList.remove('active-view');
        viewToShow.classList.add('active-view');
    }

    function initAccordion() {
        // Bu fonksiyonu her içerik yüklendiğinde yeniden kurmamız gerektiği için,
        // eski dinleyicilerin birikmesini önlemek adına event listener'ı yeniden atıyoruz.
        // Bu en basit yöntemdir. Alternatif olarak, bir kere oluşturulup, içerik değişse de
        // delegasyon sayesinde çalışmaya devam eder. Mevcut kodunuz zaten bu şekilde ve doğru.
        // Bu yüzden bu fonksiyonda değişiklik yapmaya gerek yok.
        const container = courseContentContainer; // Kapsayıcıyı bir değişkene alalım
        
        // Önceki olası dinleyicileri temizlemek yerine (ki bu daha karmaşık olabilir),
        // mevcut delegasyon yapınız zaten doğru çalışıyor. Sadece her seferinde
        // çağrıldığından emin olalım.
        
        container.onclick = (event) => { // .addEventListener yerine .onclick kullanarak eskiyi eziyoruz.
            const header = event.target.closest('.accordion-header');
            if (!header) return;

            const accordionItem = header.parentElement;
            const allItems = container.querySelectorAll('.accordion-item');

            allItems.forEach(item => {
                if (item !== accordionItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                }
            });

            accordionItem.classList.toggle('active');
        };
    }

    /**
     * Verilen URL'den ders içeriğini asenkron olarak çeker ve sayfaya yerleştirir.
     * (ÖNBELLEKLEME MEKANİZMASI EKLENMİŞ VERSİYON)
     * @param {string} url - Yüklenecek HTML parçasının dosya yolu.
     * @param {string} title - Ders sayfasında gösterilecek başlık.
     */
    async function loadCourseContent(url, title) {
        courseTitleElement.textContent = title;

        // 1. Adım: İçeriğin önbellekte olup olmadığını kontrol et
        if (courseContentCache.has(url)) {
            const contentHtml = courseContentCache.get(url);
            courseContentContainer.innerHTML = contentHtml;
            showView(courseContentView);
            initAccordion();
            console.log(`İçerik önbellekten yüklendi: ${url}`);
            return; // Fonksiyondan çık, çünkü işimiz bitti.
        }

        // 2. Adım: İçerik önbellekte yoksa, fetch ile yükle
        try {
            console.log(`İçerik fetch ile çekiliyor: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP Hatası! Durum: ${response.status}`);
            }
            const contentHtml = await response.text();

            // 3. Adım: İçeriği gelecekte kullanmak üzere önbelleğe al
            courseContentCache.set(url, contentHtml);

            // 4. Adım: İçeriği sayfaya yerleştir
            courseContentContainer.innerHTML = contentHtml;
            showView(courseContentView);
            initAccordion();

        } catch (error) {
            console.error('Ders içeriği yüklenirken bir sorun oluştu:', error);
            alert('Ders içeriği yüklenemedi. Lütfen geliştirici konsolunu (F12) kontrol edin.');
        }
    }


    // --- 3. OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ---
    showExamsBtn.addEventListener('click', () => {
        showView(examListView);
    });

    backToHeroBtn.addEventListener('click', (event) => {
        event.preventDefault();
        showView(heroView);
    });

    backToExamsBtn.addEventListener('click', () => {
        showView(examListView);
    });

    examListContainer.addEventListener('click', (event) => {
        const listItem = event.target.closest('li');
        if (listItem) {
            const contentUrl = listItem.dataset.contentUrl;
            const examTitle = listItem.dataset.examTitle;
            if (contentUrl && examTitle) {
                loadCourseContent(contentUrl, examTitle);
            }
        }
    });


    // --- 4. BAŞLANGIÇ DURUMU ---
    showView(heroView);

});
