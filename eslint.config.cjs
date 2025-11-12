
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: {} });

const legacy = require('./.eslintrc.cjs');
module.exports = compat.config(legacy);
