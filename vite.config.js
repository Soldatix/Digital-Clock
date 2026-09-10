import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        target: 'es2020',
        sourcemap: false
    },
    server: {
        open: false
    },
    preview: {
        open: false
    }
});
