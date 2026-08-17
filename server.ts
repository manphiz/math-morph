import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Stripe from "stripe";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let stripeClient: Stripe | null = null;
function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Generate Scenario / Historical Context using Gemini
  app.post("/api/generate-scenario", async (req, res) => {
    try {
      const { equation } = req.body;
      if (!equation || typeof equation !== "string") {
        return res.status(400).json({ error: "Equation is required" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({ 
          text: "Connect your GEMINI_API_KEY in the settings menu to enable AI historical context generation." 
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Provide a very brief (max 2 sentences) historical or biographical context related to the mathematical equation or the type of curve it represents: ${equation}. Mention a famous mathematician or a historical discovery associated with this math. Make it inspiring for a student. Use LaTeX for any math symbols or variables (e.g., $x$ or $y = x^2$).`,
        config: { temperature: 0.7 },
      });

      res.json({ text: response.text || "No historical context found." });
    } catch (error: any) {
      console.error("Gemini scenario generation error:", error.message || error);
      res.status(500).json({ error: error.message || "Failed to generate context" });
    }
  });

  // API Route: Create Stripe Checkout Session
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const stripe = getStripeClient();
      if (!stripe) {
        // When STRIPE_SECRET_KEY is not configured, inform client smoothly
        return res.json({ 
          unconfigured: true,
          message: "STRIPE_SECRET_KEY is not configured in settings. Export feature unlocked for demo mode." 
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Math Morph - Export Unlock",
                description: "One-time support to unlock high-resolution morph exports.",
              },
              unit_amount: 500, // $5.00
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/?payment_success=true`,
        cancel_url: `${req.headers.origin}/?payment_cancelled=true`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe error:", error.message || error);
      res.status(500).json({ error: error.message || "Checkout session creation failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
