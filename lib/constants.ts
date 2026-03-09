export const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "salon", label: "Salon" },
  { value: "dentist", label: "Dentist" },
  { value: "auto_shop", label: "Auto Shop" },
  { value: "other", label: "Other" },
] as const;

export type BusinessTypeValue = (typeof BUSINESS_TYPES)[number]["value"];

export const VOICE_TONES = [
  {
    id: "professional" as const,
    label: "Professional",
    desc: "Formal and polished — ideal for medical, legal, or corporate businesses.",
  },
  {
    id: "friendly" as const,
    label: "Friendly",
    desc: "Warm and approachable — great for restaurants, salons, and retail.",
  },
  {
    id: "casual" as const,
    label: "Casual",
    desc: "Relaxed and conversational — perfect for cafes, gyms, and creative shops.",
  },
] as const;

export type VoiceToneId = (typeof VOICE_TONES)[number]["id"];
