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


    /* ---------- Jeton anti-robot Turnstile ----------
       Demande au moment de l'envoi, et pas avant. Un jeton ne vaut que 300
       secondes : celui qui a ete fabrique a l'ouverture de la page est perime
       quand le visiteur a fini d'ecrire. C'est arrive a Loic le 11/11/2026 sur
       son propre formulaire : classe robot, aucun accuse.
       On en redemande donc un frais ; au bout de six secondes on part SANS
       jeton et c'est n8n qui tranche. La page ne bloque jamais personne.
       Si le formulaire n'a pas de widget, lireJeton rend '' et rien ne change. */
    const lireJeton = () => {
      try {
        if (window.turnstile && typeof window.turnstile.getResponse === 'function') {
          const t = window.turnstile.getResponse('#verif');
          if (t) return t;
        }
      } catch (err) { /* widget absent, pas encore rendu, ou en erreur */ }
      const champ = form.querySelector('[name=cf-turnstile-response]');
      return champ ? champ.value : '';
    };

    const jetonFrais = () => new Promise((resoudre) => {
      if (!form.querySelector('.cf-turnstile')) { resoudre(''); return; }
      const deja = lireJeton();
      if (deja) { resoudre(deja); return; }
      try {
        if (!window.turnstile || typeof window.turnstile.reset !== 'function') { resoudre(''); return; }
        window.turnstile.reset('#verif');
      } catch (err) { resoudre(''); return; }
      const debut = Date.now();
      const guet = setInterval(() => {
        const t = lireJeton();
        if (t) { clearInterval(guet); resoudre(t); }
        else if (Date.now() - debut > 6000) { clearInterval(guet); resoudre(''); }
      }, 250);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.querySelector('.hp-field input')?.value) return; // piège anti-spam

      const payload = Object.fromEntries(new FormData(form).entries());

      button.disabled = true;
      status.className = 'form-status loading';
      status.textContent = 'Envoi en cours…';

      /* Le jeton part sous la cle 'verif' : c'est ce que lit le pilote 21. */
      payload.verif = await jetonFrais();

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
});
