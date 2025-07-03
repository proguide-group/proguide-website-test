class TranslationManager {
  constructor() {
    this.currentLang = document.documentElement.lang || 'en';
    this.translations = {};
    this.init();
  }

  async init() {
    try {
      await this.loadAllTranslations();
      this.applyTranslations();
      this.setupLanguageSwitcher();
    } catch (error) {
      console.log('Translations not available, using defaults');
    }
  }

  async loadAllTranslations() {
    const translationFiles = [
      'navigation',
      'hero', 
      'about',
      'services',
      'process',
      'contact',
      'blog',
      'footer'
    ];

    for (const file of translationFiles) {
      try {
        const response = await fetch(`/data/translations/${file}.json`);
        const data = await response.json();
        this.translations[file] = data;
      } catch (error) {
        console.log(`Translation file ${file}.json not found`);
      }
    }
  }

  applyTranslations() {
    // Apply all translations to elements with data-translate attributes
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.getAttribute('data-translate');
      const translation = this.getTranslation(key);
      
      if (translation) {
        if (element.tagName === 'INPUT' && element.type === 'text') {
          element.placeholder = translation;
        } else {
          element.textContent = translation;
        }
      }
    });

    // Apply translations to form labels and placeholders
    this.updateFormElements();
  }

  getTranslation(key) {
    const [section, translationKey] = key.split('_', 2);
    const fullKey = key.replace(`${section}_`, '');
    
    if (this.translations[section] && this.translations[section][this.currentLang]) {
      return this.translations[section][this.currentLang][fullKey];
    }
    
    return null;
  }

  updateFormElements() {
    // Update contact form if it exists
    const contactForm = document.querySelector('.contact-form');
    if (contactForm && this.translations.contact) {
      const lang = this.translations.contact[this.currentLang];
      
      // Update form field labels and placeholders
      const nameField = contactForm.querySelector('[name="name"]');
      const emailField = contactForm.querySelector('[name="email"]');
      const companyField = contactForm.querySelector('[name="company"]');
      const messageField = contactForm.querySelector('[name="message"]');
      const submitBtn = contactForm.querySelector('[type="submit"]');

      if (nameField && lang.form_name) nameField.placeholder = lang.form_name;
      if (emailField && lang.form_email) emailField.placeholder = lang.form_email;
      if (companyField && lang.form_company) companyField.placeholder = lang.form_company;
      if (messageField && lang.form_message) messageField.placeholder = lang.form_message;
      if (submitBtn && lang.submit_btn) submitBtn.textContent = lang.submit_btn;
    }

    // Update search form in blog
    const searchInput = document.querySelector('#blog-search');
    if (searchInput && this.translations.blog) {
      const placeholder = this.translations.blog[this.currentLang]?.search_placeholder;
      if (placeholder) searchInput.placeholder = placeholder;
    }
  }

  setupLanguageSwitcher() {
    // Setup language switcher functionality
    document.querySelectorAll('.lang-switch').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const newLang = button.getAttribute('data-lang');
        this.switchLanguage(newLang);
      });
    });
  }

  async switchLanguage(newLang) {
    if (newLang === this.currentLang) return;

    this.currentLang = newLang;
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    
    // Store language preference
    localStorage.setItem('preferredLanguage', newLang);
    
    // Reapply translations
    this.applyTranslations();
    
    // Trigger custom event for other components
    document.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: newLang } 
    }));

    // Update active language button
    document.querySelectorAll('.lang-switch').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === newLang);
    });
  }

  // Method to get current language
  getCurrentLanguage() {
    return this.currentLang;
  }

  // Method to get translation by key for JavaScript use
  t(key) {
    return this.getTranslation(key) || key;
  }
}

// Initialize translation manager
let translationManager;

document.addEventListener('DOMContentLoaded', () => {
  // Check for saved language preference
  const savedLang = localStorage.getItem('preferredLanguage') || 'en';
  document.documentElement.lang = savedLang;
  document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  
  translationManager = new TranslationManager();
});

// Export for use in other scripts
window.TranslationManager = TranslationManager;
window.t = (key) => translationManager ? translationManager.t(key) : key;