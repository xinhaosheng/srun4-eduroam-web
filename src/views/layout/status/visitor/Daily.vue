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
                    <transition name="el-zoom-in-center">
                        <el-button v-show="showSearch"
                                   type="primary"
                                   size="small"
                                   icon="icon ion-md-search"
                                   @click="getData">立即搜索
                        </el-button>
                    </transition>
                    <el-button type="info"
                               size="small"
                               icon="icon ion-md-options"
                               @click="showSearch = !showSearch">高级选项
                    </el-button>
                    <el-button type="primary"
                               size="small"
                               icon="icon ion-md-list-box"
                               @click="showReport = !showReport">数据报表
                    </el-button>
                </el-row>
            </el-col>
        </el-row>
        <!-- Pro Search -->
        <transition name="el-zoom-in-top">
            <el-row class="row" :gutter="20" v-show="showSearch">
                <el-col :span="4">
                    <el-input v-model.trim="search.user_country_suffix"
                              placeholder="国际域名后缀"
                              size="small"
                              clearable
                              @keyup.enter.native="getData">
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-input v-model.trim="search.user_domain"
                              placeholder="学校/域名"
                              size="small"
                              clearable
                              @keyup.enter.native="getData">
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-input v-model.trim="search.user_name"
                              placeholder="用户名"
                              size="small"
                              clearable
                              @keyup.enter.native="getData">
                    </el-input>
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
                   width="800px">
            <el-table :data="tableData"
                      stripe>
                <el-table-column type="index" :index="indexMethod"></el-table-column>
                <el-table-column prop="date" label="统计时间" min-width="100"></el-table-column>
                <el-table-column label="总流量" min-width="120">
                    <template slot-scope="scope">
                        <span :class="scope.row.total_bytes >= 1073741824 ? 'danger' : ''">
                        {{ tools.formatFlow(scope.row.total_bytes,'b') }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="入流量" min-width="120">
                    <template slot-scope="scope">
                        <span :class="scope.row.bytes_in >= 1073741824 ? 'danger' : ''">
                        {{ tools.formatFlow(scope.row.bytes_in,'b') }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="出流量" min-width="120">
                    <template slot-scope="scope">
                        <span :class="scope.row.bytes_out >= 1073741824 ? 'danger' : ''">
                        {{ tools.formatFlow(scope.row.bytes_out,'b') }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="总时长" min-width="150">
                    <template slot-scope="scope">
                        {{ tools.formatTime(scope.row.time_long,'s') }}
                    </template>
                </el-table-column>
                <el-table-column prop="login_count" label="认证次数" min-width="100"></el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<script>
    /**
     * TODO:
     * + 统一控制高级选项状态的变量命名
     * + 高级选项，立即搜索按钮寻找更好的交互方式
     */
    export default {
        name: "Daily",
        data() {
            return {
                status: {
                    loading: true
                },
                // 搜索选项
                search: {},
                // 图表项目
                options: [
                    {label: '每日访客流量', value: 'bytes'},
                    {label: '每日访客时长', value: 'times'}
                ],
                // 显示高级搜索
                showSearch: false,
                // 显示报表
                showReport: false,
                // 当前展示项目
                showNow: {value: 'times', label: '每日访客时长'},
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
                api: this.config.api.status.visitor.daily
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
                        stop_time: this.timeRange[1],
                        user_country_suffix: this.search.user_country_suffix,
                        user_domain: this.search.user_domain,
                        user_name: this.search.user_name
                    };

                // 发送请求
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
                    option;

                if (!this.tools.checkChartData(chart, this.chartData)) return false;

                if (this.showNow.value === 'bytes') {
                    let xData = (() => {
                        let data = [];
                        for (let val of this.chartData.bytes_total) {
                            data.push(val.label)
                        }
                        return data;
                    })();
                    let dealData = type => {
                        let arr = [];
                        for (let val of this.chartData[type]) {
                            arr.push(val.value);
                        }
                        return arr;
                    };
                    let data = {
                        total: dealData('bytes_total'),
                        in: dealData('bytes_in'),
                        out: dealData('bytes_out'),
                    };
                    let unit = (() => {
                        let max = 0;
                        for (let val of data.total) {
                            if (val > max) max = val;
                        }
                        if (max < 1024) return 'B';
                        max = this.tools.formatFlow(max, 'b');
                        return max.substring(max.length - 2, max.length);
                    })();
                    option = {
                        tooltip: {
                            trigger: "axis",
                            axisPointer: {
                                type: "shadow"
                            },
                            formatter: value => {
                                let str = '';
                                for (let val of value) {
                                    str += `${val.seriesName}：${this.tools.formatFlow(val.value, 'b')}<br/>`
                                }
                                return str;
                            }
                        },
                        grid: {
                            borderWidth: 0,
                            top: 50,
                            bottom: 100
                        },
                        legend: {
                            textStyle: {
                                color: '#606266',
                            },
                            data: ['总流量', '入流量', '出流量']
                        },
                        calculable: true,
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
                            data: xData
                        },
                        yAxis: [{
                            type: "value",
                            splitLine: {
                                lineStyle: {
                                    type: 'dashed',
                                    color: '#DCDFE6'
                                }
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#DCDFE6'
                                }
                            },
                            axisTick: {show: false},
                            axisLabel: {
                                color: '#606266',
                                formatter: num => {
                                    switch (unit) {
                                        case 'B':
                                            return parseInt(num) + 'B';
                                        case 'KB':
                                            return parseInt(num / 1024) + 'KB';
                                        case 'MB':
                                            return parseInt(num / (1024 * 1024)) + 'MB';
                                        case 'GB':
                                            return parseInt(num / (1024 * 1024 * 1024)) + ' GB';
                                        case 'TB':
                                            return parseInt(num / (1024 * 1024 * 1024 * 1024)) + 'TB';
                                    }
                                }
                            }
                        }],
                        dataZoom: [
                            {
                                show: true,
                                height: 30,
                                xAxisIndex: [0],
                                bottom: 30,
                                start: 0,
                                end: 30,
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
                            }
                        ],
                        series: [
                            {
                                name: "总流量",
                                type: "bar",
                                barMaxWidth: 70,
                                barGap: 0,
                                zlevel: 3,
                                itemStyle: {
                                    normal: {
                                        color: "rgba(131,175,155,.8)",
                                        barBorderRadius: 5,
                                        label: {
                                            show: true,
                                            textStyle: {
                                                color: "#606266"
                                            },
                                            position: "top",
                                            formatter: p => {
                                                let flow = p.value > 0 ? (p.value) : '';
                                                flow = this.tools.formatFlow(flow, 'b');
                                                return flow === '0 B' ? '' : flow;
                                            }
                                        },
                                        shadowBlur: 50,
                                        shadowColor: 'rgba(0, 0, 0, 0.3)'
                                    }
                                },
                                data: data.total
                            },
                            {
                                name: "入流量",
                                type: "bar",
                                barMaxWidth: 70,
                                barGap: 0,
                                zlevel: 2,
                                itemStyle: {
                                    normal: {
                                        color: "rgba(200,200,169,.8)",
                                        barBorderRadius: 5,
                                        label: {
                                            show: true,
                                            textStyle: {
                                                color: "#606266"
                                            },
                                            position: "top",
                                            formatter: p => {
                                                let flow = p.value > 0 ? (p.value) : '';
                                                flow = this.tools.formatFlow(flow, 'b');
                                                return flow === '0 B' ? '' : flow;
                                            }
                                        },
                                        shadowBlur: 50,
                                        shadowColor: 'rgba(0, 0, 0, 0.3)'
                                    }
                                },
                                data: data.in
                            },
                            {
                                name: "出流量",
                                type: "bar",
                                barMaxWidth: 70,
                                barGap: 0,
                                zlevel: 1,
                                itemStyle: {
                                    normal: {
                                        color: "rgba(249,205,173,.8)",
                                        barBorderRadius: 5,
                                        label: {
                                            show: true,
                                            textStyle: {
                                                color: "#606266"
                                            },
                                            position: "top",
                                            formatter: p => {
                                                let flow = p.value > 0 ? (p.value) : '';
                                                flow = this.tools.formatFlow(flow, 'b');
                                                return flow === '0 B' ? '' : flow;
                                            }
                                        },
                                        shadowBlur: 50,
                                        shadowColor: 'rgba(0, 0, 0, 0.3)'
                                    }
                                },
                                data: data.out
                            }
                        ]
                    };
                } else {
                    let xData = (() => {
                        let data = [];
                        for (let val of this.chartData.time_long) {
                            data.push(val.label)
                        }
                        return data;
                    })();
                    let dealData = type => {
                        let arr = [];
                        for (let val of this.chartData[type]) {
                            arr.push(val.value);
                        }
                        return arr;
                    };
                    let time = dealData('time_long');
                    let unit = (() => {
                        let max = 0;
                        for (let val of time) {
                            if (val > max) max = val;
                        }
                        switch (true) {
                            case max < 60:
                                return 's';
                            case max < 3600:
                                return 'm';
                            default:
                                return 'h';
                        }
                    })();
                    option = {
                        tooltip: {
                            trigger: "axis",
                            axisPointer: {
                                type: "shadow"
                            },
                            formatter: value => {
                                let str = '';
                                for (let val of value) {
                                    str += `${val.seriesName}：${this.tools.formatTime(val.value, 's')}<br/>`
                                }
                                return str;
                            }
                        },
                        grid: {
                            borderWidth: 0,
                            top: 50,
                            bottom: 100
                        },
                        legend: {
                            textStyle: {
                                color: '#606266',
                            },
                            data: ['总流量', '入流量', '出流量']
                        },
                        calculable: true,
                        xAxis: [{
                            type: "category",
                            axisLine: {show: false,},
                            splitLine: {show: false},
                            axisTick: {show: false},
                            splitArea: {show: false},
                            axisLabel: {
                                color: '#606266',
                                margin: 15
                            },
                            data: xData
                        }],
                        yAxis: [{
                            type: "value",
                            splitLine: {
                                lineStyle: {
                                    type: 'dashed',
                                    color: '#DCDFE6'
                                }
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#DCDFE6'
                                }
                            },
                            axisTick: {show: false},
                            axisLabel: {
                                color: '#606266',
                                formatter: num => {
                                    switch (unit) {
                                        case 's':
                                            return parseInt(num) + ' 秒';
                                        case 'm':
                                            return parseInt(num / 60) + ' 分钟';
                                        case 'h':
                                            return parseInt(num / (60 * 60)) + ' 小时';
                                    }
                                }
                            }
                        }],
                        dataZoom: [{
                            show: true,
                            height: 30,
                            xAxisIndex: [0],
                            bottom: 30,
                            start: 0,
                            end: 30,
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
                        series: [
                            {
                                name: "总时长",
                                type: "bar",
                                stack: "总量",
                                barMaxWidth: 50,
                                itemStyle: {
                                    normal: {
                                        color: "rgba(131,175,155,.8)",
                                        barBorderRadius: 5,
                                        label: {
                                            show: true,
                                            textStyle: {
                                                color: "#606266"
                                            },
                                            position: "top",
                                            formatter: p => {
                                                let time = p.value > 0 ? (p.value) : '';
                                                time = this.tools.formatTime(time, 's');
                                                time = time.replace(/小时/g, 'h ');
                                                time = time.replace(/分钟/g, 'm ');
                                                time = time.replace(/秒/g, 's');
                                                return time === '0 s' ? '' : time;
                                            }
                                        },
                                        shadowBlur: 50,
                                        shadowColor: 'rgba(0, 0, 0, 0.3)'
                                    }
                                },
                                data: time
                            }
                        ]
                    };
                }

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