import { logger } from '../logger/logger.utils';

export function cleanJSON(str: string): string {
  let result = str.trim();

  // 1. Удаляем пробелы внутри чисел
  result = result
    .replace(/(\d)\s+(\d)/g, '$1$2') // "123 456" → "123456"
    .replace(/(\d)\s+\./g, '$1.') // "1 .5" → "1.5"
    .replace(/\.\s+(\d)/g, '.$1'); // ". 5" → ".5"

  // 2. Удаляем пробелы внутри ключей: "P11 " → "P11"
  // Паттерн: "ключ с пробелами":значение
  result = result.replace(/"([^"]+)"\s*:/g, (match, key) => {
    const cleanedKey = key.trim();
    return `"${cleanedKey}":`;
  });

  // 3. Удаляем длинные последовательности пробелов
  result = result.replace(/\s{10,}/g, ' ');

  // 4. Убираем пробелы вокруг JSON-разделителей
  result = result.replace(/\s*([,:{}[\]])\s*/g, '$1');

  return result;
}

export function parse(t: string) {
  try {
    const cleaned = cleanJSON(t);

    const result = JSON.parse(cleaned);
    logger.debug('✅ Parsed successfully');

    return result;
  } catch (e) {
    //@ts-ignore
    logger.error('❌ Parse error:', e.message);
    //@ts-ignore
    const posMatch = e.message.match(/position (\d+)/);
    if (posMatch) {
      const pos = parseInt(posMatch[1]);
      const cleaned = cleanJSON(t);

      logger.error('\n📍 Error at position', pos);
      logger.error('Context:', cleaned.substring(Math.max(0, pos - 40), pos + 40));
      logger.error('        ', ' '.repeat(40) + '↑');
    }

    return null;
  }
}
