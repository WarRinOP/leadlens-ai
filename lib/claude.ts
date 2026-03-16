import Anthropic from "@anthropic-ai/sdk";

// Anthropic client — server-side only
// Never import this in client components
let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set");
    }
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export interface AnalysisResult {
  score: number;
  tier: "Hot" | "Warm" | "Cold";
  reason: string;
  intent: "High" | "Medium" | "Low";
  urgency: "High" | "Medium" | "Low";
  budget_signal: "Strong" | "Moderate" | "Weak" | "None";
  reply: string;
  next_steps: string[];
}

export async function analyzeLeadEmail(
  businessType: string,
  brandName: string,
  emailContent: string
): Promise<AnalysisResult> {
  const client = getClient();

  const systemPrompt = `You are an expert sales strategist. Analyze inbound lead emails and return structured intelligence to help sales teams respond faster and close more deals.
Respond with a single valid JSON object only. No markdown. No explanation. No backticks.`;

  const userMessage = `Analyze this inbound lead email for a ${businessType} called "${brandName}".

Return ONLY this JSON:
{
  "score": <integer 1-100>,
  "tier": "<Hot | Warm | Cold>",
  "reason": "<2 sentences explaining score based on specific signals in this email>",
  "intent": "<High | Medium | Low>",
  "urgency": "<High | Medium | Low>",
  "budget_signal": "<Strong | Moderate | Weak | None>",
  "reply": "<full professional reply, 3-4 paragraphs, personalized to their specific email, signed from ${brandName}. Warm and direct. No filler phrases like 'Hope this finds you well'.>",
  "next_steps": [
    "<specific actionable step 1>",
    "<specific actionable step 2>",
    "<specific actionable step 3>",
    "<specific actionable step 4>"
  ]
}

Lead email:
${emailContent}`;

  const message = await client.messages.create({
    model: "claude-3-5-haiku-latest",
    max_tokens: 2048,
    messages: [{ role: "user", content: userMessage }],
    system: systemPrompt,
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const parsed = JSON.parse(content.text) as AnalysisResult;
  return parsed;
}
