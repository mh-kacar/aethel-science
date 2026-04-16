import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from "@google/genai";
import { CURATED_CONTENT } from './src/constants.js';

const app = express();
const PORT = 3000;
const CONTENT_FILE = path.join(process.cwd(), 'dynamic-content.json');

// Initialize content file if it doesn't exist
if (!fs.existsSync(CONTENT_FILE)) {
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(CURATED_CONTENT, null, 2));
}

async function generateNewCycle(currentContent: any[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  // Find the latest cycle end date to determine the new cycle dates
  const latestItem = currentContent.filter(i => i.status === 'showroom').sort((a, b) => new Date(b.cycleEndDate).getTime() - new Date(a.cycleEndDate).getTime())[0];
  
  const startDate = latestItem ? latestItem.cycleEndDate : new Date().toISOString().split('T')[0];
  const endDate = new Date(new Date(startDate).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const expiryDate = new Date(new Date(startDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const prompt = `
    You are the Chief Editor and AI Curator for Aethel Science.
    Your mission is to generate 3 new high-quality news items for the next 5-day cycle (${startDate} to ${endDate}).
    
    RULES:
    1. Language: "Simplify but don't shallow". Use metaphors for complex terms.
    2. Target Audience: 15-25 years old, tech-savvy but not necessarily experts.
    3. Tone: Exciting, inspiring, yet professional.
    4. Manifesto: Reflect "Sovereignty of Knowledge", "Technological Ethics", and "Truth Protocol".
    5. Structure: Each item must follow the CuratedItem interface.
    6. Content: Use NASA OSDR data themes and global science trends.
    
    OUTPUT FORMAT: A JSON array of 3 CuratedItem objects.
    
    Current latest ID is ${Math.max(...currentContent.map(i => parseInt(i.id)))}. Start new IDs from ${Math.max(...currentContent.map(i => parseInt(i.id))) + 1}.
    
    For each item, provide:
    - title (tr/en)
    - dataAnalysis (tr/en) - 1 paragraph summary
    - globalContext (tr/en) - 1 paragraph global impact
    - deepDive (tr/en) - 4+ paragraphs (Intro, Technical, Global, Future)
    - technicalSpecs (3-4 items)
    - beyondPerspective (tr/en) - Philosophical note
    - curatorSignature (tr/en) - 2 sentence summary
    - archiveCardSummary (tr/en) - 2 sentence teaser
    - visualPrompt (en) - Futuristic image description
    - category (Space, Physics, Biology, AI, Engineering)
    - publishDate: ${startDate}
    - cycleEndDate: ${endDate}
    - expiryDate: ${expiryDate}
    - status: "showroom"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              status: { type: Type.STRING },
              title: { type: Type.OBJECT, properties: { tr: { type: Type.STRING }, en: { type: Type.STRING } } },
              dataAnalysis: { type: Type.OBJECT, properties: { tr: { type: Type.STRING }, en: { type: Type.STRING } } },
              globalContext: { type: Type.OBJECT, properties: { tr: { type: Type.STRING }, en: { type: Type.STRING } } },
              deepDive: { type: Type.OBJECT, properties: { tr: { type: Type.STRING }, en: { type: Type.STRING } } },
              technicalSpecs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.STRING } } } },
              beyondPerspective: { type: Type.OBJECT, properties: { tr: { type: Type.STRING }, en: { type: Type.STRING } } },
              curatorSignature: { type: Type.OBJECT, properties: { tr: { type: Type.STRING }, en: { type: Type.STRING } } },
              archiveCardSummary: { type: Type.OBJECT, properties: { tr: { type: Type.STRING }, en: { type: Type.STRING } } },
              visualPrompt: { type: Type.STRING },
              category: { type: Type.STRING },
              publishDate: { type: Type.STRING },
              cycleEndDate: { type: Type.STRING },
              expiryDate: { type: Type.STRING },
              imageUrl: { type: Type.STRING }
            }
          }
        }
      }
    });

    const newItems = JSON.parse(response.text);
    
    // Fallback for imageUrl if AI doesn't provide a good one
    newItems.forEach((item: any) => {
      if (!item.imageUrl) {
        item.imageUrl = `https://picsum.photos/seed/${item.id}/1920/1080`;
      }
      item.author = "Aethel Core";
    });

    return newItems;
  } catch (error) {
    console.error("AI Generation failed:", error);
    return null;
  }
}

app.get('/api/news', async (req, res) => {
  try {
    let content = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
    const now = new Date();
    
    // Check if we need to update
    const activeShowroom = content.filter((i: any) => i.status === 'showroom' && new Date(i.cycleEndDate) > now);
    
    if (activeShowroom.length === 0) {
      console.log("No active showroom items. Triggering autonomous generation...");
      
      // Mark old showroom items as archive
      content = content.map((item: any) => {
        if (item.status === 'showroom' && new Date(item.cycleEndDate) <= now) {
          return { ...item, status: 'archive' };
        }
        return item;
      });

      const newItems = await generateNewCycle(content);
      if (newItems) {
        content = [...content, ...newItems];
        // Deep Space Deletion: Remove items older than 30 days
        content = content.filter((item: any) => {
          if (!item.expiryDate) return true;
          return new Date(item.expiryDate) > now;
        });
        
        fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2));
      }
    }

    // Deep Space Deletion: Remove items older than 30 days (Expiry Date check)
    const cleanedContent = content.filter((item: any) => {
      if (!item.expiryDate) return true;
      return new Date(item.expiryDate) > now;
    });

    // If items were removed, update the file
    if (cleanedContent.length !== content.length) {
      console.log(`[SYSTEM] Deep Space Deletion: ${content.length - cleanedContent.length} expired items removed.`);
      fs.writeFileSync(CONTENT_FILE, JSON.stringify(cleanedContent, null, 2));
      content = cleanedContent;
    }

    res.json(content);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aethel Science Autonomous Engine running on http://localhost:${PORT}`);
  });
}

startServer();
