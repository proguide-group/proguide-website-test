document.addEventListener('DOMContentLoaded', () => {
  const consentBanner = document.getElementById('cc-banner');
  const acceptBtn = document.getElementById('cc-accept');
  const rejectBtn = document.getElementById('cc-reject');
  const manageBtn = document.getElementById('cc-manage');
  const modal = document.getElementById('cc-modal');
  const saveBtn = document.getElementById('cc-save');
  const acceptModalBtn = document.getElementById('cc-accept-modal');
  const functionalCheckbox = document.getElementById('cc-functional');
  const marketingCheckbox = document.getElementById('cc-marketing');

  // Check if user has already consented
  const existingConsent = localStorage.getItem('pg_consent_v1');
  if (!existingConsent) {
    // If not, show the banner after a short delay
    setTimeout(() => {
      consentBanner.removeAttribute('hidden');
    }, 1000);
  } else {
    // Load services based on existing consent
    try {
      const consent = JSON.parse(existingConsent);
      loadServices(consent);
    } catch (e) {
      console.error('Error parsing consent:', e);
    }
  }

  // When the accept all button is clicked
  acceptBtn.addEventListener('click', () => {
    const consent = { functional: true, marketing: true };
    saveConsent(consent);
    hideConsentUI();
    loadServices(consent);
  });

  // When the reject all button is clicked
  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      const consent = { functional: false, marketing: false };
      saveConsent(consent);
      hideConsentUI();
      loadServices(consent);
    });
  }

  // When manage preferences is clicked
  if (manageBtn) {
    manageBtn.addEventListener('click', () => {
      consentBanner.setAttribute('hidden', '');
      modal.removeAttribute('hidden');
    });
  }

  // When save preferences is clicked
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const consent = {
        functional: functionalCheckbox.checked,
        marketing: marketingCheckbox.checked
      };
      saveConsent(consent);
      hideConsentUI();
      loadServices(consent);
    });
  }

  // When accept all in modal is clicked
  if (acceptModalBtn) {
    acceptModalBtn.addEventListener('click', () => {
      functionalCheckbox.checked = true;
      marketingCheckbox.checked = true;
      const consent = { functional: true, marketing: true };
      saveConsent(consent);
      hideConsentUI();
      loadServices(consent);
    });
  }

  function saveConsent(consent) {
    localStorage.setItem('pg_consent_v1', JSON.stringify(consent));
  }

  function hideConsentUI() {
    consentBanner.setAttribute('hidden', '');
    modal.setAttribute('hidden', '');
  }

  function loadServices(consent) {
    // Load Tawk.to if marketing consent is given
    if (consent.marketing && typeof window.loadTawk === 'function') {
      window.loadTawk();
    }

    // Load Google Maps if functional consent is given
    if (consent.functional) {
      const mapPlaceholder = document.getElementById('map-placeholder');
      const gmap = document.getElementById('gmap');
      if (mapPlaceholder && gmap) {
        mapPlaceholder.style.display = 'none';
        gmap.src = gmap.getAttribute('data-src');
        gmap.removeAttribute('hidden');
      }
    }

    // Update Google Consent Mode if available
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: consent.functional ? 'granted' : 'denied',
        ad_storage: consent.marketing ? 'granted' : 'denied',
        ad_user_data: consent.marketing ? 'granted' : 'denied',
        ad_personalization: consent.marketing ? 'granted' : 'denied'
      });
    }
  }

  // Handle enable map button click
  const enableMapBtn = document.getElementById('enable-map');
  if (enableMapBtn) {
    enableMapBtn.addEventListener('click', () => {
      const consent = JSON.parse(localStorage.getItem('pg_consent_v1') || '{}');
      consent.functional = true;
      saveConsent(consent);
      loadServices(consent);
    });
  }
});