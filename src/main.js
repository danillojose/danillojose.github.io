import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router.js'
import { i18n, setLocale } from './i18n.js'
import { magnetic } from './directives/magnetic.js'
import './styles/main.css'

setLocale(i18n.global.locale.value)

createApp(App).use(router).use(i18n).directive('magnetic', magnetic).mount('#app')
