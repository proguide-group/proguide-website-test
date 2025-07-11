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
    } catch (error) {
      console.log('Settings not available, using defaults');
      this.useDefaults();
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
  }

  switchLanguage(newLang) {

  }

  updateLanguageButtons() {
  }

  applyTranslations(lang) {

  }

  // Method to manually refresh settings
  async refresh() {
    await this.init();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  
  window.sectionVisibility = new SectionVisibilityController();
});

// Make it available globally
window.SectionVisibilityController = SectionVisibilityController;