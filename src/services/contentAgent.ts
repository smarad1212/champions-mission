import type { ChildProfile, CurriculumSlot, SprintContent } from "../types";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts/content";
import { getProvider } from "../providers";
import { getImageForLesson } from "./imageService";

/** Extract retryDelay ms from a Gemini / fetch 429 error, or 0 if not present */
function extractRetryDelay(err: unknown): number {
  try {
    const details = (err as { errorDetails?: Array<{ "@type": string; retryDelay?: string }> }).errorDetails;
    if (!Array.isArray(details)) return 0;
    const retryInfo = details.find(d => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo");
    if (!retryInfo?.retryDelay) return 0;
    // retryDelay is like "9s" or "477ms"
    const raw = retryInfo.retryDelay;
    if (raw.endsWith("s")) return parseFloat(raw) * 1000;
    if (raw.endsWith("ms")) return parseFloat(raw);
    return 0;
  } catch {
    return 0;
  }
}

function validateSprintContent(data: unknown): SprintContent {
  const d = data as Record<string, unknown>;
  if (!d.lesson || typeof d.lesson !== "object") throw new Error("Missing or invalid 'lesson'");
  if (!Array.isArray(d.questions) || d.questions.length !== 4) throw new Error("'questions' must be exactly 4 items");
  if (!d.real_world_task) throw new Error("Missing 'real_world_task'");
  return data as SprintContent;
}

function stripFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

async function callAPI(child: ChildProfile, slot: CurriculumSlot): Promise<SprintContent> {
  const userPrompt = buildUserPrompt(child, slot);
  const provider = getProvider();

  const rawText = await provider.generateContent(SYSTEM_PROMPT, userPrompt);
  const jsonText = stripFences(rawText);
  const parsed = JSON.parse(jsonText);

  // Fetch real Unsplash image based on imageKeyword
  const lesson = parsed.lesson as Record<string, unknown>;
  const imageKeyword = typeof lesson?.imageKeyword === "string" ? lesson.imageKeyword : "";
  const subject = typeof lesson?.subject === "string" ? lesson.subject : "";
  lesson.imageUrl = await getImageForLesson(imageKeyword, subject);

  return validateSprintContent(parsed);
}

export async function generateSprint(
  child: ChildProfile,
  slot: CurriculumSlot
): Promise<SprintContent & { field_task: string | null }> {
  let sprint: SprintContent;

  try {
    sprint = await callAPI(child, slot);
  } catch (err: unknown) {
    // If provider returned a retryDelay, honour it before retrying
    const delay = extractRetryDelay(err);
    if (delay > 0) {
      console.warn(`Rate limited — waiting ${delay}ms before retry`);
      await new Promise(r => setTimeout(r, delay));
    } else {
      console.warn("First attempt failed, retrying once:", err);
    }
    sprint = await callAPI(child, slot);
  }

  // Merge model metadata (voice_used, hook_type, etc.) with server metadata
  sprint.metadata = {
    ...(typeof sprint.metadata === "object" && sprint.metadata !== null ? sprint.metadata : {}),
    generated_at: new Date().toISOString(),
    child_id: child.id,
    difficulty: slot.difficulty,
    sprint_number: slot.sprint_number_today,
  };

  // Field task only on first sprint of the day
  const rwt = sprint.real_world_task as unknown;
  const field_task_text =
    typeof rwt === "string"
      ? rwt
      : rwt && typeof rwt === "object" && "text" in rwt
      ? (rwt as { text: string }).text
      : null;

  const field_task = slot.sprint_number_today === 1 ? field_task_text : null;

  return { ...sprint, field_task };
}
