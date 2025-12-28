export const FEATURE_DEPENDENCIES: Record<string, string[]> = {
  members: ["points"], // If members is disabled, points must also be disabled
};

export interface FeatureUpdate {
  id: string;
  enabled: boolean;
}

export function calculateDependentUpdates(
  allFeatures: { id: string; enabled: boolean }[],
  targetId: string,
  newEnabled: boolean
): FeatureUpdate[] {
  const updates: FeatureUpdate[] = [{ id: targetId, enabled: newEnabled }];

  // Cascade disable: If disabling a feature, also disable features that depend on it
  if (!newEnabled && FEATURE_DEPENDENCIES[targetId]) {
    FEATURE_DEPENDENCIES[targetId].forEach((depId) => {
      const depFeature = allFeatures.find((f) => f.id === depId);
      // If dependent feature is currently enabled, it needs to be disabled
      if (depFeature && depFeature.enabled) {
        updates.push({ id: depId, enabled: false });
      }
    });
  }

  return updates;
}
