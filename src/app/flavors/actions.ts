"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { runAlmostcrackdChain } from "@/lib/almostcrackd";
import { requireAdmin } from "@/lib/require-admin";

const TEMP_OFFSET = 1_000_000;

async function applyOrder(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  flavorId: string,
  orderedStepIds: string[],
) {
  for (let i = 0; i < orderedStepIds.length; i++) {
    const { error } = await supabase
      .from("humor_flavor_steps")
      .update({ position: TEMP_OFFSET + i })
      .eq("id", orderedStepIds[i])
      .eq("flavor_id", flavorId);
    if (error) throw new Error(error.message);
  }
  for (let i = 0; i < orderedStepIds.length; i++) {
    const { error } = await supabase
      .from("humor_flavor_steps")
      .update({ position: i })
      .eq("id", orderedStepIds[i])
      .eq("flavor_id", flavorId);
    if (error) throw new Error(error.message);
  }
}

export async function createFlavor(formData: FormData): Promise<string | null> {
  const { supabase, user } = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description =
    String(formData.get("description") ?? "").trim() || null;
  if (!name) {
    return "Name is required.";
  }

  const { data, error } = await supabase
    .from("humor_flavors")
    .insert({
      name,
      description,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return error.message;
  }

  revalidatePath("/flavors");
  redirect(`/flavors/${data.id}`);
}

export async function updateFlavor(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description =
    String(formData.get("description") ?? "").trim() || null;
  if (!id || !name) {
    throw new Error("Flavor id and name are required.");
  }

  const { error } = await supabase
    .from("humor_flavors")
    .update({ name, description, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/flavors");
  revalidatePath(`/flavors/${id}`);
}

export async function deleteFlavor(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    throw new Error("Missing flavor id.");
  }
  const { error } = await supabase.from("humor_flavors").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/flavors");
  redirect("/flavors");
}

export async function createStep(flavorId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim() || null;
  const prompt = String(formData.get("prompt") ?? "").trim();
  if (!prompt) {
    throw new Error("Step prompt is required.");
  }

  const { data: last, error: lastErr } = await supabase
    .from("humor_flavor_steps")
    .select("position")
    .eq("flavor_id", flavorId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastErr) {
    throw new Error(lastErr.message);
  }

  const nextPosition = (last?.position ?? -1) + 1;

  const { error } = await supabase.from("humor_flavor_steps").insert({
    flavor_id: flavorId,
    position: nextPosition,
    title,
    prompt,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/flavors/${flavorId}`);
}

export async function updateStep(
  flavorId: string,
  stepId: string,
  formData: FormData,
) {
  const { supabase } = await requireAdmin();
  const title = String(formData.get("title") ?? "").trim() || null;
  const prompt = String(formData.get("prompt") ?? "").trim();
  if (!prompt) {
    throw new Error("Step prompt is required.");
  }

  const { error } = await supabase
    .from("humor_flavor_steps")
    .update({ title, prompt })
    .eq("id", stepId)
    .eq("flavor_id", flavorId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/flavors/${flavorId}`);
}

export async function deleteStep(flavorId: string, stepId: string) {
  const { supabase } = await requireAdmin();

  const { data: rows, error: listErr } = await supabase
    .from("humor_flavor_steps")
    .select("id")
    .eq("flavor_id", flavorId)
    .order("position", { ascending: true });

  if (listErr) {
    throw new Error(listErr.message);
  }

  const ordered = (rows ?? []).map((r) => r.id).filter((id) => id !== stepId);

  const { error: delErr } = await supabase
    .from("humor_flavor_steps")
    .delete()
    .eq("id", stepId)
    .eq("flavor_id", flavorId);

  if (delErr) {
    throw new Error(delErr.message);
  }

  await applyOrder(supabase, flavorId, ordered);
  revalidatePath(`/flavors/${flavorId}`);
}

export async function moveStep(
  flavorId: string,
  stepId: string,
  direction: "up" | "down",
) {
  const { supabase } = await requireAdmin();

  const { data: rows, error: listErr } = await supabase
    .from("humor_flavor_steps")
    .select("id")
    .eq("flavor_id", flavorId)
    .order("position", { ascending: true });

  if (listErr) {
    throw new Error(listErr.message);
  }

  const ordered = (rows ?? []).map((r) => r.id);
  const idx = ordered.indexOf(stepId);
  if (idx < 0) {
    throw new Error("Step not found.");
  }

  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= ordered.length) {
    return;
  }

  const next = [...ordered];
  [next[idx], next[swapWith]] = [next[swapWith], next[idx]];

  await applyOrder(supabase, flavorId, next);
  revalidatePath(`/flavors/${flavorId}`);
}

export async function runCaptionTest(flavorId: string, imageUrl: string) {
  const { supabase, user } = await requireAdmin();

  const { data: steps, error: stepsErr } = await supabase
    .from("humor_flavor_steps")
    .select("position, prompt")
    .eq("flavor_id", flavorId)
    .order("position", { ascending: true });

  if (stepsErr) {
    return { ok: false as const, error: stepsErr.message };
  }

  if (!steps?.length) {
    return {
      ok: false as const,
      error: "Add at least one step before running a test.",
    };
  }

  try {
    const result = await runAlmostcrackdChain({
      imageUrl,
      steps: steps.map((s) => ({
        position: s.position,
        prompt: s.prompt,
      })),
    });

    const { error: insErr } = await supabase.from("humor_caption_runs").insert({
      flavor_id: flavorId,
      image_url: imageUrl,
      request_payload: result.requestPayload as object,
      response_payload: result.responsePayload as object,
      captions_text: result.captionsText,
      created_by: user.id,
    });

    if (insErr) {
      return { ok: false as const, error: insErr.message };
    }

    revalidatePath(`/flavors/${flavorId}`);
    return { ok: true as const };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await supabase.from("humor_caption_runs").insert({
      flavor_id: flavorId,
      image_url: imageUrl,
      error: message,
      created_by: user.id,
    });
    revalidatePath(`/flavors/${flavorId}`);
    return { ok: false as const, error: message };
  }
}
