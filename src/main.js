import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import router from './router'
import store from './store'
import echarts from 'echarts'
import config from './config'

import tools from './utils'

Vue.config.productionTip = false;
Vue.prototype.$echarts = echarts;
Vue.prototype.config = config;
Vue.prototype.tools = tools;

Vue.use(ElementUI);

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
