const scroll = document.getElementById('scroll-bottom');
const inputSection = document.getElementById('userInput-wrapper');
inputSection.addEventListener('input', function () {
  // Adjust input height dynamically
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 28 * window.innerHeight / 100) + 'px';
  this.scrollTop = this.scrollHeight;
  // Get the updated height of input
  const height = this.scrollHeight;

  // Get current bottom style numeric value (in px)
  const currentBottom = parseInt(getComputedStyle(scroll).bottom) || 0;
  // Update scroll button bottom position only if new height + 10 is greater than current
  const newBottom = height + 10;
  if (newBottom-10 !== currentBottom) {
    scroll.style.bottom = `${newBottom}px`;
  }
});
