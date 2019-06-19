<template>
    <div>
        <!-- Title -->
        <div class="row">
            <h3 class="module-title">eduroam 连接指南</h3>
        </div>
        <!-- Article -->
        <article>
            <!-- eduroam 简介 -->
            <el-row class="row">
                <h3>eduroam 简介</h3>
            </el-row>
            <el-row class="row">
                <p>
                    eduroam 是 education
                    roaming 的缩写，是⼀种安全的全球漫游服务，为各个国家的教育科研⽹⼴泛采⽤。eduroam 最早起源于欧洲，⽬前覆盖了 89
                    个国家和地区。对于学⽣、教师和科研⼈员来讲，如果所在学校/单位已经加⼊ eduroam，那么他们可以⾮常容易地在其他⽀持 eduroam 的学校/单位使⽤
                    Internet，不受国界限制。所使⽤的⽹络身份为其所在学校/单位的⽹络身份。eduroam⽀持已经参加到eduroam联盟机构的⽤户在任何可以搜索到 eduroam
                    wifi 的地点使⽤⽆线⽹。是否可以正常使⽤依赖于所到访机构是否设置了本地控制策略。使⽤ eduroam
                    时，⽤户个⼈信息是安全的，并不提供给所到访的机构，⽽是提供给⽤户身份所属机构。认证请求经过到访机构、到访国家教育科研⽹、身份所属国家教育科研⽹、身份所属机构的⼀组服务器，建⽴⼀条安全的路径，完成认证过程。
                </p>
                <ul>
                    <li>全球 eduroam 部署情况，参见：<a target="_blank" href="https://www.eduroam.org">https://www.eduroam.org</a>
                    </li>
                    <li>中国 eduroam 部署情况，参见：<a target="_blank"
                                              href="http://eduroam.cstnet.cn">http://eduroam.cstnet.cn</a></li>
                    <li>教育网 eduroam 部署情况，参见：<a target="_blank" href="https://www.eduroam.edu.cn">https://www.eduroam.edu.cn</a>
                    </li>
                </ul>
            </el-row>
            <el-divider content-position="right">Srun4K eduroam</el-divider>
            <!-- 用户的 eduroam 账号信息 -->
            <el-row class="row">
                <h3>⽤户的 eduroam 账号信息</h3>
            </el-row>
            <el-row class="row">
                <p>
                    已经成功加⼊ eduroam 联盟。连接 eduroam 信号的账号为学号或⼯号添加后缀 @xxxx.edu.cn，密码为校园⽹密码。
                </p>
                <p>
                    例如我的校园⽹账号是 2016102841，那么我的 eduroam 的账号就是 2016102841@xxxx.edu.cn，密码为校园⽹的密码。
                </p>
            </el-row>
            <el-divider content-position="right">Srun4K eduroam</el-divider>
            <!-- 设备如何连接 eduroam 账号 -->
            <el-row class="row">
                <h3>安卓⼿机如何连接 eduroam 信号</h3>
            </el-row>
            <el-row class="row">
                <el-menu default-active="Android"
                         mode="horizontal"
                         @select="changeDevice">
                    <el-menu-item index="Android">Android</el-menu-item>
                    <el-menu-item index="iOS">iOS</el-menu-item>
                    <el-menu-item index="Mac">Mac</el-menu-item>
                    <el-menu-item index="Win 7">Win 7</el-menu-item>
                    <el-menu-item index="Win 10">Win 10</el-menu-item>
                    <el-menu-item index="download">
                        <a :href="downloadSrc" target="_blank">
                            <i class="icon ion-md-download"></i>下载文档
                        </a>
                    </el-menu-item>
                </el-menu>
            </el-row>
            <el-row class="row">
                <el-carousel :interval="4000"
                             type="card"
                             arrow="never"
                             :autoplay="false"
                             :loop="false"
                             height="500px">
                    <el-carousel-item class="card-step"
                                      v-for="(item,index) in showDevice"
                                      :key="index">
                        <h3>步骤{{ index+1 }}:</h3>
                        <p>{{ item.intro }}</p>
                        <img :src="item.image"
                             :alt="'步骤' + (index+1) + ':'"
                             @click="showDetail(item.image)">
                    </el-carousel-item>
                </el-carousel>
            </el-row>
        </article>
        <!-- Dialog -->
        <el-dialog class="showDetail"
                   :visible.sync="status.showDetail"
                   width="600px">
            <img :src="status.detailImgSrc" alt="">
        </el-dialog>
    </div>
