/**
 * Model representing a video category
 */
class Category {
  /**
   * Create a new Category instance
   * @param {Object} categoryData - Category data from API
   */
  constructor(categoryData = {}) {
    this.id = categoryData.id || '';
    this.name = categoryData.name || '';
    this.description = categoryData.description || '';
    this.thumbnailUrl = categoryData.thumbnail_url || categoryData.thumbnailUrl || '';
    this.iconName = categoryData.icon_name || categoryData.iconName || '';
    this.color = categoryData.color || '#000000';
    this.videosCount = categoryData.videos_count || categoryData.videosCount || 0;
    this.isPopular = categoryData.is_popular || categoryData.isPopular || false;
    this.order = categoryData.order || 0;
    this.parentId = categoryData.parent_id || categoryData.parentId || null; // For sub-categories
    this.createdAt = categoryData.created_at ? new Date(categoryData.created_at) : null;
    this.updatedAt = categoryData.updated_at ? new Date(categoryData.updated_at) : null;
  }

  /**
   * Get a display-friendly name (capitalized)
   * @returns {string} - Formatted name
   */
  get displayName() {
    if (!this.name) return '';
    return this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }

  /**
   * Get a short description for the category
   * @param {number} maxLength - Maximum length of description
   * @returns {string} - Truncated description
   */
  getShortDescription(maxLength = 100) {
    if (!this.description || this.description.length <= maxLength) {
      return this.description;
    }
    return this.description.substring(0, maxLength) + '...';
  }

  /**
   * Get a formatted video count string
   * @returns {string} - Formatted video count
   */
  get formattedVideoCount() {
    if (this.videosCount === 0) {
      return 'No videos';
    } else if (this.videosCount === 1) {
      return '1 video';
    } else {
      return `${this.videosCount} videos`;
    }
  }

  /**
   * Get a badge label if the category is special
   * @returns {string|null} - Badge label or null
   */
  get badgeLabel() {
    if (this.isPopular) {
      return 'Popular';
    }
    return null;
  }

  /**
   * Serialize category data for storage
   * @returns {Object} - Serialized category data
   */
  serialize() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      thumbnail_url: this.thumbnailUrl,
      icon_name: this.iconName,
      color: this.color,
      videos_count: this.videosCount,
      is_popular: this.isPopular,
      order: this.order,
      parent_id: this.parentId,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null
    };
  }

  /**
   * Create a Category instance from stored/serialized data
   * @param {Object} data - Serialized category data
   * @returns {Category} - Category instance
   */
  static fromStorage(data) {
    if (!data) return new Category();
    return new Category(data);
  }
}

export default Category; 