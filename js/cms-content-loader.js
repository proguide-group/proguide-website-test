class CMSContentLoader {
  constructor() {
    this.currentLang = document.documentElement.lang || 'en';
    this.init();
  }

  async init() {
    try {
      await this.loadSettings();
      await this.loadClients();
      await this.loadProjects();
      await this.loadTestimonials();
    } catch (error) {
      console.log('CMS content not available, using defaults');
    }
  }

  async loadSettings() {
    try {
      const response = await fetch('/data/settings.json');
      const settings = await response.json();
      
      // Update statistics
      if (settings.sections.show_statistics) {
        this.updateStatistics(settings.stats);
      } else {
        this.hideSection('.stats-grid');
      }

      // Control section visibility
      this.toggleSection('.clients-marquee', settings.sections.show_clients);
      this.toggleSection('#projects', settings.sections.show_projects);
      this.toggleSection('.testimonials-section', settings.sections.show_testimonials);
      
    } catch (error) {
      console.log('Settings file not found');
    }
  }

  async loadClients() {
    try {
      const clientsData = await this.fetchMarkdownFiles('/data/clients/');
      if (clientsData.length > 0) {
        this.renderClientsMarquee(clientsData);
      }
    } catch (error) {
      console.log('Clients data not found');
    }
  }

  async loadProjects() {
    try {
      const projectsData = await this.fetchMarkdownFiles('/data/projects/');
      if (projectsData.length > 0) {
        this.renderProjects(projectsData);
      }
    } catch (error) {
      console.log('Projects data not found');
    }
  }

  async loadTestimonials() {
    try {
      const testimonialsData = await this.fetchMarkdownFiles('/data/testimonials/');
      if (testimonialsData.length > 0) {
        this.renderTestimonials(testimonialsData);
      }
    } catch (error) {
      console.log('Testimonials data not found');
    }
  }

  updateStatistics(stats) {
    const elements = {
      projects: document.querySelector('[data-count]'),
      years: document.querySelectorAll('[data-count]')[1],
      satisfaction: document.querySelectorAll('[data-count]')[2]
    };

    if (elements.projects) elements.projects.setAttribute('data-count', stats.projects_completed);
    if (elements.years) elements.years.setAttribute('data-count', stats.years_experience);
    if (elements.satisfaction) elements.satisfaction.setAttribute('data-count', stats.client_satisfaction);
  }

  renderClientsMarquee(clients) {
    const marqueeTrack = document.querySelector('.marquee-track');
    if (!marqueeTrack) return;

    const activeClients = clients
      .filter(client => client.active)
      .sort((a, b) => a.order - b.order);

    marqueeTrack.innerHTML = activeClients.map(client => `
      <div class="marquee-item">
        <img src="${client.logo}" alt="${this.currentLang === 'ar' ? client.name_ar : client.name_en}">
      </div>
    `).join('');
  }

  renderProjects(projects) {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    const featuredProjects = projects
      .filter(project => project.featured && project.active)
      .sort((a, b) => a.order - b.order)
      .slice(0, 3);

    projectsGrid.innerHTML = featuredProjects.map(project => `
      <div class="project-card">
        <div class="project-image">
          <img src="${project.image}" alt="${this.currentLang === 'ar' ? project.title_ar : project.title_en}">
          <div class="project-overlay">
            <h3 class="project-title">${this.currentLang === 'ar' ? project.title_ar : project.title_en}</h3>
            <p class="project-summary">${this.currentLang === 'ar' ? project.summary_ar : project.summary_en}</p>
            <a href="${project.url || '#'}" class="project-link">
              <span>${this.currentLang === 'ar' ? 'عرض المشروع' : 'View Project'}</span>
              <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderTestimonials(testimonials) {
    const testimonialsSlider = document.querySelector('.testimonials-slider');
    if (!testimonialsSlider) return;

    const activeTestimonials = testimonials
      .filter(testimonial => testimonial.active)
      .sort((a, b) => a.order - b.order);

    testimonialsSlider.innerHTML = activeTestimonials.map(testimonial => `
      <div class="testimonial-card">
        <div class="testimonial-content">
          <div class="rating">
            ${this.generateStars(testimonial.rating)}
          </div>
          <p class="testimonial-text">
            "${this.currentLang === 'ar' ? testimonial.text_ar : testimonial.text_en}"
          </p>
          <div class="client-info">
            <div class="client-avatar">
              <img src="${testimonial.photo}" alt="${this.currentLang === 'ar' ? testimonial.name_ar : testimonial.name_en}">
            </div>
            <div class="client-details">
              <h4 class="client-name">${this.currentLang === 'ar' ? testimonial.name_ar : testimonial.name_en}</h4>
              <p class="client-position">${this.currentLang === 'ar' ? testimonial.position_ar : testimonial.position_en}, ${this.currentLang === 'ar' ? testimonial.company_ar : testimonial.company_en}</p>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>';
    }

    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    }

    return stars;
  }

  toggleSection(selector, show) {
    const element = document.querySelector(selector);
    if (element) {
      element.style.display = show ? 'block' : 'none';
    }
  }

  hideSection(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.style.display = 'none';
    }
  }

  async fetchMarkdownFiles(path) {
    // This would need to be implemented based on your build process
    // For now, return empty array - you'll need to generate a JSON index
    return [];
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CMSContentLoader();
});

// Reinitialize when language changes
document.addEventListener('languageChanged', () => {
  new CMSContentLoader();
});