# WebRTC Hands-on Labs

Each lab should be completed in code. Keep each lab in a separate folder and add a README with lessons learned.

## Lab 1: Local Media Preview

- Capture camera and microphone.
- Show local stream on video element.
- Add mute and camera toggle.

## Lab 2: Device Switching

- List devices using `enumerateDevices()`.
- Switch camera during preview.
- Persist selected device in localStorage.

## Lab 3: Local Loopback Peer

- Create two peer connections in one page.
- Pass offer, answer, and ICE locally.
- Display remote stream.

## Lab 4: Two-Client Signaling

- Build Socket.IO signaling server.
- Connect two browser clients.
- Complete one-to-one call.

## Lab 5: TURN Validation

- Add TURN credentials.
- Test with blocked UDP or constrained network.
- Verify relay candidate usage.

## Lab 6: Data Channel Chat

- Add text chat over data channel.
- Add typing indicator.
- Handle reconnection edge cases.

## Lab 7: File Transfer

- Send file in chunks via data channel.
- Reassemble file and download.
- Display transfer speed and completion status.

## Lab 8: Screen Share

- Add `getDisplayMedia()` flow.
- Replace outgoing video track.
- Revert to camera after share stops.

## Lab 9: Stats Dashboard

- Poll `getStats()` periodically.
- Show bitrate, RTT, packet loss, and fps.
- Highlight warning thresholds.

## Lab 10: Failure Injection

- Simulate signaling disconnect.
- Stop network briefly.
- Ensure app handles recovery or fails gracefully with clear UI.
