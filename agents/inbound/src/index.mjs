// Worker entry. wrangler.toml bundles voice.md as a text module.
import voice from '../voice.md';
import { handle } from './app.mjs';

export default {
  fetch: (request, env, ctx) => handle(request, env, ctx, { voice }),
};
