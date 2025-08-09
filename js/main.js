document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    const navbar = document.querySelector('.main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });

    // NEW: Advanced form submission handling for Netlify
    const contactForm = document.querySelector('form[name="contact"]');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default browser submission
            const form = e.target;
            const formData = new FormData(form);
            const statusDiv = document.getElementById('form-status');
            const submitButton = form.querySelector('button[type="submit"]');
            const buttonOriginalText = submitButton.querySelector('span').textContent;
            
            // Ensure form-name is included
            formData.set('form-name', 'contact');
            
            // Disable button and show sending message
            submitButton.disabled = true;
            submitButton.querySelector('span').textContent = 'Sending...';
            statusDiv.textContent = '';
            statusDiv.className = 'form-status-message';
            
            // Use fetch to submit form data in the correct format for Netlify
            fetch(form.action || '/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            })
            .then(response => {
                if (response.ok) {
                    // Show success message
                    statusDiv.textContent = 'Thank you! Your message has been sent successfully.';
                    statusDiv.classList.add('success');
                    form.reset(); // Clear the form 
                } else {
                    // Handle server-side errors
                    throw new Error('Network response was not ok.');
                }
            })
            .catch(error => {
                // Show error message
                statusDiv.textContent = 'Sorry, there was an error sending your message. Please try again later.';
                statusDiv.classList.add('error');
                console.error('Form submission error:', error);
            })
            .finally(() => {
                // Re-enable the button and restore text
                submitButton.disabled = false;
                submitButton.querySelector('span').textContent = buttonOriginalText;
                // Hide the status message after a few seconds
                setTimeout(() => {
                    statusDiv.textContent = '';
                    statusDiv.className = 'form-status-message';
                }, 5000);
            });
        });
    }

    // Animation observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    });

    document.querySelectorAll('.animate-fade-up').forEach(element => {
        observer.observe(element);
    });
});