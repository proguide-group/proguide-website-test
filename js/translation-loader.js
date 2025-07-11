class TranslationManager {
  constructor() {
    this.currentTranslations = {};
    // Get initial language from localStorage or default to 'en'
    this.currentLang = localStorage.getItem('preferredLanguage') || 'en';
    this.isFetching = false; // Prevent multiple simultaneous fetches

    // Ensure initial document language and direction are set immediately
    document.documentElement.lang = this.currentLang;
    document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', this.currentLang === 'ar');

    // Fetch and apply translations on initial load
    document.addEventListener('DOMContentLoaded', async () => {
      await this.fetchTranslations(this.currentLang);
      this.setupLanguageToggle(); // Setup toggle after initial translations are loaded
    });
  }

  async fetchTranslations(lang) {
    if (this.isFetching) {
      console.warn('Translation fetch already in progress.');
      return;
    }
    this.isFetching = true;

    try {
      console.log(`Fetching translations for: ${lang}`);
      const response = await fetch(`/data/translations-${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}: ${response.statusText}`);
      }
      const data = await response.json();
      this.currentTranslations = data.translations;
      this.applyTranslations();
      console.log(`Translations loaded and applied for: ${lang}`);

      // Dispatch a custom event after translations are applied
      document.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: lang },
        bubbles: true // Allow event to bubble up
      }));

    } catch (error) {
      console.error("Error loading or applying translations:", error);
      // Optionally, load a fallback language or show an error to the user
      if (lang !== 'en') { // Prevent infinite loop if English also fails
        console.warn('Attempting to load English fallback due to error.');
        await this.fetchTranslations('en'); // Fallback to English
      }
    } finally {
      this.isFetching = false;
    }
  }

  getTranslation(key) {
    return this.currentTranslations[key] || key; // Return key if translation is missing
  }

  applyTranslations() {
    // Apply translations to elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.getAttribute('data-translate');
      const translation = this.getTranslation(key);

      // Handle common elements that might use innerText or placeholder
      const nodeName = element.nodeName.toLowerCase();
      if (['input', 'textarea'].includes(nodeName)) {
        element.placeholder = translation;
      } else if (nodeName === 'img') {
        element.alt = translation;
      } else {
        element.innerHTML = translation; // Use innerHTML to allow for HTML in translations
      }
    });

    // Handle data-translate-attr
    document.querySelectorAll('[data-translate-attr]').forEach(element => {
      const key = element.getAttribute('data-translate');
      const attrToTranslate = element.getAttribute('data-translate-attr');
      const translation = this.getTranslation(key + '_' + attrToTranslate); // e.g., 'blog_search_placeholder'

      if (translation) {
        element.setAttribute(attrToTranslate, translation);
      }
    });

    // Update the language toggle button text itself (as it might have data-translate)
    const langToggleButtonText = document.querySelector('#langToggle span[data-translate="lang_toggle"]');
    if (langToggleButtonText) {
      // Set the button text to the *other* language for the toggle
      langToggleButtonText.textContent = this.currentLang === 'en' ? this.getTranslation('lang_toggle_ar_text') : this.getTranslation('lang_toggle_en_text');
    }
  }

  setupLanguageToggle() {
    const langToggleButton = document.getElementById('langToggle');
    if (langToggleButton) {
      langToggleButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const newLang = this.currentLang === 'en' ? 'ar' : 'en';
        await this.switchLanguage(newLang);
      });
      // Initial update of the button text
      this.updateToggleButtonText();
    }
  }

  async switchLanguage(newLang) {
    if (newLang === this.currentLang) return; // No change needed
    this.currentLang = newLang;

    // Update document language and direction
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', newLang === 'ar');

    // Store preference
    localStorage.setItem('preferredLanguage', newLang);

    // Fetch and apply new translations
    await this.fetchTranslations(newLang);

    // Update the toggle button text after switch
    this.updateToggleButtonText();
  }

  updateToggleButtonText() {
    const langToggleButtonText = document.querySelector('#langToggle span[data-translate="lang_toggle"]');
    if (langToggleButtonText) {
      // If current language is English, display 'عربي' to switch to Arabic
      // If current language is Arabic, display 'EN' to switch to English
      langToggleButtonText.textContent = this.currentLang === 'en' ? this.getTranslation('lang_toggle_ar_text') : this.getTranslation('lang_toggle_en_text');
    }
  }
}

// Instantiate the manager globally
window.translationManager = new TranslationManager();

// Make getTranslation public for other modules (like blog-post.js)
window.getTranslation = (key) => window.translationManager.getTranslation(key);

// Optional: Ensure translation is applied if DOM changes dynamically (e.g., blog posts)
// This listener can be used by modules that inject new content
document.addEventListener('contentLoadedAndReadyForTranslation', () => {
  window.translationManager.applyTranslations();
});
