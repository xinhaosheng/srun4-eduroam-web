<template>
    <div>
        <el-row class="row">
            <h3 class="module-title">资源管理</h3>
        </el-row>
        <el-row class="row">
            <el-col :xs="24" :sm="18" :md="12">
                <el-card v-loading="status.loading">
                    <el-form :model="formData"
                             :disabled="status.lock"
                             label-width="150px"
                             label-position="left"
                             size="small">
                        <!-- 折叠面板 -->
                        <el-row class="row">
                            <el-collapse :value="['local','visitor']">
                                <el-collapse-item title="本校用户控制" name="local">
                                    <el-form-item label="可访问的资源">
                                        <el-radio-group v-model="formData.local.source">
                                            <el-radio v-for="(item,index) in $store.state.options.sources"
                                                      :key="index"
                                                      border
                                                      :label="item.value">{{item.label}}
                                            </el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-collapse-item>
                                <el-collapse-item title="来访用户控制" name="visitor">
                                    <el-form-item label="可访问的资源">
                                        <el-radio-group v-model="formData.visitor.source">
                                            <el-radio v-for="(item,index) in $store.state.options.sources"
                                                      :key="index"
                                                      border
                                                      :label="item.value">{{item.label}}
                                            </el-radio>
                                        </el-radio-group>
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
        name: "SourceMgr",
        data() {
            return {
                status: {
                    loading: true,
                    lock: true
                },
                formData: {
                    local: {
                        source: ''
                    },
                    visitor: {
                        source: ''
                    }
                },
                dataCache: '',
                api: this.config.api.netMgr.default
            }
        },
        methods: {
            // 获取数据
            getData() {
                // 开启 loading
                this.status.loading = true;
                // 请求地址
                let url = this.api.search;
                // 发送请求
                request.get(url, res => {
                    // 数据缓存
                    this.dataCache = res.data;
                    // 可使用的资源选择
                    this.formData.local.source = res.data.local.rad_attr_ids;
                    this.formData.visitor.source = res.data.visitor.rad_attr_ids;
                    // 关闭 loading
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
                            allow_arrears: this.dataCache.local.allow_arrears,
                            rad_attr_ids: this.formData.local.useSource,
                            time: this.dataCache.visitor.time,
                            flow: this.dataCache.visitor.flow,
                            area: this.dataCache.visitor.area,
                            vlan: this.dataCache.visitor.vlan
                        },
                        visitor: {
                            control_id: this.dataCache.visitor.control_id,
                            allow_arrears: this.dataCache.visitor.allow_arrears,
                            rad_attr_ids: this.formData.visitor.useSource,
                            time: this.dataCache.visitor.time,
                            flow: this.dataCache.visitor.flow,
                            area: this.dataCache.visitor.area,
                            vlan: this.dataCache.visitor.vlan
                        }
                    };
                request.post(url, para, {
                    success: () => {
                        this.getData();
                        // 退出编辑模式
                        this.status.lock = true;
                    }
                }, 'notice');
            },
            // 取消修改
            cancel() {
                this.getData();
                this.status.lock = true;
            }
        },
        mounted() {
            this.getData();
        }
    }
</script>