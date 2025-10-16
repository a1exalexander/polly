import { PostHog } from 'posthog-js';
import { sanitizeState, isPayloadTooLarge } from './sanitizeState';

/**
 * Configuration for PostHog action logging
 */
export interface ActionLoggingConfig {
  enabled: boolean;
  logState: boolean;
  sampleRate: number;
  maxPayloadSizeKB: number;
  debugMode: boolean;
}

/**
 * Get action logging configuration from environment variables
 */
export function getActionLoggingConfig(): ActionLoggingConfig {
  // Default to enabled in development, check env var in production
  const isProduction = process.env.NODE_ENV === 'production';
  const enabledByDefault = !isProduction;

  return {
    enabled: process.env.NEXT_PUBLIC_POSTHOG_LOG_ACTIONS !== 'false' && enabledByDefault,
    logState: process.env.NEXT_PUBLIC_POSTHOG_LOG_STATE !== 'false',
    sampleRate: parseFloat(process.env.NEXT_PUBLIC_POSTHOG_LOG_SAMPLE_RATE || '1.0'),
    maxPayloadSizeKB: parseInt(process.env.NEXT_PUBLIC_POSTHOG_MAX_PAYLOAD_KB || '100', 10),
    debugMode: process.env.NODE_ENV === 'development',
  };
}

/**
 * Check if event should be sampled based on sample rate
 */
export function shouldSampleEvent(sampleRate: number): boolean {
  return Math.random() < sampleRate;
}

/**
 * Convert Redux action type to PostHog event name
 * Example: "USERS_FETCHED" -> "users_fetched"
 */
export function actionTypeToEventName(actionType: string, prefix: string = ''): string {
  const eventName = actionType.toLowerCase();
  return prefix ? `${prefix}.${eventName}` : eventName;
}

/**
 * Extract metadata from action
 */
export function extractActionMetadata(action: { type: string; payload?: unknown }): Record<string, unknown> {
  const metadata: Record<string, unknown> = {
    action_type: action.type,
  };

  // Add payload if it exists and is not too large
  if (action.payload !== undefined) {
    const sanitizedPayload = sanitizeState(action.payload);
    if (!isPayloadTooLarge(sanitizedPayload, 50)) {
      metadata.action_payload = sanitizedPayload;
    } else {
      metadata.action_payload = '[Payload Too Large]';
    }
  }

  return metadata;
}

/**
 * Capture Redux action event with PostHog
 */
export function captureActionEvent(
  posthog: PostHog | undefined,
  eventName: string,
  metadata: Record<string, unknown>,
  config: ActionLoggingConfig
): void {
  // Check if logging is enabled
  if (!config.enabled || !posthog) {
    return;
  }

  // Check sampling
  if (!shouldSampleEvent(config.sampleRate)) {
    return;
  }

  // Check payload size
  if (isPayloadTooLarge(metadata, config.maxPayloadSizeKB)) {
    if (config.debugMode) {
      console.warn(`[PostHog] Event ${eventName} payload too large, skipping state data`);
    }
    // Remove large fields
    const { state_before, state_after, ...smallerMetadata } = metadata;
    metadata = smallerMetadata;
  }

  // Add timestamp
  const eventData = {
    ...metadata,
    timestamp: new Date().toISOString(),
  };

  try {
    posthog.capture?.(eventName, eventData);

    if (config.debugMode) {
      console.log(`[PostHog] Captured event: ${eventName}`, eventData);
    }
  } catch (error) {
    if (config.debugMode) {
      console.error(`[PostHog] Error capturing event ${eventName}:`, error);
    }
  }
}

/**
 * Create a debounced version of capture function for high-frequency actions
 */
export function createDebouncedCapture(
  posthog: PostHog | undefined,
  delay: number = 1000
): (eventName: string, metadata: Record<string, unknown>) => void {
  const timeouts = new Map<string, NodeJS.Timeout>();

  return (eventName: string, metadata: Record<string, unknown>) => {
    const existingTimeout = timeouts.get(eventName);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(() => {
      posthog?.capture?.(eventName, metadata);
      timeouts.delete(eventName);
    }, delay);

    timeouts.set(eventName, timeout);
  };
}

/**
 * Batch capture multiple events
 */
export function captureActionBatch(
  posthog: PostHog | undefined,
  events: Array<{ eventName: string; metadata: Record<string, unknown> }>,
  config: ActionLoggingConfig
): void {
  if (!config.enabled || !posthog || events.length === 0) {
    return;
  }

  events.forEach(({ eventName, metadata }) => {
    captureActionEvent(posthog, eventName, metadata, config);
  });
}
