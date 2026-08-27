export function pointsForFirstCorrectAttempt(attemptNumber: number) {
  if (!Number.isInteger(attemptNumber) || attemptNumber < 1) {
    throw new RangeError("attemptNumber must be a positive integer");
  }

  if (attemptNumber === 1) return 100;
  if (attemptNumber === 2) return 50;
  if (attemptNumber === 3) return 25;
  return 0;
}
