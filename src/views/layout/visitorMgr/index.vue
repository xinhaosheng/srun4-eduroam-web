<template>
    <div>
        <!-- Title -->
        <el-row class="row">
            <h3 class="module-title">访客管理</h3>
        </el-row>
        <!-- Search -->
        <el-row class="row" :gutter="20">
            <el-col :span="4">
                <el-input v-model.trim="user_name"
                          placeholder="账号"
                          size="small"
                          @keyup.enter.native="getData"
                          clearable>
                </el-input>
            </el-col>
            <el-col :span="4">
                <el-input v-model.trim="user_real_name"
                          placeholder="姓名"
                          size="small"
                          @keyup.enter.native="getData"
                          clearable>
                </el-input>
            </el-col>
            <el-col :span="6">
                <!-- 模糊搜索开关 -->
                <el-switch v-model="like"
                           class="switch sm"
                           active-color="#409EFF"
                           inactive-color="#E6A23C"
                           active-text="精确搜索"
                           inactive-text="模糊搜索">
                </el-switch>
            </el-col>
            <el-col :span="10">
                <el-row type="flex" justify="end">
                    <el-button type="primary"
                               size="small"
                               icon="icon
                               ion-md-search"
                               @click="getData">立即搜索
                    </el-button>
                    <el-button type="primary"
                               size="small"
                               icon="icon ion-md-add"
                               @click="addVisitorClick">添加访客
                    </el-button>
                    <el-button type="info"
                               size="small"
                               icon="icon ion-md-options"
                               @click="status.proMode = !status.proMode">高级选项
                    </el-button>
                    <el-button type="warning"
                               size="small"
                               icon="icon ion-md-list-box"
                               @click="fieldSort('open')">字段排序
                    </el-button>
                </el-row>
            </el-col>
        </el-row>
        <!-- ProMode -->
        <transition name="el-zoom-in-top">
            <el-row class="row" :gutter="20" v-show="status.proMode">
                <el-col :span="4">
                    <el-input v-model.trim="user_domain"
                              placeholder="域名"
                              size="small"
                              @keyup.enter.native="getData"
                              clearable>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-select v-model="products_id"
                               clearable
                               placeholder="选择产品"
                               size="small">
                        <el-option v-for="item in $store.state.options.products"
                                   :label="item.label"
                                   :value="item.value"
                                   :key="item.value">
                        </el-option>
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-select v-model="user_available"
                               clearable
                               placeholder="用户状态"
                               size="small">
                        <el-option label="正常" value="0"></el-option>
                        <el-option label="禁用" value="1"></el-option>
                        <el-option label="停机保号" value="2"></el-option>
                        <el-option label="暂停" value="3"></el-option>
                        <el-option label="未开通" value="4"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-select v-model="cert_type"
                               placeholder="证件类型"
                               clearable
                               size="small">
                        <el-option label="身份证" value="1"></el-option>
                        <el-option label="学生证" value="2"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-input v-model.trim="vlan_id"
                              placeholder="证件号码"
                              size="small"
                              @keyup.enter.native="getData"
                              clearable></el-input>
                </el-col>
            </el-row>
        </transition>
        <!-- Table -->
        <el-row class="row table-container">
            <el-table :data="tableData"
                      v-loading="status.loading"
                      stripe
                      @selection-change="handleSelectionChange">
                <el-table-column type="index" :index="indexMethod"></el-table-column>
                <el-table-column v-for="(item,index) in fields"
                                 show-overflow-tooltip
                                 :key="index"
                                 :label="item.label"
                                 :min-width="tools.getFieldWidth(item.value)">
                    <template slot-scope="scope">
                        <!-- 若渲染项目为 user_name -->
                        <el-link v-if="item.value === 'user_name'"
                                 type="primary"
                                 @click="viewInfo(scope.row.user_name)">{{scope.row[item.value]}}
                        </el-link>
                        <!-- 其他渲染项目 -->
                        <span v-else v-html="scope.row[item.value]"></span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="160">
                    <template slot-scope="scope">
                        <el-button type="primary"
                                   size="small"
                                   :disabled="scope.row.status === '1'"
                                   @click="viewInfo(scope.row.user_name)">查看
                        </el-button>
                        <el-button type="warning"
                                   size="small"
                                   :disabled="scope.row.status === '1'"
                                   @click="update(scope.$index, scope.row)">编辑
                        </el-button>
                        <el-button type="danger"
                                   size="small"
                                   @click.stop="logout(scope.$index, scope.row)"
                                   :disabled="scope.row.status === '1'">销户
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <!-- Pagination -->
        <el-row class="row">
            <el-pagination @size-change="changePageSize"
                           @current-change="changePageNow"
                           :current-page="page.now"
                           :page-sizes="[5, 10, 20]"
                           :page-size="page.size"
                           background
                           layout="total, sizes, prev, pager, next, jumper"
                           :total="page.total">
            </el-pagination>
        </el-row>
        <!-- Dialog-Sort -->
        <el-dialog title="显示字段排序"
                   :visible.sync="status.useSort"
                   width="600px"
                   @closed="formReset">
            <draggable ref="draggable"/>
            <el-row slot="footer" class="dialog-footer btn-group">
                <el-col :span="10">
                    <!-- 添加 -->
                    <el-button type="primary" size="small" @click="fieldSort">确定</el-button>
                </el-col>
                <el-col :span="10" :offset="4">
                    <!-- 取消 -->
                    <el-button type="danger" size="small" @click="formReset">取消</el-button>
                </el-col>
            </el-row>
        </el-dialog>
        <!-- add visitor -->
        <el-dialog :title="formTitle"
                   :visible.sync="status.addVisitor"
                   v-if="status.addVisitor"
                   @closed="addReset"
                   width="700px">
            <add ref="add"
                 v-bind:addform="addform"
                 v-bind:obind="true"
                 v-on:hiddenVisitor="status.addVisitor = false"
                 v-on:getData="getData"/>
        </el-dialog>
        <!-- visitorInfo -->
        <el-dialog title="访客详情" width="800px" :visible.sync="status.infoVisible">
            <info ref="info" v-bind:info="infoData"/>
        </el-dialog>
    </div>
