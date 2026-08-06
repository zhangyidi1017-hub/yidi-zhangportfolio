import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const dir = dirname(fileURLToPath(import.meta.url));

const css = readFileSync(join(dir, 'src/style.css'), 'utf8');
const lenisCss = readFileSync(join(dir, 'node_modules/lenis/dist/lenis.css'), 'utf8');
const gsapJs = readFileSync(join(dir, 'node_modules/gsap/dist/gsap.min.js'), 'utf8');
const scrollTriggerJs = readFileSync(
  join(dir, 'node_modules/gsap/dist/ScrollTrigger.min.js'),
  'utf8'
);
const lenisJs = readFileSync(join(dir, 'node_modules/lenis/dist/lenis.min.js'), 'utf8');

const body = readFileSync(join(dir, 'index.html'), 'utf8')
  .replace(/<!DOCTYPE html>[\s\S]*?<body>/i, '')
  .replace(/<script[\s\S]*?<\/body>[\s\S]*$/i, '')
  .replace(/src="\/images\//g, 'src="images/')
  .replace(/src="\/videos\//g, 'src="videos/')
  .replace(/src="\/docs\//g, 'src="docs/')
  .replace(/href="\/docs\//g, 'href="docs/')
  .replace(/src="\/demos\//g, 'src="demos/')
  .replace(/href="\/demos\//g, 'href="demos/');

const js = readFileSync(join(dir, 'src/main.js'), 'utf8')
  .replace(/^import Lenis from 'lenis';\n/, '')
  .replace(/^import \{ gsap \} from 'gsap';\n/, '')
  .replace(/^import \{ ScrollTrigger \} from 'gsap\/ScrollTrigger';\n\n/, '');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>张贻娣 — AI 产品经理</title>
  <meta name="description" content="张贻娣 — AI 产品经理作品集" />
  <style>
${lenisCss}
${css}
  </style>
</head>
<body>
${body}
  <script>
${gsapJs}
  <\/script>
  <script>
${scrollTriggerJs}
  <\/script>
  <script>
${lenisJs}
  <\/script>
  <script>
${js}
  <\/script>
</body>
</html>
`;

const publicImagesDir = join(dir, 'public', 'images');
const publicVideosDir = join(dir, 'public', 'videos');
const publicDocsDir = join(dir, 'public', 'docs');
const publicDemosDir = join(dir, 'public', 'demos');
const prototypeDir = join(dir, 'prototype');
mkdirSync(prototypeDir, { recursive: true });

if (existsSync(publicImagesDir)) {
  cpSync(publicImagesDir, join(dir, 'images'), { recursive: true, force: true });
  cpSync(publicImagesDir, join(prototypeDir, 'images'), { recursive: true, force: true });
}

if (existsSync(publicVideosDir)) {
  cpSync(publicVideosDir, join(dir, 'videos'), { recursive: true, force: true });
  cpSync(publicVideosDir, join(prototypeDir, 'videos'), { recursive: true, force: true });
}

if (existsSync(publicDocsDir)) {
  cpSync(publicDocsDir, join(dir, 'docs'), { recursive: true, force: true });
  cpSync(publicDocsDir, join(prototypeDir, 'docs'), { recursive: true, force: true });
}

if (existsSync(publicDemosDir)) {
  cpSync(publicDemosDir, join(dir, 'demos'), { recursive: true, force: true });
  cpSync(publicDemosDir, join(prototypeDir, 'demos'), { recursive: true, force: true });
}

const outputs = [
  join(dir, 'portfolio.html'),
  join(prototypeDir, 'index.html'),
];

for (const out of outputs) {
  writeFileSync(out, html, 'utf8');
  console.log('Written:', out, '(' + Math.round(html.length / 1024) + ' KB)');
}

const zipPath = join(dir, 'prototype', '张贻娣-作品集原型.zip');
try {
  if (process.platform === 'win32') {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${join(prototypeDir, 'index.html')}','${join(prototypeDir, 'images')}','${join(prototypeDir, 'videos')}','${join(prototypeDir, 'docs')}','${join(prototypeDir, 'demos')}' -DestinationPath '${zipPath}' -Force"`,
      { stdio: 'inherit' }
    );
  } else {
    execSync(`cd "${prototypeDir}" && zip -r "张贻娣-作品集原型.zip" index.html images videos docs demos`, {
      stdio: 'inherit',
    });
  }
  console.log('Written:', zipPath);
} catch (err) {
  console.warn('Zip creation skipped:', err.message);
}
