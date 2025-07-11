/* filepath: js/blogs.js */
/**
 * Blog Posts Management
 * Handles loading and displaying blog posts from markdown files
 */

class BlogManager {
  constructor() {
    this.postsPerPage = 6;
    this.currentPage = 1;
    this.posts = [];
    this.filteredPosts = [];
    this.totalPages = 0;
    this.currentFilters = {
      search: '',
      topic: 'all',
      language: 'all' // This filter should be controlled by the main language switch
    };
    this.isFiltering = false;

    // Listen for global language change event
    document.addEventListener('languageChanged', (e) => this.handleLanguageChange(e));
  }

  async init() {
    await this.loadBlogPosts();
    // The initial filteredPosts should be based on the current interface language
    this.currentFilters.language = document.documentElement.lang;
    this.applyFilters(); // Call applyFilters to set up initial view
    this.setupFilters();
    this.setupPagination();
    this.setupNewsletterForm();
    // renderPosts() and updateResultsCount() are called by applyFilters()
    this.updatePaginationControls();
  }
  // NEW METHOD
  async handleLanguageChange(event) {
    const newLang = event.detail.language;
    console.log(`BlogManager: Language changed to ${newLang}. Re-applying filters.`);
    this.currentFilters.language = newLang; // Update the language filter
    this.currentPage = 1; // Reset to first page on language change
    this.applyFilters(); // Re-apply filters to refresh posts based on new language
    // Re-attach category listeners as the DOM might have been rebuilt by BlogCategoriesLoader
    // setTimeout is a small workaround to ensure BlogCategoriesLoader completes its rebuild first
    setTimeout(() => {
        if (window.blogCategoriesLoader) {
            window.blogCategoriesLoader.attachCategoryListeners(); // Re-attach listeners for category tags
            // Ensure the 'All' category for the new language is active by default
            const activeCategoryButton = document.querySelector(`.category-tag[data-slug="all"][data-language="${newLang}"]`);
            if (activeCategoryButton) {
                document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
                activeCategoryButton.classList.add('active');
            }
        }
    }, 150); // Small delay
  }

  async loadBlogPosts() {
    try {
      // Load the auto-generated blog index or use fallback
      let blogFiles;
      try {
        const indexResponse = await fetch('assets/blog-index.json');
        blogFiles = indexResponse.ok ? await indexResponse.json() : [
          '2025-01-15-test-proguide-blog.md',
          '2025-07-02-mechanical-reverse-engineering-in-saudi-arabia-how-proguide-sets-the-standard-for-innovation.md',
          'whyProGuide.md',
          'الهندسة-العكسية-الرقمية-حل-قطع-الغيار.md'
        ];
      } catch {
        blogFiles = [
          '2025-01-15-test-proguide-blog.md',
          '2025-07-02-mechanical-reverse-engineering-in-saudi-arabia-how-proguide-sets-the-standard-for-innovation.md',
          'whyProGuide.md',
          'الهندسة-العكسية-الرقمية-حل-قطع-الغيار.md'
        ];
      }

      console.log('Loading blog files:', blogFiles);
      
      const posts = [];
      
      for (const filename of blogFiles) {
        try {
          console.log(`Attempting to fetch: assets/blog/${filename}`);
          const encodedFilename = encodeURIComponent(filename);
          const response = await fetch(`assets/blog/${encodedFilename}`);
          console.log(`Response for ${filename}:`, response.status, response.ok);
          
          if (response.ok) {
            const content = await response.text();
            console.log(`Content length for ${filename}:`, content.length);
            const post = this.parseMarkdown(content, filename);
            if (post) {
              console.log(`Generated post:`, post);
              posts.push(post);
            }
          }
        } catch (error) {
          console.warn(`Failed to load blog post: ${filename}`, error);
        }
      }
      
      // Sort posts by date (newest first)
      this.posts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      this.totalPages = Math.ceil(this.posts.length / this.postsPerPage);
      
      console.log('Loaded posts:', this.posts.length);
      console.log('All posts:', this.posts);
      
    } catch (error) {
      console.error('Error loading blog posts:', error);
      this.showError();
    }
  }

  // Add a category mapping method
  categoryToSlug(category) {
    const mapping = {
      'Engineering': 'engineering',
      '3D Scanning': '3d-scanning',
      'CAD Modeling': 'cad-modeling',
      'Manufacturing': 'manufacturing',
      'Innovation': 'innovation',
      'Case Studies': 'case-studies'
    };
    return mapping[category] || category.toLowerCase().replace(/\s+/g, '-');
  }

