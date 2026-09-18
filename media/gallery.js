
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('category-grid');
  if (!grid) return;

  function showLoadingSkeletons() {
    grid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton-card';
      skeleton.innerHTML = `
        <div class="skeleton-preview"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
        </div>
      `;
      grid.appendChild(skeleton);
    }
  }

  async function loadCategories() {
    try {
      console.log('🔄 Cargando datos de galería...');

      let data;
      try {
        const response = await fetch('gallery.php');
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('API request failed');
        }
      } catch (e) {
        console.warn('API fallback: trying data.json', e);
        const response = await fetch('data.json?t=' + Date.now());
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        data = await response.json();
      }

      console.log('📂 Datos recibidos:', data);
      return data.categories;
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      return getFallbackData();
    }
  }

  function getFallbackData() {
    return [
      {
        name: 'gatos',
        previews: ['gatos/IMG_4276.webp', 'gatos/IMG_4277.webp']
      },
      {
        name: 'ego',
        previews: ['ego/358f2154-d88a-4a8f-b037-65d3866a67a1.webp', 'ego/C460C502-7F3F-438F-8F13-0F0BA3AFC1C1.webp']
      },
      {
        name: 'memes',
        previews: ['gatos/IMG_4886.webp', 'ego/davo anime.webp']  // Usar imágenes que sabemos que existen
      },
      {
        name: 'personajes',
        previews: ['ego/davito cepillo.webp', 'gatos/IMG_4887.webp']  // Usar imágenes que sabemos que existen
      },
      {
        name: 'fondos móvil',
        previews: ['fondos móvil/011D3351-CA08-4FC9-B791-DC44AA852E9F.webp', 'fondos móvil/0E2110B2-AE4F-47D4-9A88-6CE39C9C14B5.webp']
      }
    ];
  }


  showLoadingSkeletons();

  const categories = await loadCategories();

  grid.innerHTML = '';

  categories.forEach(cat => {
    const card = document.createElement('a');
    card.className = 'category-card';
    card.href = `category.html?category=${encodeURIComponent(cat.name)}`;

    let previewHtml = '';
    let previewCount = 0;
    if (cat.previews && cat.previews.length > 0) {
      cat.previews.forEach((preview, index) => {
        if (index < 4) {
          const encodedPreview = preview.split('/').map(encodeURIComponent).join('/');
          previewCount += 1;
          previewHtml += `
            <img src="${encodedPreview}"
                 alt="${cat.name}"
                 loading="lazy"
                 onerror="this.style.display='none';"
                 onload="this.style.opacity='1';">
          `;
        }
      });
    }

    if (!previewHtml.trim()) {
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      previewHtml = `
        <div style="
          width: 100%; 
          height: 100%; 
          background: linear-gradient(135deg, ${randomColor}, ${randomColor}88);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2rem;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        ">
          ${cat.name.charAt(0).toUpperCase()}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="category-preview count-${previewCount || 1}">
        ${previewHtml}
      </div>
      <h3 class="category-name">${cat.name}</h3>
    `;

    grid.appendChild(card);
  });
});



