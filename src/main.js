import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
Vue.config.productionTip = false

import axios from 'axios'
//配置axios请求的根路径
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
//挂载一个拦截器

axios.interceptors.request.use(config=>{
  console.log(config);
  config.headers.Authorization=window.sessionStorage.getItem('token')
  return config
})
//这样每一个vue的组件都可以通过this访问到$http,从而发送请求
Vue.prototype.$http = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
