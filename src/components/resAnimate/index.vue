<template>
    <div class="animate">
        <!-- 状态动画 -->
        <div class="animateIcon"
             :class="{ success : status === 'success',
                       error : status === 'error' }">
            <i class="icon"
               :class="{ 'ion-md-checkmark' : status === 'success',
                         'ion-md-close' : status === 'error' }">
            </i>
        </div>

        <!-- 状态信息 -->
        <div class="showInfo" v-show="status !== ''">
            <span class="label">{{status === 'success' ? '成功' : '失败'}}</span>
            <span v-show="status === 'error'">{{info}}</span>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ResAnimate",
        props: ['status','info']
    }
</script>

<style scoped lang="less">
    .animateIcon {
        width: 0;
        height: 0;
        margin: 0 auto;
        overflow: hidden;
        .icon {
            position: relative;
            display: block;
            width: 100%;
            height: 100%;
            line-height: 100px;
            text-align: center;
            font-size: 5rem;
            transition: all .5s .3s;
            &::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                display: block;
                width: 100%;
                height: 100%;
                background: #fff;
                transition: all 1s;
                transform: translateX(0);
            }
        }
        &.success {
            .icon {
                color: #67C23A;
            }
        }
        &.error {
            .icon {
                color: #F56C6C;
            }
        }
        &.success,
        &.error {
            width: 100px;
            height: 100px;
            .icon {
                transform: scale(1.5);
                &::after {
                    transform: translateX(100%);
                }
            }
        }
    }

    .showInfo {
        text-align: center;
        .label {
            display: block;
            font-weight: 600;
            font-size: 1.2rem;
            margin-bottom: 5px;
        }
    }
</style>