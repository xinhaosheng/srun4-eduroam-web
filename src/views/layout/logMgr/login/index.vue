<template>
    <div>
        <!-- Title -->
        <el-row class="row">
            <h3 class="module-title">登录日志</h3>
        </el-row>
        <!-- Search -->
        <el-row class="row" :gutter="20">
            <!-- 管理员 -->
            <el-col :span="4">
                <el-input v-model.trim="search.manager_name"
                          size="small"
                          placeholder="管理员"
                          clearable
                          @keyup.enter.native="searchData">
                </el-input>
            </el-col>
            <!-- 时间范围选择 -->
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
            <!-- 模糊搜索开关 -->
            <el-col :span="6">
                <el-switch v-model="search.type"
                           class="switch sm"
                           active-color="#409EFF"
                           inactive-color="#E6A23C"
                           active-text="精确搜索"
                           inactive-text="模糊搜索">
                </el-switch>
            </el-col>
            <!-- 搜索按钮 -->
            <el-col :span="6">
                <el-row type="flex" justify="end">
                    <el-button type="primary"
                               size="small"
                               icon="icon ion-md-search"
                               @click="searchData">立即搜索
                    </el-button>
                </el-row>
            </el-col>
        </el-row>
        <!-- Table -->
        <el-row class="row table-container">
            <el-table :data="tableData"
                      stripe
                      @selection-change="select"
                      v-loading="status.loading">
                <el-table-column type="selection" width="45" fixed></el-table-column>
                <el-table-column type="index" width="40" :index="indexMethod"></el-table-column>
                <el-table-column label="管理员" prop="manager_name" min-width="200"></el-table-column>
                <el-table-column label="IP地址" prop="ip" min-width="200"></el-table-column>
                <el-table-column label="登录时间" min-width="200">
                    <template slot-scope="scope">
                        {{ tools.timeTransform(scope.row.login_time,{
                        now:'timestamp',
                        res:'yy-MM-dd HH:mm:ss'
                        }) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                    <template slot-scope="scope">
                        <el-button size="mini"
                                   type="danger"
                                   @click="delData(scope.$index, scope.row)">删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <!-- Pagination -->
        <el-row>
            <el-col :span="20">
                <el-pagination @size-change="changePage('size',$event)"
                               @current-change="changePage('now',$event)"
                               :current-page="page.now"
                               :page-sizes="[5, 10, 20]"
                               :page-size="page.size"
                               background
                               layout="total, sizes, prev, pager, next, jumper"
                               :total="page.total">
                </el-pagination>
            </el-col>
            <!-- 批量操作 -->
            <el-col :span="4">
                <el-row type="flex" justify="end">
                    <el-button type="danger" size="mini" @click="delData">批量删除</el-button>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                status: {
                    loading: true,
                },
                page: {
                    now: 1,
                    size: 10,
                    total: 0
                },
                search: {},
                selectItem: [],
                tableData: [],
                api: this.config.api.logMgr.login
            };
        },
        methods: {
            // 查询
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
                        manager_name: this.search.manager_name,
                        start_time: this.search.timeRange ? this.search.timeRange[0] : undefined,
                        stop_time: this.search.timeRange ? this.search.timeRange[1] : undefined,
                        type: this.search.type ? 'accurate' : 'like'
                    };
                request.get(url, para, res => {
                    this.tableData = res.data;
                    this.page.total = res.count;
                    this.status.loading = false;
                });
            },
            // 删除项目
            delData(index, row) {
                // 根据删除类型发送请求
                let send = () => {
                    let url = this.api.del,
                        para = {
                            id: typeof index === 'number' ? [row.id] : (() => {
                                let arr = [];
                                for (let val of this.selectItem) {
                                    arr.push(val.id);
                                }
                                return arr;
                            })()
                        };

                    request.post(url, para, {
                        success: () => {
                            this.getData();
                        }
                    }, "notice");
                };
                // 删除前确认
                let confirm = () => {
                    this.$confirm("您确定要删除吗？", "提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning"
                    }).then(() => {
                        send();
                        this.getData();
                    }).catch(() => {
                        this.$message({
                            type: "info",
                            message: "已取消删除"
                        });
                    });
                };
                // 根据参数数据类型判断用户操作 (单个删除/批量删除)
                typeof index === "number" ? confirm() : (() => {
                    if (this.selectItem.length === 0) {
                        return this.$notify.error({
                            title: "错误",
                            message: "至少选择一条数据"
                        });
                    }
                    confirm();
                })();
            },
            // 表格选择
            select(val) {
                this.selectItem = val;
            },
            // 改变分页
            changePage(type, val) {
                this.page[type] = val;
                this.getData();
            },
            // 获取 index
            indexMethod(index) {
                return index + 1;
            }
        },
        mounted() {
            this.getData();
        }
    };
</script>
