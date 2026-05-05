import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { writeFileSync, readFileSync, rmSync, existsSync } from 'fs'
import { resolve } from 'path'

const isPawPatrol = process.env.VITE_THEME === 'pawpatrol'
const isElsa = process.env.VITE_THEME === 'elsa'

const appTitle = isPawPatrol ? '汪汪队日记' : isElsa ? '艾莎日记' : '奥特曼日记'
const themeColor = isPawPatrol ? '#2563EB' : isElsa ? '#5B9BD5' : '#c0392b'
const appDescription = isPawPatrol ? '帮助孩子通过汪汪队故事提高阅读能力' : isElsa ? '帮助孩子通过冰雪公主故事提高阅读能力' : '帮助孩子通过奥特曼故事提高阅读能力'

function htmlPlugin() {
  return {
    name: 'html-transform',
    transformIndexHtml(html: string) {
      return html
        .replace(/__APP_TITLE__/g, appTitle)
        .replace(/__THEME_COLOR__/g, themeColor)
    },
  }
}

function manifestPlugin() {
  return {
    name: 'manifest-generate',
    writeBundle() {
      const manifest = {
        name: appTitle,
        short_name: appTitle,
        description: appDescription,
        start_url: './index.html',
        display: 'standalone',
        background_color: '#f9fafb',
        theme_color: themeColor,
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      }
      writeFileSync(
        resolve(__dirname, 'dist', 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      )
    },
  }
}

/**
 * Temporarily hide books/ from public dir during build to avoid copying ~700MB,
 * then fix the HTML for file:// compatibility.
 */
function buildPlugin() {
  return {
    name: 'build-tweaks',
    closeBundle() {
      // Remove books dir from dist to save space (700MB+ of images)
      const distBooks = resolve(__dirname, 'dist', 'books')
      if (existsSync(distBooks)) {
        rmSync(distBooks, { recursive: true })
      }
      // Strip module attributes for file:// compatibility
      const htmlPath = resolve(__dirname, 'dist', 'index.html')
      try {
        let html = readFileSync(htmlPath, 'utf-8')
        html = html
          .replace(/ type="module"/g, '')
          .replace(/ crossorigin/g, '')
          .replace(/<script src=/g, '<script defer src=')
        writeFileSync(htmlPath, html)
      } catch { /* dist not created — real error is elsewhere */ }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), htmlPlugin(), manifestPlugin(), buildPlugin()],
  base: './',
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  // Polyfill import.meta for IIFE format (react-router needs it)
  define: {
    'import.meta.url': JSON.stringify(''),
    'import.meta.hot': 'undefined',
  },
})
