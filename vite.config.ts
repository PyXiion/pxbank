// vite.config.ts
import {fileURLToPath, URL} from 'node:url'
import {defineConfig, PluginOption} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import {PrimeVueResolver} from '@primevue/auto-import-resolver'
import tailwindcss from '@tailwindcss/vite'
import {visualizer} from "rollup-plugin-visualizer";

export default defineConfig({
    plugins: [
        vue(),
        Components({
            resolvers: [PrimeVueResolver()]
        }),
        vueDevTools(),
        tailwindcss(),
        visualizer() as PluginOption
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    build: {
        minify: 'esbuild',
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vue: ['vue'],
                    primevue: ['primevue'],
                    anime: ['animejs'],
                    vendor: [
                        'pinia',
                        'vue-router'
                    ]
                }
            },
            input: {
                main: 'index.html',
                'push.worker': 'src/workers/push.worker.js'
            }
        },
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            }
        }
    }
})
