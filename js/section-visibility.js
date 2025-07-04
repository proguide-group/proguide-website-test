/**
 * Section Visibility Controller with Language Support
 */
class SectionVisibilityController {
  constructor() {
    this.settingsUrl = '/data/site-settings.json';
    this.currentLang = document.documentElement.lang || 'en';
    this.init();
  }

  async init() {
    try {
      await this.loadSettings();
      this.setupLanguageSwitcher();
    } catch (error) {
      console.log('Settings not available, using defaults');
      this.useDefaults();
      this.setupLanguageSwitcher();
    }
  }

  async loadSettings() {
    const response = await fetch(this.settingsUrl);
    if (!response.ok) {
      throw new Error('Settings not found');
    }
    
    const settings = await response.json();
    this.applyVisibilitySettings(settings.sections);
  }

  useDefaults() {
    const defaultSettings = {
      show_projects: true,
      show_testimonials: true,
      show_clients: false,
      show_map: true
    };
    
    this.applyVisibilitySettings(defaultSettings);
  }

  applyVisibilitySettings(sections) {
    // Projects Section
    this.toggleSection('#projects, .projects-section, .work-section', sections.show_projects);
    
    // Client Testimonials/Feedback
    this.toggleSection('.testimonials-section, .feedback-section, .reviews-section', sections.show_testimonials);
    
    // Client Marquee
    this.toggleSection('.clients-marquee, .client-logos', sections.show_clients);
    
    // Map Section
    this.toggleSection('.map-section, #map, .location-section', sections.show_map);
    
    console.log('Section visibility applied:', sections);
  }

  toggleSection(selector, isVisible) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
      if (isVisible) {
        element.style.display = '';
        element.classList.remove('hidden');
      } else {
        element.style.display = 'none';
        element.classList.add('hidden');
      }
    });
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

    // Set initial language state
    this.updateLanguageButtons();
  }

  switchLanguage(newLang) {
    if (newLang === this.currentLang) return;

    this.currentLang = newLang;
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    
    // Store language preference
    localStorage.setItem('preferredLanguage', newLang);
    
    // Update active language button
    this.updateLanguageButtons();
    
    // Apply translations (you can expand this)
    this.applyTranslations(newLang);
    
    // Trigger custom event for other components
    document.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language: newLang } 
    }));
  }

  updateLanguageButtons() {
    document.querySelectorAll('.lang-switch').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === this.currentLang);
    });
  }

  applyTranslations(lang) {
    // Basic translations - you can expand this
    const translations = {
      en: {
        nav_home: "Home",
        nav_about: "About", 
        nav_services: "Services",
        nav_projects: "Projects",
        nav_team: "Team",
        nav_contact: "Contact",
        nav_blog: "Blog"
      },
      ar: {
        nav_home: "الرئيسية",
        nav_about: "من نحن",
        nav_services: "خدماتنا", 
        nav_projects: "مشاريعنا",
        nav_team: "فريقنا",
        nav_contact: "اتصل بنا",
        nav_blog: "المدونة"
      }
    };

    // Apply translations to elements with data-translate attributes
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.getAttribute('data-translate');
      if (translations[lang] && translations[lang][key]) {
        element.textContent = translations[lang][key];
      }
    });
  }

  // Method to manually refresh settings
  async refresh() {
    await this.init();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check for saved language preference
  const savedLang = localStorage.getItem('preferredLanguage') || 'en';
  document.documentElement.lang = savedLang;
  document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
  
  window.sectionVisibility = new SectionVisibilityController();
});

// Make it available globally
window.SectionVisibilityController = SectionVisibilityController;