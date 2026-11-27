const toast = document.querySelector('.toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

async function sharePortfolio() {
  const data = {
    title: 'Valentín Guillán — Diseño gráfico',
    text: 'Identidad visual, packaging y comunicación digital.',
    url: window.location.href,
  };

  if (navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast('Enlace copiado');
  } catch {
    showToast('Copiá la dirección desde el navegador');
  }
}

document.querySelectorAll('[data-share]').forEach((button) => {
  button.addEventListener('click', sharePortfolio);
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  const elements = document.querySelectorAll('.reveal');
  elements.forEach((element) => observer.observe(element));
  document.documentElement.classList.add('motion-ready');
}

