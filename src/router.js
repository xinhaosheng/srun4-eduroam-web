import Vue from 'vue'
import Router from 'vue-router'
import store from './store'
import layout from './views/layout'

Vue.use(Router);

/**
 * TODO:
 * + 路由 name 重写
 * + 开启 history 模式
 */
const router = new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'login',
            component: () => import('./views/Login'),
            meta: {
                title: '登录'
            }
        }, {
            name: 'layout',
            path: '/status/visitor',
            component: layout,
            children: [
                {
                    path: '/status/visitor',
                    name: 'visitor',
                    component: () => import('./views/layout/status/visitor'),
                    meta: {
                        title: '访客来访',
                        requireAuth: false
                    },
                }, {
                    path: '/status/log',
                    name: 'log',
                    component: () => import('./views/layout/status/log/index.vue'),
                    meta: {
                        title: '出访记录',
                        requireAuth: false
                    }
                }, {
                    path: '/status/online',
                    name: 'online',
                    component: () => import('./views/layout/status/online'),
                    meta: {
                        title: '在线分析',
                        requireAuth: false
                    }
                }, {
                    path: '/status/domain',
                    name: 'domain',
                    component: () => import('./views/layout/status/domain'),
                    meta: {
                        title: '学校域名管理',
                        requireAuth: false
                    }
                }, {
                    path: '/visitorMgr',
                    name: 'visitorMgr',
                    component: () => import('./views/layout/visitorMgr'),
                    meta: {
                        title: '访客管理',
                        requireAuth: false
                    }
                }, {
                    path: '/visitorMgr/visitorInfo',
                    name: 'visitorInfo',
                    component: () => import('./views/layout/visitorMgr/visitorInfo'),
                    meta: {
                        title: '访客详情',
                        requireAuth: false
                    }
                }, {
                    path: '/netMgr/defControl',
                    name: 'link',
                    component: () => import('./views/layout/netMgr/defControl'),
                    meta: {
                        title: '默认控制组',
                        requireAuth: false
                    }
                }, {
                    path: '/netMgr/areaMgr',
                    name: 'link',
                    component: () => import('./views/layout/netMgr/areaMgr'),
                    meta: {
                        title: '区域管理',
                        requireAuth: false
                    }
                }, {
                    path: '/netMgr/sourceMgr',
                    name: 'link',
                    component: () => import('./views/layout/netMgr/sourceMgr'),
                    meta: {
                        title: '资源管理',
                        requireAuth: false
                    }
                }, {
                    path: '/netMgr/customize',
                    name: 'link',
                    component: () => import('./views/layout/netMgr/customize'),
                    meta: {
                        title: '自定义控制',
                        requireAuth: false
                    }
                }, {
                    path: '/logMgr/detail',
                    name: 'link',
                    component: () => import('./views/layout/logMgr/detail'),
                    meta: {
                        title: '上网明细',
                        requireAuth: false
                    }
                }, {
                    path: '/logMgr/operate',
                    name: 'link',
                    component: () => import('./views/layout/logMgr/operate'),
                    meta: {
                        title: '操作日志',
                        requireAuth: false
                    }
                }, {
                    path: '/logMgr/authenticate',
                    name: 'link',
                    component: () => import('./views/layout/logMgr/authenticate'),
                    meta: {
                        title: '认证日志',
                        requireAuth: false
                    }
                }, {
                    path: '/logMgr/system',
                    name: 'link',
                    component: () => import('./views/layout/logMgr/system'),
                    meta: {
                        title: '系统日志',
                        requireAuth: false
                    }
                }, {
                    path: '/logMgr/account',
                    name: 'account',
                    component: () => import('./views/layout/logMgr/account'),
                    meta: {
                        title: '开销户日志',
                        requireAuth: false
                    }
                }, {
                    path: '/logMgr/login',
                    name: 'login',
                    component: () => import('./views/layout/logMgr/login'),
                    meta: {
                        title: '登录日志',
                        requireAuth: false
                    }
                }, {
                    path: '/documents/link',
                    name: 'link',
                    component: () => import('./views/layout/documents/Link'),
                    meta: {
                        title: 'eduroam 连接指南',
                        requireAuth: false
                    }
                }
            ]
        }
    ]
});

// 注册全局钩子用来拦截导航
router.beforeEach((to, from, next) => {

    const needCheck = to.meta.requireAuth;      // 是否需要拦截

    let haveToken = store.state.token;          // 是否存在 Token

    // 判断该路由是否需要登录权限
    needCheck ? checkToken() : next();

    // 校验 Token
    function checkToken() {
        haveToken ? next() : next({path: '/'})
    }

});

export default router;
