<template>
<div>
    <el-row class="row">
    <h3 class="module-title">在线访客</h3>
    </el-row>
    <!-- Search -->
    <el-row class="row">
        <el-menu :default-active="nowActive"
                    mode="horizontal"
                    @select="handleSelect">
            <el-menu-item index="1">当前在线访客</el-menu-item>
            <el-menu-item index="2">每日在线分析</el-menu-item>
        </el-menu>
    </el-row>
    <el-row class="row">
        <visit v-if="nowActive === '1'"/>
        <analy v-if="nowActive === '2'"/>
    </el-row>
  </div>
</template>

<script>
import analy from './analy';
import visit from './visit';
export default {
    name: "online",
    components: {
        analy,
        visit
    },
    data() {
        return {
            nowActive: '1'
        }
    },
    methods: {
        handleSelect(key, keyPath) {
            this.nowActive = keyPath[0];
        }
    }
};
</script>

<style scoped>
</style>