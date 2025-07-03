#!/usr/bin/env node

import colors from 'colors';
import { getConfig } from '../libs/getConfig';
import { fetchXml } from '../libs/fetchXml';
import { generateHarmonyComponent } from '../libs/generateHarmonyComponent';

const config = getConfig();

fetchXml(config.symbol_url).then((result) => {
  generateHarmonyComponent(result, config);
}).catch((e) => {
  console.error(colors.red(e.message || 'Unknown Error'));
  process.exit(1);
});
