import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteAliases } from 'vite-aliases'
import svgr from 'vite-plugin-svgr';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig(() => {
    return {
        server: {
            port: 3000
        },
        preview: {
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
            nodePolyfills()
        ],
        test: {
            globals: true,
            teardownTimeout: 100
        },
    };
});

