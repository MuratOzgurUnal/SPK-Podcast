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

    // --- KRİTİK ADIM: iOS TESPİTİ ---
    // Bu, sadece sorunlu olan cihazı hedef almamızı sağlar.
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // --- 2. ANA FONKSİYONLAR ---

    function showView(viewToShow) {
        heroView.classList.remove('active-view');
        examListView.classList.remove('active-view');
        courseContentView.classList.remove('active-view');
        viewToShow.classList.add('active-view');
    }

    /**
     * SADECE iOS İÇİN: "Derin uykudaki" ses elemanlarını zorla yeniden oluşturur.
     * @param {HTMLElement} block - Ses elemanlarını içeren blok.
     */
    function forceWakeUpIOSAudio(block) {
        const audioElements = block.querySelectorAll('audio');
        
        audioElements.forEach(audio => {
            // Her bir ses elemanını klonla. cloneNode(true) tüm nitelikleri (src, controls vs.) kopyalar.
            const audioClone = audio.cloneNode(true);
            
            // Orijinal (bozuk) elemanı, taze klonla DOM'da değiştir.
            // Bu, Safari'yi elemanı tamamen yeniden başlatmaya zorlar.
            audio.parentNode.replaceChild(audioClone, audio);
        });
        console.log(`${audioElements.length} adet ses elemanı iOS için yeniden oluşturuldu.`);
    }


    /**
     * Tüm olay dinleyicilerini (akordiyon ve ses) kurar.
     */
    function initEventListeners() {
        courseContentContainer.addEventListener('click', (event) => {
            const header = event.target.closest('.accordion-header');
            if (header) {
                const accordionItem = header.parentElement;
                const parentBlock = accordionItem.closest('.course-content-block');
                if (!parentBlock) return;

                const allItems = parentBlock.querySelectorAll('.accordion-item');
                allItems.forEach(item => {
                    if (item !== accordionItem && item.classList.contains('active')) {
                        item.classList.remove('active');
                    }
                });
                accordionItem.classList.toggle('active');
            }
        });

        courseContentContainer.addEventListener('play', (event) => {
            if (event.target.tagName === 'AUDIO') {
                const currentAudio = event.target;
                const allAudioElements = courseContentContainer.querySelectorAll('audio');
                
                allAudioElements.forEach(audio => {
                    if (audio !== currentAudio) {
                        audio.pause();
                        audio.currentTime = 0; 
                    }
                });
            }
        }, true);
    }

    /**
     * Önceden yüklenmiş ders içeriğini gösterir.
     */
    function showPreloadedContent(url, title) {
        const allContentBlocks = courseContentContainer.querySelectorAll('.course-content-block');
        allContentBlocks.forEach(block => block.classList.remove('active'));

        const targetBlock = courseContentContainer.querySelector(`.course-content-block[data-content-url="${url}"]`);
        
        if (targetBlock) {
            // --- iOS İÇİN KESİN ÇÖZÜMÜN UYGULANDIĞI YER ---
            // Eğer tarayıcı iOS ise ve bu blok daha önce "uyandırılmadıysa",
            // içindeki ses elemanlarını zorla yeniden oluştur.
            if (isIOS && !targetBlock.dataset.wokenUp) {
                forceWakeUpIOSAudio(targetBlock);
                targetBlock.dataset.wokenUp = "true"; // Bu işlemi sadece bir kere yap.
            }
            // ----------------------------------------------------

            courseTitleElement.textContent = title;
            targetBlock.classList.add('active');
            showView(courseContentView);
        } else {
            console.error(`Önceden yüklenmiş içerik bulunamadı: ${url}`);
            alert('İçerik yüklenirken bir hata oluştu.');
        }
    }

    /**
     * Tüm ders içeriklerini sayfa açılır açılmaz arka planda yükler ve gizler.
     */
    async function preloadAllContent() {
        const examsToPreload = [{ url: 'spk-level1.html', title: 'Sermaye Piyasası Faaliyetleri Düzey 1 Lisansı' }];

        for (const exam of examsToPreload) {
            if (courseContentContainer.querySelector(`[data-content-url="${exam.url}"]`)) continue;
            try {
                const response = await fetch(exam.url);
                if (!response.ok) throw new Error(`Fetch error: ${response.status}`);
                const contentHtml = await response.text();
                const contentBlock = document.createElement('div');
                contentBlock.className = 'course-content-block';
                contentBlock.dataset.contentUrl = exam.url;
                contentBlock.innerHTML = contentHtml;
                courseContentContainer.appendChild(contentBlock);
            } catch (error) {
                console.error(`İçerik önceden yüklenemedi: ${exam.url}`, error);
            }
        }
    }

    // --- 3. DİĞER OLAY DİNLEYİCİLERİ ---
    showExamsBtn.addEventListener('click', () => showView(examListView));
    backToHeroBtn.addEventListener('click', (event) => { event.preventDefault(); showView(heroView); });
    backToExamsBtn.addEventListener('click', () => {
        courseContentContainer.querySelectorAll('audio').forEach(audio => { audio.pause(); audio.currentTime = 0; });
        showView(examListView);
    });
    examListContainer.addEventListener('click', (event) => {
        const listItem = event.target.closest('li');
        if (listItem) {
            const contentUrl = listItem.dataset.contentUrl;
            const examTitle = listItem.dataset.examTitle;
            if (contentUrl && examTitle) { showPreloadedContent(contentUrl, examTitle); }
        }
    });

    // --- 4. BAŞLANGIÇ ADIMLARI ---
    initEventListeners();
    preloadAllContent();
    showView(heroView);
});
