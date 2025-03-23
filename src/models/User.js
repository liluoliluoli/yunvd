/**
 * Model representing a user
 */
class User {
  /**
   * Create a new User instance
   * @param {Object} userData - User data from API
   */
  constructor(userData = {}) {
    this.id = userData.id || '';
    this.name = userData.name || '';
    this.email = userData.email || '';
    this.avatar = userData.avatar || null;
    this.bio = userData.bio || '';
    this.isVerified = userData.is_verified || false;
    this.createdAt = userData.created_at ? new Date(userData.created_at) : null;
    this.updatedAt = userData.updated_at ? new Date(userData.updated_at) : null;
    this.preferences = userData.preferences || {};
    this.stats = {
      videosWatched: userData.stats?.videos_watched || 0,
      videosLiked: userData.stats?.videos_liked || 0,
      commentsPosted: userData.stats?.comments_posted || 0,
      subscriptions: userData.stats?.subscriptions || 0,
    };
  }

  /**
   * Check if user has a complete profile
   * @returns {boolean} - Whether profile is complete
   */
  hasCompleteProfile() {
    return !!(this.name && this.email && this.avatar);
  }

  /**
   * Format user's name for display
   * @returns {string} - Formatted name
   */
  get displayName() {
    if (!this.name) return 'User';
    return this.name;
  }

  /**
   * Get the initials of the user's name
   * @returns {string} - User initials
   */
  get initials() {
    if (!this.name) return 'U';
    
    const parts = this.name.split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * Get default avatar URL based on user's name
   * @returns {string} - Default avatar URL
   */
  get defaultAvatar() {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name || 'User')}&background=random`;
  }

  /**
   * Get user's avatar URL, or default if none
   * @returns {string} - Avatar URL
   */
  get avatarUrl() {
    return this.avatar || this.defaultAvatar;
  }

  /**
   * Serialize user data for storage
   * @returns {Object} - Serialized user data
   */
  serialize() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      bio: this.bio,
      is_verified: this.isVerified,
      created_at: this.createdAt ? this.createdAt.toISOString() : null,
      updated_at: this.updatedAt ? this.updatedAt.toISOString() : null,
      preferences: this.preferences,
      stats: {
        videos_watched: this.stats.videosWatched,
        videos_liked: this.stats.videosLiked,
        comments_posted: this.stats.commentsPosted,
        subscriptions: this.stats.subscriptions,
      },
    };
  }

  /**
   * Create a User instance from stored/serialized data
   * @param {Object} data - Serialized user data
   * @returns {User} - User instance
   */
  static fromStorage(data) {
    if (!data) return new User();
    return new User(data);
  }
}

export default User; 