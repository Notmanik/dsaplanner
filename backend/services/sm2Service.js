// SuperMemo-2 (SM-2) Algorithm Implementation
// Quality scores:
// 5: Perfect response
// 4: Correct response after a hesitation
// 3: Correct response recalled with serious difficulty
// 2: Incorrect response; where the correct one seemed easy to recall
// 1: Incorrect response; the correct one remembered
// 0: Complete blackout
exports.calculateSM2 = (quality, repetitions, previousInterval, previousEaseFactor) => {
  let interval;
  let easeFactor = previousEaseFactor;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(previousInterval * previousEaseFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return { interval, repetitions, easeFactor };
};
