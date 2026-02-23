'use server';

import { visionModel } from '@/lib/gemini';

export async function analyzeRefuelImage(formData: FormData) {
    try {
        const file = formData.get('image') as File;
        if (!file) return { success: false, message: 'No se subió ninguna imagen' };

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const prompt = `
      Analiza esta imagen de un ticket de gasolina o surtidor o tablero de instrumentos.
      Extrae:
      - amount: Precio total (€)
      - liters: Litros totales
      - pricePerLiter: Precio por litro (€/L)
      - odometer: Kilómetros del coche
      
      Responde SOLO en JSON con esta estructura:
      {
        "amount": number | null,
        "liters": number | null,
        "pricePerLiter": number | null,
        "odometer": number | null
      }
    `;

        const result = await visionModel.generateContent([
            prompt,
            {
                inlineData: {
                    data: buffer.toString('base64'),
                    mimeType: file.type,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanedText);

        return { success: true, data };
    } catch (error) {
        console.error('AI Error:', error);
        return { success: false, message: 'Error procesando la imagen con IA' };
    }
}

export async function processVoiceNote(formData: FormData) {
    // Implementación básica para transcripción y extracción
    // En una versión avanzada usaríamos Whisper o Gemini con audio
    return { success: false, message: 'Procesamiento de voz próximamente' };
}
