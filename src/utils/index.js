import Vue from 'vue'
import router from '../router'
import store from '../store'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import fieldMap from './fieldMap'

const vue = Vue.prototype;

vue.axios = axios;
// 跨域携带 cookie
vue.axios.defaults.withCredentials = true;
// 请求拦截器
vue.axios.interceptors.request.use(config => {
    // 在发送请求之前做些什么
    let token = store.state.token;
    if (token) config.headers.token = token;
    return config;
}, error => {
    // 对请求错误做些什么
    return Promise.reject(error);
});
// 响应拦截器
vue.axios.interceptors.response.use(response => {
    // 对响应数据做点什么
    // 判断消息类型
    if (response.data.code === 500) {
        store.commit('LOGOUT', '');           // 清空 Token
        router.push({path: '/'});             // 路由跳转
        return vue.$message({
            showClose: true,
            message: '您因长时间未操作而注销，请重新登录',
            type: 'error'
        });
    }
    return response;
}, error => {
    // 对响应错误做点什么
    return Promise.reject(error);
});

// 请求封装
window.request = {
    get(url, para, func = () => {
    }) {
        // 如果使用默认参数,防止参数顺序混乱
        if (typeof para === "function") {
            func = para;
            para = '';
        }

        // url 拼接
        url = `${vue.config.reqUrl}:${vue.config.reqPort}${url}`;

        // 发起请求
        Vue.prototype.axios.get(url, {
            params: para
        })
            .then(
                res => {
                    if (res.data.code === 200) {
                        func(res.data);
                    } else {
                        func(res.data);
                        vue.$notify.error({
                            title: '错误',
                            message: res.data.message
                        });
                    }
                },
                res => {
                    console.error(res);
                }
            )
    },
    post(url, para, func = {
        success() {
        },
        error() {
        }
    }, notice) {

        // url 拼接
        url = `${vue.config.reqUrl}:${vue.config.reqPort}${url}`;

        // 发起请求
        Vue.prototype.axios.post(url, para)
            .then(
                res => {
                    // 200 成功
                    // 400 失败
                    // 500 token无效

                    if (func.error === undefined) func.error = () => {
                    };

                    // 根据 code 执行对应 func
                    if (res.data.code === 200) {
                        // 操作成功
                        func.success(res.data);

                        if (notice === 'notice') {
                            vue.$notify({
                                title: '成功',
                                message: res.data.message,
                                type: 'success'
                            });
                        }

                    } else {
                        // 操作失败
                        func.error(res.data);
                        vue.$notify.error({
                            title: '错误',
                            message: res.data.message
                        });
                    }
                },
                res => {
                    console.error(res);
                }
            )
    },
    delete(url, para, func = {
        success() {
        },
        error() {
        }
    }, notice) {

        // url 拼接
        url = `${vue.config.reqUrl}:${vue.config.reqPort}${url}`;

        // 发起请求
        Vue.prototype.axios.delete(url, {data: para})
            .then(
                res => {
                    // 200 成功
                    // 400 失败
                    // 500 token无效

                    if (func.error === undefined) func.error = () => {
                    };

                    // 根据 code 执行对应 func
                    if (res.data.code === 200) {
                        // 操作成功
                        func.success(res.data);

                        if (notice === 'notice') {
                            vue.$notify({
                                title: '成功',
                                message: res.data.message,
                                type: 'success'
                            });
                        }

                    } else {
                        // 操作失败
                        func.error(res.data);
                        vue.$notify.error({
                            title: '错误',
                            message: res.data.message
                        });
                    }
                },
                res => {
                    console.error(res);
                }
            )
    }
};

// 公用方法
export default class index {

    /**
     * 对象数据克隆
     * @obj             {object}    需要缓存的对象
     * @return          {object}    与原对象无关联的新对象
     */
    static cloneCache(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * 数组升序排序
     * @value           {array}     value
     * @label           {array}     label
     * @return          {object}    处理结果
     */
    static arrUp(value, label) {
        let length = value.length;

        for (let x = 0; x < length; x++) {
            for (let y = x + 1; y < length; y++) {
                let a = parseInt(value[x]),
                    b = parseInt(value[y]),
                    c = label[x],
                    d = label[y];
                if (a < b) {
                    value[x] = a;
                    value[y] = b;
                    label[x] = c;
                    label[y] = d;
                } else {
                    value[x] = b;
                    value[y] = a;
                    label[x] = d;
                    label[y] = c;
                }
            }
        }
        return {
            value: value,
            label: label
        }
    }

    /**
     * AES 加密
     * @str             {string}    需要加密的字符串
     * @key             {string}    加密 key
     * @iv              {string}    加密向量
     * @return          {string}    处理结果
     */
    static encrypt(str, key, iv) {
        //密钥16位
        key = CryptoJS.enc.Utf8.parse(key);
        //加密向量16位
        iv = CryptoJS.enc.Utf8.parse(iv);
        let encrypted = CryptoJS.AES.encrypt(str, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.ZeroPadding
        });
        return encrypted.toString()
    }

