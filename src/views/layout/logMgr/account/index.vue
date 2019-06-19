<template>
    <div>
        <!-- Title -->
        <el-row class="row">
            <h3 class="module-title">开销户日志</h3>
        </el-row>
        <!-- Search -->
        <el-row class="row" :gutter="20">
            <el-col :span="8">
                <el-input placeholder="查询账号"
                          v-model.trim="search.user_name"
                          clearable
                          class="input-with-select"
                          @keyup.enter.native="searchData"
                          size="small">
                    <el-select placeholder="操作类型"
                               v-model="search.type"
                               slot="prepend"
                               clearable
                               @change="searchData">
                        <el-option label="开户" value="0"></el-option>
                        <el-option label="销户" value="1"></el-option>
                    </el-select>
                </el-input>
            </el-col>
            <el-col :span="8">
                <!-- 时间范围选择 -->
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
            <el-row type="flex" justify="end">
                <el-button type="primary"
                           size="small"
                           icon="icon ion-md-search"
                           @click="searchData">立即搜索
                </el-button>
                <el-button type="info"
                           size="small"
                           icon="icon ion-md-options"
                           @click="status.proMode = !status.proMode">高级模式
                </el-button>
                <el-button type="success"
                           size="small"
                           icon="icon ion-md-document"
                           @click.prevent="download('excel')">导出Excel
                </el-button>
            </el-row>
        </el-row>
        <!-- Pro Mode -->
        <transition name="el-zoom-in-top">
            <el-row class="row" :gutter="20" v-show="status.proMode">
                <el-col :span="4">
                    <el-input v-model.trim="search.user_real_name"
                              size="small"
                              placeholder="姓名"
                              clearable
                              @keyup.enter.native="searchData">
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-input v-model.trim="search.mgr_name"
                              size="small"
                              placeholder="操作人"
                              clearable
                              @keyup.enter.native="searchData">
                    </el-input>
                </el-col>
            </el-row>
        </transition>
        <!-- Table -->
        <el-row class="row table-container">
            <el-table :data="tableData"
                      stripe
                      v-loading="status.loading">
                <el-table-column type="index" :index="indexMethod"></el-table-column>
                <el-table-column label="类型" width="80">
                    <template slot-scope="scope">
                        <el-tag size="medium"
                                :type="scope.row.type === '销户' ? 'danger' : 'success'">
                            {{ scope.row.type }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="user_name" label="账号" min-width="170"></el-table-column>
                <el-table-column prop="user_real_name" label="姓名" width="150"></el-table-column>
                <el-table-column prop="operate_time" label="操作时间" min-width="170"></el-table-column>
                <el-table-column prop="operate_ip" label="IP" min-width="130"></el-table-column>
                <el-table-column prop="mgr_name" label="操作人" width="130"></el-table-column>
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
                           layout="total, sizes, prev, pager, next,jumper"
                           :total="page.total">
            </el-pagination>
        </el-row>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                status: {
                    proMode: false,
                    loading: true
                },
                page: {
                    now: 1,
                    size: 10,
                    total: 0
                },
                search: {},
                formData: {},
                tableData: [],
                api: this.config.api.logMgr.account
            };
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
                        type: this.search.type,
                        user_name: this.search.user_name,
                        user_real_name: this.search.user_real_name,
                        mgr_name: this.search.mgr_name,
                        start_time: this.search.timeRange ? this.search.timeRange[0] : undefined,
                        stop_time: this.search.timeRange ? this.search.timeRange[1] : undefined
                    };
                para.action = 'search';
                request.get(url, para, res => {
                    this.page.total = res.count;
                    this.tableData = res.data;
                    this.status.loading = false;
                });
            },
            // 导出文件
            download(type) {
                let url = this.api.search + '?',
                    para = {
                        pageSize: this.page.size,
                        page: this.page.now,
                        username: this.$store.state.user,
                        type: this.search.type,
                        user_name: this.search.user_name,
                        user_real_name: this.search.user_real_name,
                        mgr_name: this.search.mgr_name,
                        start_time: this.search.timeRange ? this.search.timeRange[0] : undefined,
                        stop_time: this.search.timeRange ? this.search.timeRange[1] : undefined
                    };
                para.action = type;
                for (let key in para) {
                    if (!para[key]) continue;
                    url += `${key}=${para[key]}&`;
                }
                location = this.config.reqUrl + ':' + this.config.reqPort + url.substring(0, url.length - 1);
            },
            // 改变分页
            changePage(type, val) {
                this.page[type] = val;
                this.getData();
            },
            // 设置表格索引
            indexMethod(index) {
                return index + 1;
            }
        },
        mounted() {
            this.getData();
        }
    };
</script>
