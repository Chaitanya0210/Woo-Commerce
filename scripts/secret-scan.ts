#!/usr/bin/env node
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const files = execSync('git diff --cached --name-only').toString().trim().split('\n').filter(Boolean);

let failed = false;
for (const file of files) {
  const content = readFileSync(file, 'utf8');
  if (/(ck_[a-zA-Z0-9]{40}|cs_[a-zA-Z0-9]{40})/.test(content)) {
    console.error(`ERROR: Detected potential WooCommerce secret in ${file}`);
    failed = true;
  }
}

if (failed) {
  console.error('Commit rejected. Please remove secrets before committing.');
  process.exit(1);
}
