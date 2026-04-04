const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const client = require('prom-client');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

// ── Prometheus metrics ──
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'k8s_hub_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register],
});

const httpRequestTotal = new client.Counter({
  name: 'k8s_hub_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const aiChatTotal = new client.Counter({
  name: 'k8s_hub_ai_chats_total',
  help: 'Total number of AI chat requests',
  labelNames: ['model', 'status'],
  registers: [register],
});

// Metrics middleware — tracks every request
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
    httpRequestTotal.labels(req.method, route, res.statusCode).inc();
  });
  next();
});

// Rate limiter for AI chat endpoint (20 requests per minute per IP)
const aiChatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { content: null, error: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// CORS configuration - allow frontend environments
const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',') 
    : ['http://localhost:5173', 'http://localhost:8080'];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// GET /api/config - Check if AI features are enabled
app.get('/api/config', (req, res) => {
    res.json({
        aiEnabled: !!process.env.OPENROUTER_API_KEY,
        provider: "openrouter"
    });
});

// GET /health - Health check endpoint
app.get('/health', (req, res) => {
    const apiKeySet = !!process.env.OPENROUTER_API_KEY;
    const status = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        aiEnabled: apiKeySet,
        port: PORT,
        service: 'k8s-hub-backend'
    };
    res.status(200).json(status);
});

// POST /api/ai/chat - Proxy chat requests to OpenRouter
app.post('/api/ai/chat', aiChatLimiter, async (req, res) => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        return res.status(503).json({
            content: null,
            error: "AI service is not configured on the server."
        });
    }

    const model = req.body.model || "stepfun/step-3.5-flash:free";

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            ...req.body,
            model: model
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://hub.example.com', // Dummy for OpenRouter API
                'X-Title': 'K8s Hub AI Proxy'
            }
        });

        const content = response.data.choices?.[0]?.message?.content;

        aiChatTotal.labels(model, 'success').inc();

        res.json({
            reply: content || "No response content from AI.",
            error: null
        });
    } catch (error) {
        console.error('AI Proxy Error:', error.response?.data || error.message);
        aiChatTotal.labels(model, 'error').inc();
        res.status(error.response?.status || 500).json({
            reply: null,
            error: error.response?.data?.error?.message || error.message || "The AI service is currently unavailable. Please check server configuration."
        });
    }
});

// GET /metrics — Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Graceful shutdown
let server;

function startServer() {
    server = app.listen(PORT, () => {
        console.log(`🚀 K8s Hub Backend running on port ${PORT}`);
        const key = process.env.OPENROUTER_API_KEY;
        if (key) {
            console.log(`🤖 AI: Enabled ✅`);
        } else {
            console.warn(`⚠️ AI: OPENROUTER_API_KEY not set — AI features disabled`);
        }
    });
}

function stopServer() {
    if (server) {
        server.close(() => {
            console.log('Server closed gracefully');
            process.exit(0);
        });
        setTimeout(() => {
            console.error('Force closing connections');
            process.exit(1);
        }, 10000);
    }
}

process.on('SIGTERM', stopServer);
process.on('SIGINT', stopServer);

startServer();
