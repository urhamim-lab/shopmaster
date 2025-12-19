
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function interpretPOSCommand(text: string, inventory: any[], customers: any[]) {
  if (!process.env.API_KEY) throw new Error("API Key Missing");

  const prompt = `
    You are an expert POS data extractor for a retail shop. 
    Analyze the user's natural language command and extract structured data for a POS system.
    
    Context:
    - Current Inventory: ${inventory.length > 0 ? inventory.map(p => `${p.name} (Unit: ${p.unit}, ID: ${p.id})`).join(', ') : 'Empty'}
    - Existing Customers: ${customers.length > 0 ? customers.map(c => `${c.name} (Phone: ${c.phone}, ID: ${c.id})`).join(', ') : 'None'}

    Rules:
    1. Identify Intent: SALE, PURCHASE, RETURN, or OPENING_CASH.
    2. Product: Find the product name. If it exists in context, match the ID. If not, return the name as a string.
    3. Quantity: Extract numerical quantity. Look for units like kg, litre, pieces, etc.
    4. Price/Cost: 
       - For SALE: 'price' is the unit price the customer pays.
       - For PURCHASE: 'totalAmount' is the total spent, or 'price' is unit cost. 
       - If only unit price and quantity are given, calculate totalAmount.
    5. Customer: Match name or phone to existing customers if possible. Otherwise, extract the name.
    6. Supplier/Source: For purchases, look for keywords like "from", "at", "bought from".
    7. Language: Always respond in English.

    User Command: "${text}"
    
    Return ONLY JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING, description: "SALE, PURCHASE, RETURN, or OPENING_CASH" },
            productName: { type: Type.STRING },
            productId: { type: Type.STRING },
            quantity: { type: Type.NUMBER },
            unit: { type: Type.STRING },
            price: { type: Type.NUMBER, description: "Unit price or cost" },
            totalAmount: { type: Type.NUMBER, description: "Total transaction value" },
            customerId: { type: Type.STRING },
            customerName: { type: Type.STRING },
            source: { type: Type.STRING, description: "Supplier or shop name for purchases" },
            summary: { type: Type.STRING, description: "Brief English summary of the extracted data" }
          },
          required: ["intent", "summary"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Parse Error:", error);
    return null;
  }
}
