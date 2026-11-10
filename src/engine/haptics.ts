export type HapticType = 'turn' | 'match' | 'late' | 'qobul';

export function triggerHaptic(type: HapticType): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'turn':
        navigator.vibrate([25, 35, 25]);
        break;
      case 'match':
        navigator.vibrate([40]);
        break;
      case 'late':
        navigator.vibrate([60, 40, 60]);
        break;
      case 'qobul':
        navigator.vibrate([40, 50, 40, 50, 80]);
        break;
    }
  } catch {
  }
}

