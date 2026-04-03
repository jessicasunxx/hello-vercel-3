type StepInput = { position: number; prompt: string };

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

function extractCaptionsText(json: unknown): string {
  if (json == null) return "";
  if (typeof json === "string") return json;

  if (typeof json === "object") {
    const o = json as Record<string, unknown>;

    if (typeof o.captions === "string") return o.captions;
    if (Array.isArray(o.captions)) {
      return o.captions.map((c) => String(c)).join("\n");
    }
    if (typeof o.caption === "string") return o.caption;

    if (o.data && typeof o.data === "object") {
      const d = o.data as Record<string, unknown>;
      if (typeof d.captions === "string") return d.captions;
      if (Array.isArray(d.captions)) {
        return d.captions.map((c) => String(c)).join("\n");
      }
      if (typeof d.text === "string") return d.text;
    }

    if (typeof o.text === "string") return o.text;
    if (typeof o.result === "string") return o.result;
    if (o.result && typeof o.result === "object") {
      return extractCaptionsText(o.result);
    }
  }

  try {
    return JSON.stringify(json, null, 2);
  } catch {
    return String(json);
  }
}

/**
 * Calls the Assignment 5 REST API. Override path and body shape with env if your spec differs.
 */
export async function runAlmostcrackdChain(input: {
  imageUrl: string;
  steps: StepInput[];
}) {
  const base =
    process.env.ALMOSTCRACKD_API_BASE_URL?.trim() ||
    "https://api.almostcrackd.ai";
  const path =
    process.env.ALMOSTCRACKD_CAPTION_PATH?.trim() || "/v1/caption-chain";

  const url = joinUrl(base, path);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const apiKey = process.env.ALMOSTCRACKD_API_KEY?.trim();
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const ordered = [...input.steps].sort((a, b) => a.position - b.position);

  const body = {
    image_url: input.imageUrl,
    steps: ordered.map((s, i) => ({
      index: i + 1,
      position: s.position,
      prompt: s.prompt,
    })),
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const rawText = await res.text();
  let parsed: unknown;
  try {
    parsed = rawText ? JSON.parse(rawText) : null;
  } catch {
    parsed = { raw: rawText };
  }

  if (!res.ok) {
    const msg =
      typeof parsed === "object" && parsed && "error" in parsed
        ? String((parsed as { error: unknown }).error)
        : rawText || res.statusText;
    throw new Error(`AlmostCrackd API ${res.status}: ${msg}`);
  }

  return {
    captionsText: extractCaptionsText(parsed),
    responsePayload: parsed,
    requestPayload: body,
  };
}
