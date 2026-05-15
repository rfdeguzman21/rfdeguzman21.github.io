import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import yaml from 'js-yaml';

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'yaml-import',
            transform(src, id) {
                if (/\.ya?ml$/.test(id)) {
                    return { code: `export default ${JSON.stringify(yaml.load(src))}`, map: null };
                }
            },
        },
    ],
    server: { port: 3000 },
});
