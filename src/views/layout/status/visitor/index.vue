<template>
    <div>
        <el-row class="row">
            <h3 class="module-title">访客来访</h3>
        </el-row>
        <el-row class="row">
            <el-menu :default-active="nowActive"
                     mode="horizontal"
                     @select="handleSelect">
                <el-menu-item index="1">访客组成</el-menu-item>
                <el-menu-item index="2">使用量 Top</el-menu-item>
                <el-menu-item index="3">学校流量统计</el-menu-item>
                <el-menu-item index="4">每日访客情况</el-menu-item>
                <el-menu-item index="5">漫游人数统计</el-menu-item>
            </el-menu>
        </el-row>
        <el-row class="row">
            <Component_1 v-if="nowActive === '1'"/>
            <Component_2 v-if="nowActive === '2'"/>
            <Component_3 v-if="nowActive === '3'"/>
            <Component_4 v-if="nowActive === '4'"/>
            <Component_5 v-if="nowActive === '5'"/>
        </el-row>
    </div>
</template>

<script>
    import Component_1 from './Composition';
    import Component_2 from './Top';
    import Component_3 from './Count';
    import Component_4 from './Daily';
    import Component_5 from './Roaming';

    export default {
        name: "Visitor",
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
            Component_5,
        }
    }
</script>

<style scoped>

</style>