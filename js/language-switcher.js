// Initialize language switcher
function initLanguageSwitcher() {
  const langToggleButton = document.getElementById('langToggle');
  if (!langToggleButton) {
    console.error('Language toggle button with id "langToggle" not found.');
    return;
  }

  // Default to 'en', check localStorage for saved preference
  let currentLang = localStorage.getItem('lang') || 'en';

  const applyTranslations = (lang) => {
    // Set language and direction on the document
    document.documentElement.lang = lang;
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', lang === 'ar');


    // Translate all elements with data-translate attribute
    const elementsToTranslate = document.querySelectorAll('[data-translate]');
    elementsToTranslate.forEach(el => {
      const key = el.dataset.translate;
      if (translations[lang] && translations[lang][key]) {
        const translation = translations[lang][key];
        
        const nodeName = el.nodeName.toLowerCase();
        if (['input', 'textarea'].includes(nodeName)) {
          el.placeholder = translation;
        } else if (nodeName === 'img') {
          el.alt = translation;
        } else {
          el.innerHTML = translation;
        }
      }
    });
  };

  // Add click event listener to the toggle button
  langToggleButton.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    localStorage.setItem('lang', currentLang);
    applyTranslations(currentLang);
  });

  // Apply translations on initial page load
  applyTranslations(currentLang);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initLanguageSwitcher);