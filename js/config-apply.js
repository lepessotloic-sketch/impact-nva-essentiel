// Applique les valeurs de config.js dans le HTML via des attributs data-*
document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.siteConfig || {};
  const mapping = {
    'brand': 'brand',
    'slogan': 'slogan',
    'email': 'email',
    'phone': 'phone',
    'zone': 'zone',
    'stripe-link': 'stripeCheckoutUrl'
  };

  Object.keys(mapping).forEach(attr => {
    const key = mapping[attr];
    const nodes = document.querySelectorAll(`[data-${attr}]`);
    nodes.forEach(node => {
      if (!cfg[key]) return;
      if (attr === 'stripe-link') {
        node.setAttribute('href', cfg[key]);
      } else if (attr === 'email') {
        node.setAttribute('href', `mailto:${cfg[key]}`);
        node.textContent = cfg[key];
      } else if (attr === 'phone') {
        node.setAttribute('href', `tel:${cfg[key].replace(/\s+/g, '')}`);
        node.textContent = cfg[key];
      } else {
        node.textContent = cfg[key];
      }
    });
  });
});
