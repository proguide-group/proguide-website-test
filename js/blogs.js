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
      language: 'all'
    };
  }

  async init() {
    await this.loadBlogPosts();
    this.filteredPosts = [...this.posts]; // Initialize filtered posts
    this.setupFilters();
    this.setupPagination();
    this.setupNewsletterForm();
    this.renderPosts();
    this.updateResultsCount();
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
          category: 'Engineering',
          excerpt: this.createExcerpt(content),
          topics: ['engineering'],
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
          
          // Parse arrays for topics
          if (key.trim() === 'topics' && value.startsWith('[')) {
            try {
              value = JSON.parse(value.replace(/'/g, '"'));
            } catch {
              value = ['engineering']; // fallback
            }
          }
          
          metadata[key.trim()] = value;
        }
      });
      
      return {
        title: metadata.title || this.filenameToTitle(filename),
        date: metadata.date || this.extractDateFromFilename(filename) || new Date().toISOString(),
        content: body,
        slug: this.createSlug(filename),
        image: metadata.image || 'assets/images/about-team.avif',
        category: metadata.category || 'Engineering',
        excerpt: this.createExcerpt(body),
        topics: metadata.topics || ['engineering'],
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

    // Topic filters
    document.querySelectorAll('.topic-tag').forEach(tag => {
      tag.addEventListener('click', (e) => {
        document.querySelectorAll('.topic-tag').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        this.currentFilters.topic = e.target.dataset.filter;
        this.applyFilters();
      });
    });

    // Language filters
    document.querySelectorAll('.language-tag').forEach(tag => {
      tag.addEventListener('click', (e) => {
        document.querySelectorAll('.language-tag').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        this.currentFilters.language = e.target.dataset.langFilter;
        this.applyFilters();
      });
    });
  }

  // Apply filters
  applyFilters() {
    console.log('Applying filters:', this.currentFilters);
    
    this.filteredPosts = this.posts.filter(post => {
      // Search filter
      const matchesSearch = !this.currentFilters.search || 
        post.title.toLowerCase().includes(this.currentFilters.search) ||
        post.content.toLowerCase().includes(this.currentFilters.search) ||
        post.category.toLowerCase().includes(this.currentFilters.search);

      // Topic filter
      const matchesTopic = this.currentFilters.topic === 'all' ||
        (post.topics && post.topics.includes(this.currentFilters.topic)) ||
        post.category.toLowerCase().includes(this.currentFilters.topic);

      // Language filter
      const matchesLanguage = this.currentFilters.language === 'all' ||
        post.language === this.currentFilters.language ||
        this.detectLanguage(post);

      console.log(`Post "${post.title}": search=${matchesSearch}, topic=${matchesTopic}, language=${matchesLanguage}`);
      
      return matchesSearch && matchesTopic && matchesLanguage;
    });

    console.log('Filtered posts:', this.filteredPosts.length);

    // Reset to first page when filters change
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredPosts.length / this.postsPerPage);
    
    this.renderPosts();
    this.updateResultsCount();
    this.updatePaginationControls();
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
        resultsCount.textContent = 'No posts found matching your criteria';
      } else if (total === this.posts.length) {
        resultsCount.textContent = `Showing all ${total} posts`;
      } else {
        resultsCount.textContent = `Showing ${total} of ${this.posts.length} posts`;
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
          <h3>No posts found</h3>
          <p>Try adjusting your search criteria or filters</p>
        </div>
      `;
      return;
    }

    blogGrid.innerHTML = currentPosts.map(post => `
      <article class="blog-card">
        <div class="blog-image">
          <img src="${post.image}" alt="${post.title}" loading="lazy">
          <div class="blog-category">${post.category}</div>
        </div>
        <div class="blog-content">
          <div class="blog-meta">
            <time datetime="${post.date}">${this.formatDate(post.date)}</time>
            ${post.topics ? `<div class="blog-topics">${post.topics.slice(0, 2).map(topic => `<span class="topic-badge">${topic}</span>`).join('')}</div>` : ''}
          </div>
          <h2 class="blog-title">${post.title}</h2>
          <p class="blog-excerpt">${post.excerpt}</p>
          <a href="blog-post.html?slug=${post.slug}" class="read-more-btn">
            <span>Read More</span>
            <i class="fas fa-arrow-right"></i>
          </a>
        </div>
      </article>
    `).join('');
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
        alert('Thank you for subscribing!');
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
          <h3>Error Loading Posts</h3>
          <p>Please try refreshing the page</p>
        </div>
      `;
    }
  }
}

// Initialize the blog manager
document.addEventListener('DOMContentLoaded', () => {
  const blogManager = new BlogManager();
  blogManager.init();
});