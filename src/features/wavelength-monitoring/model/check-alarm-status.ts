export const checkAlarmStatus = (
  value: number,
  alarmMin: number | null,
  alarmMax: number | null,
): 'ok' | 'warning' | 'danger' => {
  // Критическое превышение
  if (alarmMin !== null && value < alarmMin) return 'danger';
  if (alarmMax !== null && value > alarmMax) return 'danger';

  // Предупреждение если близко к границам (в пределах 5%)
  if (alarmMin !== null && value < alarmMin * 1.05) return 'warning';
  if (alarmMax !== null && value > alarmMax * 0.95) return 'warning';

  return 'ok';
};
