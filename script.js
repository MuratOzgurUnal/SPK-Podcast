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

    function showView(viewToShow) {
        heroView.classList.remove('active-view');
        examListView.classList.remove('active-view');
        courseContentView.classList.remove('active-view');
        viewToShow.classList.add('active-view');
    }

    function initAccordion() {
        courseContentContainer.addEventListener('click', (event) => {
            const header = event.target.closest('.accordion-header');
            if (!header) return;

            const accordionItem = header.parentElement;
            const parentBlock = accordionItem.closest('.course-content-block');
            if (!parentBlock) return;

            const allItems = parentBlock.querySelectorAll('.accordion-item');
            allItems.forEach(item => {
                if (item !== accordionItem) {
                    item.classList.remove('active');
                }
            });
            accordionItem.classList.toggle('active');
        });
    }
    
    /**
     * Bir içerik bloğundaki tüm ses elemanlarını "Hard Reset" yapar.
     * Bu, mobil tarayıcılarda oynatma sorunlarını çözmek içindir.
     * @param {HTMLElement} block - Ses elemanlarını içeren blok.
     */
    function resetAudioElements(block) {
        const audioElements = block.querySelectorAll('audio');
        console.log(`Resetting ${audioElements.length} audio elements.`);
        
        audioElements.forEach(audio => {
            // Orijinal kaynak yolunun data-src'de saklandığından emin ol
            const originalSrc = audio.dataset.src;
            if (originalSrc) {
                // Kaynağı sıfırla ve yeniden yükle
                audio.src = originalSrc;
                audio.load();
            }
        });
    }

    async function loadCourseContent(url, title) {
        courseTitleElement.textContent = title;

        // 1. Tüm mevcut ders bloklarını gizle
        const allContentBlocks = courseContentContainer.querySelectorAll('.course-content-block');
        allContentBlocks.forEach(block => block.classList.remove('active'));

        // 2. Bu URL'ye ait içerik bloğu DOM'da zaten var mı diye kontrol et
        let targetBlock = courseContentContainer.querySelector(`.course-content-block[data-content-url="${url}"]`);

        if (targetBlock) {
            // 3. EĞER VARSA: Bloğu göster ve sesleri "Hard Reset" yap
            console.log(`İçerik DOM'dan bulundu ve gösteriliyor: ${url}`);
            targetBlock.classList.add('active');
            showView(courseContentView);
            resetAudioElements(targetBlock); // <-- EN ÖNEMLİ ADIM BURASI
            return;
        }

        // 4. EĞER YOKSA: Fetch ile içeriği çek ve yeni bir blok oluştur
        try {
            console.log(`İçerik fetch ile çekiliyor ve DOM'a ekleniyor: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP Hatası! Durum: ${response.status}`);
            }
            const contentHtml = await response.text();

            targetBlock = document.createElement('div');
            targetBlock.className = 'course-content-block active';
            targetBlock.dataset.contentUrl = url;
            targetBlock.innerHTML = contentHtml;
            
            // YENİ VE KRİTİK ADIM: Gelecekteki reset'ler için ses kaynaklarını data-src'ye kopyala
            targetBlock.querySelectorAll('audio').forEach(audio => {
                if (audio.hasAttribute('src')) {
                    audio.dataset.src = audio.getAttribute('src');
                }
            });

            courseContentContainer.appendChild(targetBlock);
            showView(courseContentView);

        } catch (error) {
            console.error('Ders içeriği yüklenirken bir sorun oluştu:', error);
            alert('Ders içeriği yüklenemedi. Lütfen geliştirici konsolunu (F12) kontrol edin.');
        }
    }

    // --- 3. OLAY DİNLEYİCİLERİ ---
    showExamsBtn.addEventListener('click', () => showView(examListView));

    backToHeroBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showView(heroView);
    });

    backToExamsBtn.addEventListener('click', () => {
        // Geri dönerken aktif olan sesleri durdur (isteğe bağlı ama iyi bir pratik)
        const activeBlock = courseContentContainer.querySelector('.course-content-block.active');
        if (activeBlock) {
            activeBlock.querySelectorAll('audio').forEach(audio => audio.pause());
        }
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

    // --- 4. BAŞLANGIÇ ---
    initAccordion();
    showView(heroView);
});
