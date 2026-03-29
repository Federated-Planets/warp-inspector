#!/usr/bin/env node

import { Command } from 'commander';
import * as cheerio from 'cheerio';
import chalk from 'chalk';
import { z } from 'zod';
import crypto from 'crypto';

const program = new Command();

const ManifestSchema = z.object({
  name: z.string().min(1, "Planet name is required"),
  description: z.string().optional(),
  landing_site: z.string().url("Landing site must be a valid URL").optional(),
  space_port: z.string().url("Space port must be a valid URL").optional(),
});

function calculateCoordinates(domain) {
  const hash = crypto.createHash('md5').update(domain.toLowerCase()).digest('hex');
  
  const xHex = hash.slice(0, 6);
  const yHex = hash.slice(6, 12);
  const zHex = hash.slice(12, 18);
  
  const x = (parseInt(xHex, 16) % 100000) / 100;
  const y = (parseInt(yHex, 16) % 100000) / 100;
  const z = (parseInt(zHex, 16) % 100000) / 100;
  
  const format = (n) => n.toFixed(2).padStart(6, '0');
  return `${format(x)}:${format(y)}:${format(z)}`;
}

async function inspect(target) {
  let url = target;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  console.log(chalk.cyan(`\n🔭 Starting inspection for: ${chalk.bold(url)}`));
  console.log(chalk.dim('―'.repeat(50)));

  try {
    // 1. Fetch Homepage
    process.stdout.write(chalk.white('📡 Fetching homepage... '));
    const response = await fetch(url);
    if (!response.ok) {
      console.log(chalk.red('FAILED'));
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    console.log(chalk.green('OK'));

    const html = await response.text();
    const $ = cheerio.load(html);

    // 2. Discovery
    process.stdout.write(chalk.white('🔍 Searching for space-manifest link... '));
    const manifestLink = $('link[rel="space-manifest"]').attr('href');
    if (!manifestLink) {
      console.log(chalk.red('NOT FOUND'));
      console.log(chalk.yellow('\n💡 Tip: Add <link rel="space-manifest" href="/path/to/manifest.json" /> to your <head>'));
      return;
    }
    console.log(chalk.green('FOUND'));
    console.log(chalk.dim(`   Path: ${manifestLink}`));

    const manifestUrl = new URL(manifestLink, url).href;

    // 3. Fetch Manifest
    process.stdout.write(chalk.white('📜 Retrieving manifest... '));
    const manifestRes = await fetch(manifestUrl);
    if (!manifestRes.ok) {
      console.log(chalk.red('FAILED'));
      throw new Error(`Could not fetch manifest from ${manifestUrl}`);
    }
    console.log(chalk.green('OK'));

    const manifestData = await manifestRes.json();

    // 4. Validate Schema
    process.stdout.write(chalk.white('✅ Validating manifest schema... '));
    const validation = ManifestSchema.safeParse(manifestData);
    if (!validation.success) {
      console.log(chalk.red('INVALID'));
      validation.error.errors.forEach(err => {
        console.log(chalk.red(`   ✖ ${err.path.join('.')}: ${err.message}`));
      });
      return;
    }
    console.log(chalk.green('VALID'));

    const data = validation.data;
    const landingSite = data.landing_site || url;
    const domain = new URL(landingSite).hostname;
    const coords = calculateCoordinates(domain);

    // 5. Results
    console.log(chalk.dim('―'.repeat(50)));
    console.log(chalk.bold.yellow('\n🪐 PLANET STATISTICS'));
    console.log(`${chalk.bold('Name:')}        ${data.name}`);
    console.log(`${chalk.bold('Status:')}      ${chalk.green('Active Member of the Federation')}`);
    console.log(`${chalk.bold('Coordinates:')} ${chalk.cyan.bold(coords)}`);
    console.log(`${chalk.bold('Domain:')}      ${domain}`);
    console.log(`${chalk.bold('Landing Site:')} ${landingSite}`);
    
    if (data.space_port) {
      console.log(`${chalk.bold('Space Port:')}   ${chalk.green('ACTIVE')} (${data.space_port})`);
    } else {
      console.log(`${chalk.bold('Space Port:')}   ${chalk.dim('NOT DETECTED')}`);
    }

    if (data.description) {
      console.log(`\n${chalk.italic('"' + data.description + '"')}`);
    }

    console.log(chalk.dim('\nInspection complete. Safe travels, citizen.\n'));

  } catch (err) {
    console.log(chalk.red(`\n💥 ERROR: ${err.message}\n`));
  }
}

program
  .name('warp-inspector')
  .description('Validator tool for Federated Planets configuration')
  .version('1.0.0')
  .argument('<target>', 'URL or domain of the planet to inspect')
  .action((target) => {
    inspect(target);
  });

program.parse();
