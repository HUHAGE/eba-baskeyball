<template>
  <el-card class="grouping-form-card">
    <template #header>
      <div class="card-header" @click="toggleCollapse">
        <div class="header-left">
          <span>分组设置</span>
          <el-tag size="small" type="info" class="settings-tag">
            {{ form.groupCount }}组 {{ form.useCustomNames ? '自定义组名' : '默认组名' }}
          </el-tag>
        </div>
        <el-icon :class="['collapse-icon', { 'is-active': !isCollapsed }]">
          <ArrowDown />
        </el-icon>
      </div>
    </template>
    
    <el-collapse-transition>
      <div v-show="!isCollapsed" class="form-content">
        <el-form :model="form" label-width="120px" class="grouping-form">
          <el-form-item label="分组数量">
            <el-input-number
              v-model="form.groupCount"
              :min="2"
              :max="maxGroupCount"
              :disabled="!playerCount"
            />
          </el-form-item>
          
          <el-form-item label="自定义组名">
            <el-switch v-model="form.useCustomNames" />
          </el-form-item>
          
          <div v-if="form.useCustomNames" class="group-names-container">
            <el-form-item 
              v-for="(_, index) in form.groupNames" 
              :key="index"
              :label="`第 ${index + 1} 组名称`"
            >
              <el-input v-model="form.groupNames[index]" :maxlength="10">
                <template #append>
                  <span class="char-count">{{ form.groupNames[index].length }}/10</span>
                </template>
              </el-input>
            </el-form-item>
          </div>
        </el-form>
      </div>
    </el-collapse-transition>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePlayersStore } from '@/stores/players'
import { ArrowDown } from '@element-plus/icons-vue'

const store = usePlayersStore()
const emit = defineEmits(['update:settings'])
const isCollapsed = ref(true)

interface FormState {
  groupCount: number
  useCustomNames: boolean
  groupNames: string[]
}

const form = ref<FormState>({
  groupCount: 2,
  useCustomNames: false,
  groupNames: ['第 1 组', '第 2 组']
})

const playerCount = computed(() => store.players.length)

const maxGroupCount = computed(() => {
  const max = Math.floor(playerCount.value / 2)
  return Math.max(2, max)
})

watch(() => form.value.useCustomNames, (newValue: boolean) => {
  if (newValue) {
    form.value.groupNames = Array(form.value.groupCount)
      .fill('')
      .map((_, i) => `第 ${i + 1} 组`)
  }
})

watch(playerCount, (newCount: number) => {
  const maxGroups = Math.floor(newCount / 2)
  if (form.value.groupCount > maxGroups && maxGroups >= 2) {
    form.value.groupCount = maxGroups
  }
})

watch(() => form.value.groupCount, (newCount: number) => {
  const currentNames = [...form.value.groupNames]
  form.value.groupNames = Array(newCount)
    .fill('')
    .map((_, i) => currentNames[i] || `第 ${i + 1} 组`)
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 监听表单变化，向父组件发送更新
watch(form, (newValue: FormState) => {
  emit('update:settings', {
    groupCount: newValue.groupCount,
    groupNames: newValue.useCustomNames ? newValue.groupNames : null
  })
}, { deep: true })
</script>

<style scoped>
.grouping-form-card {
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left span {
  color: var(--title-color);
  font-weight: 600;
  font-size: 16px;
}

.settings-tag {
  font-weight: normal;
  background-color: var(--hover-color);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.collapse-icon {
  transition: transform 0.3s ease;
  font-size: 16px;
  color: var(--text-secondary);
}

.collapse-icon.is-active {
  transform: rotate(180deg);
}

.form-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.grouping-form {
  max-width: 600px;
  margin: 0 auto;
}

.group-names-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.start-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding: 20px 0;
}

.start-icon {
  margin-right: 4px;
  font-size: 18px;
}

:deep(.el-button--large) {
  padding: 16px 32px;
  font-size: 16px;
}

.button-hint {
  font-size: 14px;
  color: var(--text-secondary);
}

.char-count {
  font-size: 12px;
  color: var(--text-secondary);
}

:deep(.el-form-item__content) {
  justify-content: flex-start;
}

:deep(.dark .el-form-item__label) {
  color: var(--text-primary);
}

:deep(.dark .el-switch__label) {
  color: var(--text-secondary);
}

:deep(.dark .el-input-number__decrease),
:deep(.dark .el-input-number__increase) {
  background-color: var(--hover-color);
  border-color: var(--border-color);
  color: var(--text-secondary);
}

:deep(.dark .el-input-number__decrease:hover),
:deep(.dark .el-input-number__increase:hover) {
  color: var(--primary-color);
}

/* 暗黑模式下的标签样式优化 */
:deep(.dark .el-tag.el-tag--info) {
  background-color: var(--hover-color);
  border-color: transparent;
  color: var(--text-primary);
}
</style> 