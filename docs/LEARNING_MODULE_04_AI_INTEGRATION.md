# Módulo 4: Integración de IA (Gemini Vision)

Hemos llegado a la parte más innovadora. Vamos a darle "ojos" a tu aplicación para que pueda leer tickets de gasolina y tableros de instrumentos.

## 1. El Concepto

En lugar de crear un modelo de Machine Learning desde cero (complicado), usaremos un LLM Multimodal (Google Gemini 1.5 Flash).
Le enviaremos una imagen y le diremos: *"Actúa como un lector OCR experto. Extrae estos datos y dámelos en JSON"*.

## 2. Instalación del SDK

Necesitarás instalar la librería oficial de Google:
```bash
npm install @google/generative-ai
```

## 3. Cliente de IA

Al igual que con la base de datos, configuramos el cliente.

### Archivo: `src/lib/gemini.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

// Instanciamos el cliente
// Es seguro usar process.env aquí porque esto se ejecutará en el servidor
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Seleccionamos el modelo "flash" porque es rápido y barato, ideal para tareas simples como OCR
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export default model;
```

## 4. La Función "Mágica" de Análisis

Esta función recibirá el archivo de imagen, lo convertirá a un formato que Gemini entienda, y le pedirá los datos.

### Archivo: `src/actions/ai-actions.ts`

```typescript
'use server';

import model from '@/lib/gemini';

export async function analyzeRefuelImage(formData: FormData) {
  try {
    const file = formData.get('image') as File;
    
    if (!file) {
      throw new Error('No se ha subido ninguna imagen');
    }

    // 1. Convertir File a Buffer/ArrayBuffer para la API
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 2. Preparar el prompt (Instrucciones para la IA)
    const prompt = `
      Analiza esta imagen. Puede ser un ticket de gasolinera, un surtidor o el tablero de un coche (odómetro).
      Intenta extraer la siguiente información:
      - amount: Precio total pagado (busca símbolo € o EUR).
      - liters: Litros repostados (busca L, ltr).
      - odometer: Kilómetros totales del coche (si aparece el tablero).
      
      Responde EXCLUSIVAMENTE con un objeto JSON válido con esta estructura:
      {
        "amount": number | null,
        "liters": number | null,
        "odometer": number | null
      }
      Si no encuentras algún dato, pon null. No añadidas texto markdown, solo el JSON raw.
    `;

    // 3. Enviar a Gemini
    const result = await model.generateContent([
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

    // 4. Limpiar respuesta (a veces la IA envia ```json ... ```)
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // 5. Parsear JSON
    const data = JSON.parse(cleanedText);

    return { success: true, data };

  } catch (error) {
    console.error('AI Error:', error);
    return { success: false, message: 'No pude leer la imagen' };
  }
}
```

## 5. Actualizando el Formulario

Para usar esto, necesitaríamos actualizar nuestro `RefuelForm.tsx` para tener un input de archivo:

```tsx
// Fragmento para añadir en RefuelForm.tsx
<input 
  name="image" 
  type="file" 
  accept="image/*" 
  onChange={handleImageUpload} // Esta función llamaría al server action analyzeRefuelImage
  className="mb-4"
/>
```

Al recibir la respuesta de la IA (el JSON), usarías `setValue` (si usas react-hook-form) o actualizarías el estado de tus inputs manuales (`setAmount(data.amount)`), rellenando mágicamente los campos ante los ojos del usuario.

---
## Conclusión del Curso

Con estos 4 módulos tienes el conocimiento técnico para construir una aplicación que:
1.  Usa bases de datos documentales.
2.  Ejecuta lógica backend segura.
3.  Tiene una interfaz moderna.
4.  Aprovecha la Inteligencia Artificial para automatizar tareas.

¡Espero que esta guía de aprendizaje te sea de gran utilidad para tu carrera! Sigue explorando y escribiendo código.
