import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, Modality, LiveServerMessage } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.use(express.json({ limit: '25mb' }));

const ARONE_SYSTEM_INSTRUCTION = `You are ARONE (Autonomous Real-time Operations Network Engine), a sophisticated, ultra-competent personal AI executive assistant inspired by Jarvis.
You speak with calm, distinguished authority, British elegance, refined wit, and unfailing loyalty to your user.
Your responsibilities include:
1. Answering questions with razor-sharp precision, intellect, and executive polish.
2. Managing executive daily tasks, scheduling meetings, and drafting communications.
3. Controlling and monitoring automated smart home systems (lighting, security, climate, entertainment).
4. Keeping the user apprised of schedules, alerts, and priority action items.
5. Maintaining total discretion and rigorous security standards.
Keep your spoken responses natural, concise, punchy, and confident (like Jarvis addressing Tony Stark: "Right away, sir", "All systems nominal", "I have updated your schedule"). Avoid rambling or fluff.`;

// POST /api/gemini/chat
app.post('/api/gemini/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages = [], mode = 'general', userLocation } = req.body;
    const latestUserMessage = messages[messages.length - 1]?.content || 'Hello ARONE';

    // Format conversation history for multi-turn chat
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (mode === 'high_thinking') {
      // gemini-4-argon with thinkingLevel: HIGH
      const response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents,
        config: {
          systemInstruction: ARONE_SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        },
      });

      res.json({
        text: response.text || 'Directive processed, sir.',
        model: 'gemini-4-argon',
        mode,
      });
      return;
    }

    if (mode === 'low_latency') {
      // gemini-3.1-flash-lite for rapid turnaround
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction: ARONE_SYSTEM_INSTRUCTION,
        },
      });

      res.json({
        text: response.text || 'At your command.',
        model: 'gemini-3.1-flash-lite',
        mode,
      });
      return;
    }

    if (mode === 'search_grounding') {
      // gemini-3.8-flash with googleSearch tool
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: ARONE_SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
        },
      });

      const groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      res.json({
        text: response.text || 'Information retrieved.',
        model: 'gemini-3.8-flash',
        mode,
        groundingChunks,
      });
      return;
    }

    if (mode === 'maps_grounding') {
      // gemini-3.8-flash with googleMaps tool
      const toolConfig = userLocation?.latitude
        ? {
            retrievalConfig: {
              latLng: {
                latitude: Number(userLocation.latitude),
                longitude: Number(userLocation.longitude),
              },
            },
          }
        : undefined;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: ARONE_SYSTEM_INSTRUCTION,
          tools: [{ googleMaps: {} }],
          toolConfig,
        },
      });

      const groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      res.json({
        text: response.text || 'Location telemetry acquired.',
        model: 'gemini-3.8-flash',
        mode,
        groundingChunks,
      });
      return;
    }

    // Default mode: gemini-3.8-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: ARONE_SYSTEM_INSTRUCTION,
      },
    });

    res.json({
      text: response.text || 'Understood, sir.',
      model: 'gemini-3.8-flash',
      mode,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error?.message || 'ARONE neural core encountered a processing exception.',
    });
  }
});

// POST /api/gemini/tts
// Uses gemini-3.8-flash-tts model as requested
app.post('/api/gemini/tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text = '' } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text prompt is required' });
      return;
    }

    // gemini-3.8-flash-tts
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `ARONE: ${text.slice(0, 500)}`,
              speechMetadata: {
                speaker: 'ARONE',
                style: 'Distinguished, calm British AI assistant like Jarvis, crisp and articulate',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio synthesized from gemini-3.8-flash-tts');
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    const errorStr = String(error?.message || error || '');
    const isRateLimit =
      error?.status === 429 ||
      error?.code === 429 ||
      errorStr.includes('429') ||
      errorStr.includes('RESOURCE_EXHAUSTED') ||
      errorStr.includes('quota') ||
      errorStr.includes('Quota exceeded');

    if (isRateLimit) {
      console.warn('TTS rate limit encountered (Free Tier 3 req/min). Returning graceful fallback response.');
      res.json({
        audioBase64: null,
        fallback: true,
        notice: 'Gemini TTS rate limit reached. Browser speech synthesis activated.',
      });
      return;
    }

    console.error('TTS synthesis error:', error);
    res.status(500).json({
      error: error?.message || 'Speech synthesizer error',
      fallback: true,
    });
  }
});

// POST /api/gemini/vision
// Photo analysis using gemini-4-argon as requested
app.post('/api/gemini/vision', async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt = 'Analyze this image in detail and provide an executive intelligence summary.' } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: 'Image base64 data required' });
      return;
    }

    const imagePart = {
      inlineData: {
        mimeType,
        data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
      },
    };

    const textPart = {
      text: `${ARONE_SYSTEM_INSTRUCTION}\n\nTask: ${prompt}`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents: { parts: [imagePart, textPart] },
    });

    res.json({
      text: response.text || 'Visual analysis complete.',
      model: 'gemini-4-argon',
    });
  } catch (error: any) {
    console.error('Vision analysis error:', error);
    res.status(500).json({
      error: error?.message || 'Visual telemetry analysis failed',
    });
  }
});

// Setup WebSocket for Live API (gemini-3.8-live)
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to ARONE Live voice stream');
  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } },
        },
        systemInstruction: ARONE_SYSTEM_INSTRUCTION,
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          for (const part of message.serverContent?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
              }
            }
          }
          if (message.serverContent?.interrupted) {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          }
        },
        onclose: () => {
          console.log('Live API session closed');
        },
        onerror: (err) => {
          console.error('Live API session error:', err);
        },
      },
    });

    clientWs.on('message', (data: Buffer) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.audio && session) {
          session.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
      } catch (err) {
        console.error('Error forwarding audio to Live API:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('Client disconnected from Live voice stream');
      if (session) {
        try {
          session.close();
        } catch {}
      }
    });
  } catch (err) {
    console.error('Failed to initialize Live API session:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ error: 'Live API initialization failed' }));
      clientWs.close();
    }
  }
});

server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  if (pathname === '/api/live' || pathname === '/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// Vite Middleware in Dev or Static File Serving in Prod
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ARONE Server active on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
