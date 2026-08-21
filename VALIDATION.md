# Validation Notes

The starter source was checked before packaging.

## Checks completed successfully

- `package.json` and `tsconfig.json` parse as valid JSON.
- JavaScript configuration files pass Node syntax checking.
- All TypeScript and TSX source files pass syntax parsing/transpilation.
- Every local `@/…` import resolves to an existing project file.
- Course lesson numbers are sequential.
- Course lesson slugs and quiz IDs are unique.
- Every quiz correct-answer index is inside its option list.
- Internal redirect validation rejects external and backslash-based paths.
- Demo progress preserves the best score and survives encode/decode.

## Runtime-build limitation in the packaging environment

The packaging environment could not reach `registry.npmjs.org` because DNS lookup returned `EAI_AGAIN`. Therefore, dependencies could not be installed here and a full `next build` could not be executed in this environment.

After downloading, run:

```bash
npm install
npm run check
```

`npm run check` performs ESLint, the full TypeScript type check and a production Next.js build using the installed dependencies.
