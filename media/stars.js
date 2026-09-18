document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('star-background');
  
  const numberOfStars = 200;

  for (let i = 0; i < numberOfStars; i++) {
    const star = document.createElement('div');
    star.className = 'star';

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 2 + 1;

    star.style.left = `${x}vw`;
    star.style.top = `${y}vh`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    const animationDuration = Math.random() * 2 + 1;
    const animationDelay = Math.random() * 2;

    star.style.animationDuration = `${animationDuration}s`;
    star.style.animationDelay = `${animationDelay}s`;
    
    container.appendChild(star);
  }
});


