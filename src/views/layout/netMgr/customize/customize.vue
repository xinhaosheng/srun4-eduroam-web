<template>
    <div>
        <!-- Add Button -->
        <el-row class="row">
            <el-button type="primary"
                       size="small"
                       icon="icon ion-md-add"
                       @click="addData('open')">添加数据
            </el-button>
        </el-row>
        <!-- Table -->
        <el-row class="row table-container">
            <el-table :data="tableData"
                      stripe
                      v-loading="status.loading">
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <el-row>
                            <el-col :span="12" class="module">
                                <span class="label">可使用的区域：</span>
                                <span class="value">{{ dealCondition(props.row.condition,'range') }}</span>
                            </el-col>
                            <el-col :span="12" class="module">
                                <span class="label">可访问的资源：</span>
                                <span class="value">{{ dealSource(props.row.rad_attr_ids) }}</span>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引 -->
                <el-table-column type="index" width="40" :index="indexMethod"></el-table-column>
                <el-table-column label="控制组名称" prop="product_name" min-width="180"></el-table-column>
                <el-table-column label="是否允许上网" prop="allow_arrears" width="120">
                    <template slot-scope="scope">
                        <el-tag size="medium"
                                :type="scope.row.allow_arrears === '0' ? 'danger' : 'success'">
                            {{ scope.row.allow_arrears === '0' ? '禁止' : '允许' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="周期" width="100">
                    <template slot-scope="scope">
                        <span>{{ dealBillingMode(scope.row.billing_mode) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="流量" min-width="100">
                    <template slot-scope="scope">
                        <span>{{ dealCondition(scope.row.condition,'flow','show') }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="时长" prop="condition" min-width="100">
                    <template slot-scope="scope">
                        <span>{{ dealCondition(scope.row.condition,'time','show') }}</span>
                    </template>
                </el-table-column>
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
            <el-steps :active="status.stepNow" class="step-view" finish-status="success">
                <el-step title="步骤 1" description="参数配置"></el-step>
                <el-step title="步骤 2" description="填写可使用区域"></el-step>
                <el-step title="步骤 3" description="选择可访问资源"></el-step>
            </el-steps>
            <el-form :model="formData"
                     :rules="rules"
                     status-icon
                     ref="formData"
                     label-width="120px"
                     label-position="left"
                     size="small">
                <el-row v-show="status.stepNow === 0">
                    <el-form-item label="控制组名称" prop="product_name">
                        <el-input v-model.trim="formData.product_name"
                                  clearable
                                  placeholder="请输入控制组名称">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="使用量周期">
                        <el-input placeholder="请输入内容"
                                  v-model.trim="formData.cycle.value"
                                  class="input-with-select">
                            <el-select v-model="formData.cycle.unit"
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
                    <el-form-item label="是否允许上网">
                        <el-row class="radio-group">
                            <el-radio v-model="formData.allow_arrears" label="1" border>允许</el-radio>
                            <el-radio v-model="formData.allow_arrears" label="0" border>禁止</el-radio>
                        </el-row>
                    </el-form-item>
                    <el-form-item label="最大上网时长">
                        <el-input placeholder="请输入最大上网时长"
                                  v-model.trim="formData.time.value"
                                  class="input-with-select">
                            <el-select v-model="formData.time.unit"
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
                        <el-input placeholder="请输入最大上网流量"
                                  v-model.trim="formData.flow.value"
                                  class="input-with-select">
                            <el-select v-model="formData.flow.unit"
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
                </el-row>
                <el-row v-show="status.stepNow === 1">
                    <el-form-item label="可使用的区域">
                        <el-input v-model="formData.useRange"
                                  placeholder="请输入可使用的区域 IP，以 - 分割"
                                  clearable>
                        </el-input>
                    </el-form-item>
                </el-row>
                <el-row v-show="status.stepNow === 2">
                    <el-form-item label="可访问的资源">
                        <el-row class="radio-group">
                            <el-radio-group v-model="formData.rad_attr_ids">
                                <el-radio v-for="(item,index) in $store.state.options.sources"
                                          :key="index"
                                          border
                                          :label="item.value">{{item.label}}
                                </el-radio>
                            </el-radio-group>
                        </el-row>
                    </el-form-item>
                </el-row>
                <!-- 状态动画 -->
                <resAnimate :status="status.dialogStatus" :info="status.dialogInfo"/>
            </el-form>
            <el-row slot="footer" class="dialog-footer btn-group" v-show="status.stepNow !== 3">
                <el-col :span="10">
                    <el-button type="primary"
                               size="small"
                               @click="next"
                               v-show="status.stepNow !== 3">下一步
                    </el-button>
                </el-col>
                <el-col :span="10" :offset="4">
                    <el-button type="danger"
                               size="small"
                               @click="status.stepNow--"
                               v-show="status.stepNow !== 0">上一步
                    </el-button>
                    <el-button type="danger"
                               size="small"
                               @click="formReset"
                               v-show="status.stepNow === 0">取消
                    </el-button>
                </el-col>
            </el-row>
        </el-dialog>
    </div>
</template>

<script>
    import resAnimate from '@/components/resAnimate'

    export default {
        name: "Customize",
        data() {
            return {
                status: {
                    loading: true,
                    showDialog: false,
                    stepNow: 0,
                    dialogType: '',
                    dialogStatus: '',
                    dialogInfo: ''
                },
                tableData: [],
                formData: {
                    product_name: '',
                    cycle: {
                        value: '',
                        unit: 'month'
                    },
                    allow_arrears: '1',
                    time: {
                        value: '',
                        unit: 's'
                    },
                    flow: {
                        value: '',
                        unit: 'gb'
                    },
                    useRange: '',
                    rad_attr_ids: '',
                    condition: ''
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
                rules: {
                    product_name: [
                        {validator: this.tools.ruleLib('productName'), trigger: 'blur'}
                    ]
                },
                api: this.config.api.netMgr.customize
            }
        },
        methods: {
            // 下一步
            next() {
                this.status.stepNow++;
                if (this.status.stepNow === 3) {
                    if (this.status.dialogType === 'add') this.addData();
                    if (this.status.dialogType === 'update') this.update();
                }
            },
            // 添加数据
            addData(action) {
                if (action === 'open') {
                    this.status.dialogType = 'add';
                    this.status.showDialog = true;
                } else {
                    let url = this.api.add,
                        para = {
                            product_name: this.formData.product_name,
                            billing_mode: this.formData.cycle.value + ',' + this.formData.cycle.unit + ',0',
                            allow_arrears: this.formData.allow_arrears,
                            condition: this.getCondString(),
                            rad_attr_ids: this.formData.rad_attr_ids
                        };
                    request.post(url, para, {
                        success: res => {
                            this.getData();
                            this.status.dialogStatus = 'success';
                            this.status.dialogInfo = res.message;
                        },
                        error: res => {
                            this.status.dialogStatus = 'error';
                            this.status.dialogInfo = res.message;
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
                            product_id: row.product_id,
                            control_id: row.control_id
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
                    this.formData.product_id = row.product_id;
                    this.formData.control_id = row.control_id;
                    this.formData.product_name = row.product_name;
                    this.formData.cycle.value = row.billing_mode.split(',')[0];
                    this.formData.cycle.unit = row.billing_mode.split(',')[1];
                    this.formData.allow_arrears = row.allow_arrears;
                    this.formData.time.value = this.dealCondition(row.condition, 'time');
                    this.formData.flow.value = this.dealCondition(row.condition, 'flow');
                    this.formData.time.unit = 's';
                    this.formData.flow.unit = 'b';
                    this.formData.useRange = this.dealCondition(row.condition, 'range');
                    this.formData.rad_attr_ids = row.rad_attr_ids;
                    this.formData.condition = row.condition;
                    // 对话框动作
                    this.status.dialogType = 'update';
                    // 开启对话框
                    this.status.showDialog = true;
                } else {
                    let url = this.api.update,
                        para = {
                            product_id: this.formData.product_id,
                            control_id: this.formData.control_id,
                            product_name: this.formData.product_name,
                            billing_mode: this.formData.cycle.value + ',' + this.formData.cycle.unit + ',0',
                            allow_arrears: this.formData.allow_arrears,
                            condition: this.getCondString(),
                            rad_attr_ids: this.formData.rad_attr_ids
                        };
                    request.post(url, para, {
                        success: res => {
                            this.getData();
                            this.status.dialogStatus = 'success';
                            this.status.dialogInfo = res.message;
                        },
                        error: res => {
                            this.status.dialogStatus = 'error';
                            this.status.dialogInfo = res.message;
                        }
                    }, 'notice');
                }
            },
            // 获取数据
            getData() {
                // 开启 loading
                this.status.loading = true;
                let url = this.api.search,
                    para = {};
                request.get(url, para, res => {
                    this.tableData = res.data;
                    // 关闭 loading
                    this.status.loading = false;
                });
            },
            // 重置表单
            formReset() {
                this.status.stepNow = 0;
                this.status.showDialog = false;
                this.status.dialogStatus = '';
                this.status.dialogInfo = '';
                this.formData = {
                    product_name: '',
                    cycle: {
                        value: '',
                        unit: 'month'
                    },
                    allow_arrears: '1',
                    time: {
                        value: '',
                        unit: 's'
                    },
                    flow: {
                        value: '',
                        unit: 'gb'
                    },
                    useRange: '',
                    rad_attr_ids: '',
                    condition: ''
                };
                this.$refs['formData'].resetFields();
            },
            // 获取 index
            indexMethod(index) {
                return index + 1;
            },
            // 处理计费模式
            dealBillingMode(str) {
                let arr = str.split(',');
                for (let val of this.options.product) {
                    if (arr[1] === val.value) arr[1] = val.label;
                }
                return arr[0] + arr[1];
            },
            // 处理使用条件
            dealCondition(str, res, action) {
                str = str.replace(/ /g, "").split('and');
                switch (res) {
                    case 'time': {
                        for (let val of str) {
                            let timeField = 'sum_seconds',
                                timeIndex = val.indexOf(timeField);
                            if (timeIndex !== -1) {
                                res = val.substring(timeField.length + 1, val.length);
                                if (action === 'show') res = this.tools.formatTime(res, 's');
                            }
                        }
                    }
                        break;
                    case 'flow': {
                        for (let val of str) {
                            let flowField = 'sum_bytes',
                                flowIndex = val.indexOf(flowField);
                            if (flowIndex !== -1) {
                                res = val.substring(flowField.length + 1, val.length);
                                if (action === 'show') res = this.tools.formatFlow(res, 'b');
                            }
                        }
                    }
                        break;
                    case 'range': {
                        let start,
                            end;
                        for (let val of str) {
                            let startField = 'user_ip>',
                                startIndex = val.indexOf(startField),
                                endField = 'user_ip<',
                                endIndex = val.indexOf(endField);
                            if (startIndex !== -1) {
                                start = val.substring(startField.length, val.length);
                            }
                            if (endIndex !== -1) {
                                end = val.substring(endField.length, val.length);
                            }
                        }
                        if (start === undefined || end === undefined) {
                            res = ''
                        } else {
                            res = start + ' - ' + end;
                        }
                    }
                        break;
                }
                return res;
            },
            // 处理可访问资源
            dealSource(str) {
                for (let val of this.$store.state.options.sources) {
                    if (val.value === str) return val.label;
                }
            },
            // 获取条件字符串
            getCondString() {
                let time = this.formData.time.value,
                    flow = this.formData.flow.value,
                    range = this.formData.useRange.replace(/ /g, "").split('-');

                switch (this.formData.time.unit) {
                    case 'm':
                        time = time * 60;
                        break;
                    case 'h':
                        time = time * 3600;
                        break;
                    case 'day':
                        time = time * 3600 * 24;
                        break;
                    case 'week':
                        time = time * 3600 * 24 * 7;
                        break;
                    case 'month':
                        time = time * 3600 * 24 * 30;
                        break;
                    case 'year':
                        time = time * 3600 * 24 * 365;
                        break;
                }

                switch (this.formData.flow.unit) {
                    case 'kb':
                        flow = flow * 1024;
                        break;
                    case 'mb':
                        flow = flow * 1024 * 1024;
                        break;
                    case 'gb':
                        flow = flow * 1024 * 1024 * 1024;
                        break;
                    case 'tb':
                        flow = flow * 1024 * 1024 * 1024 * 1024;
                        break;
                }

                let cond = `sum_bytes<${flow} and sum_seconds<${time}`;

                if (range.length === 2) cond += ` and user_ip>${range[0]} and user_ip<${range[1]}`;

                return cond;
            },
        },
        mounted() {
            this.getData();
        },
        components: {
            resAnimate
        }
    }
</script>

<style scoped lang="less">
    .step-view {
        margin-bottom: 50px;
    }
</style>