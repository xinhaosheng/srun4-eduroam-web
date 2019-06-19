const config = {
    reqUrl: `${location.protocol}//${location.hostname}`,                      // 请求地址
    reqPort: 9001,                                                             // 请求端口
    api: {
        login: '/users/login',                                                 // POST 登录
        logout: '/users/logout',                                               // GET  注销
        keepActive: '/users/status',                                           // GET  保持用户活跃
        // 运行状态模块
        status: {
            visitor: {                                                         // GET 查询
                composition: '/eduroam/visitor/search',
                top: '/eduroam/visitor/top',
                count: '/eduroam/visitor/top',
                daily: '/eduroam/visitor/day-detail',
                roaming: '/eduroam/visitor/in-visitor',
            },
            domain: {
                add: '/eduroam/school/add-domain',                             // POST 增加
                del: '/eduroam/school/del-domain',                             // POST 删除
                update: '/eduroam/school/update-domain',                       // POST 修改
                search: '/eduroam/school/search-domain'                        // GET  查询
            },
            log: {
                search: '/eduroam/visitor/out-visitor'                         // GET  查询
            },
            online: {
                search: '/eduroam/online/search',                              // GET  查询
                count: '/eduroam/online/count',
                drop: '/eduroam/online/drop'
            }
        },
        visitorMgr: {
            search: '/eduroam/visitor/list',                                // 列表查询
            addvisitor: '/users/add-user',                                    // 添加用户
            updatevisitor: '/users/update-user',                                  // 修改用户
            delete: '/users/del-user',                                      // 删除
            show: '/eduroam/user/show',                                     // 查看详情
            equipment: '/eduroam/online/equipment',                         // 在线信息
            users_packages: '/eduroam/user/users-packages',                  // 已订购产品
            dispro: '/products/disable-product',                             // 禁用产品
            enpro: '/products/enable-product',                             // 禁用产品
            stuctrl: '/users/user-status-control',                           // 修改用户状态
            maxnum: '/users/max-online-num'                                 // 修改最大连接数
        },
        // 上网控制模块
        netMgr: {
            // 默认控制组 区域管理 资源管理
            default: {
                search: '/eduroam/internet/search',
                update: '/eduroam/internet/edit'
            },
            // 自定义控制组
            customize: {
                add: '/eduroam/internet/custom-add',
                del: '/eduroam/internet/custom-delete',
                update: '/eduroam/internet/custom-edit',
                search: '/eduroam/internet/custom-list'
            },
            // 批量绑定控制组
            batchBind: {
                download: '/eduroam/internet/download',
                upload: '/eduroam/internet/batch-change-product',
            },
            domainBind: {
                add: '/eduroam/internet/domain-add',
                del: '/eduroam/internet/domain-delete',
                update: '/eduroam/internet/domain-edit',
                search: '/eduroam/internet/domain'
            }
        },
        // 日志管理模块
        logMgr: {
            // 操作日志
            operate: {
                search: '/log/operation'
            },
            // 上网明细
            detail: {
                getCauses: '/advanced/drop-reason',                            // GET  查询 下线原因
                search: '/log/online-detail',
                downloadCSV: '/log/download',
                flag: 'online_detail'
            },
            // 系统日志
            system: {
                search: '/log/system-log',
                flag: 'system'
            },
            // 认证日志
            authenticate: {
                getError: '/advanced/auth-err-msg',                            // GET  查询 错误信息
                search: '/log/auth',
                flag: 'auth'
            },
            // 开销户日志
            account: {
                search: '/log/overhead-household'
            },
            // 登录日志
            login: {
                search: '/log/manager-login',
                del: '/log/del-manager-login'
            }
        },
        // 全局
        all: {
            getField: '/advanced/init-settings',                               // GET  查询 展示字段
            updateField: '/advanced/update-settings',                          // POST 更新 展示字段
            getMessage: '/advanced/sys-msg',                                   // GET  查询 提示信息
            product: '/products/all-products',                                 // GET  查询 全部产品
            userGroup: '/products/all-groups',                                 // GET  查询 全部用户组
            groupAdd: '/groups/add',                                           // POST 添加用户组
            groupEdit: '/groups/edit ',                                        // POST 编辑用户组
            groupDel: '/groups/delete-group',                                  // POST 删除用户组
            bindGroup: '/groups/bind-product',                                 // POST 用户组绑定产品
            source: '/eduroam/internet/radius-list'                            // GET  可访问资源 (Radius 下发自定义属性)
        }
    },
    aes: {
        key: '52756SRUN_HELPER',                                               // KEY
        iv: 'ZBWTUJ_GHRHUWQER'                                                 // 向量
    },
};

// 开发模式
if (process.env.NODE_ENV === 'development') {
    // 深澜西安 123 测试机
    config.reqUrl = 'http://192.168.0.123';
    config.reqPort = 9001;
    // 田歌
    // config.reqUrl = 'http://192.168.0.136';
    // config.reqPort = 8087;
    console.info("[DD]: 当前为开发模式，不需要验证码");
}

export default config;
