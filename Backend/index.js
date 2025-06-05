import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import axios from 'axios';
import session from 'express-session'

import fs from 'fs';
import path from 'path'
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

const app = express();
const port = 4000;

app.use(cors({
    origin: 'https://wheretonoww.netlify.app',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.use(session({
    secret: process.env.SECRET || 'defaultrandomsecret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
    },
    name: 'sessionId'
}));

app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session exists:', !!req.session);
    console.log('Current session data:', req.session);
    next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fetchEvents=async()=> {

  try {
    const jsonPath = path.join(__dirname, 'events.json');
    const data = fs.readFileSync(jsonPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('❌ Failed to load events.json:', err.message);
    return [];
  }
}

let cachedEvents = [];


(async () => {
  try {
    cachedEvents = await fetchEvents();
    console.log(`Initial scrape: ${cachedEvents.length} events.` );
  } catch (err) {
    console.error("Initial scrape failed:", err.message);
  }
})();


cron.schedule('0 * * * *', async () => {
  console.log("Running scheduled job...");
  try {
    cachedEvents = await fetchEvents();
    console.log (`Scraped ${cachedEvents.length} events.`);
  } catch (err) {
    console.error("Scheduled scraping failed:", err.message);
  }
});

app.get('/api/eventlist',(req,res)=>{
   res.json(cachedEvents);
});

app.post('/api/storemail', async (req, res) => {
    console.log('Received storemail request:', req.body);
    console.log('Current session:', req.session);

    try {
        const { email, eventurl } = req.body;
        
        if (!email || !eventurl) {
            console.log('Missing email or eventurl');
            return res.status(400).json({ error: 'Missing email or eventurl' });
        }

        if (!req.session.clicks) {
            console.log('Initializing clicks array in session');
            req.session.clicks = [];
        }

        const newClick = {
            email,
            eventurl,
            timestamp: new Date().toISOString(),
            sessionId: req.sessionID
        };

        req.session.clicks.push(newClick);
        console.log('Added new click to session:', newClick);

        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    reject(err);
                } else {
                    console.log('Session saved successfully');
                    console.log('Updated session data:', req.session);
                    resolve();
                }
            });
        });

        console.log('Verifying session data after save:', req.session.clicks);

        return res.status(200).json({ 
            success: true, 
            message: 'Email stored successfully',
            storedClicks: req.session.clicks,
            sessionId: req.sessionID
        });

    } catch (error) {
        console.error('Error in storemail endpoint:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

app.get('/api/stored-emails', (req, res) => {
    console.log('Checking stored emails');
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);

    try {
        const storedClicks = req.session.clicks || [];
        console.log('Retrieved stored clicks:', storedClicks);
        
        return res.json({
            success: true,
            clicks: storedClicks,
            sessionId: req.sessionID,
            sessionExists: !!req.session
        });
    } catch (error) {
        console.error('Error retrieving stored emails:', error);
        return res.status(500).json({ 
            error: 'Failed to retrieve stored emails',
            details: error.message
        });
    }
});

app.get('/api/test-session', (req, res) => {
    console.log('Testing session');
    console.log('Session ID:', req.sessionID);
    console.log('Session exists:', !!req.session);
    
    if (!req.session.test) {
        req.session.test = [];
    }
    
    req.session.test.push({
        timestamp: new Date().toISOString(),
        sessionId: req.sessionID
    });

    req.session.save((err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.status(500).json({ error: 'Failed to save session' });
        }
        
        return res.json({
            success: true,
            sessionId: req.sessionID,
            testData: req.session.test,
            sessionExists: !!req.session
        });
    });
});

app.listen(port, () => {
    console.log(`Server running successfully on port ${port}`);
    console.log('Session configuration:', {
        secret: 'configured',
        resave: true,
        saveUninitialized: true,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: '24 hours'
        }
    });
});


