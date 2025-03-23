/**
 * Video model class
 * Represents a video object with standardized properties
 */
class Video {
  constructor(data = {}) {
    // Core video data
    this.id = data.id || '';
    this.title = data.title || '';
    this.description = data.description || '';
    this.thumbnail = data.thumbnail || '';
    this.videoUrl = data.videoUrl || '';
    
    // Metadata
    this.duration = data.duration || '0:00';
    this.views = data.views || 0;
    this.likes = data.likes || 0;
    this.publishDate = data.publishDate || '';
    this.categories = data.categories || [];
    
    // Author information
    this.author = {
      name: data.author?.name || '',
      avatar: data.author?.avatar || '',
      id: data.author?.id || '',
    };
    
    // User-specific status
    this.isLiked = data.isLiked || false;
    this.isInWatchlist = data.isInWatchlist || false;
    this.rating = data.rating || 0;
    
    // Related data
    this.comments = data.comments || [];
    this.relatedVideos = data.relatedVideos || [];
  }

  /**
   * Serialize the video object back to a plain object
   * @returns {Object} - Plain object representation
   */
  serialize() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      thumbnail: this.thumbnail,
      videoUrl: this.videoUrl,
      duration: this.duration,
      views: this.views,
      likes: this.likes,
      publishDate: this.publishDate,
      categories: [...this.categories],
      author: { ...this.author },
      isLiked: this.isLiked,
      isInWatchlist: this.isInWatchlist,
      rating: this.rating,
      comments: [...this.comments],
      relatedVideos: [...this.relatedVideos],
    };
  }

  /**
   * Get a short formatted duration (e.g., "10:30")
   */
  getFormattedDuration() {
    if (typeof this.duration === 'string' && this.duration.includes(':')) {
      return this.duration;
    }
    
    // If duration is in seconds, format it
    const durationInSeconds = parseInt(this.duration, 10) || 0;
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get formatted view count (e.g., "10.5K")
   */
  getFormattedViews() {
    const views = parseInt(this.views, 10) || 0;
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  }

  /**
   * Get a relative time string (e.g., "2 days ago")
   */
  getRelativeTime() {
    if (!this.publishDate) return 'Unknown date';
    
    try {
      const published = new Date(this.publishDate);
      const now = new Date();
      const diffMs = now - published;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHr / 24);
      const diffMonths = Math.floor(diffDays / 30);
      const diffYears = Math.floor(diffDays / 365);
      
      if (diffYears > 0) {
        return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
      }
      if (diffMonths > 0) {
        return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
      }
      if (diffDays > 0) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
      }
      if (diffHr > 0) {
        return `${diffHr} ${diffHr === 1 ? 'hour' : 'hours'} ago`;
      }
      if (diffMin > 0) {
        return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
      }
      return 'Just now';
    } catch (e) {
      return this.publishDate;
    }
  }
}

export default Video; 