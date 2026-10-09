// Postbuild step: pre-compress hashed JS/CSS assets so nginx can serve them
// with `gzip_static on` (no runtime compression cost, smaller transfer).
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { gzipSync, constants as zlibConstants } from "node:zlib";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const assetsDir = join(projectRoot, "dist", "assets");
const COMPRESSIBLE = new Set([".js", ".css", ".svg", ".json", ".html"]);
const MIN_BYTES = 1024; // skip tiny files where gzip overhead is not worth it

async function main() {
  let entries;
  try {
    entries = await readdir(assetsDir, { withFileTypes: true });
  } catch {
    console.log("[gzip-dist] dist/assets not found — nothing to compress.");
    return;
  }

  let count = 0;
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = extname(entry.name).toLowerCase();
    if (!COMPRESSIBLE.has(ext)) continue;

    const filePath = join(assetsDir, entry.name);
    const info = await stat(filePath);
    if (info.size < MIN_BYTES) continue;

    const source = await readFile(filePath);
    const compressed = gzipSync(source, { level: zlibConstants.Z_BEST_COMPRESSION });
    // Only emit if compression actually helps.
    if (compressed.length >= source.length) continue;

    await writeFile(`${filePath}.gz`, compressed);
    count += 1;
  }

  console.log(`[gzip-dist] pre-compressed ${count} asset(s).`);
}

main().catch((error) => {
  console.error("[gzip-dist] failed:", error);
  process.exitCode = 1;
});
