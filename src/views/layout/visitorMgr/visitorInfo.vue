<template>
    <div>
        <el-row :gutter="20" class="row">
            <!-- 用户信息 -->
            <el-col :span="12">
                <el-card class="baseInfo"
                         v-loading="status.loading.userInfo"
                         :body-style="{ padding: '0px' }">
                    <el-row class="card-header">
                        <el-row class="container">
                            <!-- 用户名 -->
                            <h1 class="username">{{userInfo.user_name}}</h1>
                            <!-- 真实姓名 -->
                            <h2 class="realName">{{userInfo.user_real_name}}</h2>
                        </el-row>
                    </el-row>
                    <el-row class="card-content">
                        <ul>
                            <li>
                                <div class="content">
                                    <i class="icon ion-md-laptop"></i>
                                    <span class="label">使用域名</span>
                                    <span class="value">{{userInfo.user_domain}}</span>
                                </div>
                            </li>
                            <li>
                                <div class="content">
                                    <i class="icon ion-md-home"></i>
                                    <span class="label">所属单位</span>
                                    <span class="value">{{userInfo.school_name}}</span>
                                </div>
                            </li>
                            <li>
                                <div class="content">
                                    <i class="icon ion-md-person"></i>
                                    <span class="label">更新人</span>
                                    <span class="value">{{userInfo.mgr_name_update}}</span>
                                </div>
                            </li>
                            <li>
                                <div class="content">
                                    <i class="icon ion-md-person-add"></i>
                                    <span class="label">创建人</span>
                                    <span class="value">{{userInfo.mgr_name_create}}</span>
                                </div>
                            </li>
                        </ul>
                    </el-row>
                </el-card>
            </el-col>
            <!-- 操作面板 -->
            <el-col :span="12">
                <el-card class="cardView operate" v-loading="status.loading.userInfo">
                    <div slot="header">
                        <i class="icon ion-md-apps"></i>
                        <h3 class="title">功能</h3>
                    </div>
                    <el-form label-width="100px" label-position="left" size="small">
                        <el-form-item label="账号操作">
                            <el-button type="warning" @click="changeUserInfo">编辑</el-button>
                            <el-button type="danger" @click="logout">销户</el-button>
                        </el-form-item>
                        <el-form-item label="用户状态">
                            <el-radio-group v-model="form.user_available" @change="changeUserStatus">
                                <el-radio-button label="0">正常</el-radio-button>
                                <el-radio-button label="1">禁用</el-radio-button>
                                <el-radio-button label="3">暂停</el-radio-button>
                                <el-radio-button label="4">未开通</el-radio-button>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="过期日期">
                            <el-date-picker v-model="form.date"
                                            value-format="yyyy-MM-dd"
                                            type="date"
                                            placeholder="空白代表永不过期"
                                            @change="changeExpiredDate">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item label="最大连线数">
                            <el-input-number v-model="form.num"
                                             :step="1"
                                             :min="0"
                                             :max="10"
                                             @change="changeMaxLinkNum">
                            </el-input-number>
                        </el-form-item>
                    </el-form>
                </el-card>
            </el-col>
        </el-row>
        <!-- 在线信息 -->
        <el-row class="row">
            <el-card class="cardView" :body-style="{ 'padding-top': '0px' }">
                <div slot="header">
                    <i class="icon ion-md-desktop"></i>
                    <h3 class="title">在线信息</h3>
                </div>
                <el-table :data="onlineData" stripe v-loading="status.loading.online">
                    <el-table-column v-for="(item,index) in onlineFields"
                                     :key="index"
                                     :prop="item.value"
                                     :label="item.name"
                                     :min-width="item.width"
                                     :show-overflow-tooltip="item.showTips">
                    </el-table-column>
                    <el-table-column label="操作" width="80">
                        <template>
                            <el-button type="primary" size="small">操作</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </el-row>
        <!-- 已订购产品 -->
        <el-row class="row">
            <el-card class="cardView" :body-style="{ 'padding-top': '0px' }">
                <div slot="header">
                    <i class="icon ion-md-cube"></i>
                    <h3 class="title">已订购产品</h3>
                </div>
                <el-table :data="orderData" stripe v-loading="status.loading.product">
                    <el-table-column v-for="(item,index) in orderFields"
                                     :key="index"
                                     :prop="item.value"
                                     :label="item.name"
                                     :min-width="item.width"
                                     :show-overflow-tooltip="item.showTips">
                    </el-table-column>
                    <el-table-column label="操作" fixed="right" width="100">
                        <template slot-scope="scope">
                            <el-button v-if="scope.row.user_available === '0'" type="danger" size="mini"
                                       @click="disOrder(scope.row.products_id)">禁用产品
                            </el-button>
                            <el-button v-if="scope.row.user_available === '1'" type="primary" size="mini"
                                       @click="startOrder(scope.row.products_id)">启用产品
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </el-row>
        <!-- 用户日志 -->
        <el-row class="row">
            <el-card class="cardView">
                <div slot="header">
                    <i class="icon ion-md-paper"></i>
                    <h3 class="title">用户日志</h3>
                </div>
                <el-row>
                    <el-button type="primary"
                               size="small"
                               @click="routerToLog('operate',{target:user_name})">操作日志
                    </el-button>
                    <el-button type="primary"
                               size="small"
                               @click="routerToLog('authenticate',{user_name:user_name})">认证日志（本月）
                    </el-button>
                    <el-button type="primary"
                               size="small"
                               @click="routerToLog('detail',{user_name:user_name})">上网明细（本月）
                    </el-button>
                </el-row>
            </el-card>
        </el-row>
        <!-- update visitor -->
        <el-dialog title="修改访客信息"
                   :visible.sync="status.addVisitor"
                   v-if="status.addVisitor"
                   width="700px">
            <updates ref="add" v-bind:addform="addform"
                     v-on:hiddenVisitor="status.addVisitor = false"/>
        </el-dialog>
    </div>
