import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  base: '/quota-machine/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
