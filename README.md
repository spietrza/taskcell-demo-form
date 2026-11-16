# taskcell-demo-form

Demo app used to show Taskcell: a NestJS API and a React contact form.

## Run

```sh
pnpm install
pnpm dev   # API on :3000, web on :5173
```

Set `VITE_API_URL` to point the web app at another API (default `http://localhost:3000`).

## Test

```sh
pnpm typecheck && pnpm lint && pnpm test
pnpm build
```
