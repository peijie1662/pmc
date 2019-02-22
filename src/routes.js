import Login from './views/login.vue'
import Home from './views/home.vue'
import NotFound from './404.vue'
import Vessel from './views/vessel.vue'
import PzInfo from './views/pzInfo.vue'

let routes = [{ 
    path: '/login',
    component: Login,
    name: '',
    hidden: true
},
{
    path: '/home',
    component: Home,
    name: '',
    hidden: true
},
{
    path: '/404',
    component: NotFound,
    name: '',
    hidden: true
},
{
    path: '/',
    component: Home,
    name: '',
    iconCls: 'el-icon-question',
    leaf: true,
    children: [
        {
            path: '/pzInfo', component: PzInfo, name: '船舶配载信息'
        }
    ]
},
{
    path: '*',
    hidden: true,
    redirect: { path: '/404' }
}]

export default routes;