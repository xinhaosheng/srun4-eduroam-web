<template>
    <div class="login-page">
        <!-- 登录容器 -->
        <div class="login-container">
            <!-- 标题 -->
            <div class="row">
                <h1 class="title">Srun4k eduroam</h1>
            </div>
            <!-- 账号 -->
            <div class="row input">
                <label for="username" class="icon ion-md-person"></label>
                <input id="username"
                       v-model="username"
                       autocomplete="off"
                       placeholder="请输入用户名">
            </div>
            <!-- 密码 -->
            <div class="row input">
                <label for="password" class="icon ion-md-lock"></label>
                <input id="password"
                       v-model="password"
                       type="password"
                       placeholder="请输入密码">
            </div>
            <!-- 验证码 -->
            <div class="row">
                <label for="captcha" class="icon ion-md-checkbox"></label>
                <input id="captcha"
                       v-model="captcha"
                       type="number"
                       autocomplete="off"
                       @keyup.enter="login"
                       placeholder="请输入验证码">
                <captcha class="captchaImg" :identifyCode="identifyCode" @click.native="refreshCode"/>
            </div>
            <!-- 登录按钮 -->
            <div class="row">
                <button type="button" @click="login">
                    <span>登录</span>
                    <span v-show="status.loading" class="loading el-icon-loading"></span>
                </button>
            </div>
        </div>
        <!-- 背景 -->
        <div class="login-background">
            <!-- <canvasBg :config="canvasBgConfig"/> -->
        </div>
    </div>
</template>

<script>
    import captcha from '@/components/captcha'
    import canvasBg from '@/components/canvasBg'

    export default {
        name: "Login",
        data() {
            return {
                status: {
                    loading: false
                },
                username: '',                           // 账号
                password: '',                           // 密码
                captcha: '',                            // 验证码 输入值
                identifyCode: '',                       // 验证码 对比值
                identifyCodes: '12356890',              // 验证码 范围
                identifyLength: 4,                      // 验证码 长度
                canvasBgConfig: {
                    number: 300,                        // def 300
                    speed: 1.5,                         // def 2
                    pointColor: '#fff',                 // def #fff
                    pointR: 1,                          // def 1
                    lineColor: '221,221,221'
                }
            };
        },
        methods: {
            // 登录
            login() {
                // 开启 loading
                this.status.loading = true;
                // 验证码校验
                if (!this.check()) return false;

                let url = this.config.api.login,
                    data = {
                        user: this.username,
                        pass: this.password,
                    },
                    // 参数加密
                    para = {
                        login: this.tools.encrypt(JSON.stringify(data), this.config.aes.key, this.config.aes.iv)
                    };

                // 发送请求
                request.post(url, para, {
                    success: res => {
                        this.$store.commit('SET_TOKEN', res.data.session.token);
                        this.$store.commit('SET_USER', res.data.session.user);
                        this.$store.commit('SET_OPTIONS');
                        this.$router.push({path: '/status/visitor'});
                    },
                    error: () => {
                        // 重置 验证码
                        this.refreshCode();
                    }
                });
            },
            // 验证码校验
            check() {
                // 开发环境 跳过验证码
                if (process.env.NODE_ENV === 'development') return true;
                // 正确性校验
                if (this.captcha !== this.identifyCode) {
                    this.$notify.error({
                        title: '错误',
                        message: '验证码错误'
                    });
                    // 重置 验证码
                    this.refreshCode();
                    return false;
                } else {
                    return true;
                }
            },
            // 重置 验证码
            refreshCode() {
                // 关闭 loading
                this.status.loading = false;
                this.captcha = '';
                this.identifyCode = '';
                this.makeCode();
            },
            // 生成 验证码
            makeCode() {
                let list = this.identifyCodes,
                    length = this.identifyLength;

                // 依次生成每位字符
                for (let i = 0; i < length; i++) {
                    let index = getRandom(0, list.length);
                    this.identifyCode += list[index];
                }

                // 生成 随机数
                function getRandom(min, max) {
                    return Math.floor(Math.random() * (max - min) + min);
                }
            }
        },
        mounted() {
            this.makeCode();
        },
        components: {
            captcha,
            canvasBg
        }
    }
</script>

<style scoped lang="less">
    .login-page {
        height: 100%;
        background: linear-gradient(to top, #09203f 0%, #537895 100%);
    }
      //登陆页面
    .login-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fff;
        z-index: 99;
        .title {
            color: #fff;
            font-size: 1.75rem;
            text-shadow: 1.5px 1.5px 3px rgba(0, 0, 0, .35);
        }
        .icon {
            position: absolute;
            top: 0;
            left: 0;
            line-height: 35px;
            width: 40px;
            text-align: center;
        }
        input {
            width: 100%;
            height: 35px;
            padding-left: 40px;
            border-bottom: 1px solid rgba(255, 255, 255, .3);
            box-sizing: border-box;
            background: none;
            font-size: 1rem;
            color: #fff;
            &::-webkit-input-placeholder {
                text-indent: .3em;
                font-size: .8rem;
                font-weight: 300;
                color: #eee;
            }
        }
        button {
            width: 100%;
            line-height: 35px;
            color: #fff;
            background: #409EFF;
            border: 0;
            border-radius: 5px;
            box-shadow: 0 0 20px rgba(0, 0, 0, .5);
            outline: none;
            cursor: pointer;
            &:hover {
                background: #409EFF - #111;
            }
            &:active {
                background: #409EFF;
            }
            .loading {
                margin-left: 10px;
            }
        }
    }

    .login-background {
        width: 100%;
        height: 100%;
    }

    .row {
        position: relative;
        width: 300px;
        overflow: hidden;
        &.input {
            &:hover {
                &::after {
                    transform: translate(0);
                }
            }
            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 1px;
                background: rgba(255, 26, 81, .95);
                transform: translate(-100%);
                transition: all .5s;
            }
        }
    }

    .captchaImg {
        position: absolute;
        top: 0;
        right: 0;
    }
</style>