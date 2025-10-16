# PostHog Action Logging

This document describes the PostHog action logging implementation for tracking Redux state changes in the Planning Poker application.

## Overview

All Redux actions in `RoomPage` and `RoomList` components are automatically logged to PostHog with state metadata. This provides comprehensive visibility into user flows, state changes, and application behavior.

## Features

- **Automatic Action Tracking**: Every Redux action is captured with metadata
- **State Snapshots**: Before/after state snapshots for debugging (configurable)
- **Metrics Extraction**: Key metrics extracted from state (user counts, voting status, etc.)
- **Performance Optimized**: Async capture, payload size limits, sampling support
- **Type Safe**: Full TypeScript support with proper type inference
- **Configurable**: Environment variable controls for production/development

## Events Tracked

### RoomPage Events (prefixed with `room_page.`)
- `room_page.users_fetch` / `room_page.users_fetched` - User list loading
- `room_page.user_created` / `room_page.user_deleted` / `room_page.user_updated` - User changes
- `room_page.story_fetch` / `room_page.story_fetched` / `room_page.story_created` / `room_page.story_updated` - Story lifecycle
- `room_page.room_fetch` / `room_page.room_fetched` / `room_page.room_updated` - Room data
- `room_page.users_on_story_fetch` / `room_page.users_on_story_fetched` - Vote data loading
- `room_page.user_on_story_created` / `room_page.user_on_story_updated` - Individual votes
- `room_page.stories_count_fetch` / `room_page.stories_count_fetched` / `room_page.stories_count_updated` - Story count updates

### RoomList Events (prefixed with `room_list.`)
- `room_list.rooms_fetched` - Initial room list load
- `room_list.room_created` / `room_list.room_deleted` / `room_list.room_updated` - Room CRUD operations
- `room_list.user_on_rooms_fetched` - User membership data
- `room_list.user_on_room_created` / `room_list.user_on_room_deleted` / `room_list.user_on_room_updated` - Membership changes
- `room_list.recently_visited_rooms_fetched` - Recent rooms loaded

## Event Metadata

Each event includes:

### Common Metadata
- `action_type` - The Redux action type
- `timestamp` - ISO timestamp of the event
- `action_payload` - The action payload (sanitized)
- `metrics` - Extracted key metrics from state

### RoomPage Metrics
- `user_count` - Total users in room
- `active_user_count` - Active/participating users
- `story_id` - Current story ID
- `story_title` - Current story title
- `story_status` - idle/active/finished
- `votes_count` - Number of votes cast
- `room_id` - Room ID
- `room_title` - Room title
- `room_type` - days/weeks/boolean
- `stories_count` - Total stories count
- `is_host` - Whether current user is host

### RoomList Metrics
- `rooms_count` - Number of owned rooms
- `total_members` - Total members across all rooms
- `active_members` - Currently active members
- `recently_visited_count` - Number of recently visited rooms

### Optional Metadata (if enabled)
- `state_before` - State snapshot before action (sanitized)
- `state_after` - State snapshot after action (sanitized)

## Configuration

Configure via environment variables:

```env
# Enable/disable action logging (default: true in development, false in production)
NEXT_PUBLIC_POSTHOG_LOG_ACTIONS=true

# Enable/disable state snapshots in events (default: true)
NEXT_PUBLIC_POSTHOG_LOG_STATE=true

# Sampling rate (0.0 to 1.0, default: 1.0 = 100%)
NEXT_PUBLIC_POSTHOG_LOG_SAMPLE_RATE=1.0

# Maximum payload size in KB (default: 100)
NEXT_PUBLIC_POSTHOG_MAX_PAYLOAD_KB=100
```

## Data Sanitization

To protect sensitive data, the following fields are automatically removed:
- `user_id` (UUID)
- `email`
- `password`
- `token`

Additional sanitization:
- Arrays limited to 5 items (configurable)
- Object depth limited to 2 levels (configurable)
- Payloads over size limit are truncated
- Null values properly handled

## Architecture

### Files
- `src/utils/sanitizeState.ts` - State sanitization utilities
- `src/utils/analytics.ts` - Analytics capture functions
- `src/utils/posthogMiddleware.ts` - Redux middleware wrapper
- `src/components/RoomPage/RoomPage.store.ts` - Enhanced RoomPage reducer
- `src/components/RoomList/RoomList.store.ts` - Enhanced RoomList reducer

### How It Works
1. Components use `createEnhancedReducer()` to wrap their reducers
2. The middleware intercepts every action dispatch
3. After the reducer runs, metrics are extracted from the new state
4. An async PostHog capture event is queued (non-blocking)
5. Events are sampled, sanitized, and sent to PostHog

## Performance Considerations

- **Non-blocking**: Events captured asynchronously using `setTimeout`
- **Lightweight**: Only metrics extracted by default, full state optional
- **Sampled**: Support for sampling in production
- **Size limits**: Payloads truncated if too large
- **Debouncing**: High-frequency actions can be debounced (not currently implemented)

## Usage in Components

### RoomPage Example
```typescript
const posthog = usePostHog();
const enhancedReducer = useMemo(
  () => createEnhancedReducer(posthog, serverUser.id),
  [posthog, serverUser.id]
);

const [state, dispatch] = useReducer(enhancedReducer, initialState);
```

### RoomList Example
```typescript
const posthog = usePostHog();
const enhancedReducer = useMemo(
  () => createEnhancedReducer(posthog),
  [posthog]
);

const [state, dispatch] = useReducer(enhancedReducer, initialState);
```

## Debugging

In development mode, action logs are printed to the console:
```
[PostHog] room_page.story_updated { metrics: {...}, action_type: "STORY_UPDATED", ... }
```

## Querying Data in PostHog

### Find all story updates
```
Event: room_page.story_updated
```

### Find completed stories
```
Event: room_page.story_updated
Where: metrics.story_status = "finished"
```

### Track voting completion rate
```
Event: room_page.users_on_story_fetched
Group by: metrics.votes_count / metrics.active_user_count
```

### Monitor room creation
```
Event: room_list.room_created
```

## Future Enhancements

Potential improvements:
- Add debouncing for high-frequency actions
- Track performance metrics (action duration)
- Add action sequences tracking (user flows)
- Custom event batching
- Error boundary integration for crash reporting
- A/B test integration with state context

## Troubleshooting

### Events not appearing in PostHog
1. Check `NEXT_PUBLIC_POSTHOG_LOG_ACTIONS` is not set to `false`
2. Verify PostHog is initialized (`posthog` is not undefined)
3. Check browser console for errors
4. Verify sampling rate is set correctly

### Payload too large errors
1. Increase `NEXT_PUBLIC_POSTHOG_MAX_PAYLOAD_KB`
2. Set `NEXT_PUBLIC_POSTHOG_LOG_STATE=false` to disable state snapshots
3. Reduce `maxArrayLength` in sanitization options

### Type errors
1. Ensure TypeScript compilation succeeds: `npm run build`
2. Update type definitions if state structure changes
3. Check that extract metrics functions match state types
