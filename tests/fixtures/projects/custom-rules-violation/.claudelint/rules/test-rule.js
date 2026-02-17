module.exports.rule = {
  meta: {
    id: 'require-commands-section',
    name: 'Require Commands Section',
    description: 'CLAUDE.md must have a ## Commands section',
    category: 'CLAUDE.md',
    severity: 'warn',
    fixable: false,
    since: '1.0.0',
  },
  validate: async (context) => {
    if (!context.filePath.endsWith('CLAUDE.md')) return;
    if (!/^## Commands/m.test(context.fileContent)) {
      context.report({ message: 'Missing ## Commands section', line: 1 });
    }
  },
};