</template>

<script>
    import draggable from '@/components/draggable';
    import add from './addVisitor';
    import info from './visitorInfo';

    export default {
        name: "online",
        components: {
            draggable,
            add,
            info
        },
        data() {
            return {
                formTitle: "添加访客",
                user_name: "",
                ip: "",
                user_real_name: "",
                user_domain: "",
                products_id: "",
                user_available: "",
                mac_auth: false,
                cert_type: "",
                timeRange: "",
                vlan_id: "",                //搜索选项
                like: true,
                showNow: {value: 'times', label: '在线访客'},       // 当前展示项目
                fields: [],             //表格字段
                tableData: [],          // 表格数据
                status: {
                    loading: true,
                    proMode: false,
                    useSort: false,
                    addVisitor: false,
                    infoVisible: false
                },
                search: {
                    type: 'school_name',
                    value: ''
                },
                page: {
                    now: 1,
                    size: 10,
                    total: 0
                },
                multipleSelection: [],           // 表格选中数据
                infoData: [],                    // 操作行的值
                addform: {},                     //添加编辑里面的表单
                api: this.config.api.visitorMgr.search
            };
        },
        methods: {
            //获取数据
            getData() {
                this.status.loading = true;
                let url = this.api,
                    para = {
                        user_name: this.user_name,
                        ip: this.ip,
                        user_real_name: this.user_real_name,
                        products_id: this.products_id,
                        user_available: this.user_available,
                        mac_auth: this.mac_auth ? 1 : 0,
                        cert_type: this.cert_type,
                        like: this.like ? null : 1,
                        start_time: this.timeRange[0],
                        stop_time: this.timeRange[1],
                        per_page: this.page.size,
                        page: this.page.now
                    };
                request.get(url, para, res => {
                    if (res.data.length) {
                        this.tableData = res.data;
                        this.page.total = res.count;
                    } else {
                        this.tableData = [];
                        this.page.total = 0;
                    }
                    this.status.loading = false;
                });

            },
            // 日期范围转文字
            timeRange2text() {
                let start = this.tools.timeTransform(this.timeRange[0], {
                        now: 'yy-MM-dd',
                        res: 'string'
                    }),
                    end = this.tools.timeTransform(this.timeRange[1], {
                        now: 'yy-MM-dd',
                        res: 'string'
                    });

                this.timeRangeText = start + ' 至 ' + end;
            },
            // 改变当前页码
            changePageSize(val) {
                this.page.size = val;
                this.getData();
            },
            // 改变单页显示数据条数
            changePageNow(val) {
                this.page.now = val;
                this.getData();
            },
            // 设置表格索引
            indexMethod(index) {
                return index + 1;
            },
            // 表单重置
            formReset() {
                this.status.useSort = false;
            },
            // 字段排序
            fieldSort(action) {
                if (action === 'open') {
                    // 开启面板
                    this.status.useSort = !this.status.useSort;
                    // 发送获取字段请求
                    let url = this.config.api.all.getField,
                        para = {
                            flag: 'visitor',
                        };
                    request.get(url, para, res => {
                        // 拖动组件初始化
                        this.$refs.draggable.init(res.data);
                    });
                } else {
                    let url = this.config.api.all.updateField,
                        para = {
                            flag: 'visitor',
                            // 从拖动组件中获取选择结果
                            updateField: this.$refs.draggable.getUpdateField()
                        };
                    request.post(url, para, {
                        success: () => {
                            this.fields = this.$refs.draggable.getChoseField();
                            this.getData();
                            this.formReset();
                        }
                    }, 'notice');
                }
            },
            // 获取字段
            getFields() {
                let url = this.config.api.all.getField,
                    para = {
                        flag: 'visitor'
                    };
                request.get(url, para, res => {
                    //生成前端表格字段
                    this.fields = res.data.select;
                    this.getData();
                });
            },
            // 关闭清空表单数据
            addReset() {
                this.$refs.add.resetForm('form');
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            // 操作里的查看按钮
            viewInfo(username) {
                this.$router.push({
                    path: '/visitorMgr/visitorInfo',
                    query: {
                        user_name: username
                    }
                })
            },
            //添加访客按钮
            addVisitorClick() {
                this.status.addVisitor = true;
                this.addform = {}
            },
            // 编辑按钮
            update(index, row) {
                this.formTitle = "编辑访客信息";
                let url = this.config.api.visitorMgr.show,
                    para = {
                        user_name: row.user_name
                    };
                request.get(url, para, res => {
                    this.addform = res.data;
                    this.status.addVisitor = true;
                })
            },
            logout(index, row) {
                this.$confirm('此操作将无法撤销, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let url = this.config.api.visitorMgr.delete,
                        para = {
                            user_name: row.user_name
                        };
                    request.delete(url, para, {
                        success: () => {
                            this.getData();
                        }
                    }, 'notice');
                });
            }
        },
        mounted() {
            this.getFields();
        }
    };
</script>

<style scoped lang="less">
    .el-table {
        .el-button--small {
            padding: 5px 7px;
        }
    }
</style>
