const fs = require("fs");

// 从 .gitignore 文件中获取忽略文件
let
    ignoreFile = fs
        .readFileSync(__dirname + '/.gitignore')
        .toString()
        .replace(/\n/g, "");

ignoreFile += '.git';

let getTree = path => {
    // 获取目录下所有文件与目录列表
    let fileList = fs.readdirSync(path),
        level = {},
        files = [];
    // 遍历列表
    for (let val of fileList) {
        // 判断是否为需忽略文件
        if (ignoreFile.indexOf(val) !== -1) continue;
        // 判断是文件还是目录
        if (fs.statSync(path + '/' + val).isFile()) {
            files.push(val)
        } else {
            level[val] = f(path + '/' + val);
        }
    }
    if (files.length !== 0) level.files = files;
    return level;
};

let drewTree = (data, num = -1) => {
    num++;
    let drew = '',
        symbol = (() => {
            let temp = '';
            for (let i = 0; i < num; i++) {
                temp += '|   ';
            }
            return temp + '|-- ';
        })();

    for (let key in data) {
        if (key === 'files') {
            for (let i = 0; i < data[key].length; i++) {
                // 最后一个文件使用 └-- 符号
                if (i === data[key].length - 1) {
                    symbol = symbol.replace(/\|--/g, '└--');
                }
                drew += symbol + data[key][i] + '\n';
            }
        } else {
            drew += symbol + key + '\n';
            drew += d(data[key], num);
        }
    }
    return drew;
};

let tree = getTree(__dirname);

let drew = drewTree(tree);

drew = '``` bash\n' + drew + '\n```';

fs.writeFileSync('Tree.md', drew);