/* filepath: js/blog-config.js */
// Shared blog configuration
const BLOG_CONFIG = {
  // Fallback list if blog-index.json doesn't exist
  fallbackBlogFiles: [
    '2025-01-15-test-proguide-blog.md',
    '2025-07-02-mechanical-reverse-engineering-in-saudi-arabia-how-proguide-sets-the-standard-for-innovation.md',
    'whyProGuide.md',
    'الهندسة-العكسية-الرقمية-حل-قطع-الغيار.md'
  ],
  
  // Function to load blog files (either from index or fallback)
  async loadBlogFilesList() {
    try {
      const indexResponse = await fetch('assets/blog-index.json');
      if (indexResponse.ok) {
        const blogFiles = await indexResponse.json();
        console.log('Loaded blog files from index:', blogFiles);
        return blogFiles;
      } else {
        console.log('Using fallback blog files list');
        return this.fallbackBlogFiles;
      }
    } catch (error) {
      console.warn('Failed to load blog index, using fallback:', error);
      return this.fallbackBlogFiles;
    }
  }
};

// Make it available globally
window.BLOG_CONFIG = BLOG_CONFIG;