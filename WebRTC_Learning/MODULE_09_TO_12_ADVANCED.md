# Modules 9 to 12: Advanced

## Module 9: Architecture at Scale

## Topologies

- Mesh: simple but bandwidth-heavy per user
- SFU: server forwards streams, common production model
- MCU: server mixes streams, heavy compute

### Rule of Thumb

- 2-4 users: mesh can work
- 5-50 users: SFU preferred
- very large rooms: SFU with advanced adaptation

### Checkpoint

Write a one-page architecture decision record for your target app size.

## Module 10: Monitoring and Debugging

### Browser Tools

- `chrome://webrtc-internals`
- `about:webrtc` (Firefox)
- `getStats()` API

### Metrics to Track

- available bitrate
- outbound and inbound bitrate
- RTT
- packets lost
- frames per second

### Checkpoint

Build a debug panel that polls selected stats every 2 seconds.

## Module 11: Production Engineering

### Backend Needs

- authenticated signaling
- room lifecycle and timeout cleanup
- abuse protection and rate limiting
- structured logs and trace IDs

### Infra Needs

- TURN deployment in nearest regions
- TLS termination
- scaling signaling horizontally
- monitoring alert thresholds

### Checkpoint

Deploy staging and run test matrix: same LAN, different ISP, mobile hotspot.

## Module 12: Portfolio and Interview Readiness

### You Should Be Able To Explain

- Offer/answer exchange flow
- ICE candidate exchange timing
- Why TURN is expensive and when needed
- Mesh vs SFU trade-offs
- Main WebRTC failure scenarios and recovery strategy

### Checkpoint

Record a short system design walk-through of your capstone.
