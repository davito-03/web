

console.log('🤖 Cargando nueva funcionalidad de Dabot...');


function toggleDabotSection() {
  const section = document.getElementById('dabot-section');
  if (!section) return;
  section.classList.add('visible');
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


document.addEventListener('DOMContentLoaded', function() {
  console.log('🤖 DOM cargado, inicializando nueva funcionalidad de Dabot...');
  

  const dabotLink = document.querySelector('a[href="#dabot-section"], a[href="#dabot-bot"], #dabot-button');
  if (dabotLink) {
    console.log('🤖 Botón de Dabot encontrado, añadiendo event listener');
    
    dabotLink.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('🤖 Click en botón de Dabot detectado');
      toggleDabotSection();
    });
  } else {
    console.warn('⚠️ No se encontró el botón de Dabot');
  }
  

  const section = document.getElementById('dabot-section');
  if (section) {
    section.classList.add('visible');
  }
  

  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      console.log('🎯 Hover en feature card:', this.querySelector('h3')?.textContent);
    });
  });
});

console.log('🤖 Nueva funcionalidad de Dabot cargada exitosamente');



