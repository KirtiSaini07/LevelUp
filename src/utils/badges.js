// Badge tier definitions per skill category
export const BADGE_TIERS = {
  Logic: [
    { threshold: 1,  name: 'Logic Novice',      xpBonus: 20,  color: '#8b5cf6' },
    { threshold: 5,  name: 'Logic Apprentice',   xpBonus: 100, color: '#7c3aed' },
    { threshold: 10, name: 'Logic Master',        xpBonus: 200, color: '#5b21b6' },
  ],
  Creativity: [
    { threshold: 1,  name: 'Creative Spark',     xpBonus: 20,  color: '#f59e0b' },
    { threshold: 5,  name: 'Creative Mind',       xpBonus: 100, color: '#d97706' },
    { threshold: 10, name: 'Creative Genius',     xpBonus: 200, color: '#b45309' },
  ],
  Stamina: [
    { threshold: 1,  name: 'Endurance Starter',  xpBonus: 20,  color: '#10b981' },
    { threshold: 5,  name: 'Iron Will',           xpBonus: 100, color: '#059669' },
    { threshold: 10, name: 'Unstoppable',          xpBonus: 200, color: '#047857' },
  ],
  Health: [
    { threshold: 1,  name: 'Health Initiate',    xpBonus: 20,  color: '#ef4444' },
    { threshold: 5,  name: 'Vitality Seeker',     xpBonus: 100, color: '#dc2626' },
    { threshold: 10, name: 'Life Champion',        xpBonus: 200, color: '#b91c1c' },
  ],
};

/**
 * Given completed task counts per category, returns an array of badge objects.
 * Each badge includes: category, tier (0-based index), name, color, xpBonus,
 * count (how many completed), nextThreshold (quests needed for next tier), tierIndex.
 */
export const computeBadges = (completedTasks) => {
  const counts = { Logic: 0, Creativity: 0, Stamina: 0, Health: 0 };
  completedTasks.forEach(t => {
    if (counts[t.category] !== undefined) counts[t.category]++;
  });

  const result = [];

  Object.entries(BADGE_TIERS).forEach(([category, tiers]) => {
    const count = counts[category];
    // Find highest earned tier (highest threshold that count >= threshold)
    let earnedTierIndex = -1;
    tiers.forEach((tier, i) => {
      if (count >= tier.threshold) earnedTierIndex = i;
    });

    if (earnedTierIndex >= 0) {
      const earned = tiers[earnedTierIndex];
      const nextTier = tiers[earnedTierIndex + 1] || null;
      result.push({
        category,
        tierIndex: earnedTierIndex,
        name: earned.name,
        color: earned.color,
        xpBonus: earned.xpBonus,
        count,
        nextThreshold: nextTier ? nextTier.threshold : null,
        maxed: earnedTierIndex === tiers.length - 1,
      });
    }
  });

  return result;
};

/**
 * Returns the full badge roadmap for a category with earned/locked status.
 */
export const getBadgeRoadmap = (category, count) => {
  return BADGE_TIERS[category].map((tier, i) => ({
    ...tier,
    tierIndex: i,
    earned: count >= tier.threshold,
    count,
  }));
};

export const ALL_CATEGORIES = ['Logic', 'Creativity', 'Stamina', 'Health'];
