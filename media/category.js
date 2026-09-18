
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    const title = document.getElementById('category-title');
    const grid = document.getElementById('gallery-container');

    if (title && category) title.textContent = category;
    if (!grid || !category) return;

    // --- Data Loading ---

    async function loadFiles(categoryName) {
        try {
            console.log(`Cargando archivos para: ${categoryName}`);
            // Try fetching from dynamic API first
            let data;
            try {
                // Changed to PHP endpoint
                const response = await fetch('gallery.php');
                if (response.ok) {
                    data = await response.json();
                } else {
                    throw new Error('API request failed');
                }
            } catch (e) {
                console.warn('API fallback: trying data.json', e);
                // Fallback to static file if API fails (e.g. running without server)
                const response = await fetch('data.json?t=' + Date.now());
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
                data = await response.json();
            }

            const categoryData = data.categories.find(c => c.name === categoryName);

            if (categoryData) {
                console.log('Archivos recibidos:', categoryData.files);
                return categoryData.files;
            } else {
                console.warn(`Categoría '${categoryName}' no encontrada`);
                return getFallbackFiles(categoryName);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            return getFallbackFiles(categoryName);
        }
    }

    function getFallbackFiles(categoryName) {
        const fallbackData = {
            'gatos': ['IMG_4276.webp', 'IMG_4277.webp', 'IMG_4886.webp', 'IMG_4887.webp', 'IMG_4888.webp', 'IMG_4889.webp'],
            'ego': ['358f2154-d88a-4a8f-b037-65d3866a67a1.webp', 'C460C502-7F3F-438F-8F13-0F0BA3AFC1C1.webp', 'davito ascensor 2.webp', 'davito ascensor.webp', 'davito cepillo.webp', 'davo anime.webp', 'davo chulo.webp', 'deboramilfs.webp', 'lore_leon79-20210414-0015.webp', 'quien me creo.webp', 'Snapchat-1966856168.webp', 'yo gym.webp', 'yoespejo.webp'],
            'memes': ['tragate mis dos huevos.webp'],
            'personajes': [],
            'fondos de pantalla': ['33193.webp', '33194.webp', '33195.webp', '33197.webp', '33200.webp']
        };
        return fallbackData[categoryName] || [];
    }

    function isVideoFile(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const videoFormats = ['mp4', 'webm', 'avi', 'mov', 'mkv'];
        return videoFormats.includes(extension);
    }

    // --- Lightbox & Zoom System ---

    let currentFiles = [];
    let currentFileIndex = 0;

    // Zoom variables
    let scale = 1;
    let pointX = 0;
    let pointY = 0;
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'media-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.98);
            display: none;
            z-index: 10000;
            justify-content: center;
            align-items: center;
            backdrop-filter: blur(10px);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        modal.innerHTML = `
            <div id="modal-wrapper" style="
                position: relative; 
                width: 100%; 
                height: 100%; 
                display: flex; 
                justify-content: center; 
                align-items: center;
                overflow: hidden;
            ">
                <div id="modal-content" style="
                    position: relative;
                    transition: transform 0.1s ease-out;
                    touch-action: none;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                "></div>
                
                <!-- Close Button -->
                <button id="modal-close" style="
                    position: absolute; 
                    top: 20px; 
                    right: 20px; 
                    background: rgba(255, 255, 255, 0.1); 
                    color: white; 
                    border: 1px solid rgba(255,255,255,0.2); 
                    width: 40px;
                    height: 40px;
                    border-radius: 50%; 
                    font-size: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer; 
                    z-index: 10002;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(5px);
                ">&times;</button>
                
                <!-- Navigation Controls -->
                <button id="modal-prev" class="nav-btn" style="left: 20px;">❮</button>
                <button id="modal-next" class="nav-btn" style="right: 20px;">❯</button>
                
                <!-- File Info -->
                <div id="modal-info" style="
                    position: absolute; 
                    bottom: 30px; 
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(0, 0, 0, 0.6); 
                    color: rgba(255, 255, 255, 0.9); 
                    padding: 8px 16px; 
                    border-radius: 20px;
                    font-size: 14px;
                    backdrop-filter: blur(5px);
                    pointer-events: none;
                    border: 1px solid rgba(255,255,255,0.1);
                "></div>
            </div>
            
            <style>
                .nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.2);
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    font-size: 20px;
                    cursor: pointer;
                    z-index: 10002;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(5px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .nav-btn:hover, #modal-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-50%) scale(1.1);
                }
                #modal-close:hover {
                    transform: scale(1.1);
                }
                @media (max-width: 768px) {
                    .nav-btn { display: none; }
                }
            </style>
        `;

        document.body.appendChild(modal);

        // Event Listeners
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.id === 'modal-wrapper') {
                closeModal();
            }
        });

        document.getElementById('modal-close').addEventListener('click', closeModal);

        document.getElementById('modal-prev').addEventListener('click', (e) => {
            e.stopPropagation();
            navigateModal(-1);
        });

        document.getElementById('modal-next').addEventListener('click', (e) => {
            e.stopPropagation();
            navigateModal(1);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (modal.style.display === 'flex') {
                switch (e.key) {
                    case 'Escape': closeModal(); break;
                    case 'ArrowLeft': navigateModal(-1); break;
                    case 'ArrowRight': navigateModal(1); break;
                }
            }
        });

        // Touch & Zoom Logic
        setupZoom(modal);

        return modal;
    }

    function setupZoom(modal) {
        const content = modal.querySelector('#modal-content');
        let initialDistance = 0;
        let initialScale = 1;

        modal.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault(); // Prevent default pinch
                initialDistance = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );
                initialScale = scale;
            } else if (e.touches.length === 1) {
                startX = e.touches[0].pageX - pointX;
                startY = e.touches[0].pageY - pointY;
                isDragging = true;
            }
        }, { passive: false });

        modal.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );

                const diff = currentDistance / initialDistance;
                scale = Math.min(Math.max(1, initialScale * diff), 4); // Limit zoom 1x to 4x

                updateTransform(content);
            } else if (e.touches.length === 1 && isDragging && scale > 1) {
                e.preventDefault();
                pointX = e.touches[0].pageX - startX;
                pointY = e.touches[0].pageY - startY;
                updateTransform(content);
            }
        }, { passive: false });

        modal.addEventListener('touchend', (e) => {
            isDragging = false;
            if (e.touches.length < 2) {
                if (scale < 1.1) {
                    resetZoom(content);
                }
            }
        });

        // Swipe for navigation (only when not zoomed)
        let touchStartX = 0;
        modal.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && scale === 1) {
                touchStartX = e.changedTouches[0].screenX;
            }
        }, { passive: true });

        modal.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1 && scale === 1) {
                const touchEndX = e.changedTouches[0].screenX;
                const diff = touchEndX - touchStartX;
                if (Math.abs(diff) > 50) {
                    navigateModal(diff > 0 ? -1 : 1);
                }
            }
        }, { passive: true });
    }

    function updateTransform(el) {
        el.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    }

    function resetZoom(el) {
        scale = 1;
        pointX = 0;
        pointY = 0;
        el.style.transform = `translate(0px, 0px) scale(1)`;
    }

    function showInModal(filename, filePath, fileIndex = 0) {
        const modal = document.getElementById('media-modal') || createModal();
        const modalContent = document.getElementById('modal-content');
        const modalInfo = document.getElementById('modal-info');

        currentFileIndex = fileIndex;
        resetZoom(modalContent); // Reset zoom on new image

        modalContent.innerHTML = '';

        if (isVideoFile(filename)) {
            const video = document.createElement('video');
            video.controls = true;
            video.autoplay = true;
            video.style.cssText = `
                max-width: 95%; 
                max-height: 95%; 
                box-shadow: 0 0 50px rgba(0,0,0,0.5);
                border-radius: 4px;
            `;
            video.innerHTML = `<source src="${filePath}" type="video/${filename.split('.').pop().toLowerCase()}">`;
            modalContent.appendChild(video);
        } else {
            const img = new Image();
            img.src = filePath;
            img.style.cssText = `
                max-width: 95%; 
                max-height: 95%; 
                object-fit: contain;
                box-shadow: 0 0 50px rgba(0,0,0,0.5);
                border-radius: 4px;
                user-select: none;
            `;
            modalContent.appendChild(img);
        }

        modalInfo.textContent = `${currentFileIndex + 1} / ${currentFiles.length}`;

        modal.style.display = 'flex';
        // Trigger reflow
        modal.offsetHeight;
        modal.style.opacity = '1';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        const modal = document.getElementById('media-modal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
                const video = modal.querySelector('video');
                if (video) video.pause();
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    function navigateModal(direction) {
        if (currentFiles.length === 0) return;

        currentFileIndex += direction;

        if (currentFileIndex >= currentFiles.length) {
            currentFileIndex = 0;
        } else if (currentFileIndex < 0) {
            currentFileIndex = currentFiles.length - 1;
        }

        const filename = currentFiles[currentFileIndex];
        const filePath = `${encodeURIComponent(category)}/${encodeURIComponent(filename)}`;
        showInModal(filename, filePath, currentFileIndex);
    }

    // --- Main Display Logic ---

    async function displayGallery() {
        const files = await loadFiles(category);
        currentFiles = files; // Save for modal navigation

        // Setup Lazy Loading Observer
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.style.opacity = '1';
                        observer.unobserve(img);
                    }
                }
            });
        }, { rootMargin: '50px' });

        files.forEach((filename, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'gallery-item';
            itemDiv.style.cursor = 'pointer';

            const filePath = `${encodeURIComponent(category)}/${encodeURIComponent(filename)}`;

            if (isVideoFile(filename)) {
                itemDiv.innerHTML = `
                    <video preload="metadata" muted autoplay loop style="pointer-events: none; width: 100%; height: 100%; object-fit: cover;">
                        <source src="${filePath}" type="video/${filename.split('.').pop().toLowerCase()}">
                    </video>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 24px; opacity: 0.8;">▶️</div>
                `;
            } else {
                // Lazy load images
                const img = document.createElement('img');
                img.dataset.src = filePath;
                img.alt = filename;
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.5s ease';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.pointerEvents = 'none';

                itemDiv.appendChild(img);
                observer.observe(img);
            }

            itemDiv.addEventListener('click', () => {
                showInModal(filename, filePath, index);
            });

            grid.appendChild(itemDiv);
        });
    }

    displayGallery();
});
