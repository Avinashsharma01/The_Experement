# Small Project: 2-Person Video Chat with Text Chat

This is a compact project to apply what you learned before capstone.

## Project Goal

Build a one-room, two-person WebRTC app with:

- local and remote video
- mute and unmute
- camera on and off
- text chat using data channel
- simple connection status labels

Estimated time: 4 to 6 hours

## What You Will Practice

- media capture with `getUserMedia()`
- signaling with Socket.IO
- offer and answer exchange
- ICE candidate exchange
- data channel setup and message send
- cleanup on leave

## Suggested Folder Structure

```text
small-project/
  client/
    index.html
    style.css
    app.js
  server/
    server.js
  package.json
  README.md
```

## Step-by-Step Build

## Step 1: Signaling Server

Create `server/server.js` using Node.js and Socket.IO:

- create room join event
- forward offer, answer, and ICE candidate messages
- emit peer join and leave events

## Step 2: Client UI

Create UI with:

- two video elements: local and remote
- input box + send button for chat
- buttons: Join, Leave, Mute, Camera
- status text: `connecting`, `connected`, `failed`

## Step 3: Peer Connection

In `client/app.js`:

- create `RTCPeerConnection` with STUN
- add local tracks
- handle `ontrack`
- handle `onicecandidate`
- create data channel for chat

## Step 4: Signaling Flow

- when first user joins: wait
- when second user joins: create offer
- receiver creates answer
- both exchange ICE candidates

## Step 5: Chat Channel

- create data channel on caller side
- receive data channel on callee side
- send text messages and render chat log

## Step 6: Cleanup

On leave or unload:

- stop local tracks
- close data channel
- close peer connection
- clear video elements

## Minimal ICE Config

```js
const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
});
```

## Definition of Done

- two browsers can join same room and see each other
- chat messages send both ways
- mute and camera buttons work
- leaving does not crash remaining user
- reconnection by rejoin works

## Stretch Goals

- screen sharing button
- network quality indicator from `getStats()`
- typing indicator in chat
- switch camera device

## Common Pitfalls

- forgetting `await setLocalDescription()` before sending SDP
- adding ICE candidates before remote description is set
- not handling `ondatachannel` on callee
- not stopping tracks when leaving