</template>

<script>
    import updates from './addVisitor';

    export default {
        components: {updates},
        props: ['info'],
        name: "add",
        data() {
            return {
                status: {
                    loading: {
                        userInfo: true,
                        online: true,
                        product: true
                    },
                    addVisitor: false
                },
                user_name: this.$route.query.user_name,
                user_real_name: "用户名",
                onlineData: [],
                orderData: [],
                onlineFields: [
                    {name: 'IP地址', value: 'ip', width: 160},
                    {name: 'MAC地址', value: 'mac', width: 160},
                    {name: '入流量', value: 'rp', width: 120, showTips: true},
                    {name: '出流量', value: 'cp', width: 120, showTips: true},
                    {name: '上线时间', value: 'time', width: 160}
                ],
                orderFields: [
                    {name: '控制组编号', value: 'products_id', width: 100},
                    {name: '控制组名称', value: 'products_name', width: 160, showTips: true},
                    {name: '已用流量', value: 'sum_bytes', width: 160},
                    {name: '已用时长', value: 'sum_times', width: 160},
                    {name: '使用次数', value: 'sum_seconds', width: 80},
                    {name: '消费额', value: 'user_charge', width: 80},
                    {name: '结算日期', value: 'checkout_date', width: 160},
                    {name: '到期日期', value: 'expire_time', width: 160}
                ],
                activeName: "01",                // 用户日志的选项面板
                form: {
                    user_available: '',
                    date: '',
                    num: ''
                },
                addform: {},                     // 添加编辑里面的表单
                userInfo: {}
            };
        },
        methods: {
            // 获取用户信息
            getUserInfo() {
                this.status.loading.userInfo = true;
                let url = this.config.api.visitorMgr.show,
                    para = {
                        user_name: this.$route.query.user_name
                    };
                request.get(url, para, res => {
                    this.userInfo = res.data;
                    this.form.user_available = res.data.user_available;
                    this.form.num = res.data.max_online_num;
                    this.form.date = res.data.user_expire_time;
                    this.status.loading.userInfo = false;
                })
            },
            // 获取已订购产品
            getUserProduct() {
                this.status.loading.product = true;
                let url = this.config.api.visitorMgr.users_packages,
                    para = {
                        user_name: this.$route.query.user_name
                    };
                request.get(url, para, res => {
                    this.orderData = res.data.data;
                    this.status.loading.product = false;
                })
            },
            // 销户
            logout() {
                this.$confirm('此操作将无法撤销, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let url = this.config.api.visitorMgr.delete,
                        para = {
                            user_name: this.user_name
                        };
                    request.delete(url, para, {
                        success: () => {
                            this.$router.go(-1)
                        }
                    }, 'notice');
                });
            },
            //禁用产品
            disOrder(id) {
                this.$confirm('此操作将导致用户无法使用该产品, 是否继续?', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let url = this.config.api.visitorMgr.dispro,
                        para = {
                            user_name: this.user_name,
                            products_id: id
                        };
                    request.post(url, para, {
                        success: () => {
                            this.getUserProduct();
                        }
                    }, 'notice');
                });
            },
            // 启用产品
            startOrder(id) {
                let url = this.config.api.visitorMgr.enpro,
                    para = {
                        user_name: this.user_name,
                        products_id: id
                    };
                request.post(url, para, {
                    success: () => {
                        this.getUserProduct();
                    }
                }, 'notice');
            },
            // 改变用户状态
            changeUserStatus(id) {
                let url = this.config.api.visitorMgr.stuctrl,
                    para = {
                        user_name: this.user_name,
                        user_available: id
                    };
                request.post(url, para, {
                    success: () => {
                        this.getUserInfo();
                    }
                }, 'notice');
            },
            // 修改账户过期日期
            changeExpiredDate(date) {
                let url = this.config.api.visitorMgr.updatevisitor,
                    para = {
                        user_name: this.user_name,
                        user_expire_time: date
                    };
                request.post(url, para, {
                    success: () => {
                        this.getUserInfo();
                    }
                }, 'notice');
            },
            // 修改最大连接数
            changeMaxLinkNum(num) {
                let url = this.config.api.visitorMgr.maxnum,
                    para = {
                        user_name: this.user_name,
                        max_online_num: num
                    };
                request.post(url, para, {
                    success: () => {
                        this.getUserInfo();
                    }
                }, 'notice');
            },
            // 编辑账户信息
            changeUserInfo() {
                let url = this.config.api.visitorMgr.show,
                    para = {
                        user_name: this.user_name
                    };
                request.get(url, para, res => {
                    this.addform = res.data;
                    this.status.addVisitor = true;
                })
            },
            // 查看日志
            routerToLog(path, data) {
                this.$router.push({
                    path: '/logMgr/' + path,
                    query: data
                });
            }
        },
        mounted() {
            this.getUserInfo();
            this.getUserProduct();
            // 获取在线信息
            (() => {
                this.status.loading.online = true;
                let url = this.config.api.visitorMgr.equipment,
                    para = {
                        user_name: this.$route.query.user_name
                    };
                request.get(url, para, res => {
                    this.onlineData = res.data.data;
                    this.status.loading.online = false;
                })
            })();
        }
    };
