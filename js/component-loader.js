/**
 * Component Loader - Loads shared components like header and footer
 */
class ComponentLoader {
  constructor() {
    this.componentsPath = './components/';
    this.init();
  }

  async init() {
    try {
      await this.loadHeader();
      // Initialize navigation functionality after header is loaded
      this.initializeNavigation();
      // Call translationManager.setupLanguageToggle() directly after header is loaded
      if (window.translationManager && typeof window.translationManager.setupLanguageToggle === 'function') {
        window.translationManager.setupLanguageToggle();
      }
    } catch (error) {
      console.error('Error loading components:', error);
    }
  }

  async loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
      try {
        const response = await fetch(`${this.componentsPath}header.html`);
        if (response.ok) {
          const headerHTML = await response.text();
          headerPlaceholder.innerHTML = headerHTML;
          console.log('Header loaded successfully');
        } else {
          throw new Error('Header component not found');
        }
      } catch (error) {
        console.error('Failed to load header:', error);
        // Fallback - keep existing header if component loading fails
      }
    }
  }

  initializeNavigation() {
    // Initialize mobile menu toggle
    this.initMobileMenu();
    
    
    // Initialize scroll effects
    this.initScrollEffects();
    
    // Initialize smooth scrolling
    this.initSmoothScrolling();
  }

  initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
      mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('nav-open');
      });

      // Close menu when clicking on links
      document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
          mobileMenuToggle.classList.remove('active');
          navLinks.classList.remove('active');
          document.body.classList.remove('nav-open');
        });
      });
    }
  }

  initLanguageToggle() {
  }

  initScrollEffects() {
    const navbar = document.querySelector('.main-nav');
    
    if (navbar) {
      let lastScrollY = window.scrollY;
      
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        
        // Add scrolled class
        if (scrollY > 100) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll (optional)
        if (scrollY > lastScrollY && scrollY > 500) {
          navbar.classList.add('nav-hidden');
        } else {
          navbar.classList.remove('nav-hidden');
        }
        
        lastScrollY = scrollY;
      });
    }
  }

  initSmoothScrolling() {
    // Smooth scrolling for anchor links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const navHeight = document.querySelector('.main-nav')?.offsetHeight || 0;
          const targetPosition = targetElement.offsetTop - navHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  }

  // Method to reload components (useful for updates)
  async reload() {
    await this.init();
  }
}

// Initialize component loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  
  // Initialize component loader
  window.componentLoader = new ComponentLoader();
});

// Make it available globally
window.ComponentLoader = ComponentLoader;