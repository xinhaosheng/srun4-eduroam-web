<template>
    <div>
        <!-- Tree -->
        <el-row class="row">
            <el-col :xs="24"
                    :sm="18"
                    :md="$store.state.setting.netMgrCustomizeStyle === 'top' ? 12 : ''">
                <el-card v-loading="status.loading">
                    <el-tree :data="treeData"
                             node-key="id"
                             default-expand-all
                             :indent="35"
                             :expand-on-click-node="false"
                             class="diy-tree">
                        <span class="custom-tree-node" slot-scope="{ node, data }">
                            <span>{{ node.label }}</span>
                            <span>
                                <el-button type="text" size="mini" @click="addData(data)"> 添加 </el-button>
                                <el-button type="text" size="mini" @click="update(data)"> 编辑 </el-button>
                                <el-button type="text" size="mini" @click="delData(data)"> 删除 </el-button>
                                <el-button type="text" size="mini" @click="bindCtrl('open',data)"> 绑定控制组 </el-button>
                            </span>
                        </span>
                    </el-tree>
                </el-card>
            </el-col>
        </el-row>
        <!-- Dialog -->
        <el-dialog title="绑定控制组"
                   :visible.sync="status.showDialog"
                   width="600px"
                   @close="formReset">
            <el-form :model="formData"
                     label-width="120px"
                     label-position="left"
                     size="small">
                <el-form-item label="用户组：">
                    <span>{{formData.groupLabel}}</span>
                </el-form-item>
                <el-form-item label="请选择产品：">
                    <el-select v-model="formData.product_id"
                               placeholder="请选择产品"
                               filterable
                               clearable>
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
                    <el-button type="primary"
                               size="small"
                               @click="bindCtrl">确定
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
        name: "GroupBind",
        data() {
            return {
                status: {
                    loading: true,
                    showDialog: false
                },
                treeData: [],
                formData: {}
            }
        },
        methods: {
            // 获取数据
            getData() {
                // 开启 loading
                this.status.loading = true;

                let url = this.config.api.all.userGroup;
                // 发送请求
                request.get(url, res => {
                    // 数据结构转换
                    let arr = this.tools.list2tree(res.data, {
                        label: 'name',
                        value: 'id'
                    });
                    // 添加根目录
                    this.treeData = [{
                        label: '/',
                        children: arr
                    }];
                    // 关闭 loading
                    this.status.loading = false;
                })
            },
            // 添加
            addData(data) {
                this.$prompt('请输入用户组名称', '添加用户组', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                }).then(({value}) => {
                    let url = this.config.api.all.groupAdd,
                        para = {
                            parent_name: data.label,
                            name: value
                        };
                    request.post(url, para, {
                        success: () => {
                            // 刷新列表
                            this.getData();
                        }
                    }, 'notice');
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '取消添加'
                    });
                });
            },
            //编辑节点
            update(data) {
                this.$prompt('请输入用户组名称', '编辑用户组', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputValue: data.label
                }).then(({value}) => {
                    let url = this.config.api.all.groupEdit,
                        para = {
                            id: data.value,
                            name: value
                        };
                    request.post(url, para, {
                        success: () => {
                            // 刷新列表
                            this.getData();
                        }
                    }, 'notice');
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '取消编辑'
                    });
                });
            },
            //删除节点
            delData(data) {
                this.$confirm('确定删除该用户组？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let url = this.config.api.all.groupDel,
                        para = {
                            id: data.value
                        };
                    request.post(url, para, {
                        success: () => {
                            this.getData();
                        }
                    }, 'notice');
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '取消删除'
                    });
                });
            },
            // 绑定控制组
            bindCtrl(action, data) {
                if (action === 'open') {
                    // 开启对话框
                    this.status.showDialog = true;
                    // 用户组
                    this.formData.groupLabel = data.label;
                    // 产品 ID
                    this.formData.groupValue = data.value
                } else {
                    let url = this.config.api.all.bindGroup,
                        para = {
                            // 用户组 ID
                            id: this.formData.groupValue,
                            // 产品 ID
                            product_id: this.formData.product_id
                        };
                    request.post(url, para, {
                        success: () => {
                            this.formReset();
                            this.getData();
                        }
                    }, 'notice');
                }
            },
            // 表单重置
            formReset() {
                // 表单清空
                this.formData = {};
                // 关闭对话框
                this.status.showDialog = false;
            }
        },
        mounted() {
            this.getData();
        }
    }
</script>

<style scoped lang="less">
    .product-id {
        margin-left: 20px;
    }
    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;
    }
    .label {
        line-height: 30px;
    }
    .el-tree-node__content:hover button {
        display: inline;
    }
    .el-tree-node__content button {
        display: none;
    }
</style>