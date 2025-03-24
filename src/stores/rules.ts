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
        _rev: utools.db.get(key)?._rev
      })
    }
  }
}

export interface GroupingRule {
  id: number
  player1Id: number
  player2Id: number
  type: 'separate' // 目前只支持分开的规则，未来可以扩展
}

export const useRulesStore = defineStore('rules', {
  state: () => ({
    rules: [] as GroupingRule[]
  }),

  actions: {
    // 初始化时从存储加载数据
    initializeStore() {
      const rulesData = storage.get('groupingRules')
      if (rulesData) {
        this.rules = rulesData
      }
    },

    // 保存数据到存储
    saveToDb() {
      storage.set('groupingRules', this.rules)
    },

    // 添加规则
    addRule(player1Id: number, player2Id: number) {
      const rule = {
        id: Date.now(),
        player1Id,
        player2Id,
        type: 'separate' as const
      }
      this.rules.push(rule)
      this.saveToDb()
    },

    // 删除规则
    removeRule(id: number) {
      const index = this.rules.findIndex(r => r.id === id)
      if (index !== -1) {
        this.rules.splice(index, 1)
        this.saveToDb()
      }
    },

    // 检查两个玩家是否可以在同一组
    canBeInSameGroup(player1Id: number, player2Id: number): boolean {
      return !this.rules.some(rule =>
        (rule.player1Id === player1Id && rule.player2Id === player2Id) ||
        (rule.player1Id === player2Id && rule.player2Id === player1Id)
      )
    },

    // 清空所有规则
    clearRules() {
      this.rules = []
      this.saveToDb()
    }
  }
})