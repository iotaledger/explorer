import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig(() => {
    return {
        server: {
            port: 3000
        },
        build: {
            outDir: 'build',
        },
        plugins: [
            react(),
            // svgr options: https://react-svgr.com/docs/options/
            svgr({ svgrOptions: { icon: true } }),
        ],
    };
});

