// js/social-links-loader.js
// Dynamically populate social links in footer/nav from site-settings.json

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const settingsResponse = await fetch('/data/site-settings.json');
        if (settingsResponse.ok) {
            const settings = await settingsResponse.json();
            const socialLinks = settings.site_info;
            document.querySelectorAll('[data-social]').forEach(element => {
                const socialKey = element.getAttribute('data-social');
                if (socialLinks[socialKey]) {
                    element.href = socialLinks[socialKey];
                    element.target = '_blank';
                    element.rel = 'noopener noreferrer';
                } else {
                    element.style.display = 'none';
                }
            });
        } else {
            console.warn('Failed to load site settings for social links.');
        }
    } catch (error) {
        console.error('Error fetching site settings for social links:', error);
    }
});
