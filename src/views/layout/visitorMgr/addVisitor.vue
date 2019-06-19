<template>
    <div>
        <el-row>
            <el-form ref="form" :model="form" :inline="true" :rules="rules" label-width="100px" size="small" v-loading="visible.loading">
                <el-form-item label="账号" prop="user_name">
                    <el-input v-model.trim="form.user_name" :disabled="formdis" clearable></el-input>
                </el-form-item>
                <el-form-item label="姓名" prop="user_real_name">
                    <el-input v-model.trim="form.user_real_name" clearable></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="user_password">
                    <el-input type="password" v-model="form.user_password" clearable></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="checkPass">
                    <el-input type="password" v-model="checkPass" clearable></el-input>
                </el-form-item>
                <!-- <el-form-item label="电子钱包">
                    <el-input v-model.trim="form.num"></el-input>
                </el-form-item> -->
                <el-form-item label="请选择组" prop="group" v-show="visible.cascader">
                    <el-col :span="22">
                        <el-cascader class="fill-width"
                                 expand-trigger="hover"
                                 change-on-select
                                 :show-all-levels="false"
                                 placeholder="用户组"
                                 size="small"
                                 :options="options.group"
                                 :disabled="formdis"
                                 v-model="group_id">
                    </el-cascader>
                    </el-col>
                </el-form-item>
                <el-form-item label="用户组" v-show="!visible.cascader">
                    <el-input v-model="group_name" :disabled="formdis"></el-input>
                </el-form-item>
                <el-form-item label="产品" prop="products" style="margin-left:-16px">
                    <el-col :span="22">
                        <el-select v-model="form.products_id" :disabled="formdis">
                            <el-option v-for="item in $store.state.options.products" :label="item.name" :value="item.id" :key="item.id"></el-option>
                        </el-select>
                    </el-col>
                </el-form-item>
                <!-- 更多选择分割线 -->
                <el-collapse @change="handleChange">
                    <el-collapse-item title="更多选择">
                        <el-form-item label="用户状态">
                            <el-radio-group v-model="form.user_available">
                                <el-radio label="0" value="正常">正常</el-radio>
                                <el-radio label="1" value="禁用">禁用</el-radio>
                                <el-radio label="3" value="暂停">暂停</el-radio>
                                <el-radio label="4" value="未开通">未开通</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="账号过期时间">
                            <el-col :span="20">
                                <el-date-picker v-model="form.user_expire_time" type="date" placeholder="不填写代表永不过期"> </el-date-picker>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="绑定状态">
                            <el-switch v-model="status"></el-switch>
                        </el-form-item>
                        <el-form-item label="证件类型">
                            <el-col :span="22">
                                <el-select v-model="form.cert_type" placeholder="请选择">
                                    <el-option label="学生证" value="shanghai"></el-option>
                                    <el-option label="身份证" value="beijing"></el-option>
                                </el-select>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="证件号码">
                            <el-input v-model.trim="form.cert_num" clearable></el-input>
                        </el-form-item>
                        <el-form-item label="用户类型">
                            <el-col :span="22">
                                <el-select v-model="form.usertype" placeholder="请选择">
                                    <el-option label="普通用户" value="01"></el-option>
                                    <el-option label="访客" value="02"></el-option>
                                </el-select>
                            </el-col>
                        </el-form-item>
                        <el-form-item label="邮件">
                            <el-input v-model.trim="form.email"></el-input>
                        </el-form-item>
                        <el-form-item label="手机号">
                            <el-input v-model.trim="form.phone"></el-input>
                        </el-form-item>
                    </el-collapse-item>
                </el-collapse>
                <el-row :gutter="20" style="margin-top:20px" class="btn-group">
                    <el-col :span="11" :offset="1">
                        <el-button type="primary" size="small" @click="submitForm('form')">提交</el-button>
                    </el-col>
                    <el-col :span="11">
                        <el-button size="small" @click="resetForm('form')">重置</el-button>
                    </el-col>
                </el-row>
            </el-form>
        </el-row>
    </div>
</template>

