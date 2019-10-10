import Login from './views/login.vue'
import Home from './views/home.vue'
import NotFound from './404.vue'
import PzInfo from './views/pzInfo.vue'
import VplanInfo from './views/vplan.vue'
import ZyqkInfo from './views/zyqk.vue'
import Lyw from './views/loadYardWarn.vue'

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
    iconCls: 'el-icon-edit-outline',
    leaf: true,
    children: [
        {
            path: '/pzInfo', component: PzInfo, name: '船舶配载'
        }
    ]
},
{
    path: '/',
    component: Home,
    name: '',
    iconCls: 'el-icon-date',
    leaf: true,
    children: [
        {
            path: '/vplan', component: VplanInfo, name: '船舶计划'
        }
    ]
},
{
    path: '/',
    component: Home,
    name: '',
    iconCls: 'el-icon-view',
    leaf: true,
    children: [
        {
            path: '/monitoring', component: ZyqkInfo, name: '作业监控'
        }
    ]
},
{
    path: '/',
    component: Home,
    name: '',
    iconCls: 'el-icon-view',
    leaf: true,
    children: [
        {
            path: '/lyw', component: Lyw, name: '装船场地预警'
        }
    ]
},
{
    path: '*',
    hidden: true,
    redirect: { path: '/404' }
}]

export default routes;