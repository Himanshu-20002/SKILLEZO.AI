import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["cjs"],
  target: "node20",
  outDir: "dist",
  clean: true,
  sourcemap: false,
  minify: true,
  treeshake: true,
  noExternal: [/^better-auth/],
});
