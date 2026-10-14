/**
 * Compares two semver version strings (X.Y.Z).
 * Returns -1 if a < b, 0 if a === b, 1 if a > b.
 */
export function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  const length = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < length; i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA < numB) return -1;
    if (numA > numB) return 1;
  }

  return 0;
}

/**
 * Returns true if `current` is older than `minimum`.
 */
export function isVersionOutdated(current: string, minimum: string): boolean {
  return compareVersions(current, minimum) < 0;
}
