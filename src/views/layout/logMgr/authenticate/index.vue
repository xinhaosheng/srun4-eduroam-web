<template>
    <div>
        <!-- Title -->
        <el-row class="row">
            <h3 class="module-title">认证日志</h3>
        </el-row>
        <!-- Search -->
        <el-row class="row search" :gutter="20">
            <el-col :span="4">
                <el-input v-model.trim="search.user_name"
                          clearable
                          size="small"
                          placeholder="账号"
                          @keyup.enter.native="searchData">
                </el-input>
            </el-col>
            <el-col :span="8">
                <el-date-picker class="fill-width"
                                value-format="yyyy-MM-dd"
                                v-model="search.timeRange"
                                size="small"
                                type="daterange"
                                :picker-options="tools.pickerOptions('range')"
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                align="left"
                                unlink-panels
                                @change="searchData">
                </el-date-picker>
            </el-col>
            <el-col :span="12">
                <el-row type="flex" justify="end">
                    <el-button type="primary"
                               size="small"
                               icon="icon ion-md-search"
                               @click="searchData">立即搜索
                    </el-button>
                    <el-button type="info"
                               size="small"
                               icon="icon ion-md-options"
                               @click="status.proMode = !status.proMode">高级选项
                    </el-button>
                    <el-button type="warning"
                               size="small"
                               icon="icon ion-md-funnel"
                               @click="fieldSort('open')">字段排序
                    </el-button>
                    <el-button type="success"
                               size="small"
                               icon="icon ion-md-document"
                               @click="download('excel')">导出 Excel
                    </el-button>
                </el-row>
            </el-col>
        </el-row>
        <!-- ProSearch -->
        <transition name="el-zoom-in-top">
            <el-row class="row proSearch" :gutter="20" v-show="status.proMode">
                <el-col :span="4">
                    <el-input v-model.trim="search.user_ip"
                              clearable
                              size="small"
                              placeholder="IP 地址"
                              @keyup.enter.native="searchData">
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-input v-model.trim="search.user_mac"
                              clearable
                              size="small"
                              placeholder="Mac 地址"
                              @keyup.enter.native="searchData">
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-select class="fill-width"
                               v-model="search.err_msg"
                               size="small"
                               clearable
                               filterable
                               placeholder="错误信息"
                               @change="searchData">
                        <el-option v-for="(item,index) in errorList"
                                   :key="index"
                                   :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </el-col>
            </el-row>
        </transition>
        <!-- Table -->
        <el-row class="row table-container">
            <el-table :data="tableData"
                      v-loading="status.loading"
                      stripe>
                <el-table-column type="index" :index="indexMethod"></el-table-column>
                <el-table-column v-for="(item,index) in tableField"
                                 :key="index"
                                 :label="item.label"
                                 :min-width="tools.getFieldWidth(item.value)">
                    <template slot-scope="scope">
                        <span>{{scope.row[item.value]}}</span>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <!-- Pagination -->
        <el-row class="row">
            <el-pagination @size-change="changePage('size',$event)"
                           @current-change="changePage('now',$event)"
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
                    <el-button type="primary"
                               size="small" @click="fieldSort">确定
                    </el-button>
                </el-col>
                <el-col :span="10" :offset="4">
                    <!-- 取消 -->
                    <el-button type="danger"
                               size="small" @click="formReset">取消
                    </el-button>
                </el-col>
            </el-row>
        </el-dialog>
    </div>
</template>

<script>
    import draggable from '@/components/draggable'

    export default {
        name: "Authenticate",
        data() {
            return {
                status: {
                    loading: true,
                    proMode: false,
                    useSort: false
                },
                search: {
                    user_name: '',
                    user_ip: '',
                    user_mac: '',
                    err_msg: ''
                },
                tableField: [],
                tableData: [],
                pickerOptions: {},
                errorList: [],
                page: {
                    now: 1,
                    size: 10,
                    total: 0
                },
                api: this.config.api.logMgr.authenticate,
                flag: this.config.api.logMgr.authenticate.flag
            }
        },
        methods: {
            // 查询数据
            searchData() {
                this.page.now = 1;
                this.getData();
            },
            // 获取数据
            getData() {
                this.status.loading = true;
                let url = this.api.search,
                    para = {
                        username: this.$store.state.user,
                        pageSize: this.page.size,
                        page: this.page.now,
                        user_name: this.search.user_name,
                        user_ip: this.search.user_ip,
                        user_mac: this.search.user_mac,
                        err_msg: this.search.err_msg,
                        start_time: this.search.timeRange ? this.search.timeRange[0] : undefined,
                        stop_time: this.search.timeRange ? this.search.timeRange[1] : undefined
                    };
                para.action = 'search';
                request.get(url, para, res => {
                    this.tableData = res.data;
                    this.page.total = res.count;
                    this.status.loading = false;
                });
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
                            flag: this.flag
                        };
                    request.get(url, para, res => {
                        // 拖动组件初始化
                        this.$refs.draggable.init(res.data);
                    });
                } else {
                    let url = this.config.api.all.updateField,
                        para = {
                            flag: this.flag,
                            // 从拖动组件中获取选择结果
                            updateField: this.$refs.draggable.getUpdateField()
                        };
                    request.post(url, para, {
                        success: () => {
                            this.tableField = this.$refs.draggable.getChoseField();
                            this.getData();
                            this.formReset();
                        }
                    }, 'notice');
                }
            },
            // 获取字段
            getField() {
                let url = this.config.api.all.getField,
                    para = {
                        flag: this.flag
                    };
                if (this.$route.query) {
                    for (let key in this.$route.query) {
                        this.search[key] = this.$route.query[key]
                    }
                }
                request.get(url, para, res => {
                    this.tableField = res.data.select;
                    this.getData();
                });
            },
            // 改变分页
            changePage(type, val) {
                this.page[type] = val;
                this.getData();
            },
            // 设置表格索引
            indexMethod(index) {
                return index + 1;
            },
            // 导出文件
            download(type) {
                let url = this.api.search + '?',
                    para = {
                        username: this.$store.state.user,
                        pageSize: this.page.size,
                        page: this.page.now,
                        user_name: this.search.user_name,
                        user_ip: this.search.user_ip,
                        user_mac: this.search.user_mac,
                        err_msg: this.search.err_msg,
                        start_time: this.search.timeRange ? this.search.timeRange[0] : undefined,
                        stop_time: this.search.timeRange ? this.search.timeRange[1] : undefined
                    };
                para.action = type;
                for (let key in para) {
                    if (!para[key]) continue;
                    url += `${key}=${para[key]}&`;
                }
                location = this.config.reqUrl + ':' + this.config.reqPort + url.substring(0, url.length - 1);
            }
        },
        mounted() {
            this.getField();
            (() => {
                let url = this.api.getError,
                    para = {
                        t: new Date().getTime()
                    };
                request.get(url, para, res => {
                    this.errorList = res.data;
                })
            })();
        },
        components: {
            draggable
        }
    }
</script>