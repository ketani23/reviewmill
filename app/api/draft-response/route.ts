import { NextRequest, NextResponse } from "next/server";

// Mock draft generator — replace body with real Anthropic SDK call once ANTHROPIC_API_KEY is set:
//
//   import Anthropic from "@anthropic-ai/sdk";
//   const client = new Anthropic();
//   const message = await client.messages.create({
//     model: "claude-sonnet-4-6",
//     max_tokens: 300,
//     messages: [{ role: "user", content: buildPrompt(rating, reviewerName, reviewText, brandVoice) }],
//   });
//   const draft = (message.content[0] as { text: string }).text;

function mockDraft(
  rating: number,
  reviewerName: string,
  reviewText: string,
  brandVoice: string
): string {
  const firstName = reviewerName.split(/[\s.]/)[0];
  const mentionsPizza = reviewText.toLowerCase().includes("pizza");
  const voiceNote = brandVoice.includes("casual") ? "casual" : "professional";

  if (rating === 5) {
    return `Thank you so much, ${firstName}! We're absolutely thrilled to read your kind words — it truly means the world to our entire team. ${
      mentionsPizza
        ? "Our pizza is made fresh every day with a lot of love, and hearing that it hit the spot makes it all worthwhile."
        : "Your support means everything to us."
    } We can't wait to welcome you back very soon!`;
  }

  if (rating === 4) {
    return `Hi ${firstName}, thank you so much for the wonderful feedback! We're really glad you enjoyed your visit. We always strive for a 5-star experience${
      voiceNote === "casual" ? " — and we think we can get there!" : "."
    } We appreciate you letting us know how we can improve and hope to see you back soon!`;
  }

  if (rating === 3) {
    return `Hi ${firstName}, thank you for your honest feedback — we genuinely appreciate it. We're sorry your visit didn't fully meet your expectations. We'd love the chance to make it up to you, so please feel free to reach out to us directly and we'll make sure your next experience is a great one.`;
  }

  // 1–2 stars
  return `Hi ${firstName}, we sincerely apologize for the experience you had — this is absolutely not the standard we hold ourselves to and we take your feedback very seriously. We'd genuinely like the opportunity to make this right. Please contact us directly so we can address your concerns personally. Thank you for letting us know.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    rating,
    reviewer_name,
    review_text,
    brand_voice = "professional and friendly",
  } = body as {
    rating?: unknown;
    reviewer_name?: unknown;
    review_text?: unknown;
    brand_voice?: string;
  };

  if (!rating || !reviewer_name || !review_text) {
    return NextResponse.json(
      { error: "rating, reviewer_name, and review_text are required" },
      { status: 400 }
    );
  }

  const draft = mockDraft(
    Number(rating),
    String(reviewer_name),
    String(review_text),
    brand_voice
  );

  return NextResponse.json({ draft });
}
