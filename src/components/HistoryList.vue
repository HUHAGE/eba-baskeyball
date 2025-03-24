<template>
  <el-dialog
    v-model="dialogVisible"
    title="历史记录"
    width="80%"
    :close-on-click-modal="false"
    class="history-dialog"
  >
    <el-empty v-if="!store.groupingHistory.length" description="暂无历史记录" />
    
    <div v-else class="history-list">
      <el-card v-for="record in store.groupingHistory" :key="record.id" class="history-card">
        <template #header>
          <div class="card-header">
            <span class="date">{{ formatDate(record.date) }}</span>
            <div class="actions">
              <el-button type="primary" link @click="handleReuse(record)">
                <el-icon><RefreshRight /></el-icon>
                复用
              </el-button>
              <el-button type="danger" link @click="handleDelete(record.id)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </template>
        
        <div class="groups-container">
          <div v-for="group in record.groups" :key="group.id" class="group-item">
            <div class="group-name">{{ group.name }}</div>
            <div class="group-members">
              {{ group.members.map((member: Player) => member.name).join('、') }}
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RefreshRight, Delete } from '@element-plus/icons-vue'
import { usePlayersStore } from '@/stores/players'
import type { GroupingHistory, Player } from '@/types'
import { ElMessageBox } from 'element-plus'

const store = usePlayersStore()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'reuse', record: GroupingHistory): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const handleReuse = (record: GroupingHistory) => {
  emit('reuse', record)
  dialogVisible.value = false
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      type: 'warning'
    })
    store.groupingHistory = store.groupingHistory.filter(record => record.id !== id)
    store.saveToDb()
  } catch {
    // 用户取消删除
  }
}
</script>

<style scoped>
.history-dialog :deep(.el-dialog__body) {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-card {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date {
  font-size: 14px;
  color: var(--text-secondary);
}

.actions {
  display: flex;
  gap: 8px;
}

.groups-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-item {
  padding: 8px 0;
}

.group-name {
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.group-members {
  color: var(--text-primary);
  line-height: 1.5;
}

/* 暗黑模式适配 */
:deep(.dark) .date {
  color: var(--text-secondary);
}

:deep(.dark) .group-name {
  color: var(--primary-color);
}

:deep(.dark) .group-members {
  color: var(--text-primary);
}
</style> 