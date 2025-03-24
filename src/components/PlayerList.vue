<template>
  <el-card class="player-list-card">
    <template #header>
      <div class="card-header">
        <div class="header-title">
          <el-icon><User /></el-icon>
          <span>队员列表</span>
          <el-tag type="info" class="player-count">{{ players.length }}人</el-tag>
        </div>
        <div class="button-group">
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon>添加队员
          </el-button>
          <el-button @click="handleImport">
            <el-icon><Upload /></el-icon>导入
          </el-button>
          <el-button @click="downloadExample">
            <el-icon><Download /></el-icon>下载示例
          </el-button>
        </div>
      </div>
    </template>
    
    <div v-if="players.length" class="players-grid">
      <div v-for="player in players" :key="player.id" class="player-card">
        <div class="player-avatar-wrapper">
          <el-avatar 
            :size="48" 
            :src="generateAvatar(player.name)"
            class="player-avatar"
          />
          <div class="player-actions">
            <el-button 
              circle
              type="primary"
              size="small"
              @click="showEditDialog(player)"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button 
              circle
              type="danger"
              size="small"
              @click="handleDelete(player.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="player-name">{{ player.name }}</div>
      </div>
    </div>
    
    <el-empty v-else description="暂无队员" />

    <!-- 添加/编辑队员对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑队员' : '添加队员'"
      width="400px"
      destroy-on-close
    >
      <el-form :model="form" label-width="0">
        <el-form-item>
          <el-input
            v-model="form.name"
            :placeholder="isEditing ? '修改队员姓名' : '请输入队员姓名'"
            clearable
            @keyup.enter="handleSubmit"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayersStore } from '@/stores/players'
import { ElMessage } from 'element-plus'
import { Plus, Upload, Delete, User, Edit, Download } from '@element-plus/icons-vue'
import { generateAvatar } from '@/utils/avatar'

const store = usePlayersStore()
const dialogVisible = ref(false)
const isEditing = ref(false)
const form = ref({
  id: null as number | null,
  name: ''
})

const players = computed(() => store.players)

const showAddDialog = () => {
  isEditing.value = false
  form.value = { id: null, name: '' }
  dialogVisible.value = true
}

const showEditDialog = (player: { id: number; name: string }) => {
  isEditing.value = true
  form.value = { ...player }
  dialogVisible.value = true
}

const handleSubmit = () => {
  if (!form.value.name.trim()) {
    ElMessage.warning('请输入队员姓名')
    return
  }
  
  if (isEditing.value && form.value.id !== null) {
    store.updatePlayer(form.value.id, form.value.name.trim())
    ElMessage.success('修改成功')
  } else {
    store.addPlayer(form.value.name.trim())
    ElMessage.success('添加成功')
  }
  
  dialogVisible.value = false
}

const handleDelete = (id: number) => {
  store.removePlayer(id)
  ElMessage.success('删除成功')
}

const handleImport = () => {
  const result = utools.showOpenDialog({
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile']
  })
  
  if (result && Array.isArray(result) && result.length > 0) {
    try {
      const players = window.exports.importPlayersFromFile(result[0])
      if (players && Array.isArray(players)) {
        store.importPlayers(players)
        ElMessage.success('导入成功')
      } else {
        ElMessage.error('文件格式错误')
      }
    } catch (error) {
      console.error('导入失败:', error)
      ElMessage.error('导入失败')
    }
  }
}

const downloadExample = () => {
  const exampleData = [
    { id: 1, name: "张三" },
    { id: 2, name: "李四" },
    { id: 3, name: "王五" },
    { id: 4, name: "赵六" }
  ]
  
  const blob = new Blob(
    [JSON.stringify(exampleData, null, 2)], 
    { type: 'application/json' }
  )
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'players_example.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('示例文件已下载')
}
</script>

<style scoped>
.player-list-card {
  transition: all 0.3s ease;
  border-radius: 16px;
  overflow: hidden;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 4px;
  padding: 4px;
}

.player-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.player-avatar-wrapper {
  position: relative;
  cursor: pointer;
}

.player-avatar {
  transition: all 0.3s ease;
}

.player-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;

  :deep(.el-button--small) {
    padding: 4px;
    font-size: 12px;
  }
  
  :deep(.el-icon) {
    font-size: 14px;
  }
}

.player-avatar-wrapper:hover .player-avatar {
  filter: brightness(0.7);
}

.player-avatar-wrapper:hover .player-actions {
  opacity: 1;
  pointer-events: auto;
}

.player-name {
  font-size: 12px;
  color: var(--text-primary);
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 2px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--title-color);
  font-weight: 600;
  font-size: 16px;
}

.player-count {
  margin-left: 8px;
}

.button-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.empty-table {
  border-radius: 8px;
  background-color: var(--hover-color);
}

:deep(.el-table) {
  --el-table-border-color: var(--border-color);
  --el-table-header-bg-color: var(--card-background);
  --el-table-row-hover-bg-color: var(--hover-color);
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
}

:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

:deep(.el-button) {
  border-radius: 12px;
}

:deep(.el-tag) {
  border-radius: 10px;
}
</style> 