<script>
    export default {
        props:["addform","obind"],
        name: "add",
        data() {
            return {
                // obind:false,                    //从列表页进入的标识，用于决定提交完成以后是否刷新列表
                formdis:false,
                form:{
                    user_name:"",
                    user_real_name:"",
                    user_password:"",
                    user_available:"1",
                    user_expire_time:"",
                    cert_type:"",
                    cert_num:"",
                    usertype:"01",
                    email:"",
                    phone:"",
                    status:"0",
                    products_id:""
                },
                visible:{
                    cascader:true,
                    loading:true
                },
                status:false,
                group_id: [],           //级联选择器选中的数据
                group_name:"",          // 编辑的时候级联选择器展示的数据
                checkPass:"",
                //表单验证
                rules:{
                    user_name:[
                        { required: true, message: '请输入账号' }
                    ],
                    user_real_name:[
                        { required: true, message: '请输入姓名' }
                    ],
                    user_password: [
                        { required: true, message: '请输入密码'}
                    ],
                    checkPass: [
                        { required: true, validator: this.validatePass2 }
                    ],
                    group:[
                        { required: true,validator: this.validategroup, message: '请选择用户组' }
                    ],
                    products:[
                        { required: true,validator: this.validateproducts, message: '请选择产品' }
                    ]
                },
                //
                options:{
                    group:[]
                },
                url: this.config.api.visitorMgr.addvisitor
            };
        },
        watch: {
            group_id(val){
                this.form.group_id = val[val.length-1];
            },
            status(val){
                if(val){
                    this.form.status='1';
                }else{
                    this.form.status='0';
                }
            }
        },
        methods: {
            handleChange(){},
            validatePass2(rule, value, callback){
                if (this.checkPass === '') {
                    callback(new Error('请再次输入密码'));
                } else if (this.checkPass && this.checkPass !== this.form.user_password) {
                    callback(new Error('两次输入密码不一致!'));
                } else{
                    callback();
                }
            },
            // 编辑的时候确认密码验证
            validatePass3(rule, value, callback){
                if (this.checkPass && this.checkPass !== this.form.user_password) {
                    callback(new Error('两次输入密码不一致!'));
                }
                callback();
            },
            // 用户组非空验证
            validategroup(rule, value, callback){
                if(!this.form.group_id){
                    callback(new Error('请选择用户组'));
                }
                callback();
            },
            // 产品的非空验证
            validateproducts(rule, value, callback){
                if(!this.form.products_id){
                    callback(new Error('请选择产品'));
                }
                callback();
            },
            submitForm(form){
                this.$refs[form].validate((valid) => {
                    if (valid) {
                        let url = this.url,
                            para = this.form;
                        request.post(url, para, {
                            success: () => {
                                //刷新列表
                                if(this.obind){
                                    this.$emit('getData');
                                };
                                // 关闭对话框
                                this.$emit('hiddenVisitor');
                            }
                        }, 'notice');
                    } else {
                        return false;
                    }
                });
            },
            // 重置
            resetForm(form){
                this.$refs[form].resetFields();
                this.checkPass = "";
                this.group_id = [];
            }
        },
        updated(){
            // console.log('2333组件更新了')
        },
        mounted() {
            this.visible.loading = false;
            // 获取用户组
            (() => {
                let url = this.config.api.all.userGroup;
                request.get(url, res => {
                    this.options.group = this.tools.list2tree(res.data, {
                        label: 'name',
                        value: 'id'
                    });
                })
            })();
            if(this.addform.user_name){
                // 组件赋值
                this.form.user_name = this.addform.user_name;
                this.form.user_real_name = this.addform.user_real_name;
                this.form.user_password = this.addform.user_password;
                this.form.user_available = this.addform.user_available;
                this.form.user_expire_time = this.addform.user_expire_time || undefined;
                this.form.cert_type = this.addform.cert_type;
                this.form.cert_num = this.addform.cert_num;
                this.form.usertype = this.addform.usertype;
                this.form.email = this.addform.email;
                this.form.phone = this.addform.phone;
                this.form.status = this.addform.status;
                this.form.products_id = this.addform.products_id;
                this.group_name = this.addform.user_group;
                this.formdis = true;
                this.visible.cascader = false;
                // 修改提交的接口
                this.url = this.config.api.visitorMgr.updatevisitor;
                // 更改验证规则
                this.rules = {
                    user_real_name:[
                        { required: true, message: '请输入姓名' }
                    ],
                    user_password: [
                        { message: '请输入密码'}
                    ],
                    checkPass: [
                        { validator: this.validatePass3 }
                    ]
                }
            }
        }
    };
</script>

<style scoped>
    .el-collapse-item__header{
        padding-left: 38px;
    }
</style>
