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

  // Soumission d'un formulaire vers un webhook n8n.
  // onSucces reçoit (status, button) : à chaque formulaire de décider ce qu'il
  // affiche ou vers où il redirige.
  const brancherFormulaire = (selecteur, url, onSucces) => {
    const form = document.querySelector(selecteur);
    if (!form) return;

    // Pas de webhook configuré : on retire la section plutôt que de laisser un
    // formulaire qui rechargerait la page en perdant la demande.
    if (!url) {
      (form.closest('section') || form).remove();
      return;
    }

    const status = form.querySelector('.form-status');
    const button = form.querySelector('button[type="submit"]');
    const libelle = button.textContent;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.querySelector('.hp-field input')?.value) return; // piège anti-spam

      const payload = Object.fromEntries(new FormData(form).entries());

      button.disabled = true;
      status.className = 'form-status loading';
      status.textContent = 'Envoi en cours…';

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Réponse serveur invalide');
        onSucces(form, status, button);
      } catch (err) {
        status.className = 'form-status error';
        status.textContent = "Une erreur est survenue. Vous pouvez aussi écrire directement à contact@impact-nva.fr.";
        button.disabled = false;
        button.textContent = libelle;
      }
    });
  };

  const cfg = window.siteConfig || {};

  // Formulaire de contact : redirige vers la page de remerciement.
  brancherFormulaire(
    '#contact-form',
    cfg.contactWebhookUrl || 'https://n8n.srv1677224.hstgr.cloud/webhook/nouveau-prospect',
    () => { window.location.href = 'merci.html'; }
  );

  // Demande d'aperçu : la génération prend un moment, donc on ne redirige pas.
  // On confirme sur place et le lien part par SMS une fois la page publiée.
  brancherFormulaire('#demo-form', cfg.demoWebhookUrl, (form, status, button) => {
    form.querySelectorAll('input, button').forEach(el => { el.disabled = true; });
    status.className = 'form-status success';
    status.textContent =
      'C’est noté. Vous recevez le lien de votre aperçu par SMS dans quelques minutes.';
    button.textContent = 'Demande envoyée';
  });
});
