/**
 * Proguide Website Animations
 * Complete animation controller with modern effects
 */

// Hero Section Animations
function initHeroAnimations() {
  // Generate dot grid for scan effect
  const dotGrid = document.querySelector('.dot-grid');
  if (dotGrid) {
    for (let i = 0; i < 400; i++) { // 20x20 grid
      const dot = document.createElement('span');
      dot.style.animationDelay = `${Math.random() * 2}s`;
      dot.style.opacity = Math.random() * 0.3 + 0.1; // Reduced opacity for lighter theme
      dotGrid.appendChild(dot);
    }
  }

  // Animate subtitle lines sequentially
  const subtitleLines = document.querySelectorAll('.subtitle-line');
  subtitleLines.forEach((line, index) => {
    setTimeout(() => {
      line.style.transform = 'translateY(0)';
      line.style.opacity = '1';
    }, index * 200 + 500);
  });

  // Part transition hover effect
  const scanContainer = document.querySelector('.scan-animation');
  if (scanContainer) {
    let isHovering = false;
    
    scanContainer.addEventListener('mouseenter', () => {
      isHovering = true;
      document.querySelector('.part-real').style.transform = 'rotateY(-90deg)';
      document.querySelector('.part-digital').style.transform = 'rotateY(0deg)';
    });
    
    scanContainer.addEventListener('mouseleave', () => {
      isHovering = false;
      document.querySelector('.part-real').style.transform = 'rotateY(0deg)';
      document.querySelector('.part-digital').style.transform = 'rotateY(90deg)';
    });

    // Auto-trigger scan effect periodically
    setInterval(() => {
      if (!isHovering && Math.random() > 0.7) {
        scanContainer.classList.add('trigger-scan');
        setTimeout(() => scanContainer.classList.remove('trigger-scan'), 1200);
      }
    }, 5000);
  }
}

// Particle.js Initialization - Updated for Light Theme
function initParticles() {
  if (document.getElementById('particles-js')) {
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 60, // Reduced number for cleaner look
          density: { enable: true, value_area: 1000 }
        },
        color: {
          value: '#a5b4fc' // Lighter primary color for light theme
        },
        shape: { 
          type: 'circle',
          stroke: {
            width: 0,
            color: '#e0e7ff'
          }
        },
        opacity: {
          value: 0.3, // Reduced opacity for subtlety
          random: true,
          anim: { 
            enable: true, 
            speed: 0.5, // Slower animation
            opacity_min: 0.05 
          }
        },
        size: {
          value: 2, // Smaller particles
          random: true,
          anim: { 
            enable: true, 
            speed: 1, 
            size_min: 0.1 
          }
        },
        line_linked: {
          enable: true,
          distance: 120, // Shorter lines for cleaner look
          color: '#e0e7ff', // Very light blue for connections
          opacity: 0.15, // Very subtle lines
          width: 1
        },
        move: {
          enable: true,
          speed: 0.8, // Slower movement
          direction: 'none',
          random: true,
          straight: false,
          out_mode: 'out',
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { 
            enable: true, 
            mode: 'grab' 
          },
          onclick: { 
            enable: true, 
            mode: 'push' 
          },
          resize: true
        },
        modes: {
          grab: { 
            distance: 100, // Shorter grab distance
            line_linked: { 
              opacity: 0.3 // Subtle hover effect
            } 
          },
          push: { 
            particles_nb: 2 // Fewer particles on click
          },
          remove: {
            particles_nb: 2
          }
        }
      },
      retina_detect: true
    });
  }
}

// Scroll Animations - Updated for smoother light theme transitions
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        
        // Special handling for different animation types
        if (entry.target.classList.contains('fade-up')) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          entry.target.style.transition = 'all 0.6s ease-out';
        }
        
        if (entry.target.classList.contains('scale-in')) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'scale(1)';
          entry.target.style.transition = 'all 0.5s ease-out';
        }
        
        if (entry.target.classList.contains('slide-in-left')) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
          entry.target.style.transition = 'all 0.6s ease-out';
        }
        
        if (entry.target.classList.contains('slide-in-right')) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
          entry.target.style.transition = 'all 0.6s ease-out';
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe all elements with animation classes
  document.querySelectorAll('.fade-up, .scale-in, .slide-in-left, .slide-in-right, .reveal, .animate').forEach(el => {
    observer.observe(el);
  });
}

