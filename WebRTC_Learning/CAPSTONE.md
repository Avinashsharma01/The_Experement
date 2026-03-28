# Capstone: Build a Production-Style Video Meeting App

## Goal

Build a real-time app with:

- one-to-one and small-group rooms
- camera and microphone controls
- screen share
- chat via data channel
- participant join and leave events
- basic connection quality indicators

## Required Stack

- Frontend: HTML/CSS/JavaScript (or React if preferred)
- Signaling: Node.js + Socket.IO
- NAT Traversal: STUN + TURN
- Deployment: any cloud platform for signaling server

## Mandatory Features

1. Authentication gate before joining room.
2. Room IDs with shareable links.
3. Join and leave notifications.
4. Mute, unmute, camera toggle.
5. Screen share with fallback handling.
6. Text chat.
7. Reconnect UX after temporary disconnect.
8. Basic stats view (RTT, bitrate, packet loss).
9. Graceful cleanup when tab closes.
10. Error toasts with actionable messages.

## Suggested Folder Layout

- client/
- server/
- shared/
- docs/

## Milestones

1. Baseline call works.
2. Controls and chat added.
3. Screen share and reconnection.
4. Quality stats and error states.
5. Deployment and testing report.

## Testing Matrix

- Chrome to Chrome same network
- Chrome to Chrome different networks
- Chrome to Firefox
- Laptop to mobile browser
- Low bandwidth simulation

## Completion Criteria

- Call setup success rate above 90 percent in your test matrix.
- No memory leak on repeated join and leave cycles.
- Clear logs for signaling and peer state transitions.
- README documents setup, architecture, and known limitations.
