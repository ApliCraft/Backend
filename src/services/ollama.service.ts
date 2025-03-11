import ollama from "ollama";

const AI_MODEL = "llama3.2:3b";

const streamChatWithOllama = async function* (
  message: string,
  context?: string
) {
  const prompt = { role: "user", content: context + " " + message };

  const response = await ollama.chat({
    model: AI_MODEL,
    messages: [prompt],
    stream: true,
  });

  let text = "";

  for await (const part of response) {
    const content = part.message.content;
    text += content;
    yield content;

    console.log(text);
  }
};

const getEmbeddingFromOllama = async function (text: string) {
  const response = await ollama.embed({
    model: AI_MODEL,
    input: text,
  });

  return response.embeddings;
};

export { streamChatWithOllama, getEmbeddingFromOllama };
