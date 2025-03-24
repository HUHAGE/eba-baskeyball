<template>
  <el-card class="rules-card">
    <template #header>
      <div class="card-header">
        <div class="header-title">
          <el-icon><Setting /></el-icon>
          <span>分组规则</span>
          <el-tag type="info" class="rules-count">{{ rules.length }}条</el-tag>
        </div>
        <el-button type="primary" @click="showAddRuleDialog">
          <el-icon><Plus /></el-icon>添加规则
        </el-button>
      </div>
    </template>

    <div v-if="rules.length" class="rules-list">
      <el-alert
        title="以下队员将不会被分配到同一组"
        type="info"
        :closable="false"
        class="rules-info"
      />
      <el-card
        v-for="rule in rules"
        :key="rule.id"
        class="rule-item"
        shadow="hover"
      >
        <div class="rule-content">
          <div class="players-info">
            <el-avatar :size="32" :src="generateAvatar(getPlayerName(rule.player1Id))" />
            <span class="player-name">{{ getPlayerName(rule.player1Id) }}</span>
            <el-icon class="separator"><Close /></el-icon>
            <el-avatar :size="32" :src="generateAvatar(getPlayerName(rule.player2Id))" />
            <span class="player-name">{{ getPlayerName(rule.player2Id) }}</span>
          </div>
          <el-button
            type="danger"
            size="small"
            circle
            @click="handleDeleteRule(rule.id)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </el-card>
    </div>

    <el-empty v-else description="暂无分组规则" />

    <!-- 添加规则对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加分组规则"
      width="500px"
      destroy-on-close
    >
      <el-form :model="form" label-width="120px">
        <el-form-item label="选择队员">
          <div class="player-selector">
            <el-select
              v-model="form.player1Id"
              placeholder="选择第一位队员"
              :disabled="!availablePlayers1.length"
            >
              <el-option
                v-for="player in availablePlayers1"
                :key="player.id"
                :label="player.name"
                :value="player.id"
              />
            </el-select>
            <el-icon class="separator"><Close /></el-icon>
            <el-select
              v-model="form.player2Id"
              placeholder="选择第二位队员"
              :disabled="!availablePlayers2.length"
            >
              <el-option
                v-for="player in availablePlayers2"
                :key="player.id"
                :label="player.name"
                :value="player.id"
              />
            </el-select>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!canAddRule"
          @click="handleAddRule"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayersStore } from '@/stores/players'
import { useRulesStore } from '@/stores/rules'
import { ElMessage } from 'element-plus'
import { Setting, Plus, Close, Delete } from '@element-plus/icons-vue'
import { generateAvatar } from '@/utils/avatar'

const playersStore = usePlayersStore()
const rulesStore = useRulesStore()

const dialogVisible = ref(false)
const form = ref({
  player1Id: null as number | null,
  player2Id: null as number | null
})

const rules = computed(() => rulesStore.rules)

// 获取玩家名称的辅助函数
const getPlayerName = (playerId: number) => {
  const player = playersStore.players.find(p => p.id === playerId)
  return player ? player.name : '未知队员'
}

// 计算可选的玩家列表（第一个下拉框）
const availablePlayers1 = computed(() => {
  return playersStore.players.filter(player => player.id !== form.value.player2Id)
})

// 计算可选的玩家列表（第二个下拉框）
const availablePlayers2 = computed(() => {
  return playersStore.players.filter(player => player.id !== form.value.player1Id)
})

// 检查是否可以添加规则
const canAddRule = computed(() => {
  return form.value.player1Id && form.value.player2Id
})

// 显示添加规则对话框
const showAddRuleDialog = () => {
  if (playersStore.players.length < 2) {
    ElMessage.warning('至少需要两名队员才能添加规则')
    return
  }
  form.value = {
    player1Id: null,
    player2Id: null
  }
  dialogVisible.value = true
}

// 添加规则
const handleAddRule = () => {
  if (!form.value.player1Id || !form.value.player2Id) return

  // 检查规则是否已存在
  if (!rulesStore.canBeInSameGroup(form.value.player1Id, form.value.player2Id)) {
    ElMessage.warning('该规则已存在')
    return
  }

  rulesStore.addRule(form.value.player1Id, form.value.player2Id)
  ElMessage.success('规则添加成功')
  dialogVisible.value = false
}

// 删除规则
const handleDeleteRule = (ruleId: number) => {
  rulesStore.removeRule(ruleId)
  ElMessage.success('规则删除成功')
}
</script>

<style scoped>
.rules-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rules-count {
  margin-left: 8px;
}

.rules-info {
  margin-bottom: 16px;
}

.rule-item {
  margin-bottom: 12px;
}

.rule-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.players-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-name {
  margin: 0 8px;
}

.separator {
  color: var(--el-text-color-secondary);
}

.player-selector {
  display: flex;
  align-items: center;
  gap: 16px;
}

.player-selector .el-select {
  flex: 1;
}
</style>