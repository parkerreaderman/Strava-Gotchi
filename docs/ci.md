## Continuous Integration

- Workflow: `.github/workflows/ci.yml`
  - Runs on `push` and `pull_request` to `main`.
  - Node 20, `npm install`.
  - Executes `npm run ci` → `eslint` + `vitest run` (see `package.json`).

### Local check

```bash
npm run ci
```

### Rive (not in CI today)

The app ships **pixel-based** avatars; there is **no** `@rive-app/*` dependency and **no** `scripts/verify-rive-assets` step. If you adopt Rive later, see `docs/rive-pipeline.md` and extend `npm run ci` only after adding assets and a real check script.

### Future extensions

- Add a second job to deploy to Vercel when `main` builds succeed.
- Upload coverage from `vitest` using `--coverage`.
- Cache Prisma downloads by persisting `node_modules/.prisma`.
