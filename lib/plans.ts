export type Plan = "free" | "starter" | "growth" | "scale";

const LOCATION_LIMITS: Record<Plan, number> = {
  free: 0,
  starter: 1,
  growth: 3,
  scale: 10,
};

const REVIEW_LIMITS: Record<Plan, number> = {
  free: 0,
  starter: 50,
  growth: Infinity,
  scale: Infinity,
};

export function canAddLocation(plan: Plan, currentCount: number): boolean {
  return currentCount < LOCATION_LIMITS[plan];
}

export function getReviewLimit(plan: Plan): number {
  return REVIEW_LIMITS[plan];
}

const PAID_PLANS: Plan[] = ["starter", "growth", "scale"];

export function isPlanActive(business: {
  plan: string;
  trial_ends_at?: string | null;
}): boolean {
  if (!PAID_PLANS.includes(business.plan as Plan)) return false;
  // Active paid plan (subscription)
  if (!business.trial_ends_at) return true;
  // Still within trial period
  return new Date(business.trial_ends_at) > new Date();
}
