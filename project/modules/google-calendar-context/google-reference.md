---
id: google-calendar-context-google-reference
title: Google Calendar API Reference
status: ready
phase: 2
owners:
  - Backend Engineer
depends_on:
  - google-calendar-context
parallel_group: calendar-context
source_of_truth:
  - project/modules/google-calendar-context/README.md
  - PRD_Zuam_v0.3.md
last_updated: "2026-04-08"
---

# Google Calendar API Reference

This file captures the Google Calendar behaviors that matter for Zuam's calendar-context module, especially the tradeoffs between free/busy reads, full event sync, sync tokens, and push channels.

## Official Docs Reviewed
- Calendar scopes: https://developers.google.com/workspace/calendar/api/auth
- Incremental sync: https://developers.google.com/workspace/calendar/api/guides/sync
- Push notifications: https://developers.google.com/workspace/calendar/api/guides/push
- `calendarList.list`: https://developers.google.com/workspace/calendar/api/v3/reference/calendarList/list
- `freeBusy.query`: https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query
- `events.list`: https://developers.google.com/workspace/calendar/api/v3/reference/events/list
- `events.watch`: https://developers.google.com/workspace/calendar/api/v3/reference/events/watch

Reviewed on 2026-04-05.

## Zuam Decisions Frozen From The Docs

### 1. Phase 2 baseline should use calendar list plus free/busy, not full event mirroring
- Zuam's Phase 2 calendar-context goal is availability and scheduling guidance, not full calendar event management.
- The narrowest useful Google scope set for that goal is:
  - `https://www.googleapis.com/auth/calendar.calendarlist.readonly`
  - `https://www.googleapis.com/auth/calendar.freebusy`
- `calendarList.list` gives the user's subscribed calendars.
- `freeBusy.query` gives busy blocks and supports `calendar.freebusy`, `calendar.events.freebusy`, `calendar.readonly`, or full `calendar`.

This is a deliberate Zuam choice based on the official scope docs plus the current module goal.

### 2. Escalate to event-read scopes only if the UI needs event-level explanations
- If Zuam only needs busy windows, keep the baseline scopes above.
- If Zuam needs event titles, event types, or other event-level explanations in the UI, add `https://www.googleapis.com/auth/calendar.events.readonly`.
- If Zuam later writes focus-session or time-block events, add `https://www.googleapis.com/auth/calendar.events`.

### 3. Free/busy is the safest MVP read model
- `freeBusy.query` returns busy windows for a time range and can include per-calendar or per-group errors.
- Zuam should use this for:
  - "you are busy/free in this window"
  - candidate-slot generation
  - schedule conflict explanations at the interval level
- Normalize the results into `BusyBlock` records and derive `FreeWindow` from user work hours plus those busy blocks.
- Handle partial failure per calendar instead of failing the entire scheduling response.

### 4. If event sync is needed, use sync tokens correctly
- Calendar incremental sync is two-stage:
  - one full sync to obtain `nextSyncToken`
  - repeated incremental sync using the stored sync token
- Deleted entries are always included in incremental sync results.
- If the sync token expires or is invalid, Google returns `410 GONE`; the client must wipe its mirrored store and perform a new full sync.
- Google requires the same query-parameter set across initial and incremental sync requests.

### 5. Sync-token restrictions make bounded event mirroring awkward
- `events.list` with `syncToken` cannot be combined with:
  - `iCalUID`
  - `orderBy`
  - `privateExtendedProperty`
  - `q`
  - `sharedExtendedProperty`
  - `timeMin`
  - `timeMax`
  - `updatedMin`
- Because `timeMin` and `timeMax` are incompatible with `syncToken`, Zuam should avoid designing a long-lived sync model that depends on "only the next two weeks of events" plus sync tokens.
- This is one of the main reasons the Phase 2 baseline should stay centered on `calendarList.list` plus `freeBusy.query`.

### 6. Push notifications are optional optimization, not the baseline contract
- Calendar supports watch channels for Events, CalendarList, ACLs, and Settings.
- Watch requests require:
  - a unique channel `id`
  - `type=web_hook`
  - an HTTPS callback `address`
- The callback must use a valid public HTTPS certificate.
- Notification messages do not include a body with resource details; Zuam must refetch via the API after notifications arrive.
- Google sends an initial `sync` message when a channel starts, and it may arrive before the watch response due to timing.
- Channels expire and must be replaced manually; Google does not auto-renew them.
- `channels.stop` requires the channel `id` and `resourceId`.

Given Zuam's current phase plan, push should be treated as a later freshness optimization, not a prerequisite for Phase 2.

### 7. Calendar-list sync also has sync tokens
- `calendarList.list` supports `syncToken` and returns `nextSyncToken`.
- If the token expires, Google returns `410 GONE` and the client must do a full resync.
- Hidden and deleted calendar-list entries are always included in incremental results, and Google disallows forcing them off in that mode.

### 8. Access-role differences matter
- `calendarList.list` exposes access roles such as `freeBusyReader`, `reader`, `writer`, and `owner`.
- Zuam should not assume event details are visible for every calendar that appears in the user's calendar list.
- If a calendar is effectively free/busy only, schedule guidance may still work while event-detail explanations do not.

## Concrete Zuam Strategy

### Phase 2 recommended read path
1. Use `calendarList.list` to discover calendars the user is subscribed to.
2. Filter calendars according to product rules and user settings.
3. Use `freeBusy.query` over the chosen time window to derive busy blocks.
4. Normalize those busy blocks into Zuam's `BusyBlock` and `FreeWindow` read models.

### Optional later detail path
If event titles or event-type explanations are required:
1. Add `calendar.events.readonly`.
2. Mirror event data with `events.list`.
3. Persist `nextSyncToken` per mirrored collection.
4. Handle `410 GONE` by clearing the mirror and re-running the full sync.
5. Optionally add `events.watch` for freshness if the operational overhead is justified.

## Failure Modes Agents Must Handle
- `410 GONE` on expired sync tokens.
- Partial free/busy failures for some calendars in a multi-calendar query.
- Watch-channel expiration and overlapping replacement channels.
- Incoming webhook notifications with headers only and no body.
- Calendar access roles that allow free/busy but not full event detail.

## Recommended Zuam Test Additions
- Add a backend test that proves `410 GONE` wipes the mirrored calendar store and restarts a full sync.
- Add a backend test that handles one failing calendar inside a multi-calendar free/busy query without dropping the whole response.
- Add a backend test that validates watch-channel notifications trigger a refetch rather than trying to parse a nonexistent body.
- Add a frontend test that distinguishes "busy/free known" from "event details unavailable".

## Source Highlights
- Google recommends choosing the narrowest scopes possible.
- `calendar.freebusy` is enough for availability-only reads.
- `calendarList.list` and `events.list` both support sync tokens.
- `events.list` incremental sync has strict query restrictions and returns `410 GONE` when the token expires.
- Calendar push notifications require HTTPS webhooks and contain headers, not resource bodies.