  slugToCategory(slug) {
    const mapping = {
      'engineering': 'Engineering',
      '3d-scanning': '3D Scanning',
      'cad-modeling': 'CAD Modeling',
      'manufacturing': 'Manufacturing',
      'innovation': 'Innovation',
      'case-studies': 'Case Studies'
    };
    return mapping[slug] || slug;
  }

  parseMarkdown(content, filename) {
    try {
      // Extract frontmatter and content
      const frontmatterRegex = /^---\s*\n(.*?)\n---\s*\n(.*)/s;
      const match = content.match(frontmatterRegex);
      
      if (!match) {
        // If no frontmatter, create a basic post structure
        return {
          title: this.filenameToTitle(filename),
          date: this.extractDateFromFilename(filename) || new Date().toISOString(),
          content: content,
          slug: this.createSlug(filename),
          image: 'assets/images/about-team.avif',
          categories: ['Engineering'], // Change to array
          excerpt: this.createExcerpt(content),
          language: this.detectLanguageFromContent(content),
          filename: filename
        };
      }
      
      const frontmatter = match[1];
      const body = match[2];
      
      // Parse frontmatter
      const metadata = {};
      frontmatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          let value = valueParts.join(':').trim().replace(/['"]/g, '');
          
          // Handle both single category and array of categories
          if (key.trim() === 'category' || key.trim() === 'categories') {
            if (value.startsWith('[') && value.endsWith(']')) {
              // Parse array format: ["Cat1", "Cat2"]
              value = value.slice(1, -1).split(',').map(cat => cat.trim().replace(/['"]/g, ''));
            } else {
              // Single category
              value = [value];
            }
          }
          
          metadata[key.trim()] = value;
        }
      });
      
      // Handle both old 'category' and new 'categories' fields
      let categories = metadata.categories || [];
      if (metadata.category) {
        if (Array.isArray(metadata.category)) {
          categories = metadata.category;
        } else {
          categories = [metadata.category];
        }
      }
      if (categories.length === 0) {
        categories = ['Engineering'];
      }
      
      return {
        title: metadata.title || this.filenameToTitle(filename),
        date: metadata.date || this.extractDateFromFilename(filename) || new Date().toISOString(),
        content: body,
        slug: this.createSlug(filename),
        image: metadata.image || 'assets/images/about-team.avif',
        categories: categories, // Now an array
        excerpt: this.createExcerpt(body),
        language: metadata.language || this.detectLanguageFromContent(body),
        filename: filename
      };
      
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return null;
    }
  }

  // Helper methods
  detectLanguageFromContent(content) {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(content) ? 'ar' : 'en';
  }

  filenameToTitle(filename) {
    return filename
      .replace(/\.md$/, '')
      .replace(/^\d{4}-\d{2}-\d{2}-/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  extractDateFromFilename(filename) {
    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
    return dateMatch ? dateMatch[1] : null;
  }

  createSlug(filename) {
    let slug = filename.replace(/\.md$/, '');
    slug = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    return slug.toLowerCase()
      .replace(/[^\w\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  createExcerpt(content) {
    const textContent = content.replace(/[#*`]/g, '').replace(/\n+/g, ' ');
    return textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Filter setup
  setupFilters() {
    // Search functionality
    const searchInput = document.getElementById('blogSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentFilters.search = e.target.value.toLowerCase();
        this.applyFilters();
      });
    }

    // Category filters
    this.setupCategoryFilters();
  }

  applyFilters() {
    if (this.isFiltering) return;
    this.isFiltering = true;
    
    console.log('Applying filters in BlogManager:', this.currentFilters);
    const currentInterfaceLanguage = document.documentElement.lang || 'en';
    
    this.filteredPosts = this.posts.filter(post => {
      const matchesSearch = !this.currentFilters.search || 
        post.title.toLowerCase().includes(this.currentFilters.search) ||
        post.content.toLowerCase().includes(this.currentFilters.search) ||
        post.categories.some(cat => cat.toLowerCase().includes(this.currentFilters.search));

      const matchesCategory = this.currentFilters.topic === 'all' ||
        post.categories.some(category => {
          const categorySlug = this.categoryToSlug(category);
          return categorySlug === this.currentFilters.topic.toLowerCase() ||
                 category.toLowerCase() === this.currentFilters.topic.toLowerCase() ||
                 category.toLowerCase().includes(this.currentFilters.topic.toLowerCase());
        });

      // Crucial: Filter posts by the current interface language
      const matchesLanguage = post.language === currentInterfaceLanguage;
      
      return matchesSearch && matchesCategory && matchesLanguage;
    });

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredPosts.length / this.postsPerPage);
    
    this.renderPosts();
    this.updateResultsCount();
    this.updatePaginationControls();
    this.isFiltering = false;
  }

  detectLanguage(post) {
    if (post.language) return post.language === this.currentFilters.language;
    
    const arabicRegex = /[\u0600-\u06FF]/;
    const hasArabic = arabicRegex.test(post.title) || arabicRegex.test(post.content);
    
    if (this.currentFilters.language === 'ar') return hasArabic;
    if (this.currentFilters.language === 'en') return !hasArabic;
    
    return true;
  }

  // Update results count
  updateResultsCount() {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
      const total = this.filteredPosts.length;
      if (total === 0) {
        resultsCount.textContent = window.getTranslation('blog_results_no_posts');
      } else if (total === this.posts.length) {
        resultsCount.textContent = window.getTranslation('blog_results_showing_all').replace('{total}', total);
      } else {
        resultsCount.textContent = window.getTranslation('blog_results_showing_filtered').replace('{total}', total).replace('{allTotal}', this.posts.length);
      }
    }
  }

  // Render posts
  renderPosts() {
    const postsToRender = this.filteredPosts || this.posts;
    const startIndex = (this.currentPage - 1) * this.postsPerPage;
    const endIndex = startIndex + this.postsPerPage;
    const currentPosts = postsToRender.slice(startIndex, endIndex);

    const blogGrid = document.getElementById('blogGrid');
    
    if (currentPosts.length === 0) {
      blogGrid.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <h3>${window.getTranslation('no_results_title')}</h3>
          <p>${window.getTranslation('no_results_subtitle')}</p>
        </div>
      `;
      return;
    }

    blogGrid.innerHTML = currentPosts.map(post => {
      // RTL/LTR support - ADD THIS
      const postLanguage = post.language || 'en';
      const isRTL = postLanguage === 'ar';
      const directionClass = isRTL ? 'rtl' : 'ltr';
      // Keep your existing category logic
      const categoryData = post.categories.map(cat => this.categoryToSlug(cat)).join(',');
      // Use the original filename (URL-encoded) as the slug in the link
      const postLinkHref = `blog-post.html?slug=${encodeURIComponent(post.filename)}`;
      return `
      <article class="blog-card ${directionClass}" 
               data-categories="${categoryData}" 
               data-language="${postLanguage}"
               dir="${isRTL ? 'rtl' : 'ltr'}">
        <div class="blog-image">
          <img src="${post.image}" alt="${post.title}" loading="lazy">
        </div>
        <div class="blog-content">
          <div class="blog-meta">
            <time datetime="${post.date}">${this.formatDate(post.date)}</time>
            ${post.categories.length > 0 ? `<div class="blog-categories">${post.categories.slice(0, 3).map(cat => `<span class="category-badge">${cat}</span>`).join('')}</div>` : ''}
          </div>
          <h2 class="blog-title">${post.title}</h2>
          <p class="blog-excerpt">${post.excerpt}</p>
          <a href="${postLinkHref}" class="read-more-btn">
            <span>${window.getTranslation('blog_read_more')}</span>
            <i class="fas fa-arrow-${isRTL ? 'left' : 'right'}"></i>
          </a>
        </div>
      </article>
    `;
    }).join('');
  }

  // Pagination setup
  setupPagination() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderPosts();
          this.updatePaginationControls();
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.renderPosts();
          this.updatePaginationControls();
        }
      });
    }
  }

  updatePaginationControls() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    const pagination = document.getElementById('blogPagination');
    
    if (this.totalPages <= 1) {
      if (pagination) pagination.style.display = 'none';
      return;
    }
    
    if (pagination) pagination.style.display = 'flex';
    if (prevBtn) prevBtn.disabled = this.currentPage === 1;
    if (nextBtn) nextBtn.disabled = this.currentPage === this.totalPages;
    if (pageInfo) pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
  }

  // Newsletter form
  setupNewsletterForm() {
    const form = document.querySelector('.newsletter-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        console.log('Newsletter subscription:', email);
        // Add your newsletter logic here
        alert(window.getTranslation('newsletter_success'));
        form.reset();
      });
    }
  }

  showError() {
    const blogGrid = document.getElementById('blogGrid');
    if (blogGrid) {
      blogGrid.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>${window.getTranslation('blog_error_generic')}</h3>
          <p>${window.getTranslation('blog_error_refresh')}</p>
        </div>
      `;
    }
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.blogManager = new BlogManager();
  window.blogManager.init();
});