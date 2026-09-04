(function () {
  'use strict';

  const API_URL = '/api/contacto';
  const pageOrigin = window.location.pathname;

  document.querySelectorAll('form').forEach((form) => {
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.tabIndex = -1;
    honeypot.autocomplete = 'off';
    honeypot.setAttribute('aria-hidden', 'true');
    honeypot.style.position = 'absolute';
    honeypot.style.left = '-10000px';
    form.appendChild(honeypot);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton?.innerHTML;
      const formData = new FormData(form);
      const value = (name) => String(formData.get(name) || '').trim();
      const payload = {
        nombre: value('nombre') || value('name'),
        correo: value('correo') || value('email'),
        telefono: value('telefono') || value('phone'),
        empresa: value('empresa') || value('company'),
        mensaje: value('mensaje') || value('message'),
        origen: form.dataset.origen || pageOrigin,
        website: value('website'),
      };

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
      }

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'No fue posible enviar el formulario.');
        }

        window.location.href = pageOrigin.includes('/pages/') ? '../gracias.html' : 'gracias.html';
      } catch (error) {
        console.error('Error al enviar el formulario de contacto:', error);
        window.alert(error instanceof Error ? error.message : 'Ocurrió un error al enviar el formulario.');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText || 'Enviar mensaje';
        }
      }
    }, true);
  });
})();