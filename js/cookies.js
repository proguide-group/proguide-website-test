document.addEventListener('DOMContentLoaded', () => {
  const consentBanner = document.getElementById('cookie-consent-banner');
  const acceptBtn = document.getElementById('cookie-accept-btn');

  // Check if user has already consented
  if (!localStorage.getItem('cookieConsent')) {
    // If not, show the banner after a short delay
    setTimeout(() => {
      consentBanner.classList.add('show');
    }, 1000);
  }

  // When the accept button is clicked
  acceptBtn.addEventListener('click', () => {
    // Hide the banner
    consentBanner.classList.remove('show');
    // Store the consent in localStorage
    localStorage.setItem('cookieConsent', 'true');
  });
});