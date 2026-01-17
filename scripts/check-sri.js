#!/usr/bin/env bun
import { resolve } from "path";

async function readPkgVersion() {
  const pkgPath = resolve(process.cwd(), "package.json");
  const pkgFile = Bun.file(pkgPath);
  if (!(await pkgFile.exists())) {
    console.error(`package.json not found at ${pkgPath}`);
    Bun.exit(1);
  }

  const pkg = JSON.parse(await pkgFile.text());
  const v = pkg?.config?.scalarVersion;
  if (!v) {
    console.error(
      "package.json: config.scalarVersion is not set. Please set it to the desired Scalar version.",
    );
    Bun.exit(1);
  }
  return String(v);
}

async function readGeneratedVersion() {
  const outPath = resolve(process.cwd(), "src/lib/orpc/scalar-sri.ts");
  const sriFile = Bun.file(outPath);
  if (!(await sriFile.exists())) {
    console.error(
      `${outPath} not found. Run 'bun run generate:sri' to generate it.`,
    );
    Bun.exit(1);
  }

  const content = await sriFile.text();
  const match = content.match(/SCALAR_VERSION\s*=\s*["']([^"']+)["']/);
  if (!match) {
    console.error(
      `${outPath} doesn't contain SCALAR_VERSION. The file may be malformed.`,
    );
    Bun.exit(1);
  }
  return match[1];
}

const pkgVersion = await readPkgVersion();
const genVersion = await readGeneratedVersion();

if (pkgVersion !== genVersion) {
  console.error(
    `Scalar version mismatch:\n  package.json config.scalarVersion = "${pkgVersion}"\n  src/lib/orpc/scalar-sri.ts SCALAR_VERSION = "${genVersion}"\n\nRun 'bun run generate:sri' to regenerate the SRI file or update package.json to the desired version.`,
  );
  Bun.exit(2);
}

console.log(
  `OK: SCALAR_VERSION (${genVersion}) matches package.json config.scalarVersion.`,
);
process.exit(0);
