let players = [];
let groupingHistory = [];

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    initEventListeners();
});

// 初始化事件监听
function initEventListeners() {
    document.getElementById('addPlayer').addEventListener('click', addPlayer);
    document.getElementById('importPlayers').addEventListener('click', importPlayers);
    document.getElementById('startGrouping').addEventListener('click', startGrouping);
    document.getElementById('saveResult').addEventListener('click', saveCurrentResult);
    document.getElementById('showHistory').addEventListener('click', showHistoryModal);
    
    // 关闭历史记录弹窗
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('historyModal').style.display = 'none';
    });
}

// 添加队员
function addPlayer() {
    const playerName = prompt('请输入队员姓名：');
    if (playerName && playerName.trim()) {
        players.push({
            id: Date.now(),
            name: playerName.trim()
        });
        renderPlayersList();
    }
}

// 渲染队员列表
function renderPlayersList() {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = players.map(player => `
        <div class="player-card">
            <span>${player.name}</span>
            <button onclick="removePlayer(${player.id})" class="btn">删除</button>
        </div>
    `).join('');
}

// 删除队员
function removePlayer(id) {
    players = players.filter(player => player.id !== id);
    renderPlayersList();
}

// 导入队员
function importPlayers() {
    // 调用 preload.js 中的导入方法
    utools.showOpenDialog({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
    }).then(result => {
        if (result && result.length > 0) {
            const importedPlayers = window.exports.importPlayersFromFile(result[0]);
            if (importedPlayers) {
                players = importedPlayers;
                renderPlayersList();
            }
        }
    });
}

// 开始分组
function startGrouping() {
    const totalPlayers = players.length;
    const groupCount = parseInt(document.getElementById('groupCount').value);
    
    if (totalPlayers < groupCount) {
        alert('队员数量不能少于分组数！');
        return;
    }

    // 随机打乱队员顺序
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // 计算每组的基本人数和余数
    const baseCount = Math.floor(totalPlayers / groupCount);
    const remainder = totalPlayers % groupCount;
    
    // 进行分组
    const groups = Array.from({ length: groupCount }, (_, index) => {
        const extraMember = index < remainder ? 1 : 0;
        const groupSize = baseCount + extraMember;
        return {
            name: `第 ${index + 1} 组`,
            members: shuffledPlayers.splice(0, groupSize)
        };
    });

    renderGroupingResult(groups);
}

// 渲染分组结果
function renderGroupingResult(groups) {
    const resultContainer = document.getElementById('groupingResult');
    resultContainer.innerHTML = groups.map(group => `
        <div class="group-card">
            <h3>${group.name}</h3>
            <div class="group-members">
                ${group.members.map(member => `<div>${member.name}</div>`).join('')}
            </div>
        </div>
    `).join('');
}

// 保存当前分组结果
function saveCurrentResult() {
    const groupingResult = {
        date: new Date().toISOString(),
        groups: Array.from(document.getElementById('groupingResult').children).map(groupEl => ({
            name: groupEl.querySelector('h3').textContent,
            members: Array.from(groupEl.querySelectorAll('.group-members div')).map(memberEl => ({
                name: memberEl.textContent
            }))
        }))
    };

    groupingHistory.unshift(groupingResult);
    window.exports.saveGroupingHistory(groupingHistory);
    alert('分组结果已保存！');
}

// 加载历史记录
function loadHistory() {
    groupingHistory = window.exports.getGroupingHistory();
}

// 显示历史记录
function showHistoryModal() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = groupingHistory.map((record, index) => `
        <div class="history-item">
            <h3>分组记录 ${index + 1} - ${new Date(record.date).toLocaleString()}</h3>
            <div class="history-groups">
                ${record.groups.map(group => `
                    <div class="group-card">
                        <h4>${group.name}</h4>
                        <div class="group-members">
                            ${group.members.map(member => `<div>${member.name}</div>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    document.getElementById('historyModal').style.display = 'block';
} 