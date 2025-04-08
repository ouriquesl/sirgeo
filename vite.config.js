import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  server: {
    base: '/',
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    target: 'esnext',
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        format: 'es'
      },
      external: [
        '/js/jquery-3.3.1.min.js',
        '/js/popper.min.js',
        '/js/bootstrap.min.js',
        '/js/global.js',
        '/js/apply_modal.js',
        '/js/apply_toggle.js'
      ]
    }
  }
})
