<template>
  <div class="app-container" :class="{ 'dark': isDark }">
    <el-config-provider :locale="zhCn">
      <el-container>
        <el-header class="app-header">
          <div class="header-content">
            <div class="title-container">
              <h1 class="main-title">
                <span class="title-text">EBA</span>
                <span class="title-divider">·</span>
                <span class="title-text">篮球队员分组</span>
              </h1>
              <div class="title-decoration"></div>
            </div>
            <div class="header-actions">
              <el-switch
                v-model="isDark"
                class="theme-switch"
                inline-prompt
                :active-icon="Moon"
                :inactive-icon="Sunny"
              />
            </div>
          </div>
        </el-header>
        
        <el-main class="app-main">
          <div class="content-wrapper">
            <PlayerList />
            <GroupResult 
              :groups="groups"
              @start-grouping="handleStartGrouping"
            />
            <div class="history-button">
              <el-button type="primary" @click="showHistory = true">
                <el-icon><Clock /></el-icon>历史记录
              </el-button>
            </div>
          </div>
        </el-main>
      </el-container>
      
      <HistoryList
        v-model="showHistory"
        @reuse="handleReuseHistory"
      />
    </el-config-provider>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Moon, Sunny, Clock } from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import PlayerList from '@/components/PlayerList.vue'
import GroupResult from '@/components/GroupResult.vue'
import HistoryList from '@/components/HistoryList.vue'
import { usePlayersStore } from '@/stores/players'
import type { Group, GroupingHistory } from '@/types'
import { useAppStore } from '@/stores/app'

const store = usePlayersStore()
const appStore = useAppStore()

// 初始化 stores
onMounted(() => {
  store.initializeStore()
  appStore.initializeStore()
  
  // 确保初始化时应用正确的主题
  document.documentElement.classList.toggle('dark', appStore.isDark)
})

// 监听主题变化
watch(() => appStore.isDark, (newValue) => {
  document.documentElement.classList.toggle('dark', newValue)
})

const groups = ref<Group[]>(appStore.lastGrouping || [])
const showHistory = ref(false)
const isDark = computed({
  get: () => appStore.isDark,
  set: (value) => appStore.setDarkMode(value)
})

const handleStartGrouping = (params: { groupCount: number; groupNames: string[] | null }) => {
  const { groupCount, groupNames } = params
  const players = [...store.players].sort(() => Math.random() - 0.5)
  const baseCount = Math.floor(players.length / groupCount)
  const remainder = players.length % groupCount
  
  groups.value = Array.from({ length: groupCount }, (_, index) => {
    const extraMember = index < remainder ? 1 : 0
    const groupSize = baseCount + extraMember
    const groupMembers = players.splice(0, groupSize)
    
    return {
      id: Date.now() + index,
      name: groupNames?.[index] || `第 ${index + 1} 组`,
      members: groupMembers
    }
  })

  // 保存最后一次分组结果
  appStore.setLastGrouping(groups.value)
}

const handleReuseHistory = (record: GroupingHistory) => {
  groups.value = record.groups
  appStore.setLastGrouping(groups.value)
}
</script>

<style>
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --background-color: #f8fafc;
  --card-background: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --hover-color: #f1f5f9;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --card-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --title-color: #1e293b;
}

.dark {
  --primary-color: #60a5fa;
  --secondary-color: #94a3b8;
  --background-color: #0f172a;
  --card-background: #1e293b;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --border-color: #334155;
  --hover-color: #2d3a4f;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --card-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
  --title-color: #ffffff;
}

.app-container {
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.app-header {
  background-color: var(--card-background);
  box-shadow: 0 2px 4px var(--shadow-color);
  position: sticky;
  top: 0;
  z-index: 100;
  height: auto !important;
  padding: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-container {
  position: relative;
  padding: 4px 0;
}

.main-title {
  font-size: 32px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(45deg, #ff6b6b, #ff9f43, #ffd93d);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
  line-height: 1.2;
}

.title-text {
  display: inline-block;
  transition: transform 0.3s ease;
  vertical-align: middle;
}

.title-text:hover {
  transform: translateY(-2px);
}

.title-divider {
  margin: 0 8px;
  color: #ff9f43;
  opacity: 0.8;
  vertical-align: middle;
}

.title-decoration {
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #ff6b6b, #ff9f43, #ffd93d);
  border-radius: 2px;
  opacity: 0.3;
}

/* 暗黑模式下的标题样式 */
:deep(.dark) .main-title {
  background: linear-gradient(45deg, #ff7e7e, #ffb067, #ffe066);
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

:deep(.dark) .title-decoration {
  opacity: 0.2;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0px;
}

.grouping-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 20px 0;
}

.history-button {
  text-align: center;
  margin-top: 40px;
}

/* Element Plus 暗黑模式覆盖样式 */
.dark .el-card {
  --el-card-bg-color: var(--card-background);
  border-color: var(--border-color);
  box-shadow: var(--card-shadow);
}

.dark .el-button {
  --el-button-bg-color: var(--card-background);
  --el-button-border-color: var(--border-color);
  --el-button-hover-bg-color: var(--hover-color);
  --el-button-hover-text-color: var(--primary-color);
  --el-button-hover-border-color: var(--primary-color);
}

.dark .el-input__inner {
  background-color: var(--card-background);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark .el-empty__description {
  color: var(--text-secondary);
}

.dark .el-dialog {
  --el-dialog-bg-color: var(--card-background);
  --el-dialog-border-color: var(--border-color);
}

.dark .el-table {
  --el-table-bg-color: var(--card-background);
  --el-table-tr-bg-color: var(--card-background);
  --el-table-header-bg-color: var(--hover-color);
  --el-table-border-color: var(--border-color);
  color: var(--text-primary);
}

.dark .el-tag {
  border-color: transparent;
}

.theme-switch {
  margin-left: 16px;
}

/* 添加卡片标题的暗黑模式样式 */
.dark .el-card__header {
  color: var(--title-color);
  border-bottom-color: var(--border-color);
}

/* 隐藏滚动条但保持滚动功能 */
.app-main {
  /* 隐藏主内容区域的滚动条 */
  overflow-y: scroll;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.app-main::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* 隐藏整个文档的滚动条 */
::-webkit-scrollbar {
  display: none;
}

body {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.header-actions {
  display: flex;
  align-items: center;
  height: 100%;
}
</style> 