</script>

<style scoped lang="less">
    .baseInfo {
        border: 0;
        .card-header {
            position: relative;
            height: 100px;
            background: linear-gradient(120deg, #409EFF - #333, #409EFF);
            box-shadow: 0 2px 2px 0 rgba(0, 0, 0, .16), 0 0 0 1px rgba(0, 0, 0, .08);
            z-index: 10;
            .container {
                position: absolute;
                top: 50%;
                left: 20px;
                transform: translateY(-50%);
            }
            .username, .realName {
                color: #fff;
            }
            .username {
                font-size: 1.75rem;
                line-height: 30px;
                margin-bottom: 10px;
                font-weight: 400;
            }
            .realName {
                font-size: 1.2rem;
                line-height: 20px;
            }
        }
        .card-content {
            li {
                padding: 0 20px;
                box-sizing: border-box;
                &:hover {
                    background: #f6f6f6;
                }
            }
            .content {
                height: 50px;
                line-height: 49px;
                box-sizing: border-box;
                border-bottom: 1px solid #EBEEF5;
            }
            .icon {
                margin-right: 10px;
                color: #409EFF;
            }
            .label {
                display: inline-block;
                width: 100px;
                font-weight: 600;
                color: #606266;
            }
            .value {
                color: #606266;
            }
        }
    }

    .cardView {
        &.operate {
            height: 300px;
        }
        &.noPadding {
            .el-card__body {
                padding: 0;
            }
        }
        .icon, .title {
            display: inline-block;
        }
        .icon {
            margin-right: 15px;
        }
        .title {
            font-size: 1rem;
        }
    }

    /* 修改阴影样式 */
    .el-card.is-always-shadow {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3)
    }
</style>
