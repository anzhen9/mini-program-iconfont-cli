import fs from 'fs';
import path, { basename } from 'path';
import mkdirp from 'mkdirp';
import glob from 'glob';
import colors from 'colors';
import { XmlData } from './fetchXml';
import { Config } from './getConfig';
import { getTemplate } from './getTemplate';
import { generateCase } from "./utils"
import {
   replaceIsRpx,
  replaceNames,
  replaceSize,
} from './replace';
// import { whitespace } from './whitespace';


export const generateHarmonyComponent = (data: XmlData, config: Config) => {
  const svgTemplates: string[] = [];
  const names: string[] = [];
  const saveDir = path.resolve(config.save_dir);
  const fileName = basename(config.save_dir) || 'iconfont';

  mkdirp.sync(saveDir);
  glob.sync(path.join(saveDir, '*')).forEach((file) => fs.unlinkSync(file));

  data.svg.symbol.forEach((item) => {
    const iconId = item.$.id;
    const iconIdAfterTrim = config.trim_icon_prefix
      ? iconId.replace(
        new RegExp(`^${config.trim_icon_prefix}(.+?)$`),
        (_, value) => value.replace(/^[-_.=+#@!~*]+(.+?)$/, '$1')
      )
      : iconId;

    names.push(iconIdAfterTrim);
    svgTemplates.push(
      `<!--${iconIdAfterTrim}-->\n<view has:if="{{name === '${iconIdAfterTrim}'}}" style="background-image: url({{quot}}data:image/svg+xml, ${generateCase(item, {
        hexToRgb: true
      })}{{quot}});` +
      ' width: {{svgSize}}px; height: {{svgSize}}px; " class="icon" />'
    );

    console.log(`${colors.green('√')} Generated icon "${colors.yellow(iconId)}"`);
  });

  fs.writeFileSync(path.join(saveDir, fileName + '.css'), getTemplate('harmony.css'));
  fs.writeFileSync(
    path.join(saveDir, fileName + '.hxml'),
    svgTemplates.join('\n\n')
  );

  let jsFile = getTemplate('harmony.js');

  jsFile = replaceSize(jsFile, config.default_icon_size);
  jsFile = replaceNames(jsFile, names);
  jsFile = replaceIsRpx(jsFile, config.use_rpx);

  fs.writeFileSync(path.join(saveDir, fileName + '.js'), jsFile);
  fs.writeFileSync(path.join(saveDir, fileName + '.json'), getTemplate('harmony.json'));

  console.log(`\n${colors.green('√')} All icons have been putted into dir: ${colors.green(config.save_dir)}\n`);
};

