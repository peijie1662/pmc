import Login from './views/login.vue'
import Home from './views/home.vue'
import NotFound from './404.vue'
import PzInfo from './views/mini_vessel_map/pzInfo.vue'
import VplanInfo from './views/vessel_plan/vplan.vue'
import ZyqkInfo from './views/real_time_monitoring/zyqk.vue'
import Lyw from './views/load_yard_warn/loadYardWarn.vue'
import MainScreen from './views/data_visualization/mainScreen.vue' 

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
            path: '/lyw', component: Lyw, name: '装船场地拥堵预警'
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
            path: '/ms', component: MainScreen, name: '看星星'
        }
    ]
},
{
    path: '*',
    hidden: true,
    redirect: { path: '/404' }
}]

export default routes;