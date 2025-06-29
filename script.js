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


    // --- 2. ANA FONKSİYONLAR ---

    /**
     * Belirtilen görünümü aktif hale getirir, diğerlerini gizler.
     */
    function showView(viewToShow) {
        heroView.classList.remove('active-view');
        examListView.classList.remove('active-view');
        courseContentView.classList.remove('active-view');
        viewToShow.classList.add('active-view');
    }

    /**
     * Akordiyon menüye tıklama işlevselliği kazandırır.
     * Bu fonksiyon SADECE BİR KEZ, sayfa yüklendiğinde çağrılır.
     * Olay delegasyonu sayesinde sonradan eklenen içeriklerde de çalışır.
     */
    function initAccordion() {
        courseContentContainer.addEventListener('click', (event) => {
            const header = event.target.closest('.accordion-header');
            if (!header) return; // Başlığa tıklanmadıysa çık

            const accordionItem = header.parentElement;

            // Diğer açık akordiyonları kapat
            const allItems = courseContentContainer.querySelectorAll('.accordion-item');
            allItems.forEach(item => {
                if (item !== accordionItem) {
                    item.classList.remove('active');
                }
            });

            // Tıklananı aç/kapat
            accordionItem.classList.toggle('active');
        });
    }

    /**
     * Verilen URL'den ders içeriğini asenkron olarak çeker ve sayfaya yerleştirir.
     * @param {string} url - Yüklenecek HTML parçasının dosya yolu.
     * @param {string} title - Ders sayfasında gösterilecek başlık.
     */
    async function loadCourseContent(url, title) {
        try {
            // 1. fetch API'si ile HTML içeriğini talep et
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP Hatası! Durum: ${response.status}`);
            }

            // 2. Gelen cevabı metin olarak al
            const contentHtml = await response.text();

            // 3. Ders başlığını ve içeriğini ilgili HTML elemanlarına yerleştir
            courseTitleElement.textContent = title;
            courseContentContainer.innerHTML = contentHtml;

            // 4. >>>>>> ÇÖZÜMÜN ANAHTARI BURASI <<<<<<
            // Yeni eklenen TÜM ses elemanlarını bul ve tarayıcıyı onları
            // yüklemeye zorla (onları "uyandır"). Bu, mobil tarayıcı
            // sorunlarını çözer.
            const newAudioElements = courseContentContainer.querySelectorAll('audio');
            newAudioElements.forEach(audio => {
                audio.load();
            });
            // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

            // 5. İçerik yüklendiğine göre, ders içeriği görünümünü aktif hale getir
            showView(courseContentView);

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
        // Geri dönerken aktif olabilecek sesleri durdurmak iyi bir pratiktir.
        courseContentContainer.querySelectorAll('audio').forEach(audio => {
            audio.pause();
            audio.currentTime = 0; // Başa sar
        });
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
    // Akordiyon dinleyicisini en başta SADECE BİR KEZ kur.
    initAccordion();

});
