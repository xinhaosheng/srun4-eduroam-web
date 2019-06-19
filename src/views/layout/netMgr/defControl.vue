<template>
    <div>
        <!-- Title -->
        <el-row class="row">
            <h3 class="module-title">默认控制组</h3>
        </el-row>
        <!-- Form -->
        <el-row class="row">
            <el-col :xs="24" :sm="18" :md="12">
                <el-card v-loading="status.loading">
                    <!-- 表单 -->
                    <el-form :model="formData"
                             :disabled="status.lock"
                             label-width="150px"
                             label-position="left"
                             size="small">
                        <!-- 公用配置 -->
                        <el-form-item label="使用量统计周期">
                            <el-input placeholder="请输入内容"
                                      v-model.trim="formData.product.cycle"
                                      class="input-with-select">
                                <el-select v-model="formData.product.cycleUnit"
                                           slot="append"
                                           placeholder="请选择单位">
                                    <el-option v-for="(item,index) in options.product"
                                               :key="index"
                                               :label="item.label"
                                               :value="item.value">
                                    </el-option>
                                </el-select>
                            </el-input>
                        </el-form-item>
                        <!-- 折叠面板 -->
                        <el-row class="row">
                            <el-collapse :value="['local','visitor']">
                                <el-collapse-item title="本校用户控制" name="local">
                                    <el-form-item label="是否允许上网">
                                        <el-radio v-model="formData.local.allow_arrears" label="1" border>允许</el-radio>
                                        <el-radio v-model="formData.local.allow_arrears" label="0" border>禁止</el-radio>
                                    </el-form-item>
                                    <el-form-item label="最大上网时长">
                                        <el-input placeholder="请输入内容"
                                                  v-model.trim="formData.local.time"
                                                  class="input-with-select">
                                            <el-select v-model="formData.local.timeUnit"
                                                       slot="append"
                                                       placeholder="请选择单位">
                                                <el-option v-for="(item,index) in options.time"
                                                           :key="index"
                                                           :label="item.label"
                                                           :value="item.value">
                                                </el-option>
                                            </el-select>
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item label="最大上网流量">
                                        <el-input placeholder="请输入内容"
                                                  v-model.trim="formData.local.flow"
                                                  class="input-with-select">
                                            <el-select v-model="formData.local.flowUnit"
                                                       slot="append"
                                                       placeholder="请选择单位">
                                                <el-option v-for="(item,index) in options.flow"
                                                           :key="index"
                                                           :label="item.label"
                                                           :value="item.value">
                                                </el-option>
                                            </el-select>
                                        </el-input>
                                    </el-form-item>
                                </el-collapse-item>
                                <el-collapse-item title="来访用户控制" name="visitor">
                                    <el-form-item label="是否允许上网">
                                        <el-radio v-model="formData.visitor.allow_arrears" label="1" border>允许
                                        </el-radio>
                                        <el-radio v-model="formData.visitor.allow_arrears" label="0" border>禁止
                                        </el-radio>
                                    </el-form-item>
                                    <el-form-item label="最大上网时长">
                                        <el-input placeholder="请输入内容"
                                                  v-model.trim="formData.visitor.time"
                                                  class="input-with-select">
                                            <el-select v-model="formData.visitor.timeUnit"
                                                       slot="append"
                                                       placeholder="请选择单位">
                                                <el-option v-for="(item,index) in options.time"
                                                           :key="index"
                                                           :label="item.label"
                                                           :value="item.value">
                                                </el-option>
                                            </el-select>
                                        </el-input>
                                    </el-form-item>
                                    <el-form-item label="最大上网流量">
                                        <el-input placeholder="请输入内容"
                                                  v-model.trim="formData.visitor.flow"
                                                  class="input-with-select">
                                            <el-select v-model="formData.visitor.flowUnit"
                                                       slot="append"
                                                       placeholder="请选择单位">
                                                <el-option v-for="(item,index) in options.flow"
                                                           :key="index"
                                                           :label="item.label"
                                                           :value="item.value">
                                                </el-option>
                                            </el-select>
                                        </el-input>
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
        name: "DefControl",
        data() {
            return {
                status: {
                    loading: true,
                    lock: true
                },
                formData: {
                    product: {
                        cycle: '',
                        cycleUnit: '',
                        cyclePrice: ''
                    },
                    local: {
                        flow: '',
                        time: '',
                        flowUnit: 'b',
                        timeUnit: 's',
                        allow_arrears: ''
                    },
                    visitor: {
                        flow: '',
                        time: '',
                        flowUnit: 'b',
                        timeUnit: 's',
                        allow_arrears: ''
                    }
                },
                options: {
                    product: [
                        {label: '天', value: 'day'},
                        {label: '月', value: 'month'},
                        {label: '年', value: 'year'}
                    ],
                    flow: [
                        {label: 'Byte', value: 'b'},
                        {label: 'KB', value: 'kb'},
                        {label: 'MB', value: 'mb'},
                        {label: 'GB', value: 'gb'},
                        {label: 'TB', value: 'tb'}
                    ],
                    time: [
                        {label: '秒', value: 's'},
                        {label: '分钟', value: 'm'},
                        {label: '小时', value: 'h'},
                        {label: '天', value: 'day'},
                        {label: '周', value: 'week'},
                        {label: '月', value: 'month'},
                        {label: '年', value: 'year'}
                    ]
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
                    // 使用量周期
                    let mode = res.data.local.billing_mode.split(',');
                    this.formData.product.cycle = mode[0];
                    this.formData.product.cycleUnit = mode[1];
                    this.formData.product.cyclePrice = mode[2];
                    // 是否允许上网
                    this.formData.local.allow_arrears = res.data.local.allow_arrears;
                    this.formData.visitor.allow_arrears = res.data.visitor.allow_arrears;
                    // 最大上网时长 & 流量
                    this.formData.local.time = res.data.local.time;
                    this.formData.local.flow = res.data.local.flow;
                    this.formData.visitor.time = res.data.visitor.time;
                    this.formData.visitor.flow = res.data.visitor.flow;
                    // 关闭 Loading
                    this.status.loading = false;
                })
            },
            // 更新数据
            update() {
                let url = this.api.update,
                    para = {
                        product_id: this.dataCache.product_id,
                        billing_mode:
                            this.formData.product.cycle + ',' +
                            this.formData.product.cycleUnit + ',' +
                            this.formData.product.cyclePrice,
                        local: {
                            control_id: this.dataCache.local.control_id,
                            allow_arrears: this.formData.local.allow_arrears,
                            rad_attr_ids: this.dataCache.local.rad_attr_ids,
                            time: this.formData.local.time,
                            flow: this.formData.local.flow,
                            area: this.dataCache.local.area,
                            vlan: this.dataCache.local.vlan
                        },
                        visitor: {
                            control_id: this.dataCache.visitor.control_id,
                            allow_arrears: this.formData.visitor.allow_arrears,
                            rad_attr_ids: this.dataCache.visitor.rad_attr_ids,
                            time: this.formData.visitor.time,
                            flow: this.formData.visitor.flow,
                            area: this.dataCache.visitor.area,
                            vlan: this.dataCache.visitor.vlan
                        }
                    };
                request.post(url, para, {
                    success: () => {
                        this.getData();
                        // 退出编辑模式
                        this.status.lock = true;
                        // 单位重置
                        this.formData.local.timeUnit = 's';
                        this.formData.local.flowUnit = 'b';
                        this.formData.visitor.timeUnit = 's';
                        this.formData.visitor.flowUnit = 'b';
                    }
                }, 'notice')
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