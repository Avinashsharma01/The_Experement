# Checklist and Assessments

## Progress Checklist

- [ ] I can explain offer, answer, and ICE without notes.
- [ ] I can implement a working signaling flow.
- [ ] I can diagnose at least 3 common call failure reasons.
- [ ] I can configure STUN and TURN servers.
- [ ] I can build data channel chat and file transfer.
- [ ] I can gather and interpret WebRTC stats.
- [ ] I can explain mesh vs SFU architecture trade-offs.
- [ ] I can deploy a staging build and test across networks.

## Weekly Self-Test Questions

1. What is the difference between signaling and media transport?
2. Why can `setRemoteDescription` fail, and how do you debug it?
3. What does a relay ICE candidate indicate?
4. When should you use unordered data channels?
5. Which metrics best indicate poor call quality?

## Practical Assessments

## Assessment A (After Week 4)

- Build one-to-one call with signaling.
- Demonstrate join and leave handling.
- Explain logs for each connection state transition.

## Assessment B (After Week 8)

- Add TURN and verify cross-network stability.
- Add chat and screen share.
- Show failure handling for denied media permissions.

## Assessment C (Final)

- Present capstone end-to-end.
- Explain architecture and trade-offs.
- Demonstrate live debugging with webrtc-internals or stats panel.

## Scoring Guide

- 0: not attempted
- 1: partial implementation
- 2: works with major gaps
- 3: works and resilient in common cases
- 4: production-minded quality

Target average score: 3 or above across all final assessment categories.
