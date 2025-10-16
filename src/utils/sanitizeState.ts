/**
 * Utility functions for sanitizing state data before sending to PostHog
 * Removes sensitive information and limits data size
 */

interface SanitizeOptions {
  maxArrayLength?: number;
  maxObjectDepth?: number;
  removeFields?: string[];
  includeFields?: string[];
}

const DEFAULT_OPTIONS: Required<SanitizeOptions> = {
  maxArrayLength: 10,
  maxObjectDepth: 3,
  removeFields: ['user_id', 'email', 'password', 'token'],
  includeFields: [],
};

/**
 * Check if a value is a plain object
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

/**
 * Sanitize a single value based on options and depth
 */
function sanitizeValue(
  value: unknown,
  options: Required<SanitizeOptions>,
  currentDepth: number = 0
): unknown {
  // Handle null and undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Handle primitives
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  // Handle dates
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Check depth limit
  if (currentDepth >= options.maxObjectDepth) {
    return '[Max Depth Reached]';
  }

  // Handle arrays
  if (Array.isArray(value)) {
    const sanitized = value
      .slice(0, options.maxArrayLength)
      .map(item => sanitizeValue(item, options, currentDepth + 1));

    if (value.length > options.maxArrayLength) {
      return [...sanitized, `... ${value.length - options.maxArrayLength} more items`];
    }
    return sanitized;
  }

  // Handle objects
  if (isPlainObject(value)) {
    const sanitized: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(value)) {
      // Skip sensitive fields
      if (options.removeFields.includes(key)) {
        continue;
      }

      // If includeFields is specified, only include those fields
      if (options.includeFields.length > 0 && !options.includeFields.includes(key)) {
        continue;
      }

      sanitized[key] = sanitizeValue(val, options, currentDepth + 1);
    }

    return sanitized;
  }

  // For other types, convert to string
  return String(value);
}

/**
 * Sanitize state object for analytics
 */
export function sanitizeState<T>(state: T, customOptions?: SanitizeOptions): Record<string, unknown> {
  const options = { ...DEFAULT_OPTIONS, ...customOptions };
  return sanitizeValue(state, options) as Record<string, unknown>;
}

/**
 * Extract key metrics from RoomPage state
 * Uses Pick utility type to extract only needed fields from state types
 */
export function extractRoomPageMetrics(state: unknown): Record<string, unknown> {
  const typedState = state as {
    users?: Array<{ id: number; active?: boolean | null }>;
    story?: { id?: number; started_at?: string | null; finished_at?: string | null; title?: string | null } | null;
    usersOnStory?: Array<{ value?: number | null }>;
    room?: { id?: number; title?: string | null; type?: string | null; public_user_id?: number | null } | null;
    storiesCount?: number;
  };

  return {
    user_count: typedState.users?.length ?? 0,
    active_user_count: typedState.users?.filter(u => u.active)?.length ?? 0,
    story_id: typedState.story?.id ?? null,
    story_title: typedState.story?.title ?? null,
    story_status: !typedState.story?.started_at ? 'idle' : (typedState.story?.finished_at ? 'finished' : 'active'),
    votes_count: typedState.usersOnStory?.filter(u => u.value !== null)?.length ?? 0,
    room_id: typedState.room?.id ?? null,
    room_title: typedState.room?.title ?? null,
    room_type: typedState.room?.type ?? null,
    stories_count: typedState.storiesCount ?? 0,
    is_host: false, // This should be determined by caller
  };
}

/**
 * Extract key metrics from RoomList state
 */
export function extractRoomListMetrics(state: unknown): Record<string, unknown> {
  const typedState = state as {
    rooms?: Array<{ id: number }>;
    usersOnRooms?: Array<{ room_id: number; active?: boolean | null }>;
    recentlyVisitedRooms?: Array<{ id: number }>;
  };

  return {
    rooms_count: typedState.rooms?.length ?? 0,
    total_members: typedState.usersOnRooms?.length ?? 0,
    active_members: typedState.usersOnRooms?.filter(u => u.active)?.length ?? 0,
    recently_visited_count: typedState.recentlyVisitedRooms?.length ?? 0,
  };
}

/**
 * Calculate payload size in bytes (approximate)
 */
export function getPayloadSize(payload: unknown): number {
  try {
    return new Blob([JSON.stringify(payload)]).size;
  } catch {
    return 0;
  }
}

/**
 * Check if payload exceeds size limit
 */
export function isPayloadTooLarge(payload: unknown, maxSizeKB: number = 100): boolean {
  const sizeBytes = getPayloadSize(payload);
  const sizeKB = sizeBytes / 1024;
  return sizeKB > maxSizeKB;
}
