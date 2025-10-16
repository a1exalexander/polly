import { Reducer } from 'react';
import { PostHog } from 'posthog-js';
import {
  getActionLoggingConfig,
  actionTypeToEventName,
  extractActionMetadata,
  captureActionEvent,
} from './analytics';
import { sanitizeState } from './sanitizeState';

/**
 * Options for creating PostHog middleware
 */
export interface PostHogMiddlewareOptions {
  eventPrefix: string;
  extractMetrics?: (state: unknown) => Record<string, unknown>;
  skipActions?: string[];
  customMetadata?: Record<string, unknown>;
}

/**
 * Create a reducer wrapper that logs actions to PostHog
 *
 * @param reducer - The original reducer function
 * @param posthogGetter - Function to get PostHog instance (lazy evaluation)
 * @param options - Middleware options
 * @returns Enhanced reducer with PostHog logging
 */
export function createPostHogMiddleware<TState, TAction extends { type: string; payload?: unknown }>(
  reducer: Reducer<TState, TAction>,
  posthogGetter: () => PostHog | undefined,
  options: PostHogMiddlewareOptions
): Reducer<TState, TAction> {
  const config = getActionLoggingConfig();

  return (state: TState, action: TAction): TState => {
    // Skip if logging is disabled
    if (!config.enabled) {
      return reducer(state, action);
    }

    // Skip specific actions if configured
    if (options.skipActions?.includes(action.type)) {
      return reducer(state, action);
    }

    // Capture state before action
    const stateBefore = config.logState ? state : undefined;

    // Execute the original reducer
    const stateAfter = reducer(state, action);

    // Capture analytics asynchronously to not block rendering
    if (typeof window !== 'undefined') {
      // Use setTimeout to make it truly async and non-blocking
      setTimeout(() => {
        try {
          const posthog = posthogGetter();
          if (!posthog) {
            return;
          }

          // Build event name
          const eventName = actionTypeToEventName(action.type, options.eventPrefix);

          // Extract action metadata
          const actionMetadata = extractActionMetadata(action);

          // Build metadata
          const metadata: Record<string, unknown> = {
            ...actionMetadata,
            ...options.customMetadata,
          };

          // Add state snapshots if enabled
          if (config.logState && stateBefore && stateAfter) {
            metadata.state_before = sanitizeState(stateBefore, {
              maxArrayLength: 5,
              maxObjectDepth: 2,
            });
            metadata.state_after = sanitizeState(stateAfter, {
              maxArrayLength: 5,
              maxObjectDepth: 2,
            });
          }

          // Extract metrics if function provided
          if (options.extractMetrics) {
            const metrics = options.extractMetrics(stateAfter);
            metadata.metrics = metrics;
          }

          // Capture the event
          captureActionEvent(posthog, eventName, metadata, config);
        } catch (error) {
          if (config.debugMode) {
            console.error('[PostHog Middleware] Error capturing action:', error);
          }
        }
      }, 0);
    }

    return stateAfter;
  };
}

/**
 * Create a simple action logger (without full state snapshots)
 * Useful for high-frequency actions
 */
export function createLightweightPostHogMiddleware<TState, TAction extends { type: string; payload?: unknown }>(
  reducer: Reducer<TState, TAction>,
  posthogGetter: () => PostHog | undefined,
  options: Omit<PostHogMiddlewareOptions, 'extractMetrics'> & {
    extractMetrics?: (state: TState) => Record<string, unknown>;
  }
): Reducer<TState, TAction> {
  const config = getActionLoggingConfig();

  return (state: TState, action: TAction): TState => {
    const stateAfter = reducer(state, action);

    if (!config.enabled || options.skipActions?.includes(action.type)) {
      return stateAfter;
    }

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        try {
          const posthog = posthogGetter();
          if (!posthog) {
            return;
          }

          const eventName = actionTypeToEventName(action.type, options.eventPrefix);
          const metadata: Record<string, unknown> = {
            action_type: action.type,
            ...options.customMetadata,
          };

          // Only add metrics, not full state
          if (options.extractMetrics) {
            metadata.metrics = options.extractMetrics(stateAfter);
          }

          posthog.capture?.(eventName, metadata);

          if (config.debugMode) {
            console.log(`[PostHog] ${eventName}`, metadata);
          }
        } catch (error) {
          if (config.debugMode) {
            console.error('[PostHog Middleware] Error:', error);
          }
        }
      }, 0);
    }

    return stateAfter;
  };
}

/**
 * Helper to create a memoized PostHog getter
 * Useful for React components where PostHog might not be available immediately
 */
export function createPostHogGetter(getPostHog: () => PostHog | undefined) {
  let cachedPostHog: PostHog | undefined;

  return (): PostHog | undefined => {
    if (!cachedPostHog) {
      cachedPostHog = getPostHog();
    }
    return cachedPostHog;
  };
}
