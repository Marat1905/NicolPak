import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    server: {
        port: 62301,
    }
})
