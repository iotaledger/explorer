import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteAliases } from 'vite-aliases'
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
            ViteAliases(),
            svgr({
                include: "**/*.svg?react"
            }),
        ],
    };
});

