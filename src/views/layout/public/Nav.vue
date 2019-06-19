<template>
    <nav>
        <el-menu class="menu"
                 background-color="#222d32"
                 text-color="#FFF"
                 :default-active="this.$route.path"
                 :collapse="$store.state.device !== 'pc'"
                 unique-opened
                 router>

            <!-- Status -->
            <el-submenu index="status">
                <template slot="title">
                    <i class="icon" :class="status.icon"></i>
                    <span slot="title">{{status.name}}</span>
                </template>
                <span class="mini-title"
                      v-show="$store.state.device !== 'pc'">
                    {{status.name}}
                </span>
                <el-menu-item v-for="(item,index) in status.subMenu"
                              :key="index"
                              :index="item.path">
                    <i class="el-icon-caret-right"></i>
                    {{item.name}}
                </el-menu-item>
            </el-submenu>

            <!-- VisitorMgr -->
            <el-menu-item :index="visitorMgr.path">
                <i class="icon" :class="visitorMgr.icon"></i>
                <span slot="title">{{visitorMgr.name}}</span>
            </el-menu-item>

            <!-- InternetMgr -->
            <el-submenu index="netMgr">
                <template slot="title">
                    <i class="icon" :class="netMgr.icon"></i>
                    <span slot="title">{{netMgr.name}}</span>
                </template>
                <span class="mini-title"
                      v-show="$store.state.device !== 'pc'">
                        {{netMgr.name}}
                    </span>
                <el-menu-item v-for="(item,index) in netMgr.subMenu"
                              :key="index"
                              :index="item.path">
                    <i class="el-icon-caret-right"></i>
                    {{item.name}}
                </el-menu-item>
            </el-submenu>

            <!-- LogMgr -->
            <el-submenu index="logMgr">
                <template slot="title">
                    <i class="icon" :class="logMgr.icon"></i>
                    <span slot="title">{{logMgr.name}}</span>
                </template>
                <span class="mini-title"
                      v-show="$store.state.device !== 'pc'">
                        {{logMgr.name}}
                    </span>
                <el-menu-item v-for="(item,index) in logMgr.subMenu"
                              :key="index"
                              :index="item.path">
                    <i class="el-icon-caret-right"></i>
                    {{item.name}}
                </el-menu-item>
            </el-submenu>

            <!-- Document -->
            <el-submenu index="document">
                <template slot="title">
                    <i class="icon" :class="document.icon"></i>
                    <span slot="title">{{document.name}}</span>
                </template>
                <span class="mini-title"
                      v-show="$store.state.device !== 'pc'">
                        {{document.name}}
                    </span>
                <el-menu-item v-for="(item,index) in document.subMenu"
                              :key="index"
                              :index="item.path">
                    <i class="el-icon-caret-right"></i>
                    {{item.name}}
                </el-menu-item>
            </el-submenu>
        </el-menu>
    </nav>
</template>

<script>
    export default {
        name: "Nav",
        data() {
            return {
                status: {
                    name: "运行状态",
                    icon: "ion-md-stats",
                    subMenu: [
                        {path: "/status/visitor", name: "访客来访"},
                        {path: "/status/log", name: "出访记录"},
                        {path: "/status/domain", name: "学校域名管理"},
                        {path: "/status/online", name: "在线分析"}
                    ]
                },
                visitorMgr: {
                    name: "访客管理",
                    icon: "ion-md-people",
                    path: '/visitorMgr'
                },
                netMgr: {
                    name: "上网控制",
                    icon: "ion-md-laptop",
                    subMenu: [
                        {path: "/netMgr/defControl", name: "默认控制策略"},
                        {path: "/netMgr/areaMgr", name: "区域管理"},
                        {path: "/netMgr/sourceMgr", name: "资源管理"},
                        {path: "/netMgr/customize", name: "自定义控制"}
                    ]
                },
                logMgr: {
                    name: "日志管理",
                    icon: "ion-md-paper",
                    subMenu: [
                        {path: "/logMgr/operate", name: "操作日志"},
                        {path: "/logMgr/detail", name: "上网明细"},
                        {path: "/logMgr/authenticate", name: "认证日志"},
                        {path: "/logMgr/system", name: "系统日志"},
                        {path: "/logMgr/account", name: "开销户日志"},
                        {path: "/logMgr/login", name: "登录日志"}
                    ]
                },
                document: {
                    name: "文档",
                    icon: "ion-md-book",
                    subMenu: [
                        {path: "/documents/link", name: "eduroam 连接指南"}
                    ]
                }
            };
        }
    };
</script>

<style scoped lang="less">
    @import "../../../assets/less/conf";

    nav {
        height: 100%;

        .menu {
            min-height: 100%;
        }

        .icon {
            display: inline-block;
            width: 24px;
            height: 18px;
            line-height: 18px;
            text-align: center;
            font-size: 18px;
            color: #fff;
            margin-right: 5px;
            vertical-align: middle;
        }

        li, span {
            font-weight: 300;
        }
    }
</style>