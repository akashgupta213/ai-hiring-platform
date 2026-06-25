// import OpenAI from "openai";
import Groq from "groq-sdk";
// const openai = new OpenAI({
const openai = new Groq({
  // apiKey: process.env.OPENAI_API_KEY,
  apiKey: process.env.GROQ_API_KEY,
});

// ─── Embeddings ────────────────────────────────────────────────────────────────

/**
 * Generate a 1536-dim embedding vector for the given text.
 * Uses text-embedding-3-small as specified in the blueprint.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000), // Truncate to safe token limit
  });
  return response.data[0].embedding;
}

// ─── Resume Parsing ─────────────────────────────────────────────────────────────

export interface ParsedResume {
  name: string;
  email: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  summary: string;
}

/**
 * Use GPT-4o-mini to structure raw resume text into a clean JSON schema.
 */
export async function parseResumeText(rawText: string): Promise<ParsedResume> {
  const response = await openai.chat.completions.create({
    // model: "gpt-4o-mini",
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You are a resume parser. Extract structured information from the raw resume text provided.
Return ONLY valid JSON matching this exact schema, with no markdown, no explanation, just JSON:
{
  "name": "string",
  "email": "string",
  "skills": ["string"],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "duration": "string",
      "description": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string"
    }
  ],
  "summary": "string"
}

If a field cannot be found, use an empty string or empty array. Never return null.`,
      },
      {
        role: "user",
        content: `Parse this resume:\n\n${rawText.slice(0, 12000)}`,
      },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content ?? "{}";

  try {
    return JSON.parse(content) as ParsedResume;
  } catch {
    // Retry with stricter prompt on parse failure
    const retryResponse = await openai.chat.completions.create({
      // model: "gpt-4o-mini",
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Return ONLY a valid JSON object. No markdown. No extra text. No backticks.",
        },
        {
          role: "user",
          content: `Parse this resume into JSON with fields: name, email, skills[], experience[], education[], summary.\n\n${rawText.slice(0, 8000)}`,
        },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });
    return JSON.parse(
      retryResponse.choices[0].message.content ?? "{}"
    ) as ParsedResume;
  }
}

// ─── Job Description Embedding Helper ──────────────────────────────────────────

/**
 * Build a rich text blob from a job posting for embedding.
 */
export function buildJobEmbeddingText(
  title: string,
  description: string,
  skills: string[]
): string {
  return `Job Title: ${title}\n\nDescription: ${description}\n\nRequired Skills: ${skills.join(", ")}`;
}

/**
 * Build a rich text blob from a parsed resume for embedding.
 */
export function buildResumeEmbeddingText(parsed: ParsedResume): string {
  const skillsText = parsed.skills.join(", ");
  const expText = parsed.experience
    .map((e) => `${e.title} at ${e.company}: ${e.description}`)
    .join(". ");
  const eduText = parsed.education
    .map((e) => `${e.degree} from ${e.institution}`)
    .join(". ");
  return `${parsed.summary}. Skills: ${skillsText}. Experience: ${expText}. Education: ${eduText}`;
}

export { openai };