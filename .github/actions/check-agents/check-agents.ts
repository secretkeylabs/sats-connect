import { fromMarkdown } from 'mdast-util-from-markdown';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

type MarkdownNode = {
  type?: string;
  url?: unknown;
  identifier?: unknown;
  children?: unknown;
};

const ignoredDirectories = new Set([
  '.git',
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
]);

const requestedRoot = process.env.AGENTS_CHECK_ROOT || '.';
const rootDir = path.resolve(process.cwd(), requestedRoot);
const rootAgentsPath = path.join(rootDir, 'AGENTS.md');

function toPosixPath(value: string) {
  return value.replace(/\\/g, '/');
}

function normalizeDefinitionIdentifier(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeLinkTarget(target: string) {
  let normalized = target.trim();

  if (!normalized) {
    return null;
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(normalized)) {
    return null;
  }

  if (normalized.startsWith('#')) {
    return null;
  }

  const withoutHash = normalized.split('#', 1)[0] ?? '';
  normalized = withoutHash.split('?', 1)[0] ?? '';

  normalized = normalized
    .split('/')
    .map((segment) => {
      let decoded = segment;

      try {
        decoded = decodeURIComponent(segment);
      } catch {}

      return /[/\\]/.test(decoded) ? segment : decoded;
    })
    .join('/');

  normalized = toPosixPath(normalized).replace(/^\.\//, '');

  if (normalized.startsWith('/')) {
    normalized = normalized.slice(1);
  }

  normalized = path.posix.normalize(normalized);

  if (!normalized || normalized === '.' || normalized.startsWith('../')) {
    return null;
  }

  return normalized;
}

function asMarkdownNode(value: unknown): MarkdownNode | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  return value as MarkdownNode;
}

function collectLinkTargets(markdown: string) {
  const root = fromMarkdown(markdown) as MarkdownNode;
  const inlineTargets = new Set<string>();
  const definitions = new Map<string, string>();
  const usedDefinitionIdentifiers = new Set<string>();

  function visit(value: unknown) {
    const node = asMarkdownNode(value);

    if (!node) {
      return;
    }

    if (node.type === 'link' && typeof node.url === 'string') {
      inlineTargets.add(node.url);
    }

    if (
      node.type === 'definition' &&
      typeof node.identifier === 'string' &&
      typeof node.url === 'string'
    ) {
      const identifier = normalizeDefinitionIdentifier(node.identifier);

      if (!definitions.has(identifier)) {
        definitions.set(identifier, node.url);
      }
    }

    if (node.type === 'linkReference' && typeof node.identifier === 'string') {
      usedDefinitionIdentifiers.add(normalizeDefinitionIdentifier(node.identifier));
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        visit(child);
      }
    }
  }

  visit(root);

  const targets = new Set<string>();

  for (const target of inlineTargets) {
    const normalizedTarget = normalizeLinkTarget(target);

    if (normalizedTarget) {
      targets.add(normalizedTarget);
    }
  }

  for (const identifier of usedDefinitionIdentifiers) {
    const target = definitions.get(identifier);

    if (!target) {
      continue;
    }

    const normalizedTarget = normalizeLinkTarget(target);

    if (normalizedTarget) {
      targets.add(normalizedTarget);
    }
  }

  return targets;
}

async function fileExists(filePath: string) {
  try {
    const fileStats = await stat(filePath);
    return fileStats.isFile();
  } catch {
    return false;
  }
}

async function findAgentsFiles(directory: string, relativeDirectory = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const agentsFiles: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }

      agentsFiles.push(
        ...(await findAgentsFiles(
          path.join(directory, entry.name),
          path.join(relativeDirectory, entry.name)
        ))
      );
      continue;
    }

    if (entry.isFile() && entry.name === 'AGENTS.md') {
      agentsFiles.push(toPosixPath(path.join(relativeDirectory, entry.name)));
    }
  }

  return agentsFiles;
}

if (!(await fileExists(rootAgentsPath))) {
  console.error(`Missing root AGENTS.md file at ${rootAgentsPath}.`);
  process.exit(1);
}

const rootAgents = await readFile(rootAgentsPath, 'utf8');
const linkedAgents = collectLinkTargets(rootAgents);
const nestedAgents = (await findAgentsFiles(rootDir))
  .filter((agentsPath) => agentsPath !== 'AGENTS.md')
  .sort();
const missingAgents = nestedAgents.filter((agentsPath) => !linkedAgents.has(agentsPath));

if (missingAgents.length > 0) {
  console.error('Root AGENTS.md is missing links to nested AGENTS.md files:');

  for (const agentsPath of missingAgents) {
    console.error(`- ${agentsPath}`);
  }

  process.exit(1);
}

console.log(
  nestedAgents.length === 0
    ? 'Root AGENTS.md exists and there are no nested AGENTS.md files to link.'
    : `Root AGENTS.md links all ${nestedAgents.length} nested AGENTS.md file(s).`
);
