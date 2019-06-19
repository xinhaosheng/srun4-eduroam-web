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
        </el-row>
        <!-- Chart -->
        <el-row class="row">
            <div class="chart" id="chart" v-loading="status.loading"></div>
        </el-row>
    </div>
</template>

<script>
    export default {
        name: "Roaming",
        data() {
            return {
                status: {
                    loading: true
                },
                // 显示报表
                showReport: false,
                // 查询时间范围 value
                timeRange: '',
                // 查询时间范围 文字提示
                timeRangeText: '',
                // 图表数据
                chartData: [],
                // 请求接口
                api: this.config.api.status.visitor.roaming
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

                // 请求参数配置
                let url = this.api,
                    para = {
                        start_time: this.timeRange[0],
                        stop_time: this.timeRange[1]
                    };

                // 发送请求
                request.get(url, para, res => {
                    // 获取图表数据
                    this.chartData = res.data.chart;
                    // 关闭 loading 状态
                    this.status.loading = false;
                    // 绘制图表
                    this.createChart();
                });

                this.timeRange2text();
            },
            // 绘制图表
            createChart() {
                let chart = this.$echarts.init(document.getElementById('chart')),
                    data = (() => {
                        let label = [],
                            value = [];
                        for (let val of this.chartData) {
                            label.push(val.label);
                            value.push(val.value);
                        }
                        return {
                            label,
                            value
                        };
                    })(),
                    option = {};

                if (!this.tools.checkChartData(chart, this.chartData)) return false;

                option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            lineStyle: {
                                color: '#909399'
                            }
                        }
                    },
                    grid: {
                        borderWidth: 0,
                        bottom: 100
                    },
                    xAxis: {
                        type: "category",
                        axisLine: {show: false,},
                        splitLine: {show: false},
                        axisTick: {show: false},
                        splitArea: {show: false},
                        axisLabel: {
                            color: '#606266',
                            margin: 15
                        },
                        data: data.label
                    },
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
                            color: '#606266'
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
                    dataZoom: [{
                        show: true,
                        height: 30,
                        xAxisIndex: [0],
                        bottom: 30,
                        start: 0,
                        end: 50,
                        handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
                        handleSize: '110%',
                        handleStyle: {
                            color: "#d3dee5",
                        },
                        textStyle: {
                            color: "rgba(255,255,255,0)"
                        },
                        borderColor: "#90979c"
                    }, {
                        type: "inside",
                        show: true,
                        height: 15,
                        start: 1,
                        end: 35
                    }],
                    series: [{
                        name: 'eduroam 漫游人数',
                        type: 'line',
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 5,
                        showSymbol: false,
                        lineStyle: {
                            normal: {
                                width: 1
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: 'rgba(219, 50, 51, 0.3)'
                                }, {
                                    offset: 0.8,
                                    color: 'rgba(219, 50, 51, 0)'
                                }], false),
                                shadowColor: 'rgba(0, 0, 0, 0.1)',
                                shadowBlur: 10
                            }
                        },
                        itemStyle: {
                            normal: {
                                color: 'rgb(219,50,51)',
                                borderColor: 'rgba(219,50,51,0.2)',
                                borderWidth: 12,
                                label: {
                                    show: true,
                                    textStyle: {
                                        color: "#606266"
                                    },
                                    position: "right"
                                },
                                shadowBlur: 50,
                                shadowColor: 'rgba(0, 0, 0, 0.3)'
                            }
                        },
                        data: data.value
                    }]
                };

                chart.setOption(option, true);
            },
            // 日期范围转文字
            timeRange2text() {
                let start = this.tools.timeTransform(this.timeRange[0], {
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