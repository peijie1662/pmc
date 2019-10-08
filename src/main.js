import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import routes from './routes'
import './assets/iconfont/iconfont.css'
import './assets/iconfont-crab/iconfont.css'
import VueKonva from 'vue-konva'
import "./assets/font/font.css"
import VCharts from 'v-charts'

Vue.use(VueRouter)
Vue.use(ElementUI)
Vue.use(VueKonva)
Vue.use(VCharts)

const router = new VueRouter({
  //mode: "history",
  routes
})

//通过beforeEach判断用户是否登录，
router.beforeEach((to, from, next) => {
  //登录动作删除原用户
  if (to.path == '/login') {
    sessionStorage.removeItem('userinfo');
    next()
  } else {
    //如果无登录信息则转向登录页面，否则继续加载组件.
    let userinfo = JSON.parse(sessionStorage.getItem('userinfo'));
    if (!userinfo && to.path != '/login') {
      next({ path: '/login' })
    } else {
      next()
    }
  }
})

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
