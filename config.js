// Configuration du site Impact-NVA — V1 Essentiel
// Modifier ici la marque, le slogan, les coordonnées et les liens externes.

window.siteConfig = {
  brand: "Impact-NVA",
  slogan: "La visibilité digitale pour les paysagistes",
  description: "Impact-NVA crée des sites web professionnels pour paysagistes : visibilité, crédibilité et demandes de devis.",
  stripeCheckoutUrl: "https://buy.stripe.com/3cI8wO6QT6tj0T93FRbo401",

  // Webhooks n8n. Le formulaire de demande d'aperçu reste inactif tant que
  // demoWebhookUrl est vide : rien n'est envoyé, aucun prospect n'est perdu.
  contactWebhookUrl: "https://n8n.srv1677224.hstgr.cloud/webhook/nouveau-prospect",
  demoWebhookUrl: "",

  email: "contact@impact-nva.fr",
  phone: "",
  zone: "France",
};
