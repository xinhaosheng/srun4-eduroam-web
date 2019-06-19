<template>
    <div id="app">
        <router-view/>
    </div>
</template>

<script>
    export default {
        name: 'App',
        methods: {
            // 判断设备类型
            getDeviceType() {
                let device,
                    width = document.body.offsetWidth,
                    status = this.$store.state.device;

                switch (true) {
                    case width <= 768:
                        device = 'phone';
                        break;
                    case width > 768 && width <= 1200:
                        device = 'pad';
                        break;
                    case width > 1200:
                        device = 'pc';
                        break;
                }

                if (!status && device === 'pc') return false;

                this.$store.commit('CHANGE_DEVICE', device);
            }
        },
        watch: {
            // 路由监听
            $route(to, from) {
                // Title 动态切换
                document.title = to.meta.title;
                // 路由监听
                // 对于跳转至 login 页面与来自 login 页面的跳转 保持用户活跃
                if (to.path !== '/' && from.path !== '/') request.get(this.config.api.keepActive);
            }
        },
        mounted() {
            // 获取默认 Title
            document.title = this.$route.meta.title;
            // 判断设备类型
            this.getDeviceType();
            // 监听窗口尺寸以实现响应式效果
            window.onresize = () => {
                this.getDeviceType();
            };
            // 读取选项
            this.$store.commit('GET_OPTIONS');
        }
    }
</script>

<style lang="less">
    @import "assets/less/main";
</style>
