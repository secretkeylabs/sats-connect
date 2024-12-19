/*
 * This script is used to pin all dependencies in package.json to the exact
 * versions declared in package-lock.json.
 *
 * It assumes lockfileVersion >= 2
 *
 * Usage: node pin_all_deps.js
 */

const fs = require('fs');
const packageLock = require('../package-lock.json');
const packageJson = require('../package.json');

for (const packageName in packageJson.dependencies) {
  const installedPathKey = `node_modules/${packageName}`;
  if (packageJson.dependencies.hasOwnProperty(packageName) && packageLock.packages[installedPathKey]) {
    packageJson.dependencies[packageName] = packageLock.packages[installedPathKey].version;
  }
}

for (const packageName in packageJson.devDependencies) {
  const installedPathKey = `node_modules/${packageName}`;
  if (packageJson.devDependencies.hasOwnProperty(packageName) && packageLock.packages[installedPathKey]) {
    packageJson.devDependencies[packageName] = packageLock.packages[installedPathKey].version;
  }
}

fs.writeFileSync('../package.json', JSON.stringify(packageJson, null, 2));
