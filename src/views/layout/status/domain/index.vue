<template>
    <div>
        <!-- Title -->
        <el-row class="row">
            <h3 class="module-title">学校域名管理</h3>
        </el-row>
        <!-- Search -->
        <el-row class="row search">
            <el-col :md="8" :sm="12" :xs="16">
                <el-input placeholder="请输入查询内容"
                          v-model.trim="search.value"
                          clearable
                          class="input-with-select"
                          @keyup.enter.native="getData"
                          size="small">
                    <el-select v-model="search.type" slot="prepend" placeholder="查询项目">
                        <el-option label="学校名称" value="school_name"></el-option>
                        <el-option label="学校域名" value="school_domain"></el-option>
                    </el-select>
                    <el-button slot="append" icon="el-icon-search" @click="getData"></el-button>
                </el-input>
            </el-col>
            <el-col :md="16" :sm="12" :xs="8">
                <el-row type="flex" justify="end">
                    <el-button type="primary"
                               size="small"
                               icon="icon ion-md-add"
                               @click="addData('open')">添加数据
                    </el-button>
                </el-row>
            </el-col>
        </el-row>
        <!-- Table -->
        <el-row class="row table-container">
            <el-table :data="tableData"
                      v-loading="status.loading"
                      stripe>
                <el-table-column type="index" :index="indexMethod"></el-table-column>
                <el-table-column label="学校名称" min-width="200">
                    <template slot-scope="scope">
                        <span v-html="checkKeyword(scope.row.school_name)"></span>
                    </template>
                </el-table-column>
                <el-table-column label="学校域名" min-width="200">
                    <template slot-scope="scope">
                        <span v-html="checkKeyword(scope.row.school_domain)"></span>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="100">
                    <template slot-scope="scope">
                        <el-tag size="medium"
                                :type="scope.row.status === '1' ? 'danger' : 'primary'">
                            {{ scope.row.status === '1' ? '不可编辑' : '允许编辑' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                    <template slot-scope="scope">
                        <el-button size="mini"
                                   :disabled="scope.row.status === '1'"
                                   @click="update(scope.$index, scope.row)">编辑
                        </el-button>
                        <el-button size="mini"
                                   type="danger"
                                   :disabled="scope.row.status === '1'"
                                   @click="delData(scope.$index, scope.row)">删除
                        </el-button>
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
        <!-- Dialog -->
        <el-dialog :title="status.dialogType === 'add' ? '添加数据' : '编辑数据'"
                   :visible.sync="status.showDialog"
                   width="600px"
                   @closed="formReset">
            <el-form :model="formData"
                     :rules="rules"
                     status-icon
                     ref="formData"
                     label-width="120px"
                     label-position="left"
                     size="small">
                <el-form-item label="学校名称" prop="school_name">
                    <el-input v-model.trim="formData.school_name"
                              clearable
                              placeholder="请输入学校名称">
                    </el-input>
                </el-form-item>
                <el-form-item label="学校域名" prop="school_domain">
                    <el-input v-model.trim="formData.school_domain"
                              clearable
                              placeholder="请输入学校域名">
                    </el-input>
                </el-form-item>
                <el-form-item label="修改状态">
                    <el-radio v-model="formData.status" border label="0">允许修改</el-radio>
                    <el-radio v-model="formData.status" border label="1">禁止修改</el-radio>
                </el-form-item>
            </el-form>
            <el-row slot="footer" class="dialog-footer btn-group">
                <el-col :span="10">
                    <!-- 添加 -->
                    <el-button type="primary"
                               size="small"
                               v-show="status.dialogType === 'add'"
                               @click="addData">确定
                    </el-button>
                    <!-- 编辑 -->
                    <el-button type="primary"
                               size="small"
                               v-show="status.dialogType === 'update'"
                               @click="update">确定
                    </el-button>
                </el-col>
                <el-col :span="10" :offset="4">
                    <!-- 取消 -->
                    <el-button type="danger"
                               size="small"
                               @click="formReset">取消
                    </el-button>
                </el-col>
            </el-row>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Domain",
        data() {
            return {
                status: {
                    loading: true,
                    dialogType: 'add',
                    showDialog: false
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
                tableData: [],
                formData: {
                    // 默认允许修改
                    status: '0'
                },
                rules: {
                    school_name: [
                        {validator: this.tools.ruleLib('blank'), trigger: 'blur'}
                    ],
                    school_domain: [
                        {validator: this.tools.ruleLib('blank'), trigger: 'blur'}
                    ]
                },
                api: this.config.api.status.domain
            }
        },
        methods: {
            // 增加数据
            addData(status, data) {
                if (status === 'open') {
                    this.status.dialogType = 'add';
                    this.status.showDialog = true;
                    if (data) {
                        this.formData[this.search.type] = data;
                    }
                } else {
                    let send = () => {
                        let url = this.api.add,
                            para = this.formData;
                        request.post(url, para, {
                            success: () => {
                                this.formReset();
                                this.getData();
                            }
                        }, 'notice')
                    };
                    this.$refs['formData'].validate((valid) => {
                        if (valid) {
                            send();
                        } else {
                            return false;
                        }
                    });
                }
            },
            // 删除数据
            delData(index, row) {
                this.$confirm('您确定要删除此条数据吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let url = this.api.del,
                        para = {
                            id: [row.id]
                        };
                    request.post(url, para, {
                        success: () => {
                            this.formReset();
                            this.getData();
                        }
                    }, 'notice')
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            // 修改数据
            update(index, row) {
                if (row) {
                    // 开启编辑面板
                    this.status.dialogType = 'update';
                    this.status.showDialog = true;
                    this.formData = this.tools.cloneCache(row)
                } else {
                    // 提交编辑数据
                    let url = this.api.update,
                        para = this.formData;
                    request.post(url, para, {
                        success: () => {
                            this.formReset();
                            this.getData();
                        }
                    }, 'notice')
                }
            },
            // 查询数据
            getData() {
                this.status.loading = true;
                let url = this.api.search,
                    para = {
                        per_page: this.page.size,
                        page: this.page.now,
                        id: this.search.type === 'id' ? this.search.value : undefined,
                        school_name: this.search.type === 'school_name' ? this.search.value : undefined,
                        school_domain: this.search.type === 'school_domain' ? this.search.value : undefined
                    };
                request.get(url, para, res => {
                    for (let val of res.data) {
                        val.status += ''
                    }
                    this.tableData = res.data;
                    this.page.total = res.count;
                    this.status.loading = false;
                    if (res.count === 0 && this.search.value) this.confirmAdd();
                })
            },
            // 是否添加无查询结果数据
            confirmAdd() {
                let typeLabel = this.search.type === 'school_name' ? '学校名称' : '学校域名';
                this.$confirm(`没有查询到${typeLabel}为${this.search.value}的数据，是否添加该${typeLabel}？`, '提示', {
                    confirmButtonText: '添加',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.addData('open', this.search.value);
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消'
                    });
                });
            },
            // 校验是否为关键字
            checkKeyword(string) {
                return this.tools.keywordStyle(string, this.search.value);
            },
            // 表单重置
            formReset() {
                this.status.dialogType = '';
                this.status.showDialog = false;
                this.formData = {status: '0'};
                this.$refs['formData'].resetFields();
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
            if (this.$route.query.school_domain) {
                this.search.type = 'school_domain';
                this.addData('open', this.$route.query.school_domain);
            }
        }
    }
</script>

<style scoped lang="less">
    .el-tag {
        margin: 0;
    }
</style>