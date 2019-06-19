<template>
    <div>
        <!-- Title -->
        <el-row class="row">
            <h3 class="module-title">出访记录</h3>
        </el-row>
        <!-- Search -->
        <el-row class="row" :gutter="20">
            <el-col :span="4">
                <el-input v-model.trim="username"
                          placeholder="用户名"
                          size="small"
                          @keyup.enter.native="getData"
                          clearable>
                </el-input>
            </el-col>
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
                                @change="getData"
                ></el-date-picker>
            </el-col>
            <el-col :span="12">
                <el-row type="flex" justify="end">
                    <el-button type="primary"
                               size="small"
                               icon="icon ion-md-search" @click="getData">立即搜索
                    </el-button>
                    <el-button type="primary"
                               size="small"
                               icon="icon ion-md-list-box" @click="showReport = !showReport">数据报表
                    </el-button>
                </el-row>
            </el-col>
        </el-row>
        <!-- Chart -->
        <el-row class="row">
            <div class="chart" id="chart" v-loading="status.loading"></div>
        </el-row>
        <!-- Dialog -->
        <el-dialog :title="showNow.label + '（ ' + timeRangeText + ' ）'"
                   :visible.sync="showReport"
                   width="1050px">
            <!-- table -->
            <el-row class="row">
                <el-table :data="tableData"
                          v-loading="status.loading"
                          stripe>
                    <el-table-column prop="user_name" label="用户名" min-width="100"></el-table-column>
                    <el-table-column prop="nas_ip" label="Nas IP" min-width="150"></el-table-column>
                    <el-table-column prop="user_mac" label="用户mac" min-width="200"></el-table-column>
                    <el-table-column prop="nas_port_id" label="NasPortID绑定" min-width="200"></el-table-column>
                    <el-table-column prop="id" label="用户组" min-width="100"></el-table-column>
                    <el-table-column label="日期" min-width="150">
                        <template slot-scope="scope">
                            {{tools.timeTransform(scope.row.log_time,{
                            now:'timestamp',
                            res:'string'
                            })}}
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <!-- Pagination -->
            <el-row class="row">
                <el-pagination @size-change="changePage('size',$event)"
                               @current-change="changePage('now',$event)"
                               :current-page="page.now"
                               :page-sizes="[5, 10, 20]"
                               :page-size="page.size"
                               background
                               layout="total, sizes, prev, pager, next, jumper"
                               :total="page.total">
                </el-pagination>
            </el-row>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "log",
        data() {
            return {
                username: "",
                timeRange: "",
                showNow: {value: 'times', label: '出访记录'},        // 当前展示项目
                timeRangeText: '',                                  // 查询时间范围 文字提示
                showReport: false,                                  // 显示报表
                chartData: {},                                      // 图表数据
                tableData: [],                                      // 表格数据
                status: {
                    loading: true,
                    dialogType: '',
                    showDialog: false
                },
                search: {
                    type: 'school_name',
                    value: ''
                },
                page: {
                    now: 1,
                    size: 5,
                    total: 0
                },
                api: this.config.api.status.log.search
            };
        },
        methods: {
            // 获取当前日期
            getToday(type = "month") {
                let end = new Date(),
                    start = new Date();

                switch (type) {
                    case "week":
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                        break;
                    case "month":
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        break;
                    case "month*3":
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        break;
                }

                this.timeRange = [
                    this.tools.timeTransform(start, {
                        now: "object",
                        res: "yy-MM-dd"
                    }),
                    this.tools.timeTransform(end, {
                        now: "object",
                        res: "yy-MM-dd"
                    })
                ];
                this.getData();
            },
            //获取数据
            getData() {
                this.status.loading = true;
                let url = this.api,
                    para = {
                        user_name: this.username,
                        start_time: this.timeRange[0],
                        stop_time: this.timeRange[1],
                        per_page: this.page.size,
                        page: this.page.now
                    };

                request.get(url, para, res => {
                    this.chartData = res.data.chart;
                    this.tableData = res.data.table;
                    this.page.total = res.data._meta.totalCount
                    this.createChart();
                    this.status.loading = false;
                    this.timeRange2text();
                });
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
            // 绘制图表
            createChart() {
                let option,
                    data = (() => {
                        let label = [],
                            value = [];
                        for (let val of this.chartData) {
                            label.push(val.label);
                            value.push(val.value);
                        }
                        return {label, value};
                    })(),
                    chart = this.$echarts.init(document.getElementById('chart'));

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
            // 改变分页
            changePage(type, val) {
                this.page[type] = val;
                this.getData();
            }
        },
        mounted() {
            this.getToday();
        }
    };
</script>

<style scoped>
</style>