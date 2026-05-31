# 📞 xubh-call: Stealth Calling Puzzle Game

An elegant, premium 3x3 sliding tile puzzle game that hides a secure peer-to-peer WebRTC voice calling dashboard. It allows a designated circle of 10 users, each assigned a specific 2-digit extension, to register, check active lines, and place audio calls.

## 🚀 Deployed URLs
- **Live Frontend App**: [https://xubh-call.vercel.app](https://xubh-call.vercel.app)
- **Live Signaling API**: [https://xubh-call-api.vercel.app](https://xubh-call-api.vercel.app)

---

## 🛠️ Project Structure

```text
xubh-call/
├── xubh-call/              # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # SlidingPuzzle, Settings, HiddenCaller, IncomingCall
│   │   ├── hooks/          # useWebRTC core voice logic
│   │   ├── App.jsx         # App screen coordinator & visibility listener
│   │   ├── App.css         # Styling system (Glassmorphism & animations)
│   │   └── main.jsx        # App entry point
│   ├── index.html          # HTML head & meta properties
│   └── package.json        # Frontend dependencies
└── xubh-call-api/          # Backend Node.js Signaling API
    ├── api/
    │   └── index.js        # Express server running as Vercel Serverless Function
    ├── vercel.json         # Vercel Serverless Routing configurations
    └── package.json        # Backend dependencies
```

---

## 🔒 Stealth Mechanisms & Features

1. **Disguised Outer Game**: On launch, the app behaves as a classic sliding tile puzzle game. No calling buttons or indicators are visible.
2. **Hidden Portal**: Inside the Settings panel (accessed via the top-right Gear icon ⚙️), there are 10 standard game settings. Below the last setting is a subtle link labeled **"Customer Support"**. Tapping it opens the dialing dashboard.
3. **2-Digit Allocation & Conflict Check**: The network supports exactly 10 lines: `10, 20, 30, 40, 50, 60, 70, 80, 90, 99`. Upon opening the support page for the first time, users must claim an extension. The signaling server dynamically verifies that the selected extension is not active elsewhere.
4. **Discrete Signaling**: Real-time incoming calls trigger a custom, sleek alert overlay at the top saying `"Customer Care Alert - Line XX is calling..."` with Accept/Deny triggers.
5. **Background Audio Channels**: Once a call is connected, users can close the support screen and return to playing the puzzle game. The WebRTC audio runs silently in the background with zero onscreen notifications.
6. **Power Button / Screen Lock Disconnect**: Direct physical button hooks are blocked by browser sandboxes. To achieve the "power button hang-up" experience, the app listens to the Page Visibility API (`visibilitychange` event). As soon as the phone screen is locked or turned off, the page becomes hidden, and the WebRTC channel is immediately hung up.

---

## ⚙️ How to Run Locally

### 1. Run Backend Server
```bash
cd xubh-call-api
npm install
npm run dev
```
Runs signaling on `http://localhost:5000`.

### 2. Run Frontend Client
```bash
cd xubh-call
npm install
npm run dev
```
Runs client on `http://localhost:5173`. Open in multiple windows/devices to test calling.

---

## ☁️ Deployment on Vercel

This monorepo project is fully pre-configured for Vercel. 
- The backend is deployed using Server-Sent Events/polling and `@vercel/node` inside `xubh-call-api`.
- The frontend is built and deployed as a static React single-page app inside `xubh-call`.

*Deployed by Antigravity Agent.*
