const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// In-memory data structures
const ALLOWED_NUMBERS = ['10', '20', '30', '40', '50', '60', '70', '80', '90', '99'];
let clients = {}; // format: { '10': { lastHeartbeat: timestamp } }
let signalsQueue = {}; // format: { '10': [ { from, type, data } ] }

// Helper: Clean up inactive clients (no heartbeat for 12 seconds)
function cleanupInactiveClients() {
  const now = Date.now();
  Object.keys(clients).forEach((id) => {
    if (now - clients[id].lastHeartbeat > 12000) {
      delete clients[id];
      delete signalsQueue[id];
    }
  });
}

// Check online status of an ID
function isOnline(id) {
  cleanupInactiveClients();
  return !!clients[id] && (Date.now() - clients[id].lastHeartbeat <= 12000);
}

// 1. Get status of all numbers
app.get('/api/status', (req, res) => {
  cleanupInactiveClients();
  const statuses = ALLOWED_NUMBERS.map(num => ({
    id: num,
    online: isOnline(num)
  }));
  res.json({ success: true, statuses });
});

// 2. Register user to a 2-digit number
app.post('/api/register', (req, res) => {
  const { id } = req.body;
  if (!id || !ALLOWED_NUMBERS.includes(id)) {
    return res.status(400).json({ success: false, message: 'Invalid 2-digit number' });
  }

  cleanupInactiveClients();

  if (isOnline(id)) {
    return res.json({ success: false, message: 'This number is already in use by another user' });
  }

  // Register
  clients[id] = { lastHeartbeat: Date.now() };
  signalsQueue[id] = [];
  
  res.json({ success: true, message: 'Number registered successfully' });
});

// 3. Heartbeat endpoint to maintain registration
app.post('/api/heartbeat', (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: 'ID required' });
  }

  if (clients[id]) {
    clients[id].lastHeartbeat = Date.now();
    return res.json({ success: true });
  } else {
    // If client expired, re-register if free
    clients[id] = { lastHeartbeat: Date.now() };
    if (!signalsQueue[id]) signalsQueue[id] = [];
    return res.json({ success: true, message: 'Session re-established' });
  }
});

// 4. Send signals (offer, answer, candidate, hangup)
app.post('/api/signal', (req, res) => {
  const { from, to, type, data } = req.body;
  if (!from || !to || !type) {
    return res.status(400).json({ success: false, message: 'Missing parameters' });
  }

  if (!signalsQueue[to]) {
    signalsQueue[to] = [];
  }

  signalsQueue[to].push({ from, type, data, timestamp: Date.now() });
  res.json({ success: true });
});

// 5. Poll for incoming signals
app.get('/api/poll', (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, message: 'ID required' });
  }

  // Keep heartbeat fresh during polling
  if (clients[id]) {
    clients[id].lastHeartbeat = Date.now();
  } else {
    clients[id] = { lastHeartbeat: Date.now() };
  }

  const queue = signalsQueue[id] || [];
  signalsQueue[id] = []; // Clear queue after fetching
  
  res.json({ success: true, signals: queue });
});

// 6. Unregister / manual logout
app.post('/api/unregister', (req, res) => {
  const { id } = req.body;
  if (id) {
    delete clients[id];
    delete signalsQueue[id];
  }
  res.json({ success: true });
});

// Root path test
app.get('/', (req, res) => {
  res.send('Hidden Calling Signaling Server is Online');
});

// Port configuration for local running
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Signaling server running on port ${PORT}`);
  });
}

module.exports = app;
