<template>
    <div>
        <el-row class="row">
            <h3 class="module-title">操作日志</h3>
        </el-row>
        <el-row class="row">
            <el-col :span="6">
                <el-row class="row">
                    <el-input v-model.trim="search.operator"
                              size="small"
                              placeholder="操作员"
                              clearable
                              @keyup.enter.native="getData">
                    </el-input>
                </el-row>
                <el-row class="row">
                    <el-input v-model.trim="search.target"
                              size="small"
                              placeholder="操作目标"
                              clearable
                              @keyup.enter.native="getData">
                    </el-input>
                </el-row>
                <el-row class="row">
                    <el-input v-model.trim="search.opt_ip"
                              size="small"
                              placeholder="操作 IP"
                              clearable
                              @keyup.enter.native="getData">
                    </el-input>
                </el-row>
                <el-row class="row">
                    <el-date-picker class="fill-width"
                                    v-model="search.start_time"
                                    size="small"
                                    type="datetime"
                                    placeholder="选择开始时间"
                                    align="left"
                                    value-format="yyyy-MM-dd HH:mm:ss"
                                    :picker-options="tools.pickerOptions('single')"
                                    @change="getData">
                    </el-date-picker>
                </el-row>
                <el-row class="row">
                    <el-date-picker class="fill-width"
                                    v-model="search.stop_time"
                                    size="small"
                                    type="datetime"
                                    placeholder="选择结束时间"
                                    align="left"
                                    value-format="yyyy-MM-dd HH:mm:ss"
                                    :picker-options="tools.pickerOptions('single')"
                                    @change="getData">
                    </el-date-picker>
                </el-row>
                <el-row class="row">
                    <el-select class="fill-width"
                               v-model="search.action"
                               size="small"
                               clearable
                               placeholder="操作类型"
                               @change="getData">
                        <el-option v-for="(action,index) in actionList"
                                   :key="index"
                                   :label="action.label"
                                   :value="action.value">
                        </el-option>
                    </el-select>
                </el-row>
                <el-row class="row btn-group">
                    <el-col :span="10">
                        <el-button type="primary"
                                   size="small"
                                   @click="getData">查询
                        </el-button>
                    </el-col>
                    <el-col :span="10" :offset="4">
                        <el-button type="danger"
                                   size="small"
                                   @click="searchReset">重置
                        </el-button>
                    </el-col>
                </el-row>
            </el-col>
            <el-col :sm={span:16,offset:2}>
                <el-timeline>
                    <el-timeline-item v-for="(item,index) in timelineData"
                                      placement="top"
                                      :timestamp="item.time"
                                      icon='el-icon-more'
                                      :type="item.type"
                                      :color="item.color"
                                      size="large"
                                      :key="index">
                        <el-card>
                            <h4>{{item.show}}</h4>
                        </el-card>
                    </el-timeline-item>
                </el-timeline>
                <el-row class="loading">
                    <el-link type="primary" @click="getData('more')">
                        <span v-show="!status.loading">{{ status.noData ? '当前暂无数据，请切换查询条件' : '点击加载更多'}}</span>
                        <span v-show="status.loading">正在加载中</span>
                        <span class="icon el-icon-loading" v-show="status.loading"></span>
                    </el-link>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    export default {
        name: "Operate",
        data() {
            return {
                status: {
                    loading: true,
                    noData: false,
                },
                search: {
                    operator: '',
                    target: '',
                    opt_ip: '',
                    action: ''
                },
                timelinePage: {
                    num: 1,
                    size: 10,
                },
                actionList: [
                    {
                        label: '添加',
                        value: 'add'
                    }, {
                        label: '修改',
                        value: 'edit'
                    }, {
                        label: '删除',
                        value: 'delete'
                    }, {
                        label: '缴费',
                        value: 'pay'
                    }, {
                        label: '自助缴费',
                        value: 'self-pay'
                    }, {
                        label: '退费',
                        value: 'refund'
                    }, {
                        label: '结算',
                        value: 'checkout'
                    }, {
                        label: '下线',
                        value: 'drop'
                    }, {
                        label: '导出',
                        value: 'export'
                    }, {
                        label: '取消产品',
                        value: 'cancelProduct'
                    }, {
                        label: '转移产品',
                        value: 'changeProduct'
                    }, {
                        label: '审核',
                        value: 'audit'
                    }, {
                        label: '激活',
                        value: 'activated'
                    }, {
                        label: '访客停止',
                        value: 'visitor_stop'
                    }
                ],
                timelineData: [],
                // 请求接口
                api: this.config.api.logMgr.operate
            }
        },
        methods: {
            // 获取数据
            getData(action) {
                // 开启 loading 状态
                this.status.loading = true;
                // 取消无数据的状态
                this.status.noData = false;
                // 若状态为查询更多数据，查询数据批次 +1
                if (action === 'more') this.timelinePage.num += 1;
                // 若由其他页面跳转而来
                if (this.$route.query) {
                    for (let key in this.$route.query) {
                        this.search[key] = this.$route.query[key]
                    }
                }
                // 请求参数配置
                let url = this.api.search,
                    para = {
                        username: this.$store.state.user,
                        pageSize: this.timelinePage.size,
                        page: this.timelinePage.num,
                        operator: this.search.operator,
                        target: this.search.target,
                        opt_ip: this.search.opt_ip,
                        action: this.search.action,
                        start_time: this.search.start_time ? this.search.start_time : undefined,
                        stop_time: this.search.stop_time ? this.search.stop_time : undefined
                    };
                // 发送请求
                request.get(url, para, res => {
                    this.status.noData = res.data.length === 0;
                    // 用于存放响应数据的临时数组
                    let tempArr = [];
                    // 处理响应数据
                    for (let val of res.data) {
                        // 存放处理结果的临时对象
                        let tempObj = {
                            // 根据 action 对应时间轴状态
                            type: (() => {
                                switch (val.action) {
                                    // add 增加 为 绿色
                                    case 'add' :
                                        return 'success';
                                    // delete 删除 为 红色
                                    case 'delete':
                                        return 'danger';
                                    // edit 修改 为 蓝色
                                    case 'edit':
                                        return 'primary';
                                    // 其余 action 全部为黄色
                                    default:
                                        return 'warning';
                                }
                            })(),
                            // content: JSON.parse(val.content),
                            // 时间戳 转化 年月日
                            time: this.tools.timeTransform(val.opt_time, {
                                now: 'timestamp',
                                res: 'string'
                            }),
                            show: val.showContent
                        };
                        // 判断是否为查询更多数据
                        action === 'more' ? this.timelineData.push(tempObj) : tempArr.push(tempObj);
                    }
                    // 若不是查询更多数据
                    if (action !== 'more') {
                        // 数据替换
                        this.timelineData = tempArr;
                        // 查询数据批次重置
                        this.timelinePage.num = 1;
                    }
                    // 关闭 loading 状态
                    this.status.loading = false;
                })
            },
            // 搜索重置
            searchReset() {
                this.search = {
                    operator: '',
                    target: '',
                    opt_ip: '',
                    start_time: '',
                    stop_time: '',
                    action_type: ''
                };
                this.getData();
            }
        },
        mounted() {
            if (this.$route.query) {
                for (let key in this.$route.query) {
                    this.search[key] = this.$route.query[key]
                }
            }
            this.getData();
        }
    }
</script>

<style scoped lang="less">
    .loading {
        text-align: center;
        .icon {
            margin-left: 10px;
        }
    }
</style>