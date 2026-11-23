(() => {
  'use strict';
  const dialog = document.querySelector('.case-lightbox');
  if (!dialog) return;
  const image = dialog.querySelector('img');
  const caption = document.querySelector('#case-lightbox-caption');
  let trigger = null;
  document.querySelectorAll('.case-image').forEach(button => {
    button.addEventListener('click', () => {
      const source = button.querySelector('img');
      if (typeof dialog.showModal !== 'function') {
        window.open(source.src, '_blank', 'noopener'); return;
      }
      trigger = button;
      image.src = source.src;
      image.alt = source.alt;
      caption.textContent = button.dataset.caption || '';
      dialog.showModal();
      dialog.querySelector('[data-close-lightbox]').focus();
    });
  });
  dialog.querySelector('[data-close-lightbox]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => trigger?.focus());
})();
