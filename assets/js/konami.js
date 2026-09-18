
export function initKonami() {
  const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let userInput = [];
  const secretMessage = document.getElementById('secret-message');
  const closeButton = document.getElementById('close-secret-message');

  document.addEventListener('keydown', (e) => {
    const key = e.key;
    userInput.push(key);
    if (userInput.length > secretCode.length) {
      userInput.shift();
    }
    if (userInput.join('') === secretCode.join('')) {
      secretMessage.classList.add('show');

      // Achievement
      if (typeof unlockAchievement === 'function') {
        unlockAchievement('konamiMaster');
      }

      // God Mode Visual Effect
      document.body.classList.add('god-mode');
      const allElements = document.querySelectorAll('div, section, header, footer');
      allElements.forEach(el => {
        el.style.transition = 'all 1s';
        el.style.borderColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      });

      console.log('%c GOD MODE ACTIVATED ', 'background: red; color: white; font-size: 20px; padding: 10px;');
    }
  });

  if (closeButton) {
    closeButton.addEventListener('click', () => {
      secretMessage.classList.remove('show');
    });
  }
}



