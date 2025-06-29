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

    // Safari tarayıcısını tespit et
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);


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
     * SADECE SAFARI İÇİN: Gizlenip tekrar gösterilen ses elemanlarını "hard reset" yapar.
     * Bu, Safari'nin sesleri oynatamama sorununu çözer.
     * @param {HTMLElement} block - Ses elemanlarını içeren blok.
     */
    function safariAudioFix(block) {
        const audioElements = block.querySelectorAll('audio');
        audioElements.forEach(audio => {
            const originalSrc = audio.getAttribute('src');
            if (originalSrc) {
                audio.pause();
                // Kaynağı kaldırıp anında geri yüklemek, Safari'yi sıfırlamaya zorlar.
                audio.setAttribute('src', '');
                audio.setAttribute('src', originalSrc);
                // load() komutu, yeni kaynağı işlemesi için tarayıcıyı tetikler.
                audio.load();
            }
        });
    }

    async function loadCourseContent(url, title) {
        courseTitleElement.textContent = title;

        // 1. Tüm mevcut ders bloklarını gizle
        const allContentBlocks = courseContentContainer.querySelectorAll('.course-content-block');
        allContentBlocks.forEach(block => block.classList.remove('active'));

        // 2. İstenen içerik bloğu DOM'da zaten var mı diye kontrol et
        let targetBlock = courseContentContainer.querySelector(`.course-content-block[data-content-url="${url}"]`);

        if (targetBlock) {
            // 3. EĞER VARSA: Bloğu göster ve GEREKİYORSA Safari düzeltmesini uygula
            targetBlock.classList.add('active');
            if (isSafari) {
                safariAudioFix(targetBlock);
            }
        } else {
            // 4. EĞER YOKSA: Fetch ile içeriği çek ve DOM'a kalıcı olarak ekle
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP Hatası! Durum: ${response.status}`);
                }
                const contentHtml = await response.text();

                targetBlock = document.createElement('div');
                targetBlock.className = 'course-content-block active';
                targetBlock.dataset.contentUrl = url;
                targetBlock.innerHTML = contentHtml;
                courseContentContainer.appendChild(targetBlock);

            } catch (error) {
                console.error('Ders içeriği yüklenirken bir sorun oluştu:', error);
                alert('Ders içeriği yüklenemedi.');
                return;
            }
        }

        // 5. Ana ders görünümünü aktif et
        showView(courseContentView);
    }

    // --- 3. OLAY DİNLEYİCİLERİ ---
    showExamsBtn.addEventListener('click', () => showView(examListView));

    backToHeroBtn.addEventListener('click', (e) => {
        e.preventDefault();
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

    // --- 4. BAŞLANGIÇ ---
    initAccordion();
    showView(heroView);
});
