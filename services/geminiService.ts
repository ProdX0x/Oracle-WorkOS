
import { GoogleGenAI, Type } from "@google/genai";
import { Task, AIAnalysisResult } from "../types";

// Fonction utilitaire pour nettoyer le JSON retourné par l'IA
const cleanJsonString = (str: string): string => {
  return str.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const analyzeProjectProgress = async (tasks: Task[]): Promise<AIAnalysisResult> => {
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
    throw error;
  }
};

// Nouvelle fonction pour évaluer l'impact stratégique d'une tâche
export const evaluateTaskStrategy = async (taskTitle: string, taskDescription: string): Promise<{ impactScore: number, effortScore: number, strategicTheme: string, aiRationale: string }> => {
  if (!process.env.API_KEY) {
    throw new Error("Clé API manquante");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Analyse la tâche suivante pour un projet d'application mobile d'entreprise "Oracle Navigator".
    Titre: ${taskTitle}
    Description: ${taskDescription}

    Estime:
    1. Score d'Impact Business (0-100) : À quel point cela apporte de la valeur ?
    2. Score d'Effort (1-10) : Complexité estimée.
    3. Thème Stratégique : Choisis le plus pertinent parmi [Acquisition, Rétention, Revenus, Tech Debt, UX, Sécurité, Feature].
    4. Rationale : Une phrase courte justifiant le score.

    Réponds en JSON strict.
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
            impactScore: { type: Type.NUMBER },
            effortScore: { type: Type.NUMBER },
            strategicTheme: { type: Type.STRING },
            aiRationale: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      const cleanedText = cleanJsonString(response.text);
      return JSON.parse(cleanedText);
    }
    throw new Error("Erreur IA");
  } catch (error) {
    console.error("Strategy Evaluation failed:", error);
    // Fallback values si l'IA échoue
    return { impactScore: 50, effortScore: 5, strategicTheme: 'Général', aiRationale: 'Évaluation non disponible' };
  }
};
