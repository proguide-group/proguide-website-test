/* filepath: js/blog-post.js */
/**
 * Individual Blog Post Management
 * Handles loading and displaying individual blog posts
 */

class BlogPostManager {
  constructor() {
    this.currentPost = null;
    this.allPosts = [];
    this.init();
  }
  
  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (!slug) {
      this.showError('No blog post specified');
      return;
    }
    
    await this.loadAllPosts();
    await this.loadBlogPost(slug);
  }
  
  async loadAllPosts() {
    try {
      // Use the shared blog configuration
      const blogFiles = await BLOG_CONFIG.loadBlogFilesList();
      
      console.log('Loading blog files for individual post:', blogFiles);
      
      const posts = [];
      
      for (const filename of blogFiles) {
        try {
          // URL encode the filename for proper fetching
          const encodedFilename = encodeURIComponent(filename);
          const response = await fetch(`assets/blog/${encodedFilename}`);
          if (response.ok) {
            const content = await response.text();
            const post = this.parseMarkdown(content, filename);
            if (post) {
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
      console.log('=== DEBUG INFO ===');
      console.log('Looking for slug:', slug);
      console.log('All loaded posts:');
      this.allPosts.forEach(post => {
        console.log(`  - Title: "${post.title}"`);
        console.log(`    Slug: "${post.slug}"`);
        console.log(`    Filename: "${post.filename || 'unknown'}"`);
        console.log('    ---');
      });
      
      const post = this.allPosts.find(p => p.slug === slug);
      
      if (!post) {
        console.error('❌ Post not found for slug:', slug);
        console.error('Available slugs:', this.allPosts.map(p => p.slug));
        this.showError('Blog post not found');
        return;
      }
      
      console.log('✅ Found post:', post.title);
      this.currentPost = post;
      this.renderPost();
      this.loadRelatedPosts();
      
    } catch (error) {
      console.error('Error loading blog post:', error);
      this.showError('Failed to load blog post');
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
          filename: filename // Add this line
        };
      }
      
      const frontmatter = match[1];
      const body = match[2];
      
      // Parse frontmatter
      const metadata = {};
      frontmatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim().replace(/['"]/g, '');
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
        filename: filename // Add this line
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
    
    // Hide loading, show content
    loadingEl.style.display = 'none';
    contentEl.style.display = 'block';
    
    // Set page direction based on post language
    const postLanguage = this.currentPost.language || 'en';
    const isRTL = postLanguage === 'ar';
    
    // Apply direction to the blog post content container
    contentEl.dir = isRTL ? 'rtl' : 'ltr';
    contentEl.className = `blog-post-content ${isRTL ? 'rtl' : 'ltr'}`;
    
    // Update page title
    document.title = `${this.currentPost.title} - Proguide Engineering`;
    
    // Render the post content
    contentEl.innerHTML = `
      <div class="blog-post-header">
        <nav class="breadcrumb">
          <a href="blogs.html">${isRTL ? 'المدونة' : 'Blog'}</a>
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
            ${isRTL ? 'العودة للمدونة' : 'Back to Blog'}
          </a>
          
          <div class="blog-post-share">
            <span>${isRTL ? 'شارك:' : 'Share:'}</span>
            <a href="#" class="share-btn" onclick="shareOnTwitter()" aria-label="Share on Twitter">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="share-btn" onclick="shareOnLinkedIn()" aria-label="Share on LinkedIn">
              <i class="fab fa-linkedin-in"></i>
            </a>
            <a href="#" class="share-btn" onclick="copyLink()" aria-label="Copy link">
              <i class="fas fa-link"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  }
  
  markdownToHtml(markdown) {
    // Basic markdown to HTML conversion
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Code blocks
      .replace(/```[\s\S]*?```/g, '<pre><code>$&</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Lists
      .replace(/^\* (.+$)/gim, '<li>$1</li>')
      .replace(/^\- (.+$)/gim, '<li>$1</li>')
      // Blockquotes
      .replace(/^> (.+$)/gim, '<blockquote>$1</blockquote>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    
    // Fix list formatting
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    
    return html;
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
    
    relatedPostsGridEl.innerHTML = otherPosts.map(post => `
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
    `).join('');
  }
  
  showError(message) {
    const loadingEl = document.getElementById('blogPostLoading');
    const errorEl = document.getElementById('blogPostError');
    
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
    
    const errorMessageEl = errorEl.querySelector('p');
    if (errorMessageEl) {
      errorMessageEl.textContent = message;
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
    alert('Link copied to clipboard!');
  });
}

// Initialize blog post manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BlogPostManager();
});