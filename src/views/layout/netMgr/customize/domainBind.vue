<template>
    <div>
        <!-- Button -->
        <el-row class="row">
            <el-button type="primary"
                       size="small"
                       icon="icon ion-md-add"
                       @click="addData('open')">添加策略
            </el-button>
        </el-row>
        <!-- Table -->
        <el-row class="row table-container">
            <el-table :data="tableData"
                      stripe
                      v-loading="status.loading">
                <!-- 索引 -->
                <el-table-column type="index" width="40" :index="indexMethod"></el-table-column>
                <el-table-column label="学校名称" min-width="180">
                    <template slot-scope="scope">
                        <span v-if="scope.row.school_name">{{ scope.row.school_name }}</span>
                        <span v-else class="keyword">该域名暂无学校名称</span>
                    </template>
                </el-table-column>
                <el-table-column label="学校域名" prop="school_domain" min-width="180"></el-table-column>
                <el-table-column label="控制策略" prop="product_name" min-width="180"></el-table-column>
                <!-- 操作 -->
                <el-table-column label="操作" width="150">
                    <template slot-scope="scope">
                        <el-button size="mini"
                                   type="primary"
                                   @click="update('open',scope.$index, scope.row)">编辑
                        </el-button>
                        <el-button size="mini"
                                   type="danger"
                                   @click="delData(scope.$index, scope.row)">删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <!-- Dialog -->
        <el-dialog :title="status.dialogType === 'add' ? '添加数据' : '编辑数据'"
                   :visible.sync="status.showDialog"
                   width="600px"
                   @closed="formReset">
            <el-form :model="formData"
                     ref="formData"
                     label-width="120px"
                     label-position="left"
                     size="small">
                <el-form-item label="学校域名">
                    <el-autocomplete class="fill-width"
                                     v-model.trim="formData.school_domain"
                                     :fetch-suggestions="querySearchAsync"
                                     placeholder="请输入学校域名"
                                     clearable
                                     @select="handleSelect">
                        <template slot-scope="{ item }">
                            <span class="label">{{ item.label }}</span>
                            <span class="value">{{ item.value }}</span>
                        </template>
                    </el-autocomplete>
                </el-form-item>
                <transition name="el-zoom-in-top">
                    <el-form-item label="学校名称" v-show="formData.school_domain">
                        <el-input v-show="status.showName || !formData.school_domain"
                                  v-model="formData.school_name"
                                  :disabled="true"
                                  placeholder="请输入学校名称">
                        </el-input>
                        <el-link v-show="!status.showName && formData.school_domain"
                                 type="primary"
                                 @click="addSchoolName">该域名暂无学校名称，点击此处进行添加
                        </el-link>
                    </el-form-item>
                </transition>
                <el-form-item label="控制策略">
                    <el-select class="fill-width"
                               v-model="formData.product_id"
                               clearable
                               placeholder="请选择控制策略">
                        <el-option v-for="(item,index) in $store.state.options.products"
                                   :key="index"
                                   :label="item.label"
                                   :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <el-row slot="footer" class="dialog-footer btn-group">
                <el-col :span="10">
                    <el-button v-show="status.dialogType === 'add'"
                               type="primary"
                               size="small"
                               @click="addData">添加
                    </el-button>
                    <el-button v-show="status.dialogType === 'update'"
                               type="primary"
                               size="small"
                               @click="update">更新
                    </el-button>
                </el-col>
                <el-col :span="10" :offset="4">
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
        name: "DomainBind",
        data() {
            return {
                status: {
                    loading: true,
                    showDialog: false,
                    showName: false,
                    dialogType: ''
                },
                tableData: [],
                formData: {
                    school_domain: ''
                },
                api: this.config.api.netMgr.domainBind
            }
        },
        methods: {
            // 动态查询
            querySearchAsync(queryString, cb) {
                // 若查询条件为空则不给出提示列表
                if (!queryString) return cb([]);
                // 改变查询域名时隐藏学校名称
                this.status.showName = false;
                // 参数配置
                let url = this.config.api.status.domain.search,
                    para = {
                        per_page: 20,
                        page: 1,
                        school_domain: queryString
                    };
                // 发送请求
                request.get(url, para, res => {
                    let results = [];
                    for (let val of res.data) {
                        results.push({
                            label: val.school_name,
                            value: val.school_domain
                        })
                    }
                    clearTimeout(this.timeout);
                    this.timeout = setTimeout(() => {
                        cb(results);
                    }, 300 * Math.random());
                });
            },
            // 从提示列表中选择
            handleSelect(item) {
                this.status.showName = true;
                this.formData.school_name = item.label;
                this.formData.school_domain = item.value;
            },
            // 添加数据
            addData(action) {
                if (action === 'open') {
                    this.status.dialogType = 'add';
                    this.status.showDialog = true;
                } else {
                    let url = this.api.add,
                        para = {
                            product_id: this.formData.product_id,
                            group_id: 2,
                            school_domain: this.formData.school_domain
                        };
                    request.post(url, para, {
                        success: () => {
                            this.getData();
                            this.formReset();
                        }
                    }, 'notice');
                }
            },
            // 删除数据
            delData(index, row) {
                this.$confirm('您确定要删除这条数据吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let url = this.api.del,
                        para = {
                            domain_id: row.domain_id
                        };
                    request.post(url, para, {
                        success: () => {
                            this.getData();
                        }
                    }, 'notice');
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });
            },
            // 修改数据
            update(action, index, row) {
                if (action === 'open') {
                    // 获取编辑内容
                    this.formData = this.tools.cloneCache(row);
                    // 判断是否显示学校名称
                    this.status.showName = !!row.school_name;
                    // 对话框动作
                    this.status.dialogType = 'update';
                    // 开启对话框
                    this.status.showDialog = true;
                } else {
                    let url = this.api.update,
                        para = {
                            domain_id: this.formData.domain_id,
                            product_id: this.formData.product_id,
                            school_domain: this.formData.school_domain
                        };
                    request.post(url, para, {
                        success: () => {
                            this.getData();
                            this.formReset();
                        }
                    }, 'notice');
                }
            },
            // 获取数据
            getData() {
                this.status.loading = true;
                let url = this.api.search;
                request.get(url, res => {
                    this.tableData = res.data;
                    this.status.loading = false;
                })
            },
            // 获取 index
            indexMethod(index) {
                return index + 1;
            },
            // 重置表单
            formReset() {
                this.status.showName = false;
                this.status.showDialog = false;
                this.formData = {};
                this.$refs['formData'].resetFields();
            },
            addSchoolName() {
                this.$router.push({
                    path: '/status/domain',
                    query: {
                        school_domain: this.formData.school_domain
                    }
                })
            }
        },
        mounted() {
            this.getData();
        }
    }
</script>

<style scoped>

</style>