import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import LARA from '@primeuix/themes/lara';
import {ConfirmationService} from "primevue";
import ToastService from 'primevue/toastservice';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ToastService);
app.use(PrimeVue, {
    // Default theme configuration
    theme: {
        preset: LARA,
        options: {
            cssLayer: false
        }
    }
})
app.use(ConfirmationService)

app.mount('#app')
