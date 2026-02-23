import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY no está configurada en .env.local');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Usamos 1.5-flash para que sea rápido y eficiente en OCR
export const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Usamos 1.5-pro o flash para procesamiento de texto/audio
export const textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
