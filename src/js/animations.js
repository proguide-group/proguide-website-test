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
      dot.style.opacity = Math.random() * 0.5 + 0.1;
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

// Particle.js Initialization
function initParticles() {
  if (document.getElementById('particles-js')) {
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 80,
          density: { enable: true, value_area: 800 }
        },
        color: {
          value: document.documentElement.getAttribute('data-theme') === 'dark' 
            ? '#4361ee' : '#3a86ff'
        },
        shape: { type: 'circle' },
        opacity: {
          value: 0.5,
          random: true,
          anim: { enable: true, speed: 1, opacity_min: 0.1 }
        },
        size: {
          value: 3,
          random: true,
          anim: { enable: true, speed: 2, size_min: 0.1 }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: 'currentColor',
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: 1,
          direction: 'none',
          random: true,
          out_mode: 'out'
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: { enable: true, mode: 'grab' },
          onclick: { enable: true, mode: 'push' },
          resize: true
        },
        modes: {
          grab: { distance: 140, line_linked: { opacity: 0.5 } },
          push: { particles_nb: 4 }
        }
      },
      retina_detect: true
    });
  }
}

// Scroll Animations
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        
        // Special handling for different animation types
        if (entry.target.classList.contains('fade-up')) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
        
        if (entry.target.classList.contains('scale-in')) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'scale(1)';
        }
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // Observe all elements with animation classes
  document.querySelectorAll('.fade-up, .scale-in, .reveal, .animate').forEach(el => {
    observer.observe(el);
  });
}

// Animated Counters
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = +entry.target.getAttribute('data-count');
        const duration = 2000; // Animation duration in ms
        const startTime = performance.now();
        
        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          entry.target.textContent = Math.floor(progress * target);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        requestAnimationFrame(animate);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

// Smooth Scrolling
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        const nav = document.querySelector('.nav-links');
        if (nav.classList.contains('open')) {
          document.querySelector('.mobile-menu-toggle').classList.remove('open');
          nav.classList.remove('open');
        }
      }
    });
  });
}

// Mobile Menu
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });
}

// Back to Top Button
function initBackToTop() {
  const button = document.querySelector('.back-to-top');
  if (!button) return;

  window.addEventListener('scroll', () => {
    button.classList.toggle('visible', window.scrollY > 300);
  });

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Form Validation
function initFormValidation() {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
      let isValid = true;
      const inputs = form.querySelectorAll('[required]');
      
      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.classList.add('error');
          isValid = false;
        } else {
          input.classList.remove('error');
        }
      });

      if (!isValid) {
        e.preventDefault();
        alert('Please fill in all required fields.');
      } else {
        // Simulate form submission
        e.preventDefault();
        form.querySelector('button[type="submit"]').disabled = true;
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'form-success';
        successMsg.innerHTML = `
          <i class="fas fa-check-circle"></i>
          <span data-translate="form_success">Thank you! Your message has been sent.</span>
        `;
        form.appendChild(successMsg);
        
        // Reset form after delay
        setTimeout(() => {
          form.reset();
          successMsg.remove();
          form.querySelector('button[type="submit"]').disabled = false;
        }, 3000);
      }
    });
  });
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initHeroAnimations();
  initScrollAnimations();
  animateCounters();
  initSmoothScroll();
  initMobileMenu();
  initBackToTop();
  initFormValidation();

  // Initialize language switcher if available
  if (typeof initLanguageSwitcher === 'function') {
    initLanguageSwitcher();
  }
});

// Resize handler for particles
window.addEventListener('resize', () => {
  if (window.pJSDom && window.pJSDom.length > 0) {
    pJSDom[0].pJS.fn.vendors.destroypJS();
    initParticles();
  }
});