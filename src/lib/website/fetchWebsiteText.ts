const MAX_TEXT_LENGTH = 8000;

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type WebsiteFetchResult = {
  text: string | null;
  error?: string;
};

export async function fetchWebsiteText(url: string): Promise<WebsiteFetchResult> {
  const trimmed = url.trim();
  if (!trimmed) {
    return { text: null, error: "No website URL provided" };
  }

  const normalized = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(normalized, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CompetitiveLandscapeBuilder/0.1",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return { text: null, error: `Website returned HTTP ${response.status}` };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return {
        text: null,
        error: `Unsupported content type: ${contentType || "unknown"}`,
      };
    }

    const raw = await response.text();
    const text = stripHtml(raw).slice(0, MAX_TEXT_LENGTH);

    if (!text) {
      return { text: null, error: "Website returned no readable text" };
    }

    return { text };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Website fetch timed out"
        : error instanceof Error
          ? error.message
          : "Website fetch failed";

    return { text: null, error: message };
  }
}
