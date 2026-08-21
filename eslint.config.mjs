import next from 'eslint-config-next';
import prettier from 'eslint-config-prettier';

/** Next's recommended rules (core-web-vitals + TypeScript), with Prettier last. */
const config = [{ ignores: ['.next', 'node_modules', 'coverage'] }, ...next, prettier];

export default config;
