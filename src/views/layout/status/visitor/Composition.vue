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
                    <el-button type="primary"
                               size="small"
                               icon="icon ion-md-list-box" @click="showReport = !showReport">数据报表
                    </el-button>
                </el-row>
            </el-col>
        </el-row>
        <!-- Card -->
        <el-row class="row" :gutter="20">
            <el-col :lg="{span:4}"
                    :md="{span:6}"
                    :sm="{span:8}"
                    :xs="{span:24}"
                    v-for="(card,index) in cardData"
                    :key="index">
                <el-tooltip effect="dark" placement="top-end">
                    <el-row slot="content">
                        <span>{{card.intro}}：{{card.value}}</span>
                    </el-row>
                    <el-row class="row card" v-loading="status.loading">
                        <i class="icon" :class="card.icon"></i>
                        <h2 class="value">{{card.value}}</h2>
                        <h3 class="intro">{{card.intro}}</h3>
                    </el-row>
                </el-tooltip>
            </el-col>
        </el-row>
        <!-- Chart -->
        <el-row class="row">
            <div class="chart" id="chart" v-loading="status.loading"></div>
        </el-row>
        <!-- Dialog -->
        <el-dialog :title="showNow.label + '（ ' + timeRangeText + ' ）'"
                   :visible.sync="showReport"
                   width="600px">
            <el-table :data="tableData"
                      stripe>
                <el-table-column type="index" :index="indexMethod"></el-table-column>
                <el-table-column prop="label" :label="showNow.label" min-width="200"></el-table-column>
                <el-table-column prop="value" label="eduroam 漫游人数" min-width="120"></el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<script>
    /**
     * TODO:
     * + 世界地图根据中英文正确显示
     */
    import geoCoordMap from '@/assets/json/country'
    import 'echarts/map/js/world'

    export default {
        name: "Composition",
        data() {
            return {
                status: {
                    loading: true
                },
                // 图表项目
                options: [
                    {label: '国家访客组成', value: 'country'},
                    {label: '域名访客组成', value: 'domain'}
                ],
                // 显示报表
                showReport: false,
                // 当前展示项目
                showNow: {label: '国家访客组成', value: 'country'},
                // 查询时间范围 value
                timeRange: '',
                // 查询时间范围 文字提示
                timeRangeText: '',
                // 卡片数据
                cardData: [
                    {
                        intro: '访客总数',
                        value: '...',
                        icon: 'ion-md-people'
                    }, {
                        intro: '终端数',
                        value: '...',
                        icon: 'ion-md-phone-portrait'
                    }, {
                        intro: '新增访客数',
                        value: '...',
                        icon: 'ion-md-person-add'
                    }, {
                        intro: '使用流量',
                        value: '...',
                        icon: 'ion-ios-wifi'
                    }, {
                        intro: '使用时长',
                        value: '...',
                        icon: 'ion-md-time'
                    }
                ],
                // 全部数据
                totalData: {},
                // 图表数据
                chartData: {},
                // 表格数据
                tableData: [],
                // 请求接口
                api: this.config.api.status.visitor.composition
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
                        stop_time: this.timeRange[1]
                    };

                request.get(url, para, res => {
                    this.cardData[0].value = res.data.total_visitor;
                    this.cardData[1].value = res.data.total_online;
                    this.cardData[2].value = res.data.total_new_visitor;
                    this.cardData[3].value = this.tools.formatFlow(res.data.total_bytes, 'b');
                    this.cardData[4].value = this.tools.formatTime(res.data.total_times, 's');

                    this.totalData = {
                        country: (() => {
                            let arr = [];
                            for (let key in res.data.country_detail) {
                                arr.push({
                                    label: key,
                                    value: res.data.country_detail[key]
                                })
                            }
                            return arr;
                        })(),
                        domain: (() => {
                            let arr = [];
                            for (let key in res.data.school_detail) {
                                arr.push({
                                    label: key,
                                    value: res.data.school_detail[key]
                                })
                            }
                            return arr;
                        })()
                    };
                    this.chartData = this.totalData[this.showNow.value];
                    this.tableData = this.totalData[this.showNow.value];

                    // 关闭 loading 状态
                    this.status.loading = false;

                    this.createChart();
                });

                this.timeRange2text();
            },
            // 改变展示项目
            changeShow(option) {
                this.chartData = this.totalData[option.value];
                this.tableData = this.totalData[option.value];
                this.createChart();
            },
            // 绘制图表
            createChart() {
                // 基于准备好的dom，初始化echarts实例
                let option,
                    chart = this.$echarts.init(document.getElementById('chart'));

                if (!this.tools.checkChartData(chart, this.chartData)) return false;

                if (this.showNow.value === 'country') {
                    let
                        // 数据处理
                        convertData = data => {
                            let res = [];
                            for (let val of data) {
                                let country = geoCoordMap[val.label];
                                if (country) res.push({
                                    label: val.label,
                                    value: country.concat(val.value)
                                });
                            }
                            return res;
                        },
                        // 获取最大值
                        maxValue = (() => {
                            let num = 0;

                            for (let val of this.chartData) {
                                if (val.value > num) num = val.value;
                            }

                            let str = num + '',
                                length = str.length;

                            return parseInt(str.substring(0, 1)) >= 5 ? Math.pow(10, length) : 5 * Math.pow(10, length - 1);
                        })();

                    // Echarts 配置
                    option = {
                        visualMap: {
                            min: 0,
                            max: maxValue,
                            splitNumber: 5,
                            color: ['#d94e5d', '#eac736', '#50a3ba'],
                            textStyle: {
                                color: '#606266'
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: para => {
                                return `eduroam漫游： ${para.value[2]} 人`;
                            }
                        },
                        geo: {
                            map: 'world',
                            zoom: 1.2,
                            label: {
                                emphasis: {
                                    show: true,
                                    color: '#606266'
                                }
                            },
                            itemStyle: {
                                normal: {
                                    areaColor: '#eee',
                                    borderColor: '#888'
                                },
                                emphasis: {
                                    areaColor: 'rgba(115,202,226,.3)'
                                }
                            }
                        },
                        series: [
                            {
                                type: 'effectScatter',
                                coordinateSystem: 'geo',
                                zlevel: 2,
                                rippleEffect: {
                                    period: 5,
                                    scale: 5,
                                    brushType: 'fill'
                                },
                                label: {
                                    normal: {
                                        show: true,
                                        position: 'right',
                                        distance: 20,
                                        color: '#fff',
                                        padding: [5, 10, 5, 10],
                                        backgroundColor: 'rgba(0,0,0,.5)',
                                        borderRadius: 5,
                                        fontSize: 12,
                                        formatter: obj => {
                                            return obj.data.label;
                                        }
                                    }
                                },
                                symbolSize: 20,
                                data: convertData(this.chartData)
                            }
                        ]
                    };
                } else {
                    // 数据范围
                    let valueRange = (() => {
                        let max = 0,
                            min = this.chartData[0].value;
                        for (let val of this.chartData) {
                            if (val.value > max) max = val.value;
                            if (val.value < min) min = val.value;
                        }
                        return {max, min}
                    })();
                    option = {
                        title: {
                            text: this.showNow.label,
                            left: 'center',
                            top: 14,
                            textStyle: {
                                color: '#303133'
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c}人 ({d}%)"
                        },
                        visualMap: {
                            show: false,
                            min: valueRange.min,
                            max: valueRange.max,
                            inRange: {
                                colorLightness: [0.35, 0.65]
                            }
                        },
                        series: [
                            {
                                name: 'eduroam 漫游人数',
                                type: 'pie',
                                radius: '65%',
                                center: ['50%', '50%'],
                                data: this.chartData.sort((a, b) => {
                                    return a.value - b.value
                                }),
                                roseType: 'angle',
                                label: {
                                    normal: {
                                        formatter: obj => {
                                            return `${obj.data.label}：${obj.data.value}人 （${obj.percent}%）`
                                        },
                                        textStyle: {
                                            color: '#606266'
                                        }
                                    }
                                },
                                labelLine: {
                                    normal: {
                                        lineStyle: {
                                            color: '#909399'
                                        },
                                        smooth: 0.2,
                                        length: 10,
                                        length2: 20
                                    }
                                },
                                itemStyle: {
                                    normal: {
                                        color: '#73cae2',
                                        shadowBlur: 100,
                                        shadowColor: 'rgba(0, 0, 0, 0.3)'
                                    }
                                }
                            }
                        ]
                    };
                }

                // 加 true 清除画布，防止 option 合并
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
    .card {
        position: relative;
        border: 1px solid #eee;
        border-radius: 8px;
        box-shadow: 0 2px 2px rgba(0, 0, 0, 0.22);
        cursor: pointer;
        transition: all .3s;
        padding: 15px 15px 15px 70px;
        background: #fff;
        &:hover {
            transform: translateY(-2px);
            border-color: #ddd;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.33);
        }
        .icon {
            position: absolute;
            display: block;
            left: 15px;
            width: 40px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            font-size: 2rem;
            color: #fff;
            border-radius: 50%;
            box-shadow: 0 2px 2px rgba(0, 0, 0, .2);
            text-shadow: 1px 1px 2px rgba(0, 0, 0, .2);
            &.ion-md-people {
                background: #4682B4;
            }
            &.ion-md-phone-portrait {
                background: #87CEFA;
            }
            &.ion-md-person-add {
                background: #87CEEB;
            }
            &.ion-ios-wifi {
                background: #00BFFF;
            }
            &.ion-md-time {
                background: #ADD8E6;
            }
        }
        .value {
            font-size: 1.25rem;
            font-weight: 300;
            line-height: 15px;
            margin-bottom: 10px;
        }
        .intro {
            font-size: .9rem;
            font-weight: 500;
            line-height: 15px;
            color: #909399;
        }
    }
    .danger {
        color: #F56C6C;
        font-weight: 600;
    }
</style>