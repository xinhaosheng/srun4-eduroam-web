<template>
    <div>
        <!-- Form -->
        <el-row class="row">
            <el-col :xs="24"
                    :sm="18"
                    :md="$store.state.setting.netMgrCustomizeStyle === 'top' ? 12 : ''">
                <el-card>
                    <el-form :model="formData"
                             label-width="120px"
                             label-position="left"
                             size="small">
                        <el-form-item label="变更类型">
                            <el-row class="radio-group">
                                <el-radio v-model="formData.change_type" label="change_now" border>立即变更</el-radio>
                                <el-radio v-model="formData.change_type" label="change_appoint" border>预约转移</el-radio>
                                <el-radio v-model="formData.change_type" label="change_next" border>转移到下周期</el-radio>
                            </el-row>
                        </el-form-item>
                        <el-form-item label="转移日期" v-show="formData.change_type === 'change_appoint'">
                            <el-date-picker v-model="formData.change_date"
                                            value-format="yyyy-MM-dd"
                                            type="date"
                                            placeholder="转移日期">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item label="下载模板">
                            <el-button type="success" icon="icon ion-md-download" @click="download">下载模板</el-button>
                        </el-form-item>
                        <el-form-item label="查询产品 ID">
                            <el-autocomplete v-model="formData.product_name"
                                             clearable
                                             :fetch-suggestions="querySearch"
                                             placeholder="请输入产品名称"
                                             @clear="formData.product_id = ''"
                                             @select="handleSelect">
                            </el-autocomplete>
                            <span class="product-id">产品 ID：{{ formData.product_id }}</span>
                        </el-form-item>
                        <el-form-item label="上传文件">
                            <el-upload drag
                                       ref="upload"
                                       name="excel"
                                       class="fill-width"
                                       :data="formData"
                                       :action="config.reqUrl + ':' + config.reqPort + api.upload"
                                       :with-credentials="true"
                                       :auto-upload="false"
                                       :headers="{token:$store.state.token}"
                                       :on-success="uploadSuccess"
                                       multiple>
                                <i class="el-icon-upload"></i>
                                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                            </el-upload>
                        </el-form-item>
                        <el-form-item>
                            <el-row class="btn-group">
                                <el-button type="primary" size="small" @click="upload">提交</el-button>
                            </el-row>
                        </el-form-item>
                    </el-form>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    export default {
        name: "BatchBindCtrl",
        data() {
            return {
                productListTips: (() => {
                    let arr = [];
                    for (let val of this.$store.state.options.products) {
                        arr.push({
                            value: val.label
                        })
                    }
                    return arr;
                })(),
                formData: {
                    change_type: 'change_now'
                },
                dateShow: false,
                api: this.config.api.netMgr.batchBind
            }
        },
        methods: {
            // 下载模板
            download() {
                location = `${this.config.reqUrl}:${this.config.reqPort}${this.api.download}?download_type=${this.formData.change_type}`;
            },
            // 上传
            upload() {
                if (this.formData.change_type !== 'change_appoint') this.formData.change_date = undefined;
                this.$refs.upload.submit();
            },
            // 上传状态
            uploadSuccess(res) {
                if (res.code === 500) {
                    this.$store.commit('LOGOUT', '');           // 清空 Token
                    this.router.push({path: '/'});              // 路由跳转
                    return this.$message({
                        showClose: true,
                        message: '您因长时间未操作而注销，请重新登录',
                        type: 'error'
                    });
                }

                if (res.code === 200) {
                    this.$notify({
                        title: '成功',
                        message: res.message,
                        type: 'success'
                    });
                } else if (res.code === 400) {
                    this.$notify.error({
                        title: '错误',
                        message: res.message
                    });
                }
            },
            // 查询产品 ID
            querySearch(queryString, cb) {
                let productList = this.productListTips,
                    results = queryString ? productList.filter(this.createFilter(queryString)) : productList;
                // 调用 callback 返回建议列表的数据
                cb(results);
            },
            createFilter(queryString) {
                return product => {
                    return (product.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
                };
            },
            handleSelect(item) {
                for (let val of this.$store.state.options.products) {
                    if (val.label === item.value) this.formData.product_id = val.value;
                }
            }
        }
    }
</script>

<style scoped lang="less">
    .product-id {
        margin-left: 20px;
    }
</style>