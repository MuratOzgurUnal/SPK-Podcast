// script.js dosyasının yeni hali

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

    // --- 2. ANA FONKSİYONLAR ---

    /**
     * Belirtilen görünümü aktif hale getirir, diğerlerini gizler.
     * @param {HTMLElement} viewToShow - Gösterilecek olan görünümün (div) elementi.
     */
    function showView(viewToShow) {
        heroView.classList.remove('active-view');
        examListView.classList.remove('active-view');
        courseContentView.classList.remove('active-view');
        viewToShow.classList.add('active-view');
    }

    /**
     * Akordiyon menüye tıklama işlevselliği kazandırır.
     * BU FONKSİYON SADECE BİR KERE, SAYFA YÜKLENİRKEN ÇAĞRILACAK.
     * Olay delegasyonu (event delegation) sayesinde, sonradan eklenen
     * içeriklerde bile sorunsuz çalışacaktır.
     */
    function initAccordion() {
        courseContentContainer.addEventListener('click', (event) => {
            const header = event.target.closest('.accordion-header');
            if (!header) return;

            const accordionItem = header.parentElement;
            
            // Tıklanan akordiyonun ait olduğu ana içerik bloğundaki diğer akordiyonları bul
            const parentBlock = accordionItem.closest('.course-content-block');
            if (!parentBlock) return;

            const allItems = parentBlock.querySelectorAll('.accordion-item');

            // Sadece tıklanan dışındakileri kapat
            allItems.forEach(item => {
                if (item !== accordionItem) {
                    item.classList.remove('active');
                }
            });

            // Tıklanana 'active' class'ını ekle/kaldır
            accordionItem.classList.toggle('active');
        });
    }

    /**
     * Verilen URL'den ders içeriğini asenkron olarak çeker, DOM'a ekler ve gösterir.
     * Eğer içerik zaten eklenmişse, sadece onu gösterir.
     * @param {string} url - Yüklenecek HTML parçasının dosya yolu.
     * @param {string} title - Ders sayfasında gösterilecek başlık.
     */
    async function loadCourseContent(url, title) {
        courseTitleElement.textContent = title;

        // 1. Adım: Tüm mevcut ders bloklarını gizle
        const allContentBlocks = courseContentContainer.querySelectorAll('.course-content-block');
        allContentBlocks.forEach(block => block.classList.remove('active'));

        // 2. Adım: Bu URL'ye ait içerik bloğu DOM'da zaten var mı diye kontrol et
        let targetBlock = courseContentContainer.querySelector(`.course-content-block[data-content-url="${url}"]`);

        if (targetBlock) {
            // 3. Adım (EĞER VARSA): Sadece göster ve fonksiyondan çık
            console.log(`İçerik DOM'dan bulundu ve gösteriliyor: ${url}`);
            targetBlock.classList.add('active');
            showView(courseContentView);

            // Safari için ekstra güvence: Ses elemanlarını tekrar yüklemeyi dene
            targetBlock.querySelectorAll('audio').forEach(audio => audio.load());

            return;
        }

        // 4. Adım (EĞER YOKSA): Fetch ile içeriği çek ve yeni bir blok oluştur
        try {
            console.log(`İçerik fetch ile çekiliyor ve DOM'a ekleniyor: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP Hatası! Durum: ${response.status}`);
            }
            const contentHtml = await response.text();

            // Yeni bir div oluştur ve içeriği ona bas
            targetBlock = document.createElement('div');
            targetBlock.className = 'course-content-block active'; // Başlangıçta aktif olarak ekle
            targetBlock.dataset.contentUrl = url; // Daha sonra bulabilmek için URL'yi etiketle
            targetBlock.innerHTML = contentHtml;

            // Oluşturulan yeni bloğu ana konteynere ekle
            courseContentContainer.appendChild(targetBlock);

            // Ders içeriği görünümünü göster
            showView(courseContentView);

        } catch (error) {
            console.error('Ders içeriği yüklenirken bir sorun oluştu:', error);
            alert('Ders içeriği yüklenemedi. Lütfen geliştirici konsolunu (F12) kontrol edin.');
        }
    }


    // --- 3. OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ---
    showExamsBtn.addEventListener('click', () => showView(examListView));

    backToHeroBtn.addEventListener('click', (event) => {
        event.preventDefault();
        showView(heroView);
    });

    backToExamsBtn.addEventListener('click', () => showView(examListView));

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
    // Akordiyon dinleyicisini SADECE BİR KEZ en başta kur
    initAccordion();

    // Uygulama ilk açıldığında Karşılama Ekranı'nı göstererek başla
    showView(heroView);
});
