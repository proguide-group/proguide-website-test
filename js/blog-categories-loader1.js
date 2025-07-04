/**
 * Blog Categories Loader - Loads categories from CMS
 */
class BlogCategoriesLoader {
  constructor() {
    this.categoriesUrl = '/data/blog-categories.json';
    this.currentLang = document.documentElement.lang || 'en';
    this.isUpdating = false;
    this.init();
    
    // Listen for language changes
    this.setupLanguageListener();
  }

  setupLanguageListener() {
    // Listen for language change events (simplified)
    document.addEventListener('languageChanged', (e) => {
      if (this.isUpdating) return;
      
      console.log('🌐 Language changed to:', e.detail.language);
      this.currentLang = e.detail.language;
      this.isUpdating = true;
      
      try {
        // IMMEDIATE REBUILD - No delay
        this.reloadCategoriesForLanguage();
        
        // Reset flag after rebuild
        setTimeout(() => {
          this.isUpdating = false;
        }, 100);
        
      } catch (error) {
        console.error('❌ Error reloading categories:', error);
        this.isUpdating = false;
      }
    });
  }

  async init() {
    if (this.isUpdating) return;
    
    try {
      await this.loadCategories();
      this.setupCategoryFiltering();
    } catch (error) {
      console.log('Categories not available, using defaults');
      this.useDefaultCategories();
    }
  }

  async loadCategories() {
    const response = await fetch(this.categoriesUrl);
    if (!response.ok) {
      throw new Error('Categories not found');
    }
    
    const data = await response.json();
    this.allCategoriesData = data.categories;
    this.settings = data.settings;
    this.renderCategories(data.categories, data.settings);
  }

  useDefaultCategories() {
    this.allCategoriesData = [
      { name: "All", slug: "all", language: "en", active: true, color: "#6b7280", order: 0 },
      { name: "Engineering", slug: "engineering", language: "en", active: true, color: "#3b82f6", order: 1 },
      { name: "3D Scanning", slug: "3d-scanning", language: "en", active: true, color: "#10b981", order: 2 },
      { name: "CAD Modeling", slug: "cad-modeling", language: "en", active: true, color: "#f59e0b", order: 3 },
      { name: "Manufacturing", slug: "manufacturing", language: "en", active: true, color: "#ef4444", order: 4 },
      { name: "Innovation", slug: "innovation", language: "en", active: true, color: "#8b5cf6", order: 5 },
      { name: "Case Studies", slug: "case-studies", language: "en", active: true, color: "#06b6d4", order: 6 },
      
      { name: "الكل", slug: "all", language: "ar", active: true, color: "#6b7280", order: 0 },
      { name: "الهندسة العكسية", slug: "reverse-engineering", language: "ar", active: true, color: "#3b82f6", order: 1 },
      { name: "المسح ثلاثي الأبعاد", slug: "3d-scanning", language: "ar", active: true, color: "#10b981", order: 2 },
      { name: "التصنيع الذكي", slug: "smart-manufacturing", language: "ar", active: true, color: "#ef4444", order: 3 },
      { name: "الحلول الرقمية", slug: "digital-solutions", language: "ar", active: true, color: "#8b5cf6", order: 4 }
    ];
    
    this.settings = { show_all_button: true, max_per_row: 6 };
    this.renderCategories(this.allCategoriesData, this.settings);
  }

  reloadCategoriesForLanguage() {
    console.log('🔄 Reloading categories for language:', this.currentLang);
    
    if (this.allCategoriesData && this.settings) {
      const categoryContainer = document.querySelector('.category-tags');
      
      // COMPLETE REBUILD - Remove and recreate container
      if (categoryContainer) {
        const parent = categoryContainer.parentNode;
        const newContainer = document.createElement('div');
        newContainer.className = 'category-tags';
        
        // Replace the container completely
        parent.replaceChild(newContainer, categoryContainer);
        
        console.log('🔥 Container completely replaced');
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          // Now render categories in the new container
          this.renderCategories(this.allCategoriesData, this.settings);
          console.log('✅ Categories re-rendered in new container');
        }, 10);
      }
      
      // Reset blog manager
      if (window.blogManager) {
        window.blogManager.currentFilters.topic = 'all';
        window.blogManager.currentPage = 1;
        window.blogManager.filteredPosts = null;
        window.blogManager.renderPosts();
      }
    }
  }

  renderCategories(allCategories, settings) {
    const categoryContainer = document.querySelector('.category-tags');
    if (!categoryContainer) {
      console.log('❌ Category container not found!');
      return;
    }

    console.log('🎯 Rendering categories for language:', this.currentLang);

    // Clear completely
    categoryContainer.innerHTML = '';

    // Filter categories by current language only
    const languageCategories = allCategories
      .filter(category => category.language === this.currentLang && category.active)
      .sort((a, b) => a.order - b.order);

    console.log(`📋 Found ${languageCategories.length} categories for ${this.currentLang}`);

    // Create category tags for current language
    languageCategories.forEach(category => {
      const categoryTag = this.createCategoryTag(category, category.slug === 'all');
      categoryContainer.appendChild(categoryTag);
      console.log(`➕ Added: ${category.name}`);
    });

    console.log('🏁 Render complete');
  }

  createCategoryTag(category, isActive = false) {
    const tag = document.createElement('button');
    tag.className = `category-tag${isActive ? ' active' : ''}`;
    tag.dataset.filter = category.slug;
    tag.dataset.slug = category.slug;
    tag.dataset.language = category.language;
    
    // Use the category name directly
    tag.textContent = category.name;
    
    // Add color styling if available
    if (category.color) {
      tag.style.setProperty('--category-color', category.color);
    }
    
    // Add click handler
    tag.addEventListener('click', () => this.handleCategoryClick(tag, category.slug));
    
    return tag;
  }

  handleCategoryClick(clickedTag, slug) {
    // Update active state
    document.querySelectorAll('.category-tag').forEach(tag => {
      tag.classList.remove('active');
    });
    clickedTag.classList.add('active');

    // Filter blog posts
    this.filterBlogPosts(slug);
    
    // Trigger custom event
    document.dispatchEvent(new CustomEvent('categoryChanged', { 
      detail: { slug, element: clickedTag, language: this.currentLang } 
    }));
  }

  filterBlogPosts(slug) {
    // Delegate to BlogManager if available
    if (window.blogManager) {
      window.blogManager.currentFilters.topic = slug;
      window.blogManager.applyFilters();
    }
  }

  setupCategoryFiltering() {
    document.addEventListener('categoryChanged', (e) => {
      console.log('Category filter changed:', e.detail.slug, 'Language:', e.detail.language);
    });
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  window.blogCategoriesLoader = new BlogCategoriesLoader();
});

window.BlogCategoriesLoader = BlogCategoriesLoader;