<template>
    <div>
        <!-- Search -->
        <el-row class="row" :gutter="20">
            <el-col :span="8">
                <el-date-picker class="fill-width hiddenClearable"
                                v-model="timeRange"
                                value-format="yyyy-MM-dd"
                                type="daterange"
                                align="left"
                                size="small"
                                unlink-panels
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                :picker-options="tools.pickerOptions('range')"
                                @change="getData">
                </el-date-picker>
            </el-col>
            <el-col :span="4">
                <el-select class="fill-width"
                           v-model="showNow"
                           size="small"
                           @change="changeShow">
                    <el-option v-for="(item,index) in options"
                               :key="index"
                               :label="item.label"
                               :value="item">
                    </el-option>
                </el-select>
            </el-col>
            <el-col :span="12">
                <el-row type="flex" justify="end">
                    <el-button type="info"
                               size="small"
                               icon="icon ion-md-options" @click="proOptions = !proOptions">高级选项
                    </el-button>
                    <el-button type="primary"
                               size="small"
                               icon="icon ion-md-list-box" @click="showReport = !showReport">数据报表
                    </el-button>
                </el-row>
            </el-col>
        </el-row>
        <!-- Pro Search -->
        <transition name="el-zoom-in-top">
            <el-row class="row" :gutter="20" v-show="proOptions">
                <el-col :span="12">
                    <el-slider v-model="topNum"
                               :min="1"
                               :max="20"
                               show-stops
                               show-input
                               @change="getData">
                    </el-slider>
                </el-col>
            </el-row>
        </transition>
        <!-- Chart -->
        <el-row class="row">
            <div class="chart" id="chart" v-loading="status.loading"></div>
        </el-row>
        <!-- Dialog -->
        <el-dialog :title="showNow.label + '（ ' + timeRangeText + ' ）'"
                   :visible.sync="showReport"
                   width="1000px">
            <el-table :data="tableData"
                      stripe>
                <el-table-column prop="user_name" label="用户名" min-width="200"></el-table-column>
                <el-table-column label="总流量" width="120">
                    <template slot-scope="scope">
                        {{ tools.formatFlow(scope.row.total_bytes,'b') }}
                    </template>
                </el-table-column>
                <el-table-column label="入流量" min-width="120">
                    <template slot-scope="scope">
                        {{ tools.formatFlow(scope.row.bytes_in,'b') }}
                    </template>
                </el-table-column>
                <el-table-column label="出流量" min-width="120">
                    <template slot-scope="scope">
                        {{ tools.formatFlow(scope.row.bytes_out,'b') }}
                    </template>
                </el-table-column>
                <el-table-column label="总时长" min-width="180">
                    <template slot-scope="scope">
                        {{ tools.formatTime(scope.row.time_long,'s') }}
                    </template>
                </el-table-column>
                <el-table-column prop="login_count" label="认证次数" min-width="120"></el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Top",
        data() {
            return {
                status: {
                    loading: true
                },
                // 显示数目
                topNum: 10,
                // 图表项目
                options: [
                    {label: '访客使用流量 Top', unit: 'flow', value: 'users_bytes'},
                    {label: '访客使用时长 Top', unit: 'time', value: 'users_times'},
                    {label: '国家使用流量 Top', unit: 'flow', value: 'country_bytes'},
                    {label: '国家使用时长 Top', unit: 'time', value: 'country_times'}
                ],
                // 启用高级选项
                proOptions: false,
                // 显示报表
                showReport: false,
                // 当前展示项目
                showNow: {label: '访客使用流量 Top', unit: 'flow', value: 'users_bytes'},
                // 查询时间范围 value
                timeRange: '',
                // 查询时间范围 文字提示
                timeRangeText: '',
                // 全部数据
                totalData: {},
                // 图表数据
                chartData: {},
                // 表格数据
                tableData: [],
                // 请求接口
                api: this.config.api.status.visitor.top
            }
        },
        methods: {
            // 获取当前日期
            getToday(type = this.$store.state.setting.defSearchRange) {
                let end = new Date(),
                    start = new Date();

                switch (type) {
                    case 'week':
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                        break;
                    case 'month':
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        break;
                    case 'month*3':
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        break;
                }

                this.timeRange = [
                    this.tools.timeTransform(start, {
                        now: 'object',
                        res: 'yy-MM-dd'
                    }),
                    this.tools.timeTransform(end, {
                        now: 'object',
                        res: 'yy-MM-dd'
                    })
                ];

                this.getData();
            },
            // 获取数据
            getData() {
                // 开启 loading 状态
                this.status.loading = true;

                let url = this.api,
                    para = {
                        start_time: this.timeRange[0],
                        stop_time: this.timeRange[1],
                        top_num: this.topNum
                    };

                request.get(url, para, res => {
                    this.totalData = res.data;
                    this.chartData = this.totalData[this.showNow.value].chart;
                    this.tableData = this.totalData[this.showNow.value].table;
                    // 关闭 loading 状态
                    this.status.loading = false;
                    this.createChart();
                });

                this.timeRange2text();
            },
            // 改变展示项目
            changeShow(option) {
                this.chartData = this.totalData[option.value].chart;
                this.tableData = this.totalData[option.value].table;
                this.createChart();
            },
            // 绘制图表
            createChart() {
                let chart = this.$echarts.init(document.getElementById('chart')),
                    label = [],
                    value = [],
                    name = this.showNow.label,
                    unit = this.showNow.unit;

                if (!this.tools.checkChartData(chart, this.chartData)) return false;

                for (let val of this.chartData) {
                    label.push(val.label);
                    value.push(val.value);
                }

                let newData = this.tools.arrUp(value, label);

                value = newData.value;
                label = newData.label;

                let option = {
                    title: {
                        text: name + this.topNum,
                        subtext: this.timeRangeText,
                        x: "120px",
                        y: "30px",
                        padding: [10, 20, 10, 20],
                        borderWidth: 1,
                        borderColor: '#ddd',
                        borderRadius: 5,
                        backgroundColor: 'rgba(238,238,238,.3)',
                        textStyle: {
                            color: '#303133',
                            lineHeight: '30',
                            fontSize: 18
                        },
                        subtextStyle: {
                            color: '#909399',
                            fontSize: '14',
                        },
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: obj => {
                            let label;
                            if (unit === 'time') {
                                label = this.tools.formatTime(obj.value[1], 's')
                            } else {
                                label = this.tools.formatFlow(obj.value[1], 'b')
                            }
                            return label;
                        }
                    },
                    grid: {
                        top: '20px',
                        bottom: '100px',
                        left: '100px',
                        right: '100px'
                    },
                    dataRange: {
                        show: false,
                        min: 0,
                        max: 12,
                        calculable: true,
                        color: ['#d94e5d', '#eac736', '#50a3ba'],
                        y: 'center'
                    }, // 视觉映射
                    xAxis: [{
                        type: 'category',
                        data: label,
                        // 反向 x 轴
                        // inverse: true,
                        axisLabel: {
                            fontSize: '12',
                            color: '#606266',
                            rotate: 30,
                            margin: 15
                        },
                        axisLine: {
                            show: false,
                        },
                        axisTick: {
                            show: false
                        }
                    }],
                    yAxis: [{
                        type: 'value',
                        offset: 20,
                        splitNumber: 10,
                        minInterval: 1,
                        axisLine: {
                            show: false,
                        },
                        axisLabel: {
                            fontSize: '12',
                            color: '#606266',
                            formatter: num => {
                                if (unit === 'time') {
                                    switch (true) {
                                        case value[value.length - 1] / 60 < 1:
                                            return num + ' (s)';
                                        case value[value.length - 1] / 3600 < 1:
                                            return parseInt(num / 60) + ' (m)';
                                        default:
                                            return parseInt(num / 3600) + ' (h)';
                                    }
                                } else {
                                    switch (true) {
                                        case value[value.length - 1] / 1024 < 1:
                                            return num + ' B';
                                        case value[value.length - 1] / (1024 * 1024) < 1:
                                            return parseInt(num / (1024)) + ' KB';
                                        case value[value.length - 1] / (1024 * 1024 * 1024) < 1:
                                            return parseInt(num / (1024 * 1024)) + ' MB';
                                        case value[value.length - 1] / (1024 * 1024 * 1024 * 1024) < 1:
                                            return parseInt(num / (1024 * 1024 * 1024)) + ' GB';
                                        default:
                                            return parseInt(num / (1024 * 1024 * 1024 * 1024)) + ' TB';
                                    }
                                }
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            lineStyle: {
                                type: 'dashed',
                                color: '#ddd'
                            }
                        }
                    }],
                    series: [{
                        type: 'bar',
                        barGap: 0.1,
                        barMaxWidth: 100,
                        barCategoryGap: 15,
                        itemStyle: {
                            normal: {
                                color(params) {
                                    // build a color map as your need.
                                    let colorList = [
                                        '#C1232B', '#B5C334', '#FCCE10', '#E87C25', '#27727B',
                                        '#FE8463', '#9BCA63', '#FAD860', '#F3A43B', '#60C0DD',
                                        '#D7504B', '#C6E579', '#F4E001', '#F0805A', '#26C0C0'
                                    ];
                                    return colorList[params.dataIndex];
                                },
                                label: {
                                    show: true,
                                    position: 'top',
                                    formatter: obj => {
                                        let label;
                                        if (unit === 'time') {
                                            label = this.tools.formatTime(obj.value[1], 's')
                                        } else {
                                            label = this.tools.formatFlow(obj.value[1], 'b')
                                        }
                                        return label;
                                    }
                                },
                                shadowBlur: 50,
                                barBorderRadius: 5,
                                shadowColor: 'rgba(0, 0, 0, 0.3)'
                            }
                        },
                        data: value.map((a, idx) => {
                            return [idx, a, idx];
                        })
                    }]
                };

                chart.setOption(option, true);
            },
            // 日期范围转文字
            timeRange2text() {
                let
                    start = this.tools.timeTransform(this.timeRange[0], {
                        now: 'yy-MM-dd',
                        res: 'string'
                    }),
                    end = this.tools.timeTransform(this.timeRange[1], {
                        now: 'yy-MM-dd',
                        res: 'string'
                    });

                this.timeRangeText = start + ' 至 ' + end;
            },
            // 设置表格索引
            indexMethod(index) {
                return index + 1;
            }
        },
        mounted() {
            this.getToday();
        }
    }
</script>

<style scoped lang="less">
    .danger {
        color: #F56C6C;
        font-weight: 600;
    }
</style>