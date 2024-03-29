import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'
import Rights from './components/power/Rights.vue'
import Roles from './components/power/Roles.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
       path: '/home',
       component:Home ,
       redirect:'/welcome',
       children:[
         {path:'/welcome', component: Welcome},
         {path:'/users',component:Users},
         {path:'/rights',component:Rights},
         {path:'/roles',component:Roles}
        ]
      }
  ]
})

router.beforeEach((to,from,next)=>{
  //to:将要你访问的路径
  //from:代表从哪个路径跳转而来
  //next:是一个函数,表示放行

  //如果用户访问的登录页,直接放行
  if(to.path==='/login') return next()
  //从sessionStorage中获取保存token值
  const tokenStr=window.sessionStorage.getItem('token')
  //如果sessionStorage没有token值,强制跳转到登录页
  if(!tokenStr) return next('./login')
  //有则放行
  next()

})
export default router