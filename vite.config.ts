import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@react-three/fiber'],
    include: ['react', 'react-dom', 'three', 'react-reconciler', 'scheduler', '@react-three/drei', 'stats.js'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react-reconciler', 'scheduler'],
    alias: {
      'react-reconciler': resolve(__dirname, './node_modules/react-reconciler'),
      'scheduler': resolve(__dirname, './node_modules/scheduler')
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/stats\.js/, /node_modules/]
    }
  },
  ssr: {
    noExternal: ['stats.js']
  }
})

