import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const createLovableAiGatewayProvider = (apiKey: string) => {
  // Pull from environment if the passed apiKey is empty
  const effectiveKey = apiKey || import.meta.env.VITE_LOVABLE_API_KEY;
  
  return createGoogleGenerativeAI({
    apiKey: effectiveKey,
  });
};