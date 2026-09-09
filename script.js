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
    title: 'Valentín — Portfolio',
    text: 'Diseño gráfico · Digital · Hospitalidad',
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

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
