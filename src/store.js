import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const state = {
    token: localStorage.getItem('token'),                               // Token
    user: localStorage.getItem('user'),                                 // user
    device: 'pc',
    options: {},
    setting: {
        defSearchRange: 'week',         // 默认查询时间范围                week || month || month*3
        netMgrCustomizeStyle: 'top',    // 上网控制 - 自定义控制展示模式     top || left
        // 暂未使用
        background: '#fff',             // 背景色
        defPageSize: 10,                // 默认分页大小
        navBackground: '#222d32',       // 导航栏背景色
        headerBackground: 'linear-gradient(to right, #3c8dbc, #73cae2)'
    }
};

const mutations = {
    // 设置 Token 将 token 保存到 localStorage 里，token 表示登陆状态
    SET_TOKEN: (state, data) => {
        state.token = data;
        localStorage.setItem('token', data);
    },
    // 设置 用户名
    SET_USER: (state, data) => {
        // 把用户名存起来
        state.user = data;
        localStorage.setItem('user', data);
    },
    // 注销
    LOGOUT: state => {
        // 登出的时候要清除token
        state.token = null;
        state.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    // 改变 设备类型
    CHANGE_DEVICE(state, data) {
        state.device = data;
    },
    // 设置 默认选项
    SET_OPTIONS: state => {
        state.options = {};

        const api = Vue.prototype.config.api.all;

        // 获取 产品列表
        let getProducts = async arr => {
            return await new Promise(resolve => {
                request.get(api.product, res => {
                    for (let val of res.data) {
                        arr.push({
                            label: val.products_name,
                            value: val.product_id,
                        })
                    }
                    resolve(arr);
                });
            });
        };

        // 获取 可访问的资源列表
        let getSources = async arr => {
            return await new Promise(resolve => {
                request.get(api.source, res => {
                    for (let key in res.data) {
                        arr.push({
                            value: key,
                            label: res.data[key]
                        })
                    }
                    resolve(arr);
                });
            });
        };

        (async () => {
            state.options = {
                products: await getProducts([]),
                sources: await getSources([]),
            };
            localStorage.setItem('options', JSON.stringify(state.options));
        })();
    },
    // 获取 默认选项
    GET_OPTIONS: state => {
        state.options = JSON.parse(localStorage.getItem('options'));
    }
};

export default new Vuex.Store({
    state,   //存放公共数据     <!--状态-->
    actions: {}, //commit    <!-- 可包含异步操作的mutation -->
    mutations,  ///<!-- 用于改变状态 -->
})
