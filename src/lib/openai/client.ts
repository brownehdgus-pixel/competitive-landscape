import {
  OpenAIClientError,
  OpenAIRateLimitError,
} from "@/lib/openai/errors";

type ChatOptions = {
  jsonMode?: boolean;
};

async function chatCompletion(
  system: string,
  user: string,
  options: ChatOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new OpenAIClientError("OPENAI_API_KEY is not configured");
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(options.jsonMode
        ? { response_format: { type: "json_object" } }
        : {}),
      temperature: 0.2,
    }),
  });

  if (response.status === 429) {
    throw new OpenAIRateLimitError();
  }

  if (!response.ok) {
    const text = await response.text();
    throw new OpenAIClientError(
      `OpenAI API error (${response.status}): ${text}`
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new OpenAIClientError("OpenAI returned an empty response");
  }

  return content;
}

export async function chatCompletionJson(
  system: string,
  user: string
): Promise<string> {
  return chatCompletion(system, user, { jsonMode: true });
}

export async function chatCompletionText(
  system: string,
  user: string
): Promise<string> {
  return chatCompletion(system, user);
}
