document.addEventListener('DOMContentLoaded', () => {
  // Menu mobile
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  // Accordéon FAQ
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-answer').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
    });
  });

  // Formulaire de contact
  const form = document.querySelector('#contact-form');
  if (form) {
    const status = form.querySelector('.form-status');
    const button = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.querySelector('.hp-field input')?.value) return; // piège anti-spam

      const data = new FormData(form);
      const payload = Object.fromEntries(data.entries());

      button.disabled = true;
      status.className = 'form-status loading';
      status.textContent = 'Envoi en cours…';

      try {
        const res = await fetch('https://n8n.srv1677224.hstgr.cloud/webhook/nouveau-prospect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Réponse serveur invalide');
        window.location.href = 'merci.html';
      } catch (err) {
        status.className = 'form-status error';
        status.textContent = "Une erreur est survenue. Vous pouvez aussi écrire directement à contact@impact-nva.fr.";
        button.disabled = false;
      }
    });
  }
});
