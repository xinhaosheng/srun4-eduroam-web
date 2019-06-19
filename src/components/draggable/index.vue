<template>
    <div>
        <el-row class="row">
            <el-col :span="12">
                <el-autocomplete v-model.trim="search"
                                 size="small"
                                 clearable
                                 :fetch-suggestions="querySearch"
                                 placeholder="查询字段"
                                 @select="selectSearchField">
                </el-autocomplete>
            </el-col>
            <el-col :span="12">
                <el-row type="flex" justify="end">
                    <el-button type="primary"
                               size="small"
                               icon="icon ion-md-refresh"
                               @click="orderList">排序重置
                    </el-button>
                </el-row>
            </el-col>
        </el-row>
        <el-row class="row group">
            <!-- Loading -->
            <i class="icon el-icon-loading" v-show="list.length === 0 && choseData.length === 0"></i>
            <draggable class="list-group"
                       tag="div"
                       v-model="list"
                       v-bind="dragOptions"
                       :move="onMove"
                       @start="isDragging=true"
                       @end="isDragging=false">
                <transition-group type="transition" :name="'flip-list'">
                    <el-tag v-for="(element,index) in list"
                            class="animated"
                            :class="element.animate ? 'bounce' : ''"
                            :key="index">
                        <!-- 索引 -->
                        <!--<span class="badge">{{element.order}}.</span>-->
                        <span>{{element.name}}</span>
                    </el-tag>
                </transition-group>
            </draggable>
        </el-row>
        <el-row class="row target zh" :class="choseData.length === 0 ? 'tips' : ''">
            <draggable element="span"
                       v-model="choseData"
                       v-bind="dragOptions"
                       :move="onMove">
                <transition-group name="no"
                                  class="list-group"
                                  tag="div">
                    <el-tag v-for="(element,index) in choseData"
                            class="animated"
                            :class="{ bounce: element.animate}"
                            :id="element.value === 'draggablePatch' ? 'draggablePatch' : ''"
                            :type="element.fixed ? 'warning' : 'primary'"
                            :closable="!element.fixed"
                            @close="removeTag(index,element)"
                            :key="index">
                        <el-tooltip :disabled="!element.fixed"
                                    effect="dark"
                                    content="此字段为固定字段，不可排序"
                                    placement="top">
                            <!-- 索引 -->
                            <!--<span class="badge">{{element.order}}.</span>-->
                            <span>{{element.name}}</span>
                        </el-tooltip>
                    </el-tag>
                </transition-group>
            </draggable>
        </el-row>
    </div>
</template>

<script>
    import draggable from "vuedraggable";
    import animate from 'animate.css'

    export default {
        name: "Draggable",
        data() {
            return {
                search: '',
                list: [],
                choseData: [],
                editable: true,
                isDragging: false,
                delayedDragging: false
            };
        },
        methods: {
            // 初始化
            init(data) {
                this.list = [];
                this.choseData = [];

                for (let i = 0; i < data.unselect.length; i++) {
                    let val = data.unselect[i];
                    this.list.push({
                        name: val.label,
                        value: val.value,
                        order: i + 1,
                        fixed: false
                    })
                }

                for (let i = 0; i < data.select.length; i++) {
                    let val = data.select[i];
                    this.choseData.push({
                        name: val.label,
                        value: val.value,
                        order: i + 1 + this.list.length,
                        fixed: val.fixed
                    })
                }

                this.choseData.push({
                    name: '',
                    value: 'draggablePatch',
                    order: data.select.length + data.unselect.length + 1,
                    fixed: false
                });
            },
            orderList() {
                this.list = this.list.sort((one, two) => {
                    return one.order - two.order;
                });
            },
            onMove({relatedContext, draggedContext}) {
                const relatedElement = relatedContext.element;
                const draggedElement = draggedContext.element;
                return (
                    (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
                );
            },
            removeTag(index, element) {
                this.list.push(element);
                this.choseData.splice(index, 1);
            },
            querySearch(queryString, cb) {
                let fields = this.list.concat(this.choseData);
                fields = (() => {
                    let arr = [];
                    for (let val of fields) {
                        arr.push({
                            value: val.name,
                            field: val.value
                        })
                    }
                    return arr;
                })();
                let results = queryString ? fields.filter(this.createFilter(queryString)) : fields;
                // 调用 callback 返回建议列表的数据
                cb(results);
            },
            createFilter(queryString) {
                return (field) => {
                    return (field.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
                };
            },
            selectSearchField(item) {
                for (let val of this.list) {
                    if (val.value === item.field) {
                        val.animate = true;
                        setTimeout(() => {
                            val.animate = false;
                        }, 1000)
                    }
                }
                for (let val of this.choseData) {
                    if (val.value === item.field) {
                        val.animate = true;
                        setTimeout(() => {
                            val.animate = false;
                        }, 1000)
                    }
                }
            },
            // 获取要更新的参数
            getUpdateField() {
                let arr = [];
                for (let val of this.choseData) {
                    if (val.value === 'draggablePatch') continue;
                    arr.push(val.value);
                }
                return arr;
            },
            // 获取选择字段
            getChoseField() {
                let arr = [];
                for (let val of this.choseData) {
                    if (val.value === 'draggablePatch') continue;
                    arr.push({
                        label: val.name,
                        value: val.value
                    })
                }
                return arr;
            }
        },
        computed: {
            dragOptions() {
                return {
                    animation: 0,
                    group: "description",
                    disabled: !this.editable,
                    ghostClass: "ghost"
                };
            }
        },
        watch: {
            isDragging(newValue) {
                if (newValue) {
                    this.delayedDragging = true;
                    return;
                }
                this.$nextTick(() => {
                    this.delayedDragging = false;
                });
            }
        },
        components: {
            draggable
        }
    }
</script>

<style scoped lang="less">
    #draggablePatch {
        margin: 0;
        padding: 0;
        border: 0;
        width: 0;
        height: 0;
        visibility: hidden;
    }

    .badge {
        margin-right: 5px;
    }

    .group {
        position: relative;
        .icon {
            display: block;
            text-align: center;
            font-size: 2rem;
        }
    }

    .target {
        padding: 20px 20px 10px 20px;
        box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08);
        border-radius: 5px;
        .list-group {
            position: relative;
            min-height: 100px;
            &::after {
                display: none;
            }
        }
        &.tips {
            .list-group::after {
                position: absolute;
                display: block;
                width: 80%;
                text-align: center;
                top: 50%;
                left: 50%;
                color: #606266;
                transform: translate(-50%, -50%);
            }
            &.zh .list-group::after {
                content: '请将需要展示的字段拖动至框体内，表格将根据字段顺序展示数据';
            }
            &.en .list-group::after {
                content: 'Drag the fields you want to display into the frame, and the table will display the data according to the order of the fields.';
            }
        }
    }

    .el-tag {
        cursor: pointer;
        &:hover {
            border-color: #F56C6C;
        }
    }

    .flip-list-move {
        transition: transform .5s;
    }

    .no-move {
        transition: transform .5s;
    }

    .ghost {
        opacity: 0.5;
        background: #c8ebfb;
    }

    .list-group-item {
        cursor: move;
    }

    .list-group-item i {
        cursor: pointer;
    }
</style>