// Animated Counters - Enhanced for light theme
// Animated Counters - Enhanced for light theme
async function animateCounters() { // Made async to allow fetch
  const counters = document.querySelectorAll('[data-metric]'); // Changed selector
  if (!counters.length) return;

  let metricsData = {};
  try {
    const response = await fetch('/data/site-metrics.json');
    if (response.ok) {
      metricsData = await response.json();
    } else {
      console.warn('Failed to load site metrics, using fallback or default values.');
    }
  } catch (error) {
    console.error('Error fetching site metrics:', error);
    console.warn('Using fallback or default values for counters.');
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const metricKey = entry.target.getAttribute('data-metric'); // Get the metric key
        // Use the fetched metric or fallback to the hardcoded data-count if not found
        // or a default if neither is present.
        const targetValue = metricsData[metricKey] !== undefined ? +metricsData[metricKey] : +entry.target.getAttribute('data-count');
        
        // Handle company_experience_badge separately if it's not a number
        if (metricKey === 'company_experience_badge') {
          entry.target.textContent = metricsData[metricKey] || entry.target.textContent;
          observer.unobserve(entry.target); // Stop observing after setting text
          return; // Skip numeric animation for this
        }

        const duration = 2500;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          
          entry.target.textContent = Math.floor(easeOutCubic * targetValue); // Use targetValue
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            entry.target.textContent = targetValue;
          }
        };
        
        requestAnimationFrame(animate);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

// Smooth Scrolling - Enhanced
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerOffset = 100; // Account for fixed header
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        const nav = document.querySelector('.nav-links');
        const toggle = document.querySelector('.mobile-menu-toggle');
        if (nav && nav.classList.contains('open')) {
          toggle.classList.remove('open');
          nav.classList.remove('open');
          document.body.style.overflow = '';
        }
      }
    });
  });
}

// Mobile Menu - Enhanced
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.contains('open');
    
    toggle.classList.toggle('open');
    nav.classList.toggle('open');
    document.body.style.overflow = isOpen ? '' : 'hidden';
    
    // Add smooth transition
    if (!isOpen) {
      nav.style.visibility = 'visible';
    } else {
      setTimeout(() => {
        if (!nav.classList.contains('open')) {
          nav.style.visibility = 'hidden';
        }
      }, 300);
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !nav.contains(e.target) && nav.classList.contains('open')) {
      toggle.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// Back to Top Button - Enhanced for light theme
function initBackToTop() {
  const button = document.querySelector('.back-to-top');
  if (!button) return;

  let isVisible = false;

  window.addEventListener('scroll', () => {
    const shouldShow = window.scrollY > 400;
    
    if (shouldShow && !isVisible) {
      button.classList.add('visible');
      isVisible = true;
    } else if (!shouldShow && isVisible) {
      button.classList.remove('visible');
      isVisible = false;
    }
  });

  button.addEventListener('click', () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  });
}

// Form Validation - Enhanced
function initFormValidation() {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
      let isValid = true;
      const inputs = form.querySelectorAll('[required]');
      
      inputs.forEach(input => {
        const value = input.value.trim();
        
        // Remove previous error states
        input.classList.remove('error');
        
        // Basic validation
        if (!value) {
          input.classList.add('error');
          isValid = false;
        } else if (input.type === 'email' && !isValidEmail(value)) {
          input.classList.add('error');
          isValid = false;
        }
      });

      if (!isValid) {
        e.preventDefault();
        // Show error message (translated)
        showFormMessage(form, 'error', window.getTranslation('form_validation_error'));
        // Focus first error field
        const firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
      } else {
        // Simulate form submission
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = window.getTranslation('form_sending_message');
        // Simulate loading delay
        setTimeout(() => {
          showFormMessage(form, 'success', window.getTranslation('form_success_message'));
          form.reset();
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }, 1500);
      }
    });
  });
}

// Helper function for email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to show form messages
function showFormMessage(form, type, message) {
  // Remove existing messages
  const existingMsg = form.querySelector('.form-message');
  if (existingMsg) existingMsg.remove();
  
  const messageEl = document.createElement('div');
  messageEl.className = `form-message form-message-${type}`;
  messageEl.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
    <span>${message}</span>
  `;
  
  form.appendChild(messageEl);
  
  // Auto-remove after delay
  setTimeout(() => {
    messageEl.remove();
  }, type === 'success' ? 4000 : 3000);
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
  // Initialize animations with slight delays for better performance
  setTimeout(initParticles, 100);
  setTimeout(initHeroAnimations, 200);
  setTimeout(initScrollAnimations, 300);
  setTimeout(animateCounters, 400);
  
  // Initialize interactions immediately
  initSmoothScroll();
  initMobileMenu();
  initBackToTop();
  initFormValidation();

  // Initialize language switcher if available
});

// Resize handler for particles - Enhanced
window.addEventListener('resize', debounce(() => {
  if (window.pJSDom && window.pJSDom.length > 0) {
    pJSDom[0].pJS.fn.vendors.destroypJS();
    setTimeout(initParticles, 100);
  }
}, 250));

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Performance optimization - Pause animations when tab is not visible
document.addEventListener('visibilitychange', () => {
  const particles = document.getElementById('particles-js');
  if (particles) {
    if (document.hidden) {
      particles.style.display = 'none';
    } else {
      particles.style.display = 'block';
    }
  }
});