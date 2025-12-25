import { readdir, readFile, writeFile, rm, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(projectRoot, 'src');
const APPLY_CHANGES = process.argv.includes('--apply');

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const EXTENSION_SET = new Set(EXTENSIONS);

const PROXY_PATTERNS = [
  /^\s*export\s+\{\s*default\s*\}\s+from\s+['\"]([^'\"]+)['\"]\s*;?\s*$/,
  /^\s*export\s+\*\s+from\s+['\"]([^'\"]+)['\"]\s*;?\s*$/,
];

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function stripExtension(value) {
  return value.replace(/\.[^/.]+$/, '');
}

function ensureRelative(value) {
  if (value.startsWith('.') || value.startsWith('/')) {
    return value;
  }
  return `./${value}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function isFile(candidate) {
  try {
    const stats = await stat(candidate);
    return stats.isFile();
  } catch {
    return false;
  }
}

async function collectFiles(baseDir) {
  const entries = await readdir(baseDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const resolved = path.join(baseDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(resolved));
      continue;
    }

    if (entry.isFile() && EXTENSION_SET.has(path.extname(entry.name))) {
      files.push(resolved);
    }
  }

  return files;
}

async function detectProxy(filePath) {
  const content = await readFile(filePath, 'utf8');
  const trimmedLines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('//'));

  if (trimmedLines.length === 0 || trimmedLines.length > 2) {
    return null;
  }

  for (const pattern of PROXY_PATTERNS) {
    const match = trimmedLines[0]?.match(pattern);
    if (match) {
      return { filePath, specifier: match[1] };
    }
  }

  return null;
}

async function resolveTarget(baseDir, specifier) {
  const absolute = path.resolve(baseDir, specifier);
  const candidates = [absolute];

  if (!path.extname(absolute)) {
    for (const ext of EXTENSIONS) {
      candidates.push(`${absolute}${ext}`);
    }
    for (const ext of EXTENSIONS) {
      candidates.push(path.join(absolute, `index${ext}`));
    }
  }

  for (const candidate of candidates) {
    if (await isFile(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Unable to resolve "${specifier}" from "${baseDir}"`);
}

function computeProxySpecifiers(fromFile, proxyFile) {
  const relativeRaw = toPosix(path.relative(path.dirname(fromFile), proxyFile));

  if (relativeRaw.length === 0) {
    return [];
  }

  const specifiers = new Set();
  const withExt = ensureRelative(relativeRaw);
  specifiers.add(withExt);

  const withoutExt = stripExtension(withExt);
  specifiers.add(withoutExt);

  if (withoutExt.endsWith('/index')) {
    specifiers.add(withoutExt.slice(0, -'/index'.length));
  }

  return Array.from(specifiers).filter((specifier) => specifier.length > 0 && specifier !== '.');
}

function computeReplacementSpecifier(fromFile, targetFile) {
  let relative = toPosix(path.relative(path.dirname(fromFile), targetFile));
  relative = ensureRelative(relative);
  relative = stripExtension(relative);

  if (relative.endsWith('/index')) {
    relative = relative.slice(0, -'/index'.length);
  }

  if (relative === '.' || relative === './' || relative === '') {
    return './index';
  }

  return relative;
}

async function rewriteImports(files, proxyPath, targetPath) {
  for (const file of files) {
    if (file === proxyPath) {
      continue;
    }

    const specifiers = computeProxySpecifiers(file, proxyPath);
    if (specifiers.length === 0) {
      continue;
    }

    let content;
    try {
      content = await readFile(file, 'utf8');
    } catch {
      continue;
    }

    let updated = content;
    let changed = false;
    const replacement = computeReplacementSpecifier(file, targetPath);

    for (const specifier of specifiers) {
      const escaped = escapeRegExp(specifier);

      const fromRegex = new RegExp(`(from\\s+['\"])${escaped}(['\"])`, 'g');
      const bareRegex = new RegExp(`(import\\s+['\"])${escaped}(['\"])`, 'g');
      const dynamicRegex = new RegExp(`(import\\(\\s*['\"])${escaped}(['\"]\\s*\\))`, 'g');

      updated = updated.replace(fromRegex, (_match, prefix, suffix) => {
        changed = true;
        return `${prefix}${replacement}${suffix}`;
      });

      updated = updated.replace(bareRegex, (_match, prefix, suffix) => {
        changed = true;
        return `${prefix}${replacement}${suffix}`;
      });

      updated = updated.replace(dynamicRegex, (_match, prefix, suffix) => {
        changed = true;
        return `${prefix}${replacement}${suffix}`;
      });
    }

    if (changed && updated !== content) {
      await writeFile(file, updated);
    }
  }
}

async function main() {
  const files = await collectFiles(srcRoot);
  const proxies = [];

  for (const file of files) {
    const proxy = await detectProxy(file);
    if (proxy) {
      proxies.push(proxy);
    }
  }

  if (proxies.length === 0) {
    console.log('No proxy re-export files detected.');
    return;
  }

  console.log(`Found ${proxies.length} proxy re-export file(s):`);
  for (const proxy of proxies) {
    console.log(`  - ${toPosix(path.relative(projectRoot, proxy.filePath))} -> ${proxy.specifier}`);
  }

  if (!APPLY_CHANGES) {
    console.log('\nRe-run with "--apply" to rewrite imports and remove these files automatically.');
    return;
  }

  for (const proxy of proxies) {
    const proxyDir = path.dirname(proxy.filePath);
    const targetPath = await resolveTarget(proxyDir, proxy.specifier);
    await rewriteImports(files, proxy.filePath, targetPath);
    await rm(proxy.filePath, { force: true });
    const index = files.indexOf(proxy.filePath);
    if (index !== -1) {
      files.splice(index, 1);
    }
    console.log(`Removed ${toPosix(path.relative(projectRoot, proxy.filePath))}`);
  }

  console.log('Proxy cleanup complete.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
