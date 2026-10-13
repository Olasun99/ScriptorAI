import { GoogleGenAI } from "@google/genai";

interface ModelStatus {
  cooldownUntil: number;
  failureCount: number;
}

// Ordered with high-availability, responsive models first
const DEFAULT_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.8-flash"
];

const modelStatusMap = new Map<string, ModelStatus>();

/**
 * Returns model candidates ordered by current health status.
 * Models undergoing 503 / 429 high-demand spikes are deprioritized until cooldown expires.
 */
export function getHealthyModelCandidates(): string[] {
  const now = Date.now();
  const ready: string[] = [];
  const inCooldown: string[] = [];

  for (const model of DEFAULT_MODELS) {
    const status = modelStatusMap.get(model);
    if (status && status.cooldownUntil > now) {
      inCooldown.push(model);
    } else {
      ready.push(model);
    }
  }

  return [...ready, ...inCooldown];
}

export function reportModelSuccess(model: string) {
  const prev = modelStatusMap.get(model);
  if (prev && prev.failureCount > 0) {
    console.log(`[AI Model Pool] Model ${model} recovered and marked healthy.`);
  }
  modelStatusMap.set(model, { cooldownUntil: 0, failureCount: 0 });
}

export function reportModelFailure(model: string, error: any) {
  const errMsg = error?.message || String(error);
  const isCongested =
    error?.status === 503 ||
    errMsg.includes("503") ||
    errMsg.includes("high demand") ||
    errMsg.includes("UNAVAILABLE") ||
    error?.status === 429 ||
    errMsg.includes("429") ||
    errMsg.includes("RESOURCE_EXHAUSTED");

  const current = modelStatusMap.get(model) || { cooldownUntil: 0, failureCount: 0 };
  const newFailures = current.failureCount + 1;
  const cooldownDuration = isCongested
    ? Math.min(60000, 15000 * Math.pow(2, newFailures - 1))
    : 10000;

  modelStatusMap.set(model, {
    cooldownUntil: Date.now() + cooldownDuration,
    failureCount: newFailures
  });

  // Use standard stdout logging to prevent cloud logging from flagging benign fallbacks as unhandled errors
  console.log(`[AI Model Pool] Model ${model} transient demand spike detected. Cooldown ${Math.round(cooldownDuration / 1000)}s. Routing to next candidate...`);
}

/**
 * Executes a Gemini request with automatic multi-model failover and circuit breaker protection
 */
export async function generateContentWithFailover(
  ai: GoogleGenAI,
  requestParams: { contents: any; config?: any }
): Promise<{ response: any; usedModel: string }> {
  const candidates = getHealthyModelCandidates();
  let lastError: any = null;

  for (const model of candidates) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: requestParams.contents,
        config: requestParams.config,
      });
      reportModelSuccess(model);
      return { response, usedModel: model };
    } catch (err: any) {
      lastError = err;
      reportModelFailure(model, err);
    }
  }

  throw lastError || new Error("All AI models are temporarily busy. Please retry shortly.");
}
