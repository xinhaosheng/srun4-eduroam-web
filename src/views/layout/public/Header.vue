<template>
    <div>
        <div class="logo" :class="$store.state.device !== 'pc' ? 'mini' : ''">
            <h1>Srun4K eduroam</h1>
        </div>
        <div class="sidebar-toggle">
            <button type="button" @click="changeNavStatus">
                <i class="icon ion-md-menu"></i>
            </button>
        </div>
        <div class="tools">
            <!-- 注销 -->
            <button type="button" @click="logout">
                <i class="icon ion-md-power"></i>
            </button>
            <span class="text">版本：v1.0</span>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Header",
        data() {
            return {
                version: ''
            };
        },
        methods: {
            changeNavStatus() {
                let status = this.$store.state.device;
                this.$store.state.device = status === 'pc' ? '' : 'pc'
            },
            // 注销
            logout() {
                this.$confirm("您确定要注销吗？", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                })
                    .then(() => {
                        this.$store.commit('LOGOUT', '');           // 清空 Token
                        this.$router.push({path: '/'});             // 路由跳转
                        request.get(this.config.api.logout);        // 下线请求
                    })
                    .catch(() => {
                        this.$message({
                            type: 'info',
                            message: '已取消'
                        });
                    });
            }
        }
    };
</script>

<style scoped lang="less">
    @import "../../../assets/less/conf";

    .header;

    .logo {
        display: inline-block;
        width: 260px;
        padding-left: @height;
        box-sizing: border-box;
        float: left;
        cursor: default;

        h1 {
            color: #fff;
            line-height: @height;
            text-shadow: 1px 1px 1px rgba(0, 0, 0, .3);
        }

        &.mini {
            float: none;
        }
    }

    button {
        width: @height;
        text-align: center;
        cursor: pointer;
        float: right;

        .icon {
            color: #fff;
            line-height: @height;
            font-size: 1.5rem;
        }

        &:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    }

    .sidebar-toggle {
        float: left;
        button {
            width: 65px;
        }
    }

    .tools {
        float: right;
        margin-right: 50px;

        .text {
            float: right;
            line-height: 50px;
            font-size: 1rem;
            color: #fff;
            margin-right: 20px;
        }
    }
</style>