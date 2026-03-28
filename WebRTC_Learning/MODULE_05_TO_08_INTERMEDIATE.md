# Modules 5 to 8: Intermediate

## Module 5: ICE, NAT, STUN, TURN

### Why Calls Fail

- Symmetric NAT constraints
- Firewall and UDP restrictions
- No relay fallback configured

### ICE Candidate Types

- host
- srflx
- relay

### Practical Config

```js
const pc = new RTCPeerConnection({
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
            urls: "turn:YOUR_TURN_HOST:3478",
            username: "user",
            credential: "pass",
        },
    ],
});
```

### Checkpoint

Force relay-only testing and verify call still works.

## Module 6: Data Channels

### Use Cases

- chat
- typing indicators
- game state
- file transfer chunks

### Important Settings

- ordered true or false
- maxRetransmits
- binaryType

### Checkpoint

Add chat panel and file send with progress bar.

## Module 7: UX and Call Controls

### Required Controls

- mute and unmute
- camera on and off
- screen share start and stop
- leave call and cleanup

### Cleanup Rules

- stop all local tracks
- close all peer connections
- remove event listeners
- notify room on disconnect

### Checkpoint

No orphan media streams after leave call.

## Module 8: Security Basics

### Security Principles

- Always use HTTPS in production
- Keep TURN credentials short-lived when possible
- Authenticate signaling users
- Restrict room join permissions

### Privacy Principles

- Ask only required permissions
- Show clear camera and mic active states
- Document data retention policy for signaling metadata

### Checkpoint

Prepare a one-page security and privacy checklist for your app.

## Small Project Milestone (Do This Before Capstone)

Complete the guided project in [SMALL_PROJECT.md](./SMALL_PROJECT.md).

Project outcome:

- one-room two-user video call
- text chat over DataChannel
- basic call controls and cleanup
