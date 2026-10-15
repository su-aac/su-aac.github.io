import { defineConfig } from 'astro/config';
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import lit from "@astrojs/lit";
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const site = 'https://su-aac.github.io';

// English pages used to live under /en/ and now live at the root. After each
// build, write a redirect page at /en/<path> for every built English page so
// old shared and indexed links keep working.
function legacyEnRedirects() {
  return {
    name: 'legacy-en-redirects',
    hooks: {
      'astro:build:done': ({ dir, pages, logger }) => {
        let count = 0;
        for (const { pathname } of pages) {
          if (pathname === '404/' || pathname.startsWith('ch/')) continue;
          const target = new URL('/' + pathname, site).href;
          const outDir = new URL('en/' + pathname, dir);
          const outFile = new URL('index.html', outDir);
          if (fs.existsSync(outFile)) {
            throw new Error(`Refusing to overwrite existing page ${fileURLToPath(outFile)}`);
          }
          fs.mkdirSync(outDir, { recursive: true });
          fs.writeFileSync(outFile, `<!doctype html>
<title>Redirecting to: ${target}</title>
<meta http-equiv="refresh" content="0;url=${target}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${target}">
<script>location.replace(${JSON.stringify('/' + pathname)} + location.search + location.hash)</script>
<body>
	<a href="${target}">Redirecting from <code>/en/${pathname}</code> to <code>${target}</code></a>
</body>
`);
          count++;
        }
        logger.info(`Wrote ${count} /en/ redirect pages`);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site, // Your public domain, e.g.: https://my-site.dev/. Used to generate sitemaps and canonical URLs.
  sitemap: true, // Generate sitemap (set to "false" to disable)
  integrations: [sitemap(), mdx(), lit(), icon(), legacyEnRedirects()], // Add renderers to the config
});