</template>

<script>
    const imgUrl = process.env.BASE_URL + 'static/images/eduroam';

    export default {
        name: "Link",
        data() {
            return {
                status: {
                    showDetail: false,
                    detailImgSrc: ''
                },
                showDevice: [],
                downloadSrc: process.env.BASE_URL + 'static/pdf/西北工业大学eduroam连接指南.pdf'
            }
        },
        methods: {
            // 显示图片详情
            showDetail(src) {
                this.status.showDetail = true;
                this.status.detailImgSrc = src;
            },
            // 切换设备类型
            changeDevice(device) {
                switch (device) {
                    case 'Android':
                        return this.showDevice = [
                            {
                                intro: '⾸先确定您所在区域有eduroam信号。打开⼿机的WIFI设置，看到名为eduroam的信号，则此区域就可以使⽤eduroam上⽹。',
                                image: `${imgUrl}/1.png`
                            }, {
                                intro: '点击eduroam信号弹出⽤户名和密码输⼊窗⼝。',
                                image: `${imgUrl}/2.png`
                            }, {
                                intro: '有的⼿机可能会显示很多选项，保持默认就⾏。只在身份栏填⼊eduroam账号，密码处填⼊密码就⾏。',
                                image: `${imgUrl}/3.png`
                            }, {
                                intro: '输⼊完密码点击连接，⼿机就开始连接eduroam信号。显示连接成功就可以使⽤eduroam信号上⽹了。连接完成。',
                                image: `${imgUrl}/4.png`
                            }
                        ];
                    case 'iOS':
                        return this.showDevice = [
                            {
                                intro: '⾸先确定您所在区域有eduroam信号。打开⼿机的WIFI设置，看到名为eduroam的信号，则此区域就可以使⽤eduroam上⽹。',
                                image: `${imgUrl}/6.png`
                            }, {
                                intro: '点击eduroam信号弹出⽤户名和密码输⼊窗⼝。只在身份栏填⼊eduroam账号，密码处填⼊密码。输⼊完成点击加⼊按钮。',
                                image: `${imgUrl}/7.png`
                            }, {
                                intro: '此时弹出证书选择信任服务器证书，即可连接。',
                                image: `${imgUrl}/8.png`
                            }, {
                                intro: '连接成功。',
                                image: `${imgUrl}/9.png`
                            }
                        ];
                    case 'Mac':
                        return this.showDevice = [
                            {
                                intro: '⾸先确定您所在区域有eduroam信号。点击右上⻆WIFI图标，看到名为eduroam的信号，则此区域就可以使⽤eduroam上⽹。',
                                image: `${imgUrl}/10.png`
                            }, {
                                intro: '点击eduroam信号名称弹出⽤户名和密码输⼊窗⼝，输⼊⽤户名和密码。',
                                image: `${imgUrl}/11.png`
                            }, {
                                intro: '此时会弹出信任证书窗⼝，点击继续信任该证书。',
                                image: `${imgUrl}/12.png`
                            }, {
                                intro: '输⼊电脑密码以信任该证书。',
                                image: `${imgUrl}/13.png`
                            }, {
                                intro: '连接成功。',
                                image: `${imgUrl}/14.png`
                            }
                        ];
                    case 'Win 7':
                        return this.showDevice = [
                            {
                                intro: '⾸先确保eduroam在信号覆盖范围内。',
                                image: `${imgUrl}/15.png`
                            }, {
                                intro: '点击“打开⽹络和共享中⼼”，选择“设置新的连接或⽹络”。',
                                image: `${imgUrl}/16.png`
                            }, {
                                intro: '点击⼿动连接到⽆线⽹络。',
                                image: `${imgUrl}/17.png`
                            }, {
                                intro: '输⼊要添加的⽆线⽹络信息。⽹络名称填写“eduroam”，安全类型选择WPA2-企业。选择完毕点击下⼀步按钮。',
                                image: `${imgUrl}/18.png`
                            }, {
                                intro: '在弹出窗⼝点击更改连接配置按钮。',
                                image: `${imgUrl}/19.png`
                            }, {
                                intro: '在弹出的eduroam⽆线属性窗⼝点击安全⻚按钮。',
                                image: `${imgUrl}/20.png`
                            }, {
                                intro: '在安全⻚⾯点击设置按钮。',
                                image: `${imgUrl}/21.png`
                            }, {
                                intro: '在弹出的“受保护的EAP属性”窗⼝去掉“验证服务器证书”前⾯的勾选。点击确定按钮。',
                                image: `${imgUrl}/22.png`
                            }, {
                                intro: '点击⾼级设置按钮。',
                                image: `${imgUrl}/23.png`
                            }, {
                                intro: '在弹出的⾼级选项按钮勾选上指定身份验证模式，选择⽤户身份验证。点击保存凭据。',
                                image: `${imgUrl}/24.png`
                            }, {
                                intro: '在弹出的保存凭据窗⼝输⼊eduroam账号和密码，点击确定按钮。',
                                image: `${imgUrl}/25.png`
                            }, {
                                intro: '点击剩余窗⼝的确定按钮。',
                                image: `${imgUrl}/26.png`
                            }, {
                                intro: '此时已经将⽹络配置完毕。',
                                image: `${imgUrl}/27.png`
                            }, {
                                intro: '配置完毕后⽆线⽹络⼀般会⾃动连接到eduroam信号，未⾃动连接的⼿动点击⼀下⽆线列表中的连接按钮即可。勾选上⾃动连接，下次设备搜索到eduroam信号后就会⾃动连接。',
                                image: `${imgUrl}/29.png`
                            }
                        ];
                    case 'Win 10':
                        return this.showDevice = [
                            {
                                intro: '⾸先确保eduroam在信号覆盖范围内。',
                                image: `${imgUrl}/30.png`
                            }, {
                                intro: '点击 “打开⽹络和Internet设置”，点击“⽹络和共享中⼼”。',
                                image: `${imgUrl}/31.png`
                            }, {
                                intro: '点击“设置新的连接或⽹络”。',
                                image: `${imgUrl}/32.png`
                            }, {
                                intro: '点击⼿动连接到⽆线⽹络。点击“下⼀步”按钮。',
                                image: `${imgUrl}/33.png`
                            }, {
                                intro: '输⼊要添加的⽆线⽹络信息。⽹络名称填写“eduroam”，安全类型选择 WPA2-企业。选择完毕点击下⼀步按钮。',
                                image: `${imgUrl}/34.png`
                            }, {
                                intro: '在弹出窗⼝点击更改连接配置按钮。',
                                image: `${imgUrl}/35.png`
                            }, {
                                intro: '在弹出的eduroam⽆线属性窗⼝点击安全⻚按钮。',
                                image: `${imgUrl}/36.png`
                            }, {
                                intro: '在安全⻚⾯点击“设置”按钮。',
                                image: `${imgUrl}/37.png`
                            }, {
                                intro: '在弹出的“受保护的EAP属性”窗⼝去掉“验证服务器证书”前⾯的勾选。点击确定按钮。',
                                image: `${imgUrl}/38.png`
                            }, {
                                intro: '点击⾼级设置按钮。',
                                image: `${imgUrl}/39.png`
                            }, {
                                intro: '在弹出的⾼级选项按钮勾选上指定身份验证模式，选择⽤户身份验证。点击保存凭据。',
                                image: `${imgUrl}/40.png`
                            }, {
                                intro: '在弹出的保存凭据窗⼝输⼊eduroam账号和密码，点击确定按钮。',
                                image: `${imgUrl}/41.png`
                            }, {
                                intro: '配置完毕后⽆线⽹络⼀般会⾃动连接到eduroam信号，未⾃动连接的⼿动点击⼀下⽆线列表中的连接按钮即可。勾选上⾃动连接，下次设备搜索到eduroam信号后就会⾃动连接。',
                                image: `${imgUrl}/42.png`
                            }
                        ];
                }
            }
        },
        mounted() {
            this.changeDevice('Android');
        }
    }
</script>

<style scoped lang="less">
    .el-carousel__item {
        &.card-step {
            padding: 20px;
            box-sizing: border-box;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
            transition: all .3s;
            background: #fff;
            border: 1px solid #ddd;
            h3, p {
                margin-bottom: 10px;
            }
            img {
                display: block;
                height: 350px;
                margin: 0 auto;
                border: 1px solid #ddd;
                border-radius: 5px;
                overflow: hidden;
                box-shadow: 0 0 10px rgba(0, 0, 0, .1);
            }
            &:hover {
                box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 10px rgba(0, 0, 0, .1);
            }
        }
    }
    .showDetail {
        img {
            display: block;
            width: 300px;
            margin: 0 auto;
        }
    }
</style>