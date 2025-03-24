const fs = require('fs')

// 初始化数据库
const initDatabase = () => {
    try {
        const keys = ['players', 'groupingHistory', 'lastGrouping']
        keys.forEach(key => {
            if (!utools.db.get(key)) {
                utools.db.put({
                    _id: key,
                    data: null
                })
            }
        })
        
        // 特殊处理 darkMode，设置默认值为 true
        if (!utools.db.get('darkMode')) {
            utools.db.put({
                _id: 'darkMode',
                data: true
            })
        }
    } catch (error) {
        console.error('初始化数据库失败:', error)
    }
}

// 在导出方法之前调用初始化
initDatabase()

// 导出到渲染进程的方法
window.exports = {
    "basketball_team_grouping": { // 注意：这里的 feature.code 必须和 plugin.json 中的一致
        mode: "renderer", // 用于指定是否在用户按下快捷键时执行该方法
        args: {
            // 进入插件时调用
            enter: () => {
                // 可以在这里做一些初始化工作
                initDatabase()
            }
        }
    },
    // 保存分组历史记录
    saveGroupingHistory: (history) => {
        try {
            utools.db.put({
                _id: 'grouping_history',
                data: history
            });
            return true;
        } catch (error) {
            console.error('保存历史记录失败:', error);
            return false;
        }
    },

    // 获取分组历史记录
    getGroupingHistory: () => {
        try {
            const doc = utools.db.get('grouping_history');
            return doc ? doc.data : [];
        } catch (error) {
            console.error('获取历史记录失败:', error);
            return [];
        }
    },

    // 导入队员数据
    importPlayersFromFile: (filePath) => {
        try {
            const content = fs.readFileSync(filePath, 'utf8')
            return JSON.parse(content)
        } catch (error) {
            console.error('导入队员数据失败:', error)
            return null
        }
    },

    // 导出分组结果
    exportGroupingResult: (result, filePath) => {
        try {
            fs.writeFileSync(filePath, JSON.stringify(result, null, 2))
            return true
        } catch (error) {
            console.error('导出分组结果失败:', error)
            return false
        }
    }
} 