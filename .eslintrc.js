module.exports = {
  extends: 'airbnb-base',
  globals: {
    logger: 'readonly',
    promise: 'readonly',
    baseUrl: 'readonly',
    fetch: 'readonly',
  },
  rules: {
    indent: ['error', 2, { MemberExpression: 0 }],
    'arrow-parens': 'off',
    'no-return-assign': 'off',
    'no-plusplus': 'off',
    'no-confusing-arrow': 'off',
    'class-methods-use-this': 'off',
    'import/no-unresolved': 'off',
    'no-await-in-loop': 'off',
    'lines-between-class-members': 'off',
    'import/newline-after-import': 'off',
    'no-param-reassign': 'off',
  },
};
