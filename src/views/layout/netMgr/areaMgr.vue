<template>
    <div>
        <el-row class="row">
            <h3 class="module-title">区域管理</h3>
        </el-row>
        <el-row class="row">
            <el-col :xs="24" :sm="18" :md="12">
                <el-card v-loading="status.loading">
                    <el-form :model="formData"
                             :disabled="status.lock"
                             label-width="150px"
                             label-position="top"
                             size="small">
                        <!-- 折叠面板 -->
                        <el-row class="row">
                            <el-collapse :value="['local','visitor']">
                                <el-collapse-item title="本校用户控制" name="local">
                                    <el-form-item label="可使用的区域">
                                        <el-tag v-for="(item,index) in formData.local.area"
                                                :key="index"
                                                :closable="!status.lock"
                                                :disable-transitions="false"
                                                @close="removeArea(item,'local')">IP：{{ item }}
                                        </el-tag>
                                        <el-input class="input-new-tag"
                                                  placeholder="区域 IP 以 - 分割"
                                                  v-if="formData.local.inputVisible"
                                                  v-model="formData.local.inputValue"
                                                  ref="saveTagInput"
                                                  size="small"
                                                  @keyup.enter.native="handleInputConfirm('local')"
                                                  @blur="handleInputConfirm('local')">
                                        </el-input>
                                        <el-button v-else
                                                   class="button-new-tag"
                                                   size="small"
                                                   @click="showInput('local')">+ 添加区域
                                        </el-button>
                                    </el-form-item>
                                </el-collapse-item>
                                <el-collapse-item title="来访用户控制" name="visitor">
                                    <el-form-item label="可使用的区域">
                                        <el-tag v-for="(item,index) in formData.visitor.area"
                                                :key="index"
                                                :closable="!status.lock"
                                                :disable-transitions="false"
                                                @close="removeArea(item,'visitor')">IP：{{ item }}
                                        </el-tag>
                                        <el-input class="input-new-tag"
                                                  placeholder="区域 IP 以 - 分割"
                                                  v-if="formData.visitor.inputVisible"
                                                  v-model="formData.visitor.inputValue"
                                                  ref="saveTagInput"
                                                  size="small"
                                                  @keyup.enter.native="handleInputConfirm('visitor')"
                                                  @blur="handleInputConfirm('visitor')">
                                        </el-input>
                                        <el-button v-else
                                                   class="button-new-tag"
                                                   size="small"
                                                   @click="showInput('visitor')">+ 添加区域
                                        </el-button>
                                    </el-form-item>
                                </el-collapse-item>
                            </el-collapse>
                        </el-row>
                        <!-- 按钮组 -->
                        <el-row class="btn-group" v-show="!status.lock">
                            <el-col :span="10">
                                <el-button type="primary"
                                           size="small"
                                           @click="update">提交
                                </el-button>
                            </el-col>
                            <el-col :span="10" :offset="4">
                                <el-button type="danger"
                                           size="small"
                                           @click="cancel">取消
                                </el-button>
                            </el-col>
                        </el-row>
                    </el-form>
                    <!-- 修改 -->
                    <el-row class="btn-group" v-show="status.lock">
                        <el-button type="warning"
                                   size="small"
                                   @click="status.lock = !status.lock">修改
                        </el-button>
                    </el-row>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    export default {
        name: "areaMgr",
        data() {
            return {
                status: {
                    loading: true,
                    lock: true
                },
                formData: {
                    local: {
                        area: [],
                        inputVisible: false,
                        inputValue: ''
                    },
                    visitor: {
                        area: [],
                        inputVisible: false,
                        inputValue: ''
                    }
                },
                dataCache: '',
                api: this.config.api.netMgr.default
            }
        },
        methods: {
            // 获取数据
            getData() {
                // 开启 Loading
                this.status.loading = true;
                // 请求地址
                let url = this.api.search;
                // 发送请求
                request.get(url, res => {
                    // 数据缓存
                    this.dataCache = res.data;
                    // this.formData.local.area = res.data.local.area;
                    // this.formData.visitor.area = res.data.visitor.area;
                    // 关闭 Loading
                    this.status.loading = false;
                })
            },
            // 更新数据
            update() {
                let url = this.api.update,
                    para = {
                        product_id: this.dataCache.product_id,
                        billing_mode: this.dataCache.local.billing_mode,
                        local: {
                            control_id: this.dataCache.local.control_id,
                            allow_arrears: this.dataCache.local.access,
                            rad_attr_ids: this.dataCache.local.rad_attr_ids,
                            time: this.dataCache.visitor.time,
                            flow: this.dataCache.visitor.flow,
                            area: this.formData.visitor.area,
                            vlan: this.dataCache.visitor.vlan
                        },
                        visitor: {
                            control_id: this.dataCache.visitor.control_id,
                            allow_arrears: this.dataCache.visitor.access,
                            rad_attr_ids: this.dataCache.visitor.rad_attr_ids,
                            time: this.dataCache.visitor.time,
                            flow: this.dataCache.visitor.flow,
                            area: this.formData.visitor.area,
                            vlan: this.dataCache.visitor.vlan
                        }
                    };
                request.post(url, para, {
                    success: () => {
                        this.getData();
                        // 退出编辑模式
                        this.status.lock = true;
                    }
                }, 'notice')
            },
            // 取消修改
            cancel() {
                this.getData();
                this.status.lock = true;
            },
            // 删除标签
            removeArea(item, type) {
                this.formData[type].area.splice(this.formData[type].area.indexOf(item), 1);
            },
            // 显示输入框
            showInput(type) {
                this.formData[type].inputVisible = true;
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
            // 添加标签
            handleInputConfirm(type) {
                let inputValue = this.formData[type].inputValue;
                if (inputValue) {
                    this.formData[type].area.push(inputValue);
                }
                this.formData[type].inputVisible = false;
                this.formData[type].inputValue = '';
            }
        },
        mounted() {
            this.getData();
        }
    }
</script>

<style scoped lang="less">
    .button-new-tag,
    .input-new-tag {
        width: 160px;
    }
</style>