import openai from "../openaiClient.js";

export async function callOpenAIModel(modelName, messages) {
  const response = await openai.responses.create({
    model: modelName,
    input: messages.map(m => ({
      role: m.role,
      content: m.content
    }))
  });

  return response.output_text;
}