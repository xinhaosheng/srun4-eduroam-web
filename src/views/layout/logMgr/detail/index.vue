<template>
    <div>
        <el-row class="row">
            <h3 class="module-title">上网明细</h3>
        </el-row>
        <!-- Search -->
        <el-row class="row" :gutter="20">
            <el-col :span="4">
                <el-input v-model.trim="search.user_name"
                          placeholder="账号"
                          clearable
                          size="small"
                          @keyup.enter.native="searchData">
                </el-input>
            </el-col>
            <el-col :span="8">
                <el-date-picker class="fill-width"
                                value-format="yyyy-MM-dd"
                                v-model="search.timeRange"
                                type="daterange"
                                align="left"
                                size="small"
                                unlink-panels
                                range-separator="至"
                                start-placeholder="上线日期"
                                end-placeholder="下线日期"
                                :picker-options="tools.pickerOptions('range')"
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
                    <el-dropdown @command="download">
                        <el-button type="success"
                                   size="small"
                                   icon="icon ion-md-document">
                            导出日志<i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="excel">Excel 格式</el-dropdown-item>
                            <el-dropdown-item command="csv">CSV 格式</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </el-row>
            </el-col>
        </el-row>
        <!-- Pro Search -->
        <transition name="el-zoom-in-top">
            <el-row v-show="status.proMode">
                <el-row class="row" :gutter="20">
                    <el-col :span="12">
                        <el-date-picker class="fill-width"
                                        value-format="yyyy-MM-dd"
                                        v-model="search.timeRangeLogin"
                                        size="small"
                                        type="daterange"
                                        :picker-options="tools.pickerOptions('range')"
                                        range-separator="至"
                                        start-placeholder="上线开始日期"
                                        end-placeholder="上线结束日期"
                                        align="left"
                                        unlink-panels
                                        @change="searchData">
                        </el-date-picker>
                    </el-col>
                    <el-col :span="12">
                        <el-date-picker class="fill-width"
                                        value-format="yyyy-MM-dd"
                                        v-model="search.timeRangeLogout"
                                        size="small"
                                        type="daterange"
                                        :picker-options="tools.pickerOptions('range')"
                                        range-separator="至"
                                        start-placeholder="下线开始日期"
                                        end-placeholder="下线结束日期"
                                        align="right"
                                        unlink-panels
                                        @change="searchData">
                        </el-date-picker>
                    </el-col>
                </el-row>
                <el-row class="row" :gutter="20">
                    <el-col :span="6">
                        <el-input v-model.trim="search.user_ip"
                                  placeholder="IP 地址"
                                  clearable
                                  size="small"
                                  @keyup.enter.native="searchData">
                        </el-input>
                    </el-col>
                    <el-col :span="6">
                        <el-input v-model.trim="search.user_mac"
                                  placeholder="Mac 地址"
                                  clearable
                                  size="small"
                                  @keyup.enter.native="searchData">
                        </el-input>
                    </el-col>
                    <el-col :span="6">
                        <el-input v-model.trim="search.vlan_id"
                                  placeholder="VLAN ID"
                                  clearable
                                  size="small"
                                  @keyup.enter.native="searchData">
                        </el-input>
                    </el-col>
                    <el-col :span="6">
                        <el-input v-model.trim="search.nas_ip"
                                  placeholder="NAS IP"
                                  clearable
                                  size="small"
                                  @keyup.enter.native="searchData">
                        </el-input>
                    </el-col>
                </el-row>
                <el-row class="row" :gutter="20">
                    <el-col :span="4">
                        <el-select class="fill-width"
                                   v-model="search.products_id"
                                   size="small"
                                   clearable
                                   filterable
                                   placeholder="选择产品"
                                   @change="searchData">
                            <el-option v-for="(item,index) in $store.state.options.products"
                                       :key="index"
                                       :label="item.label"
                                       :value="item.value">
                            </el-option>
                        </el-select>
                    </el-col>
                    <el-col :span="4">
                        <el-select class="fill-width"
                                   v-model="search.drop_reason"
                                   size="small"
                                   clearable
                                   filterable
                                   placeholder="下线原因"
                                   @change="searchData">
                            <el-option v-for="(item,index) in options.causes"
                                       :key="index"
                                       :label="item.label"
                                       :value="item.value">
                            </el-option>
                        </el-select>
                    </el-col>
                    <el-col :span="4">
                        <el-cascader class="fill-width"
                                     expand-trigger="hover"
                                     change-on-select
                                     :show-all-levels="false"
                                     placeholder="用户组"
                                     size="small"
                                     clearable
                                     :options="options.group"
                                     v-model="search.group_id"
                                     @change="searchData">
                        </el-cascader>
                    </el-col>
                </el-row>
            </el-row>
        </transition>
        <!-- Table -->
        <el-row class="row table-container">
            <el-table :data="tableData"
                      v-loading="status.loading"
                      stripe>
                <el-table-column type="index" :index="indexMethod"></el-table-column>
                <el-table-column v-for="(item,index) in tableField"
                                 show-overflow-tooltip
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
        name: "Detail",
        data() {
            return {
                search: {
                    user_name: '',
                    user_ip: '',
                    user_mac: '',
                    vlan_id: '',
                    nas_ip: '',
                    products_id: '',
                    drop_reason: '',
                    group_id: []
                },
                status: {
                    loading: true,
                    proMode: false,
                    useSort: false
                },
                page: {
                    now: 1,
                    size: 10,
                    total: 0
                },
                tableField: [],
                tableData: [],
                sortData: [],
                options: {
                    causes: [],
                    group: []
                },
                api: this.config.api.logMgr.detail,
                flag: this.config.api.logMgr.detail.flag
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
                        vlan_id: this.search.vlan_id,
                        nas_ip: this.search.nas_ip,
                        products_id: this.search.products_id,
                        drop_reason: this.search.drop_reason,
                        group_id: this.search.group_id ? this.search.group_id[this.search.group_id.length - 1] : undefined,
                        start_time: this.search.timeRangeLogin ? this.search.timeRangeLogin[0] : undefined,
                        stop_time: this.search.timeRangeLogin ? this.search.timeRangeLogin[1] : undefined,
                        down_start_time: this.search.timeRangeLogout ? this.search.timeRangeLogout[0] : undefined,
                        down_stop_time: this.search.timeRangeLogout ? this.search.timeRangeLogout[1] : undefined
                    };
                if (this.search.timeRange && !this.search.timeRangeLogin && !this.search.timeRangeLogout) {
                    let start = this.search.timeRange[0].split('-'),
                        end = this.search.timeRange[1].split('-');

                    if (start[1] !== end[1]) {
                        this.search.timeRange = [];
                        this.$notify.error({
                            title: '错误',
                            message: '请保持上线时间和下线时间都在同一个自然月'
                        });
                    }

                    para.start_time = this.search.timeRange[0];
                    para.stop_time = undefined;
                    para.down_start_time = undefined;
                    para.down_stop_time = this.search.timeRange[1];
                }
                if (this.search.timeRange && (this.search.timeRangeLogin || this.search.timeRangeLogout)) {
                    this.search.timeRange = [];
                }
                para.action = 'search';
                request.get(url, para, res => {
                    this.tableData = res.data;
                    this.page.total = res.count;
                    this.status.loading = false;
                })
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
            // 导出文件
            download(type) {
                let url = type === 'csv' ? this.api.downloadCSV + '?' : this.api.search + '?',
                    para = {
                        username: this.$store.state.user,
                        pageSize: this.page.size,
                        page: this.page.now,
                        user_name: this.search.user_name,
                        user_ip: this.search.user_ip,
                        user_mac: this.search.user_mac,
                        vlan_id: this.search.vlan_id,
                        nas_ip: this.search.nas_ip,
                        products_id: this.search.products_id,
                        drop_reason: this.search.drop_reason,
                        group_id: this.search.group_id ? this.search.group_id[this.search.group_id.length - 1] : undefined,
                        start_time: this.search.timeRangeLogin ? this.search.timeRangeLogin[0] : undefined,
                        stop_time: this.search.timeRangeLogin ? this.search.timeRangeLogin[1] : undefined,
                        down_start_time: this.search.timeRangeLogout ? this.search.timeRangeLogout[0] : undefined,
                        down_stop_time: this.search.timeRangeLogout ? this.search.timeRangeLogout[1] : undefined
                    };
                if (this.search.timeRange && !this.search.timeRangeLogin && !this.search.timeRangeLogout) {
                    para.start_time = this.search.timeRange[0];
                    para.stop_time = undefined;
                    para.down_start_time = undefined;
                    para.down_stop_time = this.search.timeRange[1];
                }
                if (this.search.timeRange && (this.search.timeRangeLogin || this.search.timeRangeLogout)) {
                    this.search.timeRange = [];
                }
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
                let url = this.config.api.all.userGroup;
                request.get(url, res => {
                    this.options.group = this.tools.list2tree(res.data, {
                        label: 'name',
                        value: 'id'
                    });
                })
            })();
            (() => {
                let url = this.api.getCauses;
                request.get(url, res => {
                    this.options.causes = res.data;
                })
            })();
        },
        components: {
            draggable
        }
    }
</script>