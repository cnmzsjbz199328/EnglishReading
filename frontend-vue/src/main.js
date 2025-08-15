import './assets/main.css'
import './assets/app.css'
// Import global design system
import './assets/styles/variables.css'
import './assets/styles/utilities.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
