/**
 * Tests for metrics tracking system
 */

import metricsTracker from './metrics.js';

describe('MetricsTracker', () => {
  beforeEach(() => {
    // Reset metrics before each test
    metricsTracker.reset();
  });

  describe('Page View Tracking', () => {
    test('should track page views', () => {
      metricsTracker.trackPageView();
      metricsTracker.trackPageView();
      
      const metrics = metricsTracker.getMetrics();
      expect(metrics.pageViews).toBe(2);
    });

    test('should start with zero page views', () => {
      const metrics = metricsTracker.getMetrics();
      expect(metrics.pageViews).toBe(0);
    });
  });

  describe('Interaction Tracking', () => {
    test('should track user interactions', () => {
      metricsTracker.trackPageView(); // Need a page view first
      metricsTracker.trackInteraction('email_input');
      metricsTracker.trackInteraction('password_input');
      metricsTracker.trackInteraction('button_click');
      
      const metrics = metricsTracker.getMetrics();
      // Engagement rate should be high with interactions
      expect(metrics.engagementRate).toBeGreaterThan(0);
    });

    test('should mark session as interacted', () => {
      expect(metricsTracker.hasInteracted).toBe(false);
      
      metricsTracker.trackInteraction('any_action');
      
      expect(metricsTracker.hasInteracted).toBe(true);
    });
  });

  describe('Submission Tracking', () => {
    test('should track successful submissions', () => {
      metricsTracker.trackSubmission(true);
      metricsTracker.trackSubmission(true);
      
      const metrics = metricsTracker.getMetrics();
      expect(metrics.successfulSubmissions).toBe(2);
      expect(metrics.submissions).toBe(2);
    });

    test('should track failed submissions', () => {
      metricsTracker.trackSubmission(false);
      
      const metrics = metricsTracker.getMetrics();
      expect(metrics.successfulSubmissions).toBe(0);
      expect(metrics.submissions).toBe(1);
    });

    test('should track mixed submissions', () => {
      metricsTracker.trackSubmission(true);
      metricsTracker.trackSubmission(false);
      metricsTracker.trackSubmission(true);
      
      const metrics = metricsTracker.getMetrics();
      expect(metrics.successfulSubmissions).toBe(2);
      expect(metrics.submissions).toBe(3);
    });
  });

  describe('Bounce Rate Calculation', () => {
    test('should calculate 0% bounce rate with interactions', () => {
      metricsTracker.trackPageView();
      metricsTracker.trackInteraction('email_input');
      
      const metrics = metricsTracker.getMetrics();
      expect(metrics.bounceRate).toBe(0);
    });

    test('should calculate 100% bounce rate without interactions', () => {
      metricsTracker.trackPageView();
      metricsTracker.trackBounce();
      
      const metrics = metricsTracker.getMetrics();
      expect(metrics.bounceRate).toBe(100);
    });

    test('should not track bounce if user interacted', () => {
      metricsTracker.trackPageView();
      metricsTracker.trackInteraction('click');
      metricsTracker.trackBounce(); // Should not count
      
      const metrics = metricsTracker.getMetrics();
      expect(metrics.bounceRate).toBe(0);
    });

    test('should calculate 50% bounce rate', () => {
      // First session: user interacts
      metricsTracker.trackPageView();
      metricsTracker.trackInteraction('email_input');
      
      // Reset for second user session
      const firstMetrics = metricsTracker.getMetrics();
      metricsTracker.reset();
      
      // Second session: user bounces
      metricsTracker.trackPageView();
      metricsTracker.trackBounce();
      
      // Calculate combined bounce rate manually
      // 1 engaged + 1 bounced out of 2 total = 50%
      const secondMetrics = metricsTracker.getMetrics();
      const totalPageViews = firstMetrics.pageViews + secondMetrics.pageViews;
      const totalBounces = firstMetrics.bounces + secondMetrics.bounces;
      const bounceRate = (totalBounces / totalPageViews) * 100;
      
      expect(bounceRate).toBe(50);
    });

    test('should calculate 25% bounce rate across multiple sessions', () => {
      // Track 4 separate user sessions
      const sessionMetrics = [];
      
      // Session 1: engaged user
      metricsTracker.trackPageView();
      metricsTracker.trackInteraction('action1');
      sessionMetrics.push(metricsTracker.getMetrics());
      metricsTracker.reset();
      
      // Session 2: submission
      metricsTracker.trackPageView();
      metricsTracker.trackSubmission(true);
      sessionMetrics.push(metricsTracker.getMetrics());
      metricsTracker.reset();
      
      // Session 3: engaged user
      metricsTracker.trackPageView();
      metricsTracker.trackInteraction('action2');
      sessionMetrics.push(metricsTracker.getMetrics());
      metricsTracker.reset();
      
      // Session 4: bounced user
      metricsTracker.trackPageView();
      metricsTracker.trackBounce();
      sessionMetrics.push(metricsTracker.getMetrics());
      
      // Calculate aggregate bounce rate
      const totalPageViews = sessionMetrics.reduce((sum, m) => sum + m.pageViews, 0);
      const totalBounces = sessionMetrics.reduce((sum, m) => sum + m.bounces, 0);
      const bounceRate = (totalBounces / totalPageViews) * 100;
      
      expect(bounceRate).toBe(25); // 1 bounce out of 4 = 25%
    });
  });

  describe('Engagement Rate', () => {
    test('should calculate high engagement with many interactions', () => {
      metricsTracker.trackPageView();
      metricsTracker.trackInteraction('email');
      metricsTracker.trackInteraction('password');
      metricsTracker.trackSubmission(true);
      
      const metrics = metricsTracker.getMetrics();
      expect(metrics.engagementRate).toBeGreaterThan(100); // Multiple interactions per page view
    });

    test('should calculate 0% engagement with no interactions', () => {
      metricsTracker.trackPageView();
      
      const metrics = metricsTracker.getMetrics();
      expect(metrics.engagementRate).toBe(0);
    });
  });

  describe('Session Duration', () => {
    test('should track session duration', async () => {
      const startTime = Date.now();
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const metrics = metricsTracker.getMetrics();
      expect(metrics.sessionDuration).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Reset Functionality', () => {
    test('should reset all metrics', () => {
      metricsTracker.trackPageView();
      metricsTracker.trackInteraction('action');
      metricsTracker.trackSubmission(true);
      
      metricsTracker.reset();
      
      const metrics = metricsTracker.getMetrics();
      expect(metrics.pageViews).toBe(0);
      expect(metrics.bounces).toBe(0);
      expect(metrics.submissions).toBe(0);
      expect(metricsTracker.hasInteracted).toBe(false);
    });
  });

  describe('Realistic Scenario', () => {
    test('should handle typical user flow with low bounce rate', () => {
      const allSessions = [];
      
      // User 1: Successful login
      metricsTracker.trackPageView();
      metricsTracker.trackInteraction('email_input');
      metricsTracker.trackInteraction('password_input');
      metricsTracker.trackSubmission(true);
      allSessions.push(metricsTracker.getMetrics());
      metricsTracker.reset();
      
      // User 2: Failed validation, tries again
      metricsTracker.trackPageView();
      metricsTracker.trackInteraction('email_input');
      metricsTracker.trackSubmission(false);
      metricsTracker.trackInteraction('email_input');
      metricsTracker.trackSubmission(true);
      allSessions.push(metricsTracker.getMetrics());
      metricsTracker.reset();
      
      // User 3: Clicks forgot password
      metricsTracker.trackPageView();
      metricsTracker.trackInteraction('email_input');
      metricsTracker.trackInteraction('forgot_password_click');
      allSessions.push(metricsTracker.getMetrics());
      metricsTracker.reset();
      
      // User 4: Bounces (no interaction)
      metricsTracker.trackPageView();
      metricsTracker.trackBounce();
      allSessions.push(metricsTracker.getMetrics());
      
      // Aggregate metrics
      const totalPageViews = allSessions.reduce((sum, m) => sum + m.pageViews, 0);
      const totalBounces = allSessions.reduce((sum, m) => sum + m.bounces, 0);
      const totalSubmissions = allSessions.reduce((sum, m) => sum + m.submissions, 0);
      const totalSuccessful = allSessions.reduce((sum, m) => sum + m.successfulSubmissions, 0);
      const bounceRate = (totalBounces / totalPageViews) * 100;
      
      expect(totalPageViews).toBe(4);
      expect(totalBounces).toBe(1);
      expect(bounceRate).toBe(25); // 1 bounce out of 4 views = 25%
      expect(totalSubmissions).toBe(3);
      expect(totalSuccessful).toBe(2);
      
      // Bounce rate should be well below 50% threshold
      expect(bounceRate).toBeLessThan(50);
    });
  });
});
