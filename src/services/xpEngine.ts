import { ChildProfile } from "../types";

export function getStreakMultiplier(streak: number): number {
  if (streak >= 100) return 2.5;
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.25;
  if (streak >= 3) return 1.1;
  return 1.0;
}

export function getSprintMultiplier(sprintNumberToday: number): number {
  if (sprintNumberToday <= 3) return 1.0;
  if (sprintNumberToday === 4) return 0.75;
  return 0.5;
}

export function calculateXP(
  base: number,
  streak: number,
  sprintNumber: number
): number {
  const streakMult = getStreakMultiplier(streak);
  const sprintMult = getSprintMultiplier(sprintNumber);
  return Math.round(base * streakMult * sprintMult);
}

export function handleMissedDay(child: ChildProfile): ChildProfile {
  if (child.streak_shields > 0) {
    return {
      ...child,
      streak_shields: child.streak_shields - 1,
    };
  }
  return {
    ...child,
    streak_days: 0,
    xp_multiplier: 1.0,
  };
}
