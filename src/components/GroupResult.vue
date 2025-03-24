<template>
  <div class="group-result-wrapper">
    <GroupingForm @update:settings="updateSettings" />
    
    <el-card class="group-result-card">
      <template #header>
        <div class="card-header">
          <span>分组结果</span>
          <div v-if="todayResults.length" class="grouping-time">
            {{ formatDate(new Date()) }}
            {{ getWeekDay(new Date()) }}
          </div>
        </div>
      </template>
      
      <div class="actions-container">
        <div class="button-group">
          <el-button 
            type="warning" 
            @click="handleStartGrouping" 
            :disabled="!canStart"
            class="start-button"
            size="large"
            circle
          >
            <div class="basketball-button-content">
              <el-icon class="basketball-icon"><Basketball /></el-icon>
              <span class="start-text">开始</span>
            </div>
          </el-button>
        </div>
      </div>
      
      <div v-if="!todayResults.length" class="empty-result">
        <el-empty :description="'点击「开始分组」生成分组结果'">
          <template #image>
            <el-icon :size="60" class="empty-icon"><Basketball /></el-icon>
          </template>
        </el-empty>
      </div>
      
      <div v-else class="today-results">
        <div 
          v-for="(result, index) in todayResults" 
          :key="result.timestamp"
          class="result-item"
        >
          <div class="result-header">
            <h3>第 {{ todayResults.length - index }} 次分组</h3>
            <span class="result-time">{{ formatTime(result.timestamp) }}</span>
          </div>
          
          <div class="groups-container">
            <el-row :gutter="20">
              <el-col 
                v-for="group in result.groups" 
                :key="group.id"
                :span="24 / Math.min(result.groups.length, 4)"
              >
                <el-card class="group-card" shadow="hover">
                  <template #header>
                    <div class="group-header">
                      <h3>{{ group.name }}</h3>
                      <el-tag size="small" type="success">{{ group.members.length }}人</el-tag>
                    </div>
                  </template>
                  <div class="members-grid">
                    <div 
                      v-for="member in group.members" 
                      :key="member.id"
                      class="member-item"
                    >
                      <el-avatar 
                        :size="48" 
                        :src="generateAvatar(member.name)"
                      />
                      <span class="member-name">{{ member.name }}</span>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayersStore } from '@/stores/players'
import { ElMessage } from 'element-plus'
import GroupingForm from './GroupingForm.vue'
import type { Group } from '@/types'
import { generateAvatar } from '@/utils/avatar'

interface GroupingResult {
  timestamp: number
  groups: Group[]
}

const store = usePlayersStore()
const todayResults = ref<GroupingResult[]>([])

const groupSettings = ref({
  groupCount: 2,
  groupNames: null as string[] | null
})

const playerCount = computed(() => store.players.length)
const canStart = computed(() => {
  return playerCount.value >= groupSettings.value.groupCount * 2
})

const updateSettings = (settings: { groupCount: number; groupNames: string[] | null }) => {
  groupSettings.value = settings
}

const handleStartGrouping = () => {
  if (!canStart.value) {
    ElMessage.warning('队员数量不足，无法开始分组')
    return
  }
  
  const players = [...store.players].sort(() => Math.random() - 0.5)
  const baseCount = Math.floor(players.length / groupSettings.value.groupCount)
  const remainder = players.length % groupSettings.value.groupCount
  
  const groups = Array.from({ length: groupSettings.value.groupCount }, (_, index) => {
    const extraMember = index < remainder ? 1 : 0
    const groupSize = baseCount + extraMember
    const groupMembers = players.splice(0, groupSize)
    
    return {
      id: Date.now() + index,
      name: groupSettings.value.groupNames?.[index] || `第 ${index + 1} 组`,
      members: groupMembers
    }
  })

  todayResults.value.unshift({
    timestamp: Date.now(),
    groups
  })

  store.saveGroupingHistory(groups)
}

const formatDate = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  return `${year}-${month}-${day}`
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  const pad = (n: number) => n.toString().padStart(2, '0')
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())
  return `${hours}:${minutes}:${seconds}`
}

const getWeekDay = (date: Date) => {
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return weekDays[date.getDay()]
}
</script>

<style scoped>
.group-result-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-result {
  padding: 40px 0;
}

.empty-icon {
  color: var(--text-secondary);
}

.start-icon {
  margin-right: 4px;
  font-size: 18px;
}

.group-result-card {
  transition: all 0.3s ease;
  border-radius: 16px;
  overflow: hidden;
}

.group-card {
  margin-bottom: 20px;
  transition: all 0.3s ease;
  border-color: var(--border-color);
  border-radius: 12px;
  overflow: hidden;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.group-header h3 {
  margin: 0;
  color: var(--title-color);
  font-size: 16px;
  font-weight: 600;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
  gap: 8px;
  padding: 8px 0;
}

.member-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.member-name {
  font-size: 12px;
  color: var(--text-primary);
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 2px;
}

.actions-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);
}

.button-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.start-button {
  width: 100px !important;
  height: 100px !important;
  font-weight: 600;
  background: linear-gradient(145deg, #ff9a44, #fc6076) !important;
  border: none !important;
  position: relative;
  overflow: hidden;
}

.start-button:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 15px rgba(252, 96, 118, 0.3);
}

.start-button:active {
  transform: scale(0.95);
}

.basketball-button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.basketball-icon {
  font-size: 32px;
  margin: 0;
  animation: bounce 2s infinite;
}

.start-text {
  font-size: 16px;
  margin-top: 4px;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

:deep(.el-button.el-button--warning.is-disabled) {
  background: linear-gradient(145deg, #ccc, #999) !important;
  opacity: 0.8;
  border: none !important;
}

:deep(.el-card__body) {
  padding: 0;
}

.groups-container {
  padding: 20px;
}

:deep(.dark .el-card.is-always-shadow) {
  box-shadow: var(--card-shadow);
}

:deep(.dark .el-button--warning) {
  --el-button-hover-bg-color: var(--el-color-warning-dark-2);
  --el-button-hover-border-color: var(--el-color-warning-dark-2);
}

:deep(.dark .el-button--warning.is-disabled) {
  background-color: var(--el-color-warning-dark-2);
  border-color: var(--el-color-warning-dark-2);
  opacity: 0.6;
}

:deep(.dark .el-tag--success) {
  --el-tag-bg-color: var(--el-color-success-dark-2);
  border: none;
}

.card-header {
  color: var(--title-color);
  font-weight: 600;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.grouping-time {
  font-size: 14px;
  color: #909399;
}

:deep(.el-avatar) {
  width: 48px;
  height: 48px;
}

:deep(.el-card) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-button) {
  border-radius: 12px;
}

:deep(.el-tag) {
  border-radius: 10px;
}

.today-results {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 20px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--card-background);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.result-header h3 {
  margin: 0;
  color: var(--title-color);
  font-size: 16px;
  font-weight: 600;
}

.result-time {
  color: var(--text-secondary);
  font-size: 14px;
}

:deep(.dark) .result-item {
  background-color: var(--card-background);
  border-color: var(--border-color);
}

:deep(.dark) .result-header h3 {
  color: var(--title-color);
}

:deep(.dark) .result-time {
  color: var(--text-secondary);
}
</style> 