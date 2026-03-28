# Modules 1 to 4: Foundations

## Module 1: Real-Time Communication Fundamentals

### Concepts

- Real-time communication goals
- Latency, jitter, and packet loss
- Session setup vs media path
- Signaling path vs media path

### Key Idea

WebRTC does not define a signaling protocol. You build signaling yourself.

### Must Know Terms

- SDP: session description with codecs and transport details
- ICE: process to discover and test connectivity paths
- STUN: discovers public-facing address candidates
- TURN: relays media when direct path fails

### Checkpoint

Explain in your own words why signaling can be on WebSocket while media is peer-to-peer.

## Module 2: Browser Media APIs

### APIs

- `navigator.mediaDevices.getUserMedia()`
- `enumerateDevices()`
- `getDisplayMedia()`

### Practice

- Capture local camera and microphone
- Toggle track enabled states
- Handle permission denied gracefully

### Common Errors

- `NotAllowedError`
- `NotFoundError`
- `NotReadableError`

### Checkpoint

Build a page with local preview, mute button, camera button, and camera selector.

## Module 3: RTCPeerConnection Lifecycle

### Minimal Flow

1. Create peer connections.
2. Add local tracks.
3. Create offer.
4. Set local description.
5. Send offer via signaling.
6. Receive answer and set remote description.
7. Exchange ICE candidates.
8. Remote media appears.

### Core Events

- `onicecandidate`
- `ontrack`
- `connectionstatechange`
- `iceconnectionstatechange`

### Checkpoint

Simulate full flow with one browser acting as both sides (local loopback).

## Module 4: Signaling Design

### What to Send

- `join-room`
- `offer`
- `answer`
- `ice-candidate`
- `leave-room`

### Good Signaling Practices

- Include roomId, senderId, targetId
- Validate payload schema on server
- Log message type and timestamp
- Avoid forwarding malformed messages

### Checkpoint

Run two browser clients connected to your signaling server and complete first real call.
