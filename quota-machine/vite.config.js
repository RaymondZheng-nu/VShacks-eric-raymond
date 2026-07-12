import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  base: '/VShacks-eric-raymond/quota-machine/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
