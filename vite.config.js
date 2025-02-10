import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.API_BASE_URL': JSON.stringify('http://localhost:8000/api/v1'),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@recoil': path.resolve(__dirname, './src/recoil'),
      '@types': path.resolve(__dirname, './src/types'),
      '@apis': path.resolve(__dirname, './src/apis'),
    },
  },
  // SCSS 전역 사용 설정
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@assets/styles/main.scss";',
        includePaths: ['src/assets/styles']
      },
    }
  }
})
