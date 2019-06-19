<template>
    <div>
        <el-row class="row" :gutter="20">
            <el-col :span="4">
                <el-input v-model.trim="user_name" placeholder="账号" size="small" @keyup.enter.native="getData"
                          clearable></el-input>
            </el-col>
            <el-col :span="4">
                <el-input v-model.trim="ip" placeholder="IP地址" size="small" @keyup.enter.native="getData"
                          clearable></el-input>
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
                    <el-button type="primary" size="small" icon="icon ion-md-search" @click="getData">立即搜索</el-button>
                    <el-button type="info" size="small" icon="icon ion-md-options"
                               @click="status.proMode = !status.proMode">高级选项
                    </el-button>
                    <el-button type="warning" size="small" icon="icon ion-md-list-box" @click="fieldSort('open')">字段排序
                    </el-button>
                </el-row>
            </el-col>
        </el-row>
        <!-- Pro Search -->
        <el-row v-show="status.proMode">
            <el-row class="row" :gutter="20">
                <el-col :span="8">
                    <el-date-picker
                            class="fill-width hiddenClearable"
                            v-model="timeRange"
                            value-format="yyyy-MM-dd"
                            type="daterange"
                            align="left"
                            size="small"
                            unlink-panels
                            range-separator="至"
                            start-placeholder="上线开始时间"
                            end-placeholder="上线结束时间"
                            @change="getData"
                    ></el-date-picker>
                </el-col>
                <el-col :span="4">
                    <el-input v-model.trim="user_mac" placeholder="MAC地址" size="small" @keyup.enter.native="getData"
                              clearable></el-input>
                </el-col>
                <el-col :span="4">
                    <el-input v-model.trim="vlan_id" placeholder="VLAN ID" size="small" @keyup.enter.native="getData"
                              clearable></el-input>
                </el-col>
            </el-row>
        </el-row>

        <!-- table -->
        <el-row class="row table-container">
            <el-table :data="tableData"
                      v-loading="status.loading"
                      stripe>
                <el-table-column show-overflow-tooltip v-for="item in fields" :prop="item.value" :label="item.label" :key="item.value"
                                 :min-width="tools.getFieldWidth(item.value)"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="danger" size="mini"
                                   @click="offline(scope.$index, scope.row)">下线
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
    </div>
</template>

<script>
    import draggable from '@/components/draggable'

    export default {
        name: "online",
        components: {
            draggable
        },
        data() {
            return {
                user_name: "",
                ip: "",
                user_mac: "",
                timeRange: "",
                vlan_id: "",                //搜索选项
                like: false,
                showNow: {value: 'times', label: '在线访客'},       // 当前展示项目
                fields: [],             //表格字段
                tableData: [],          // 表格数据
                status: {
                    loading: true,
                    proMode: false,
                    useSort: false
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
                api: this.config.api.status.online.search
            };
        },
        methods: {
            // 获取当前日期
            getToday() {
                let end = new Date(),
                    start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                this.timeRange = [
                    this.tools.timeTransform(start, {
                        now: "object",
                        res: "yy-MM-dd HH:mm:ss"
                    }),
                    this.tools.timeTransform(end, {
                        now: "object",
                        res: "yy-MM-dd HH:mm:ss"
                    })
                ];
                this.getData();
            },
            //获取数据
            getData() {
                this.status.loading = true;
                let url = this.api,
                    para = {
                        user_name: this.user_name,
                        ip: this.ip,
                        user_mac: this.user_mac,
                        like: this.like ? '' : 1,
                        start_time: this.timeRange[0],
                        stop_time: this.timeRange[1],
                        per_page: this.page.size,
                        page: this.page.now
                    };

                request.get(url, para, res => {
                    if (res.data.table) {
                        this.tableData = res.data.table;
                        this.page.total = res.data._meta.totalCount;
                    } else {
                        this.tableData = [];
                        this.page.total = 0;
                    }
                    this.status.loading = false;
                });

            },
            // 日期范围转文字
            timeRange2text() {
                let
                    start = this.tools.timeTransform(this.timeRange[0], {
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
                            flag: 'online_radius',
                        };
                    request.get(url, para, res => {
                        // 拖动组件初始化
                        this.$refs.draggable.init(res.data);
                    });
                } else {
                    let url = this.config.api.all.updateField,
                        para = {
                            flag: 'online_radius',
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
                        flag: 'online_radius'
                    };
                request.get(url, para, res => {
                    let arr = [];
                    for (let val of res.data.select) {
                        arr.push({
                            label: val.label,
                            value: val.value
                        });
                    }
                    //生成前端表格字段
                    this.fields = arr;
                });
            },
            //下线
            offline(index, row) {
                this.$confirm('此操作将无法撤销, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let url = this.config.api.status.online.drop,
                        para = {
                            rad_online_id: row.rad_online_id,
                            user_name: row.user_name
                        };
                    request.post(url, para, {
                        success: () => {
                            this.getData();
                        }
                    }, 'notice');
                });
            }
        },
        mounted() {
            this.getFields();
            this.getToday();
        }
    };
</script>

<style scoped>
</style>
