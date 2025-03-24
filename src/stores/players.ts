import { defineStore } from 'pinia'
import type { Player } from '@/types'

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === 'development'

// 存储助手函数
const storage = {
  get: (key: string) => {
    if (isDev) {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    }
    const doc = utools.db.get(key)
    return doc ? doc.data : null
  },
  
  set: (key: string, value: any) => {
    if (isDev) {
      localStorage.setItem(key, JSON.stringify(value))
    } else {
      utools.db.put({
        _id: key,
        data: value,
        _rev: utools.db.get(key)?._rev // 添加 _rev 字段以支持更新
      })
    }
  }
}

export const usePlayersStore = defineStore('players', {
  state: () => ({
    players: [] as Player[],
    groupingHistory: [] as any[]
  }),

  actions: {
    // 初始化时从存储加载数据
    initializeStore() {
      const playersData = storage.get('players')
      const historyData = storage.get('groupingHistory')
      
      if (!playersData || playersData.length === 0) {
        // 导入示例数据
        const examplePlayers = [
          { id: 1, name: "猴" },
          { id: 2, name: "坤" },
          { id: 3, name: "龙" },
          { id: 4, name: "君" },
          { id: 5, name: "兵" },
          { id: 6, name: "伟" },
          { id: 7, name: "鹏" },
          { id: 8, name: "欢" },
          { id: 9, name: "创" }
        ]
        this.players = examplePlayers
        this.saveToDb() // 保存到存储中
      } else {
        this.players = playersData
      }

      if (historyData) {
        this.groupingHistory = historyData
      }
    },

    // 保存数据到存储
    saveToDb() {
      storage.set('players', this.players)
      storage.set('groupingHistory', this.groupingHistory)
    },

    addPlayer(name: string) {
      const player = {
        id: Date.now(),
        name: name.trim()
      }
      this.players.push(player)
      this.saveToDb()
    },

    updatePlayer(id: number, name: string) {
      const player = this.players.find(p => p.id === id)
      if (player) {
        player.name = name.trim()
        this.saveToDb()
      }
    },

    removePlayer(id: number) {
      const index = this.players.findIndex(p => p.id === id)
      if (index !== -1) {
        this.players.splice(index, 1)
        this.saveToDb()
      }
    },

    importPlayers(players: Player[]) {
      this.players = players
      this.saveToDb()
    },

    saveGroupingHistory(groups: any[]) {
      this.groupingHistory.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        groups
      })
      this.saveToDb()
    }
  }
}) 