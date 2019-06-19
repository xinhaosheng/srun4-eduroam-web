const fieldMap = new Map([
    // width: 80
    ['nas_type', 80],               // 设备类型
    ['sensitivity', 80],            // 可疑度
    ['ip_type', 80],                // IP类型
    ['line_type', 80],              // 线路类型
    ['proxy_desc', 80],             // 代理信息
    ['vlan_id', 80],                // VLAN ID
    ['pc_num', 80],                 // PC数量
    ['proc', 80],                   // proc

    // width: 100
    ['user_id', 100],               // 用户id
    ['class_name', 100],            // 系统类型
    ['bytes_in', 100],              // 入流量
    ['nas_port_id', 100],           // 端口标识别
    ['user_real_name', 100],        // 真实姓名

    // width: 120
    ['login_mode', 120],            // 登录模式
    ['user_name', 120],             // 账号
    ['mobile_phone', 120],          // 运营商账号
    ['time_long', 120],             // 总时长
    ['bytes_out', 120],             // 出流量
    ['mobile_num', 120],            // 移动终端数量
    ['os_name', 120],               // 系统名称
    ['total_bytes', 120],           // 总流量
    ['group_id', 120],              // 用户组ID        用户组
    ['session_time',120],           // 本次会话时长
    ['sum_seconds',120],            // 已用时长
    ['ip',120],                     // IPV4地址


    // width: 160
    ['traffic_up_ratio', 160],      // 上行流量比率（%）
    ['traffic_down_ratio', 160],    // 下行流量比率（%）
    ['drop_reason', 160],           // 下线原因
    ['control_id', 160],            // 控制策略ID      控制策略
    ['billing_id', 160],            // 计费策略ID      计费策略
    ['products_id', 160],           // 产品ID         产品策略
    ['user_ip', 160],               // IPV4地址
    ['my_ip', 160],                 // AAA地址
    ['nas_ip', 160],                // NAS IP
    ['user_mac', 160],              // MAC地址
    ['log_time', 160],
    ['add_time', 160],              // 上线时间
    ['drop_time', 160],             // 下线时间
    ['domain', 160],                // 域名
    ['user_create_time', 160],      // 创建时间       
    ['user_expire_time', 160],      // 账号过期时间
    ['update_time',160],            // 最近一次修改时间
    ['keepalive_time',160],         // 最后一次心跳包到达时间


    // width: 250
    ['err_msg', 310],
    ['user_ip6', 310],              // IPV6地址
    ['bytes_in6', 310],             // V6入流量
    ['bytes_out6', 310]             // V6出流量
]);

export default fieldMap;