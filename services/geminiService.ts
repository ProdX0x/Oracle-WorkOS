import { GoogleGenAI, Type } from "@google/genai";
import { Task, AIAnalysisResult } from "../types";

// Fonction utilitaire pour nettoyer le JSON retourné par l'IA (enlève les backticks Markdown)
const cleanJsonString = (str: string): string => {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const analyzeProjectProgress = async (tasks: Task[]): Promise<AIAnalysisResult> => {
  // Initialisation à l'intérieur de la fonction pour éviter les crashs au chargement du module
  // si la variable d'environnement n'est pas encore accessible.
  if (!process.env.API_KEY) {
    throw new Error("La clé API (process.env.API_KEY) est manquante.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const taskSummary = tasks.map(t => 
    `- ${t.title} (${t.status}) assigné à ${t.assignee.name} dans le secteur ${t.sector}. Deadline: ${t.deadline}. Description: ${t.description}`
  ).join('\n');

  const prompt = `
    Tu es un assistant de gestion de projet expert pour une équipe construisant une application mobile "Oracle Navigator".
    Analyse les tâches suivantes et génère un rapport JSON strict.
    
    Tâches:
    ${taskSummary}

    INSTRUCTIONS:
    1. Génère un résumé executif du travail accompli et du reste à faire.
    2. Identifie des risques potentiels (délais, surcharge, manque de clarté).
    3. Propose des prochaines étapes logiques.
    4. Génère 3 Key Performance Indicators (KPIs) pertinents. IMPORTANT: Pour le champ "trend", utilise UNIQUEMENT les valeurs "up", "down" ou "neutral".
    5. Génère des données pour un graphique d'avancement (0 à 100 pour le progrès estimé selon le statut).

    Réponds UNIQUEMENT avec l'objet JSON, sans texte avant ni après.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            kpis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  trend: { type: Type.STRING, enum: ['up', 'down', 'neutral'] }
                }
              }
            },
            chartData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  progress: { type: Type.NUMBER },
                  assignee: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const cleanedText = cleanJsonString(response.text);
      return JSON.parse(cleanedText) as AIAnalysisResult;
    }
    throw new Error("Pas de réponse texte de l'IA");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    // On propage l'erreur pour qu'elle soit gérée par le composant UI
    throw error;
  }
};