<template>
    <div>
        <!-- Tittle -->
        <el-row class="row">
            <h3 class="module-title">自定义控制</h3>
        </el-row>
        <!-- Top Mode -->
        <el-row v-if="$store.state.setting.netMgrCustomizeStyle === 'top'">
            <!-- Nav -->
            <el-row class="row">
                <el-menu :default-active="nowActive"
                         mode="horizontal"
                         @select="handleSelect">
                    <el-menu-item index="1">控制策略列表</el-menu-item>
                    <el-menu-item index="2">按域名应用控制</el-menu-item>
                    <el-menu-item index="3">按用户组应用控制组</el-menu-item>
                    <el-menu-item index="4">按用户列表应用控制组</el-menu-item>
                </el-menu>
            </el-row>
            <!-- View -->
            <el-row class="row">
                <Component_1 v-if="nowActive === '1'"/>
                <Component_2 v-if="nowActive === '2'"/>
                <Component_3 v-if="nowActive === '3'"/>
                <Component_4 v-if="nowActive === '4'"/>
            </el-row>
        </el-row>
        <!-- Left Mode -->
        <el-tabs tab-position="left" v-else>
            <el-tab-pane label="控制策略列表">
                <Component_1/>
            </el-tab-pane>
            <el-tab-pane label="按域名应用控制">
                <Component_2/>
            </el-tab-pane>
            <el-tab-pane label="按用户组应用控制组">
                <Component_3/>
            </el-tab-pane>
            <el-tab-pane label="按用户列表应用控制组">
                <Component_4/>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    import Component_1 from './customize'
    import Component_2 from './domainBind'
    import Component_3 from './batchBind'
    import Component_4 from './groupBind'

    export default {
        name: "Customize",
        data() {
            return {
                nowActive: '1'
            }
        },
        methods: {
            handleSelect(key, keyPath) {
                this.nowActive = keyPath[0];
            }
        },
        components: {
            Component_1,
            Component_2,
            Component_3,
            Component_4,
        }
    }
</script>

<style scoped lang="less">
    .el-tab-pane {
        padding: 0 20px;
        box-sizing: border-box;
    }
</style>