const { readdir, readFile, stat } = await import(`node:fs/promises`);
const { default: path } = await import(`node:path`);

const IGNORED_DIRECTORIES = new Set();
IGNORED_DIRECTORIES.add(`.git`);
IGNORED_DIRECTORIES.add(`.next`);
IGNORED_DIRECTORIES.add(`.turbo`);
IGNORED_DIRECTORIES.add(`build`);
IGNORED_DIRECTORIES.add(`coverage`);
IGNORED_DIRECTORIES.add(`dist`);
IGNORED_DIRECTORIES.add(`node_modules`);
IGNORED_DIRECTORIES.add(`out`);

const rootDir = process.cwd();
const rootAgentsPath = path.join(rootDir, `AGENTS.md`);

function toPosixPath(value) {
  return value.replace(/\\/g, `/`);
}

function normalizeLinkTarget(target) {
  let normalized = target.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith(`<`) && normalized.endsWith(`>`)) {
    normalized = normalized.slice(1, -1);
  }

  normalized = normalized.split(/\s+/)[0];

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(normalized)) {
    return null;
  }

  if (normalized.startsWith(`#`)) {
    return null;
  }

  normalized = normalized.split(`#`)[0].split(`?`)[0];

  try {
    normalized = decodeURI(normalized);
  } catch {
    // Keep the original target if it is not a valid URI.
  }

  normalized = toPosixPath(normalized).replace(/^\.\//, ``);

  return normalized || null;
}

function extractMarkdownLinkTargets(markdown) {
  const targets = new Set();
  const inlineLinkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
  let match;

  while ((match = inlineLinkPattern.exec(markdown)) !== null) {
    const target = normalizeLinkTarget(match[1]);

    if (target) {
      targets.add(target);
    }
  }

  return targets;
}

async function fileExists(filePath) {
  try {
    const fileStats = await stat(filePath);
    return fileStats.isFile();
  } catch {
    return false;
  }
}

async function findAgentsFiles(directory, relativeDirectory = ``) {
  const entries = await readdir(directory, { withFileTypes: true });
  const agentsFiles = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }

      const childDir = path.join(directory, entry.name);
      const childRelDir = path.join(relativeDirectory, entry.name);
      const childFiles = await findAgentsFiles(childDir, childRelDir);
      agentsFiles.push(...childFiles);
      continue;
    }

    if (entry.isFile() && entry.name === `AGENTS.md`) {
      agentsFiles.push(toPosixPath(path.join(relativeDirectory, entry.name)));
    }
  }

  return agentsFiles;
}

if (!(await fileExists(rootAgentsPath))) {
  console.error(`Missing root AGENTS.md file.`);
  process.exit(1);
}

const rootAgents = await readFile(rootAgentsPath, `utf8`);
const linkedAgents = extractMarkdownLinkTargets(rootAgents);
const allAgents = await findAgentsFiles(rootDir);
const nestedAgents = allAgents.filter((agentsPath) => {
  return agentsPath !== `AGENTS.md`;
});
nestedAgents.sort();
const missingAgents = nestedAgents.filter((agentsPath) => {
  return !linkedAgents.has(agentsPath);
});

if (missingAgents.length > 0) {
  console.error(`Root AGENTS.md is missing links to nested AGENTS.md files:`);

  for (const agentsPath of missingAgents) {
    console.error(`- ${agentsPath}`);
  }

  process.exit(1);
}

const successMessage =
  nestedAgents.length === 0
    ? `Root AGENTS.md exists and there are no nested AGENTS.md files to link.`
    : `Root AGENTS.md links all ${nestedAgents.length} nested AGENTS.md file(s).`;

console.log(successMessage);
