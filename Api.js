// api/gemini.js

// Importamos la librería oficial de Google
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Accedemos a nuestra clave de API de forma segura desde las variables de entorno de Vercel
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Esta es la función principal que Vercel ejecutará
export default async function handler(request, response) {
  // Solo permitimos peticiones POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = request.body;

    if (!prompt) {
      return response.status(400).json({ error: 'No se ha proporcionado un prompt.' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Creamos un prompt más específico para la tarea
    const fullPrompt = `Resuelve el siguiente ejercicio escolar de 4º de la ESO paso a paso, explicando cada parte de forma clara y didáctica. Formatea la respuesta en HTML. Ejercicio: "${prompt}"`;

    const result = await model.generateContent(fullPrompt);
    const textResponse = await result.response.text();

    // Enviamos la respuesta generada de vuelta al frontend
    response.status(200).json({ text: textResponse });

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Ha ocurrido un error al contactar con la API de Gemini.' });
  }
}