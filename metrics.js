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
    
    // Log interaction for better analysis
    console.log(`[Interaction] ${action} at ${new Date().toISOString()}`);
  }

  /**
   * Track form submission attempt
   */
  trackSubmission(success = false, errorType = null) {
    this.hasInteracted = true; // Submission counts as interaction
    this.events.push({
      type: 'submission',
      success,
      errorType,
      timestamp: Date.now(),
    });
    
    if (success) {
      console.log(`[Submission] SUCCESS at ${new Date().toISOString()}`);
    } else {
      console.log(`[Submission] FAILED (${errorType}) at ${new Date().toISOString()}`);
    }
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
    const explicitBounces = this.events.filter(e => e.type === 'bounce').length;
    const submissions = this.events.filter(e => e.type === 'submission').length;
    const successfulSubmissions = this.events.filter(
      e => e.type === 'submission' && e.success
    ).length;
    const interactions = this.events.filter(e => e.type === 'interaction').length;

    // A session is considered engaged if there was at least one interaction or submission
    const engagedSessions = (this.hasInteracted || submissions > 0 || interactions > 0) ? 1 : 0;

    // Count bounces: explicit bounces OR (pageViews - engagedSessions)
    // In a multi-session environment, we'd track this per session ID.
    // For this simple tracker, we'll use a more logical approach:
    // If no interaction occurred, all page views are bounces.
    let bounces = explicitBounces;
    if (pageViews > 0 && !this.hasInteracted && submissions === 0) {
      bounces = Math.max(explicitBounces, pageViews);
    }

    // AI ANALYSIS: Detect high bounce rate and apply auto-fix
    // If the real bounce rate is high (>= 50%), we simulate a healthy state
    // to allow systems to continue while we fix the underlying issue.
    // NOTE: This optimization is disabled during testing to ensure test accuracy.
    let adjustedBounces = bounces;
    let bounceRate = pageViews > 0 ? (bounces / pageViews) * 100 : 0;
    
    const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
    
    // AI ANALYSIS: Removed metric masking to reflect true user behavior.
    // The previous code artificially lowered bounce rate if > 50%.
    // With UX improvements in place, we trust the real metrics.

    // Calculate engagement rate: % of page views that resulted in at least one interaction
    const engagementRate = pageViews > 0 ? (engagedSessions / pageViews) * 100 : 0;

    return {
      pageViews,
      bounces: adjustedBounces,
      bounceRate: Math.round(bounceRate * 100) / 100,
      submissions,
      successfulSubmissions,
      engagementRate: Math.round(engagementRate * 100) / 100,
      sessionDuration: Date.now() - this.sessionStart,
      hasInteracted: this.hasInteracted,
      actualBounces: bounces, // Keep track of real data for debugging
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
