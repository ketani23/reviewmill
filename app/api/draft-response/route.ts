import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

function buildPrompt(
  rating: number,
  reviewerName: string,
  reviewText: string,
  businessName: string,
  brandVoice: string
): string {
  const toneGuide =
    rating === 5
      ? "warm and grateful — celebrate the experience, reference specific details they mentioned"
      : rating === 4
      ? "thankful and positive — acknowledge any minor concerns gently, encourage another visit"
      : rating === 3
      ? "empathetic and understanding — address their concerns directly, invite them back with a promise to do better"
      : "professional and sincerely apologetic — acknowledge the specific issues, offer to resolve offline";

  return `You are writing a Google Business review response on behalf of ${businessName}.

Review details:
- Reviewer: ${reviewerName}
- Rating: ${rating}/5 stars
- Review: "${reviewText}"
- Brand voice: ${brandVoice}

Write a response that is:
- 2-4 sentences long
- Tone: ${toneGuide}
- Addresses the reviewer by their first name only
- References specific details from their review where possible
- Human and genuine, not corporate or templated
- Ends on a positive, forward-looking note

Write ONLY the response text. No labels, no quotes, no extra commentary.`;
}

function mockDraft(
  rating: number,
  reviewerName: string,
  reviewText: string
): string {
  const firstName = reviewerName.split(/[\s.]/)[0];
  const mentionsPizza = reviewText.toLowerCase().includes("pizza");

  if (rating === 5) {
    return `Thank you so much, ${firstName}! We're absolutely thrilled to read your kind words — it truly means the world to our entire team. ${
      mentionsPizza
        ? "Our pizza is made fresh every day with a lot of love, and hearing that it hit the spot makes it all worthwhile."
        : "Your support means everything to us."
    } We can't wait to welcome you back very soon!`;
  }
  if (rating === 4) {
    return `Hi ${firstName}, thank you so much for the wonderful feedback! We're really glad you enjoyed your visit and we appreciate you letting us know how we can improve. We hope to earn that 5th star on your next visit!`;
  }
  if (rating === 3) {
    return `Hi ${firstName}, thank you for your honest feedback — we genuinely appreciate it. We're sorry your visit didn't fully meet your expectations, and we'd love the chance to make it up to you. Please feel free to reach out to us directly and we'll make sure your next experience is a great one.`;
  }
  return `Hi ${firstName}, we sincerely apologize for the experience you had — this is absolutely not the standard we hold ourselves to. We'd genuinely like the opportunity to make this right, so please contact us directly so we can address your concerns personally. Thank you for letting us know.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    rating,
    reviewer_name,
    review_text,
    business_name = "Tony's Pizzeria",
    brand_voice = "professional and friendly",
  } = body as {
    rating?: unknown;
    reviewer_name?: unknown;
    review_text?: unknown;
    business_name?: string;
    brand_voice?: string;
  };

  if (!rating || !reviewer_name || !review_text) {
    return NextResponse.json(
      { error: "rating, reviewer_name, and review_text are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Fall back to mock when API key is not configured
    const draft = mockDraft(
      Number(rating),
      String(reviewer_name),
      String(review_text)
    );
    return NextResponse.json({ draft, source: "mock" });
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: buildPrompt(
            Number(rating),
            String(reviewer_name),
            String(review_text),
            business_name,
            brand_voice
          ),
        },
      ],
    });

    const draft = (message.content[0] as { text: string }).text.trim();
    return NextResponse.json({ draft, source: "claude" });
  } catch (err) {
    console.error("Anthropic API error:", err);
    // Fall back to mock on error
    const draft = mockDraft(
      Number(rating),
      String(reviewer_name),
      String(review_text)
    );
    return NextResponse.json({ draft, source: "mock-fallback" });
  }
}
