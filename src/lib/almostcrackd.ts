/**
 * Calls the Assignment 5 REST API to generate captions for an image
 * using a specific humor flavor.
 *
 * Required env:
 *   ALMOSTCRACKD_GENERATE_CAPTIONS_URL — full URL to the caption endpoint
 *
 * Optional env:
 *   ALMOSTCRACKD_API_KEY — static Bearer token
 *   ALMOSTCRACKD_FORWARD_SUPABASE_TOKEN — set to "1" to forward user JWT
 */

export type CaptionResult = {
  status: number;
  body: unknown;
  captionsText: string;
};

function extractCaptionsText(body: unknown): string {
  if (body == null) return "";
  if (typeof body === "string") return body;

  if (typeof body === "object") {
    const o = body as Record<string, unknown>;

    if (typeof o.captions === "string") return o.captions;
    if (Array.isArray(o.captions))
      return o.captions.map((c) => String(c)).join("\n");
    if (typeof o.caption === "string") return o.caption;
    if (typeof o.text === "string") return o.text;
    if (typeof o.result === "string") return o.result;

    if (o.body && typeof o.body === "object") return extractCaptionsText(o.body);
    if (o.data && typeof o.data === "object") return extractCaptionsText(o.data);
    if (o.result && typeof o.result === "object")
      return extractCaptionsText(o.result);
  }

  try {
    return JSON.stringify(body, null, 2);
  } catch {
    return String(body);
  }
}

export async function generateCaptions(input: {
  imageUrl: string;
  humorFlavorId: string;
  accessToken?: string | null;
}): Promise<CaptionResult> {
  const url = process.env.ALMOSTCRACKD_GENERATE_CAPTIONS_URL?.trim();
  if (!url) {
    throw new Error(
      "Set ALMOSTCRACKD_GENERATE_CAPTIONS_URL in Vercel env vars to your Assignment 5 caption endpoint.",
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const apiKey = process.env.ALMOSTCRACKD_API_KEY?.trim();
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  } else if (
    process.env.ALMOSTCRACKD_FORWARD_SUPABASE_TOKEN === "1" &&
    input.accessToken
  ) {
    headers.Authorization = `Bearer ${input.accessToken}`;
  }

  const payload = {
    image_url: input.imageUrl,
    humor_flavor_id: input.humorFlavorId,
    imageUrl: input.imageUrl,
    humorFlavorId: input.humorFlavorId,
  };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text) as unknown;
  } catch {
    /* keep raw text */
  }

  if (!res.ok) {
    const msg =
      typeof body === "object" && body && "error" in body
        ? String((body as { error: unknown }).error)
        : text || res.statusText;
    throw new Error(`AlmostCrackd API ${res.status}: ${msg}`);
  }

  return {
    status: res.status,
    body,
    captionsText: extractCaptionsText(body),
  };
}