    /**
     * AES 解密
     * @str             {string}    需要解密的字符串
     * @key             {string}    加密 key
     * @iv              {string}    加密向量
     * @return          {string}    处理结果
     */
    static decrypt(str, key, iv) {
        //密钥16位
        key = CryptoJS.enc.Utf8.parse(key);
        //加密向量16位
        iv = CryptoJS.enc.Utf8.parse(iv);
        let decrypted = CryptoJS.AES.decrypt(str, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.ZeroPadding
        });
        return decrypted.toString(CryptoJS.enc.Utf8)
    }

    /**
     * 数组替换 Key
     * @arr             {array}     传入数组
     * @oldKey          {string}    需要被替换的 key
     * @newKey          {string}    新 key
     * @return          {array}     处理结果
     */
    static replaceKey(arr, oldKey, newKey) {
        let newArr = [],
            keys = Object.keys(arr[0]);

        for (let val of arr) {
            let temp = {};
            for (let key of keys) {
                key === oldKey ? temp[newKey] = val[key] : temp[key] = val[key]
            }
            newArr.push(temp)
        }
        return newArr
    }

    /**
     * 时间格式化 s
     */
    static formatTime(value, unit) {
        if (!value) return '0 秒';

        switch (unit) {
            case 's':
                return formatSecond(value);
        }

        function formatSecond(value) {
            let theTime = parseInt(value),      // s
                theTime1 = 0,                   // m
                theTime2 = 0;                   // h

            if (theTime > 60) {
                theTime1 = parseInt(theTime / 60);
                theTime = parseInt(theTime % 60);
                if (theTime1 > 60) {
                    theTime2 = parseInt(theTime1 / 60);
                    theTime1 = parseInt(theTime1 % 60);
                }
            }

            let result = parseInt(theTime) ? "" + parseInt(theTime) + "秒" : '';

            if (theTime1 > 0) {
                result = "" + parseInt(theTime1) + "分钟" + result;
            }
            if (theTime2 > 0) {
                result = "" + parseInt(theTime2) + "小时" + result;
            }

            return result;
        }
    }

    /**
     * 流量格式化
     */
    static formatFlow(value, unit) {
        if (!value) return '0 B';

        switch (unit) {
            case 'b':
                return formatB(value);
        }

        function formatB(value) {
            switch (true) {
                case value < Math.pow(1024, 1):
                    return (value / Math.pow(1024, 0)).toFixed(2) + ' B';
                case value >= Math.pow(1024, 1) && value < Math.pow(1024, 2):
                    return (value / Math.pow(1024, 1)).toFixed(2) + ' KB';
                case value >= Math.pow(1024, 2) && value < Math.pow(1024, 3):
                    return (value / Math.pow(1024, 2)).toFixed(2) + ' MB';
                case value >= Math.pow(1024, 3) && value < Math.pow(1024, 4):
                    return (value / Math.pow(1024, 3)).toFixed(2) + ' GB';
                case value >= Math.pow(1024, 4) && value < Math.pow(1024, 5):
                    return (value / Math.pow(1024, 4)).toFixed(2) + ' TB';
            }
        }
    }

    /**
     * 时间格式化
     * @data                        传入参数
     * @format.now      {string}    传入参数类型      object || yy-MM-dd || timestamp
     * @format.res      {string}    输出参数类型      string(年月日) || yy-MM-dd || yy-MM-dd HH:mm:ss
     * @return          {string}    处理结果
     * */
    static timeTransform(data, format) {
        let y = '',     // 年
            M = '',     // 月
            W = '',     // 周
            d = '',     // 日
            H = '',     // 时
            m = '',     // 分
            s = '';     // 秒

        let add0 = (str) => {
            str += '';
            if (str.length === 1) str = 0 + str;
            return str;
        };

        switch (format.now) {
            case 'object':
                y = data.getFullYear();
                M = data.getMonth() + 1;
                W = data.getDay();
                d = data.getDate();
                H = data.getHours();
                m = data.getMinutes();
                s = data.getSeconds();
                break;
            case 'yy-MM-dd':
                y = parseInt(data.split('-')[0]);
                M = parseInt(data.split('-')[1]);
                d = parseInt(data.split('-')[2]);
                break;
            case 'timestamp':
                if ((data + '').length === 10) data = data * 1000;
                data = new Date(data);
                y = data.getFullYear();
                M = data.getMonth() + 1;
                W = data.getDay();
                d = data.getDate();
                H = data.getHours();
                m = data.getMinutes();
                s = data.getSeconds();
                break;
        }

        switch (format.res) {
            case 'yy-MM-dd':
                return `${y}-${add0(M)}-${add0(d)}`;
            case 'HH:mm:ss':
                return `${add0(H)}:${add0(m)}:${add0(s)}`;
            case 'yy-MM-dd HH:mm:ss':
                return `${y}-${add0(M)}-${add0(d)} ${add0(H)}:${add0(m)}:${add0(s)}`;
            case 'string':
                return (() => {
                    let str = '';
                    if (y) str += `${y}年`;
                    if (M) str += `${M}月`;
                    if (d) str += `${d}日`;
                    return str;
                })();
        }
    }

    /**
     * list 结构转 tree 结构
     * @list            {array}     传入数据
     * @field.label     {string}    传入 label 字段
     * @field.value     {string}    传入 value 字段
     * @return          {array}     处理结果
     */
    static list2tree(list, field) {
        // 替换 key
        list = this.replaceKey(list, field.label, 'label');
        list = this.replaceKey(list, field.value, 'value');

        let pidGroup = [];

        for (let item of list) {
            if (pidGroup.indexOf(item.pid) === -1) pidGroup.push(item.pid);
        }

        for (let item of list) {
            if (pidGroup.indexOf(item.value) !== -1) item.children = [];
        }

        function Tree(data) {
            this.tree = data || [];       // 数据
            this.groups = {};             // 分组
        }

        Tree.prototype = {
            init(pid) {
                this.group();
                return this.getData(this.groups[pid]);
            },
            group() {
                for (let val of this.tree) {
                    let pid = val.pid;
                    if (!this.groups[pid]) this.groups[pid] = [];
                    this.groups[pid].push(val);
                }
            },
            getData(info) {
                if (!info) return;
                let children = [];
                for (let val of info) {
                    if (val.children !== undefined) val.children = [].concat(this.getData(this.groups[val.value]));
                    children.push(val);
                }
                return children;
            }
        };

        // 结构转化
        let treeData = new Tree(list).init(0);

        // 忽略 /元素
        treeData = treeData[0].children;

        return treeData;
    }

    /**
     * 时间选择器快捷选项
     * @type            {string}    取值类型         range || single
     */
    static pickerOptions(type) {
        const end = new Date();
        const start = new Date();
        const date = new Date();

        const options = {
            single: {
                shortcuts: [{
                    text: '今天',
                    onClick(picker) {
                        picker.$emit('pick', new Date());
                    }
                }, {
                    text: '昨天',
                    onClick(picker) {
                        date.setTime(date.getTime() - 3600 * 1000 * 24);
                        picker.$emit('pick', date);
                    }
                }, {
                    text: '一周前',
                    onClick(picker) {
                        date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', date);
                    }
                }]
            },
            range: {
                shortcuts: [
                    {
                        text: '最近一周',
                        onClick(picker) {
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近一个月',
                        onClick(picker) {
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近三个月',
                        onClick(picker) {
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }
                ]
            }
        };
        return options[type]
    }

    /**
     * 校验图表数据是否为空
     * @chart           {object}    图表对象
     * @data            {array}     图表数据
     */
    static checkChartData(chart, data) {
        let status = true,
            option = {
                title: {
                    text: "当前暂无数据，请切换查询条件",
                    textStyle: {
                        color: '#303133',
                        fontSize: '16'
                    },
                },
            };
        if (!data || data.length === 0) {
            status = false;
            chart.setOption(option, true);
        }
        return status;
    }

    /**
     * Element Form 校验规则
     * @type            {string}    规则类型
     */
    static ruleLib(type) {
        const rules = {
            // 非空校验
            blank: (rule, value, callback) => {
                if (!value) {
                    callback(new Error('该字段为必填项目'));
                } else {
                    callback();
                }
            },
            // 产品名称
            productName: (rule, value, callback) => {
                if (!value) {
                    callback(new Error('该字段为必填项目'));
                } else {
                    let status;
                    for (let val of store.state.options.products) {
                        status = val.label === value;
                    }
                    return status ? callback(new Error('已存在该产品名称')) : callback();
                }
            }
        };
        return rules[type];
    }

    /**
     * 匹配字段在表格中最小宽度
     * @field           {string}    传入字段
     * @return          {number}    字段宽度
     */
    static getFieldWidth(field) {
        return fieldMap.get(field);
    }

    /**
     * 关键词特殊样式
     * @str             {string}    查询字符串
     * @keyword         {string}    关键词
     * @style           {string}    样式              默认为 font-weight:600; color:#F56C6C
     * @return          {html}      带有样式的 HTML
     * */
    static keywordStyle(
        string,
        keyword,
        style = 'font-weight:600;color:#F56C6C'
    ) {
        return string.replace(new RegExp(keyword, 'g'), `<span style="${style}">${keyword}</span>`);
    }
}