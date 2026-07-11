import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base must match the GitHub repo name so built asset paths resolve
// correctly when served from https://<username>.github.io/quota-machine/
export default defineConfig({
  base: '/quota-machine/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
