const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const packagesDir = path.resolve(rootDir, 'packages');
const babelScript = path.resolve(rootDir, 'node_modules/.bin/babel');
const nonEntries = [];

fs
  .readdirSync(packagesDir)
  .forEach(name => {
    const packageDir = path.resolve(packagesDir, name);
    const packageJson = require(path.resolve(packageDir, 'package.json'));
    const shouldBuild = (packageJson.prepublish || {}).build;

    if (!shouldBuild) {
      console.log(`${name}: skipped`);

      if (shouldBuild !== false) {
        nonEntries.push(name);
      }

      return;
    }

    const srcDir = `${packageDir}/src`;
    const distDir = `${packageDir}/dist`;
    const rmCommand = `rm -rf ${distDir}`;
    const buildCommand = `${babelScript} ${srcDir} -d ${distDir} -D --ignore *.test.js`;

    console.log(`${name}: building`);
    execSync([rmCommand, buildCommand].join(' && '));
  });

console.log('\nDone.');

if (nonEntries.length > 0) {
  console.log(`\nThe following packages have no entry for prepublishing:`);

  nonEntries.forEach(name => {
    console.log(` - ${name}`);
  });

  console.log('\nAdd this entry to package.json if you want to build a package during prepublishing:');

  console.log(`
    {
      "prepublish": {
        "build": true
      }
    }
  `);
}

function buildPackage(name) {
  const packageDir = path.resolve(packagesDir, name);
  const packageJson = require(path.resolve(packageDir, 'package.json'));
  const shouldBuild = (packageJson.prepublish || {}).build === true;

  if (!shouldBuild) {
    return;
  }

  execSync(`${babelScript} ${packageDir}/src -d ${packageDir}/dist -D --ignore *.test.js`);
}
