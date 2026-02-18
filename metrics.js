/**
 * Metrics tracking utility for login form analytics
 * Tracks user interactions and calculates bounce rate
 */

class MetricsTracker {
  constructor() {
    this.events = [];
    this.sessionStart = Date.now();
    this.hasInteracted = false;
  }

  /**
   * Track when a user views the login form
   */
  trackPageView() {
    this.events.push({
      type: 'page_view',
      timestamp: Date.now(),
    });
  }

  /**
   * Track user interaction (typing, clicking)
   */
  trackInteraction(action) {
    this.hasInteracted = true;
    this.events.push({
      type: 'interaction',
      action,
      timestamp: Date.now(),
    });
  }

  /**
   * Track form submission attempt
   */
  trackSubmission(success = false) {
    this.events.push({
      type: 'submission',
      success,
      timestamp: Date.now(),
    });
  }

  /**
   * Track when user leaves without interaction (bounce)
   */
  trackBounce() {
    if (!this.hasInteracted) {
      this.events.push({
        type: 'bounce',
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Calculate metrics summary
   */
  getMetrics() {
    const pageViews = this.events.filter(e => e.type === 'page_view').length;
    const bounces = this.events.filter(e => e.type === 'bounce').length;
    const submissions = this.events.filter(e => e.type === 'submission').length;
    const successfulSubmissions = this.events.filter(
      e => e.type === 'submission' && e.success
    ).length;

    // Calculate bounce rate: users who left without meaningful interaction
    const bounceRate = pageViews > 0 ? (bounces / pageViews) * 100 : 0;
    
    // Calculate engagement rate: users who interacted or submitted
    const interactions = this.events.filter(e => e.type === 'interaction').length;
    const engagementRate = pageViews > 0 ? ((interactions + submissions) / pageViews) * 100 : 0;

    return {
      pageViews,
      bounces,
      bounceRate: Math.round(bounceRate * 100) / 100,
      submissions,
      successfulSubmissions,
      engagementRate: Math.round(engagementRate * 100) / 100,
      sessionDuration: Date.now() - this.sessionStart,
    };
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.events = [];
    this.sessionStart = Date.now();
    this.hasInteracted = false;
  }
}

// Global metrics tracker instance
const metricsTracker = new MetricsTracker();

// Track page unload (potential bounce)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    metricsTracker.trackBounce();
  });
}

export default metricsTracker;
