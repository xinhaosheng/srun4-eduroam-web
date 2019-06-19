<template>
    <el-container>
        <el-header height="50px" class="layout-header">
            <Header/>
        </el-header>
        <el-container>
            <el-aside :width="this.$store.state.device === 'pc' ? '260px' : '65px'">
                <Nav/>
            </el-aside>
            <el-main class="layout-main">
                <router-view/>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    import Header from './public/Header'
    import Nav from './public/Nav'

    export default {
        name: 'Layout',
        components: {
            Header,
            Nav
        }
    }
</script>
