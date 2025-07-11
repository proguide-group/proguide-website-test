/* filepath: js/blog-post.js */
/**
 * Individual Blog Post Management
 * Handles loading and displaying individual blog posts
 */

class BlogPostManager {
  // Basic Markdown to HTML converter (supports headings, bold, italics, links, lists, paragraphs)
  markdownToHtml(markdown) {
    if (!markdown) return '';
    let html = markdown;
    // Headings
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    // Bold and italics
    html = html.replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/gim, '<em>$1</em>');
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>');
    // Unordered lists
    html = html.replace(/^\s*\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    // Paragraphs
    html = html.replace(/^(?!<h\d|<ul|<li|<\/ul|<\/li|<p|<\/p|<strong|<em|<a)([^\n]+)\n/gim, '<p>$1</p>\n');
    // Remove multiple ul wrappers
    html = html.replace(/(<\/ul>)(\s*<ul>)+/gim, '');
    return html.trim();
  }
  constructor() {
    this.currentPost = null;
    this.allPosts = [];
    // Listen for global language change event
    document.addEventListener('languageChanged', (e) => this.handleLanguageChange(e));
    this.init();
  }
  
  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    this.slug = urlParams.get('slug'); // Store slug for re-loading

    if (!this.slug) {
      this.showError(window.getTranslation('blog_post_error_subtitle'));
      return;
    }
    await this.loadAllPosts();
    await this.loadBlogPost(this.slug);
  }
  // NEW METHOD
  async handleLanguageChange(event) {
    const newLang = event.detail.language;
    console.log(`BlogPostManager: Language changed to ${newLang}. Re-rendering dynamic UI elements.`);
    // Re-render UI elements that rely on translations
    if (this.currentPost) {
        // Attempt to reload the current post if its language is different,
        // or just re-render the UI elements if it's a content-level language change
        // For dynamic UI elements (like breadcrumbs, buttons), we can simply call renderPost
        this.renderPost(); 
    } else {
        // If no post loaded yet (e.g., initial load race condition), try loading it
        await this.loadBlogPost(this.slug);
    }
    // No need to re-fetch *all* posts just for UI elements
  }
  
  async loadAllPosts() {
    try {
      const blogFiles = await BLOG_CONFIG.loadBlogFilesList();
      console.log('Loading blog files for individual post:', blogFiles);
      const posts = [];
      // Removed interface language filter: load all posts
      for (const filename of blogFiles) {
        try {
          const encodedFilename = encodeURIComponent(filename);
          const response = await fetch(`assets/blog/${encodedFilename}`);
          if (response.ok) {
            const content = await response.text();
            const post = this.parseMarkdown(content, filename);
            if (post) { // Load post regardless of its language
              console.log(`Generated slug for ${filename}: "${post.slug}"`);
              posts.push(post);
            }
          }
        } catch (error) {
          console.warn(`Failed to load blog post: ${filename}`, error);
        }
      }
      this.allPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      console.log('All loaded posts for individual page:', this.allPosts.map(p => ({title: p.title, slug: p.slug})));
    } catch (error) {
      console.error('Error loading all blog posts:', error);
    }
  }
  
  async loadBlogPost(slug) {
    try {
      console.log('=== DEBUG INFO: BlogPostManager ===');
      console.log('URL Slug Parameter (from URL):', slug);
      // Decode the URL parameter to match the original filename
      const targetFilename = decodeURIComponent(slug).trim().toLowerCase();
      console.log('Target Filename (decoded, normalized):', targetFilename);
      console.log('All loaded posts (from loadAllPosts):');
      let foundPost = null;
      for (const post of this.allPosts) {
        const normalizedFilename = (post.filename || '').trim().toLowerCase();
        console.log(`  - Post Title: "${post.title}"`);
        console.log(`    Post Filename (loaded): "${post.filename}"`);
        console.log(`    Normalized Filename: "${normalizedFilename}"`);
        console.log(`    Filename Match Check: ${normalizedFilename === targetFilename}`);
        if (normalizedFilename === targetFilename) {
          foundPost = post;
          break;
        }
        console.log('    ---');
      }
      const post = foundPost;
      if (!post) {
        console.error('❌ BlogPostManager: Post NOT found for TARGET FILENAME:', targetFilename);
        console.error('Available filenames (in memory):', this.allPosts.map(p => p.filename));
        this.showError('blog_post_error_subtitle');
        return;
      }
      console.log('✅ BlogPostManager: Found post:', post.title, 'using filename:', post.filename);
      this.currentPost = post;
      this.renderPost();
      this.loadRelatedPosts();
    } catch (error) {
      console.error('Error loading blog post:', error);
      this.showError('blog_post_error_subtitle');
    }
  }
  
  parseMarkdown(content, filename) {
    try {
      // Extract frontmatter and content
      const frontmatterRegex = /^---\s*\n(.*?)\n---\s*\n(.*)/s;
      const match = content.match(frontmatterRegex);
      let metadata = {};
      let body = content;
      if (match) {
        const frontmatter = match[1];
        body = match[2];
        frontmatter.split('\n').forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim().replace(/['"]/g, '');
            metadata[key.trim()] = value;
          }
        });
      }
      return {
        title: metadata.title || this.filenameToTitle(filename),
        date: metadata.date || this.extractDateFromFilename(filename) || new Date().toISOString(),
        content: body,
        slug: this.createSlug(filename),
        image: metadata.image || 'assets/images/about-team.avif',
        category: metadata.category || 'Engineering',
        language: metadata.language || this.detectLanguageFromContent(body),
        filename: filename
      };
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return null;
    }
  }
  
  filenameToTitle(filename) {
    return filename
      .replace(/^\d{4}-\d{2}-\d{2}-/, '') // Remove date prefix
      .replace(/\.md$/, '') // Remove extension
      .replace(/-/g, ' ') // Replace hyphens with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
  }
  
  extractDateFromFilename(filename) {
    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
    return dateMatch ? dateMatch[1] : null;
  }
  
  createSlug(filename) {
    // Remove .md extension first
    let slug = filename.replace(/\.md$/, '');
    
    // Remove date prefix if it exists (YYYY-MM-DD-)
    slug = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '');
    
    // Convert to lowercase and clean up
    return slug.toLowerCase()
      .replace(/[^\w\u0600-\u06FF\s-]/g, '') // Keep letters, Arabic, spaces, and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
  
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  renderPost() {
    const loadingEl = document.getElementById('blogPostLoading');
    const contentEl = document.getElementById('blogPostContent');
    const errorEl = document.getElementById('blogPostError');
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
    if (errorEl) errorEl.style.display = 'none';
    if (!this.currentPost) {
      this.showError(window.getTranslation('blog_post_error_subtitle'));
      return;
    }
    const postLanguage = this.currentPost.language || 'en';
    const isRTL = postLanguage === 'ar';
    contentEl.dir = isRTL ? 'rtl' : 'ltr';
    contentEl.className = `blog-post-content ${isRTL ? 'rtl' : 'ltr'}`;
    document.title = `${this.currentPost.title} - Proguide Engineering`;
    contentEl.innerHTML = `
      <div class="blog-post-header">
        <nav class="breadcrumb">
          <a href="blogs.html">${window.getTranslation('breadcrumb_blog')}</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">${this.currentPost.title}</span>
        </nav>
        <div class="blog-post-meta">
          <span class="blog-category">${this.currentPost.category}</span>
          <div class="blog-date">
            <i class="fas fa-calendar-alt"></i>
            <span>${this.formatDate(this.currentPost.date)}</span>
          </div>
        </div>
        <h1 class="blog-post-title">${this.currentPost.title}</h1>
        <div class="blog-post-image">
          <img src="${this.currentPost.image}" alt="${this.currentPost.title}" onerror="this.src='assets/images/blog-default.jpg'">
        </div>
      </div>
      <div class="blog-post-body">
        ${this.markdownToHtml(this.currentPost.content)}
      </div>
      <div class="blog-post-footer">
        <div class="blog-post-actions">
          <a href="blogs.html" class="back-to-blog">
            <i class="fas fa-arrow-${isRTL ? 'right' : 'left'}"></i>
            ${window.getTranslation('blog_post_back_to_blog')}
          </a>
          <div class="blog-post-share">
            <span>${window.getTranslation('blog_post_share')}</span>
            <a href="#" class="share-btn" onclick="shareOnTwitter()" aria-label="${window.getTranslation('blog_post_share_twitter')}">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="share-btn" onclick="shareOnLinkedIn()" aria-label="${window.getTranslation('blog_post_share_linkedin')}">
              <i class="fab fa-linkedin-in"></i>
            </a>
            <a href="#" class="share-btn" onclick="copyLink()" aria-label="${window.getTranslation('blog_post_share_copy')}">
              <i class="fas fa-link"></i>
            </a>
          </div>
        </div>
      </div>
    `;
    window.translationManager.applyTranslations();
  }
  
  loadRelatedPosts() {
    const relatedPostsEl = document.getElementById('relatedPosts');
    const relatedPostsGridEl = document.getElementById('relatedPostsGrid');
    
    // Get other posts (excluding current one)
    const otherPosts = this.allPosts
      .filter(post => post.slug !== this.currentPost.slug)
      .slice(0, 3); // Show max 3 related posts
    
    if (otherPosts.length === 0) {
      return; // Don't show related posts section if no other posts
    }
    
    relatedPostsEl.style.display = 'block';
    
    relatedPostsGridEl.innerHTML = otherPosts.map(post => {
      return `
        <article class="related-post-card">
          <div class="related-post-image">
            <img src="${post.image}" alt="${post.title}" onerror="this.src='assets/images/blog-default.jpg'">
          </div>
          <div class="related-post-content">
            <div class="related-post-meta">
              <span class="blog-category">${post.category}</span>
              <span class="blog-date">${this.formatDate(post.date)}</span>
            </div>
            <h3 class="related-post-title">
              <a href="blog-post.html?slug=${post.slug}">${post.title}</a>
            </h3>
          </div>
        </article>
      `;
    }).join('');
  }
  
  showError(messageKey = 'blog_post_error_subtitle') {
    const loadingEl = document.getElementById('blogPostLoading');
    const errorEl = document.getElementById('blogPostError');
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
    const errorMessageEl = errorEl.querySelector('p');
    const errorTitleEl = errorEl.querySelector('h2');
    const backButtonSpan = errorEl.querySelector('.cta-button span');
    if (errorTitleEl) {
        errorTitleEl.textContent = window.getTranslation('blog_post_error_title');
    }
    if (errorMessageEl) {
        errorMessageEl.textContent = window.getTranslation(messageKey);
    }
    if (backButtonSpan) {
        backButtonSpan.textContent = window.getTranslation('blog_post_back_to_blog');
    }
  }
}

// Share functions
function shareOnTwitter() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(document.title);
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
}

function shareOnLinkedIn() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const successMessage = window.getTranslation ? window.getTranslation('blog_post_copy_success') : 'Link copied to clipboard!';
    alert(successMessage);
  });
}

// Initialize blog post manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.blogPostManager = new BlogPostManager(); // Store globally
  window.blogPostManager.init();
});