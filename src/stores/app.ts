import { defineStore } from 'pinia'
import type { Group } from '@/types'

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

export const useAppStore = defineStore('app', {
  state: () => ({
    isDark: true,
    lastGrouping: null as Group[] | null
  }),

  actions: {
    // 初始化时从存储加载数据
    initializeStore() {
      const darkMode = storage.get('darkMode')
      const lastGrouping = storage.get('lastGrouping')
      
      // 如果是第一次使用（没有存储的主题设置），使用暗黑模式
      if (darkMode === null) {
        this.isDark = true
        this.saveToDb()
      } else {
        this.isDark = darkMode
      }

      if (lastGrouping) {
        this.lastGrouping = lastGrouping
      }
    },

    // 保存数据到存储
    saveToDb() {
      storage.set('darkMode', this.isDark)
      storage.set('lastGrouping', this.lastGrouping)
    },

    setDarkMode(value: boolean) {
      this.isDark = value
      this.saveToDb()
    },

    setLastGrouping(groups: Group[]) {
      this.lastGrouping = groups
      this.saveToDb()
    }
  }
}) 