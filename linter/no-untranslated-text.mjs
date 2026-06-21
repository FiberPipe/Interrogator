export default {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow untranslated text inside JSX elements",
    },
    schema: [],
    messages: {
      untranslated: "Text '{{text}}' must be wrapped in a translation function t().",
    },
  },

  create(context) {
    return {
      JSXText(node) {
        const raw = node.value;

        // Чистим пробелы/переносы
        const text = raw.replace(/\s+/g, " ").trim();

        // Пустая строка — пропускаем
        if (!text) return;

        // Число — пропускаем
        if (!isNaN(Number(text))) return;

        // Если это латиница — возможно код/лейбл, не трогаем
        if (/^[a-zA-Z0-9\s.,:;!?'"(){}[\]-]+$/.test(text)) return;

        // Если русский/украинский/китайский/любой unicode — РУГАЕМСЯ
        context.report({
          node,
          messageId: "untranslated",
          data: { text },
        });
      },
    };
  },
};
