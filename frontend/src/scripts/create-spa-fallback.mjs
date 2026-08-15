import {
  copyFileSync,
  existsSync,
} from "node:fs";
const source ="dist/index.html";
const destination ="dist/404.html";

if (!existsSync(source)) {
  throw new Error(
    "dist/index.html does not exist. Run vite build first.",
  );
}

copyFileSync(
  source,
  destination,
);

console.log(
  "SPA fallback created: dist/404.html",
);