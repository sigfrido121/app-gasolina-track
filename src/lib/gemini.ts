import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Usamos 1.5-flash para que sea rápido y eficiente en OCR
export const visionModel = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' }) ?? null;

// Usamos 1.5-pro o flash para procesamiento de texto/audio
export const textModel = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' }) ?? null;
