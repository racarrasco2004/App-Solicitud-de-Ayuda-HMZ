import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Permite escribir  import { Button } from '@/components/ui/Button'
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
