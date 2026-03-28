# 12-Week WebRTC Study Plan

## Week 1: Internet and Real-Time Basics

- Learn HTTP vs WebSocket vs WebRTC.
- Understand latency, jitter, packet loss, bandwidth.
- Learn UDP vs TCP and why media prefers UDP.
- Output: one-page summary in your own words.

## Week 2: Media Capture and Device Handling

- Practice `getUserMedia()` for audio/video.
- Handle permission errors and missing devices.
- Add device switch (camera and microphone).
- Output: local preview app with device selector.

## Week 3: RTCPeerConnection Fundamentals

- Create your first `RTCPeerConnection`.
- Add tracks and handle remote tracks.
- Understand offers, answers, and signaling states.
- Output: local loopback peer demo.

## Week 4: Signaling Server Basics

- Build signaling server with Node.js + Socket.IO.
- Exchange offer, answer, and ICE candidates.
- Build first two-browser peer call.
- Output: one-to-one call in two tabs or devices.

## Week 5: NAT, STUN, TURN, ICE Deep Dive

- Learn NAT types and traversal constraints.
- Configure public STUN server.
- Add TURN fallback.
- Output: call works on different networks.

## Week 6: Data Channels

- Use `RTCDataChannel` for text chat.
- Add file transfer with chunking.
- Handle ordered vs unordered channels.
- Output: media call + text chat + file send.

## Week 7: Reliability and UX

- Add reconnect logic and clear call state handling.
- Show UI states: connecting, connected, failed, closed.
- Handle mute/unmute and camera on/off.
- Output: polished one-to-one app UX.

## Week 8: Security and Privacy

- Study DTLS-SRTP basics and identity assumptions.
- Add permission-aware UX and secure defaults.
- Understand metadata risk in signaling.
- Output: security checklist added to project.

## Week 9: Scaling Architectures

- Compare mesh, SFU, and MCU trade-offs.
- Integrate open-source SFU (conceptually: mediasoup/Janus/Jitsi).
- Understand simulcast and SVC fundamentals.
- Output: architecture decision note for 2, 10, 100 users.

## Week 10: Observability and Debugging

- Use `chrome://webrtc-internals`.
- Read stats via `getStats()`.
- Track bitrate, RTT, packet loss, frame drops.
- Output: debug dashboard logging key metrics.

## Week 11: Production Readiness

- Add auth for signaling.
- Add room management and limits.
- Add deployment strategy for signaling and TURN.
- Output: staging deployment and test report.

## Week 12: Capstone Build and Review

- Build full capstone described in `CAPSTONE.md`.
- Record demo and architecture explanation.
- Create README with setup, features, and known limitations.
- Output: portfolio-ready project.
