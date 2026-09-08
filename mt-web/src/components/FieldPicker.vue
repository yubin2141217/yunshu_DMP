<template>
  <div class="field-picker">
    <div v-if="!hideTemplatePanel" class="field-picker__templates">
      <div class="field-picker__templates-head">
        <span class="field-picker__templates-title">快速模板</span>
        <span class="field-picker__templates-tip">点选后自动勾选模板字段；若再改动具体字段，将退出模板选中</span>
      </div>
      <div v-if="templates.length" class="field-picker__template-list">
        <button
          v-for="tpl in templates"
          :key="tpl.id"
          type="button"
          class="field-template"
          :class="{ 'field-template--active': activeTemplateId === tpl.id }"
          @click="applyTemplate(tpl.id)"
        >
          <div class="field-template__top">
            <span class="field-template__name">{{ tpl.name }}</span>
            <a-tag :color="tpl.type === 'system' ? 'arcoblue' : 'orangered'" size="small">
              {{ tpl.type === 'system' ? '系统内置' : '用户自定义' }}
            </a-tag>
          </div>
          <span class="field-template__meta">{{ tpl.fieldIds.length }} 个字段</span>
          <span class="field-template__desc">{{ tpl.desc || '—' }}</span>
        </button>
      </div>
      <a-empty v-else description="暂无快速模板" />
    </div>

    <div class="field-picker__toolbar">
      <a-input v-model="keyword" allow-clear placeholder="搜索字段名 / 描述" style="width: 220px" />
      <a-select
        v-model="category"
        :options="categoryOpts"
        allow-clear
        placeholder="业务分类"
        style="width: 140px"
      />
      <a-button size="mini" @click="selectVisible">全选当前结果</a-button>
      <a-button size="mini" @click="clearSelected">清除当前选中</a-button>
      <span class="field-picker__count">已选 {{ modelValue.length }} / {{ fields.length }}</span>
      <a-button
        v-if="!hideSaveAsTemplate && canSaveAsTemplate"
        type="outline"
        size="mini"
        @click="openSaveModal"
      >
        保存为模板
      </a-button>
    </div>
    <div v-if="filteredGroups.length" class="field-picker__body">
      <div v-for="group in filteredGroups" :key="group.name" class="field-group">
        <div class="field-group__head">
          <a-checkbox
            :model-value="isGroupChecked(group)"
            :indeterminate="isGroupIndeterminate(group)"
            @change="(checked: boolean | (string | number | boolean)[]) => toggleGroup(group, !!checked)"
          >
            {{ group.name }}
            <span class="field-group__meta">（已选 {{ selectedCountIn(group) }}/{{ group.items.length }}）</span>
          </a-checkbox>
        </div>
        <div class="field-group__list">
          <label v-for="item in group.items" :key="item.id" class="field-item">
            <a-checkbox
              :model-value="modelValue.includes(item.id)"
              @change="(checked: boolean | (string | number | boolean)[]) => toggleField(item.id, !!checked)"
            />
            <span class="field-item__name">{{ item.name }}</span>
            <span class="field-item__desc">{{ item.description }}</span>
            <span class="field-item__type">{{ item.dataType }}</span>
          </label>
        </div>
      </div>
    </div>
    <a-empty v-else description="无匹配字段" />

    <a-modal
      v-model:visible="saveVisible"
      title="保存为快速模板"
      :width="480"
      unmount-on-close
      :on-before-ok="onSaveTemplate"
    >
      <a-form ref="saveFormRef" :model="saveForm" :rules="saveRules" layout="vertical">
        <a-form-item field="name" label="模板名称" required>
          <a-input v-model="saveForm.name" placeholder="请输入模板名称" :max-length="50" allow-clear />
        </a-form-item>
        <a-form-item field="desc" label="模板说明">
          <a-textarea
            v-model="saveForm.desc"
            placeholder="可选，说明适用场景"
            :auto-size="{ minRows: 2, maxRows: 4 }"
            :max-length="200"
            allow-clear
          />
        </a-form-item>
        <a-alert type="info">将保存当前已选 {{ modelValue.length }} 个字段，模板类型为「用户自定义」。</a-alert>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Message, type FormInstance } from '@arco-design/web-vue'
import { listFieldTemplates, saveFieldTemplate } from '@/api/mt'
import { bizCategoryOptions, sameFieldIdSet, type FieldTemplate } from '@/mock/mt'
import { clearFormValidate, validateForm } from '@/utils/formValidate'

export interface PickerField {
  id: string
  name: string
  description: string
  dataType: string
  bizCategory: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    fields: PickerField[]
    /** 隐藏顶部快速模板卡片区（如在模板管理页勾选字段时） */
    hideTemplatePanel?: boolean
    /** 隐藏「保存为模板」按钮 */
    hideSaveAsTemplate?: boolean
  }>(),
  {
    hideTemplatePanel: false,
    hideSaveAsTemplate: false,
  },
)

const emit = defineEmits<{ 'update:modelValue': [string[]] }>()

const keyword = ref('')
const category = ref<string | undefined>()
const categoryOpts = [...bizCategoryOptions]
const categoryOrder = ['平台', '作者', '文章', '标注', '运维管理', '其它']
const templates = ref<FieldTemplate[]>([])
const activeTemplateId = ref('')
const applyingTemplate = ref(false)
const saveVisible = ref(false)
const saveFormRef = ref<FormInstance>()
const saveForm = reactive({ name: '', desc: '' })
const saveRules = {
  name: [{ required: true, message: '请填写模板名称' }],
}

const availableIdSet = computed(() => new Set(props.fields.map((f) => f.id)))

const canSaveAsTemplate = computed(() => {
  if (!props.modelValue.length) return false
  const current = [...new Set(props.modelValue)]
  return !templates.value.some((tpl) => sameFieldIdSet(resolveTemplateIds(tpl.fieldIds), current))
})

const filteredFields = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return props.fields.filter((item) => {
    if (category.value && item.bizCategory !== category.value) return false
    if (!kw) return true
    return item.name.toLowerCase().includes(kw) || item.description.toLowerCase().includes(kw)
  })
})

const filteredGroups = computed(() => {
  const map = new Map<string, PickerField[]>()
  filteredFields.value.forEach((item) => {
    const key = item.bizCategory || '未分类'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  })
  return categoryOrder
    .filter((name) => map.has(name))
    .map((name) => ({ name, items: map.get(name)! }))
    .concat(
      [...map.keys()]
        .filter((name) => !categoryOrder.includes(name))
        .map((name) => ({ name, items: map.get(name)! })),
    )
})

function resolveTemplateIds(fieldIds: readonly string[]) {
  return fieldIds.filter((id) => availableIdSet.value.has(id))
}

function matchTemplateId(ids: string[]) {
  for (const tpl of templates.value) {
    const expected = resolveTemplateIds(tpl.fieldIds)
    if (sameFieldIdSet(ids, expected)) return tpl.id
  }
  return ''
}

function setIds(ids: string[]) {
  emit('update:modelValue', [...new Set(ids)])
}

function applyTemplate(id: string) {
  const tpl = templates.value.find((t) => t.id === id)
  if (!tpl) return
  applyingTemplate.value = true
  activeTemplateId.value = id
  setIds(resolveTemplateIds(tpl.fieldIds))
  queueMicrotask(() => {
    applyingTemplate.value = false
  })
}

async function loadTemplates() {
  templates.value = await listFieldTemplates()
  activeTemplateId.value = matchTemplateId(props.modelValue)
}

function openSaveModal() {
  saveForm.name = ''
  saveForm.desc = ''
  saveVisible.value = true
  queueMicrotask(() => clearFormValidate(saveFormRef.value))
}

async function onSaveTemplate() {
  if (!(await validateForm(saveFormRef.value))) return false
  try {
    await saveFieldTemplate({
      name: saveForm.name,
      desc: saveForm.desc,
      fieldIds: [...props.modelValue],
    })
    Message.success('已保存为用户自定义模板')
    await loadTemplates()
    activeTemplateId.value = matchTemplateId(props.modelValue)
    return true
  } catch (e) {
    Message.error((e as Error).message)
    return false
  }
}

watch(
  () => props.modelValue.slice(),
  (ids) => {
    if (applyingTemplate.value) return
    activeTemplateId.value = matchTemplateId(ids)
  },
)

function selectedCountIn(group: { items: PickerField[] }) {
  return group.items.filter((item) => props.modelValue.includes(item.id)).length
}
function isGroupChecked(group: { items: PickerField[] }) {
  return group.items.length > 0 && group.items.every((item) => props.modelValue.includes(item.id))
}
function isGroupIndeterminate(group: { items: PickerField[] }) {
  const n = selectedCountIn(group)
  return n > 0 && n < group.items.length
}
function toggleField(id: string, checked: boolean) {
  if (checked) setIds([...props.modelValue, id])
  else setIds(props.modelValue.filter((x) => x !== id))
}
function toggleGroup(group: { name: string; items: PickerField[] }, checked: boolean) {
  const ids = group.items.map((i) => i.id)
  if (checked) setIds([...props.modelValue, ...ids])
  else {
    const drop = new Set(ids)
    setIds(props.modelValue.filter((id) => !drop.has(id)))
  }
}
function selectVisible() {
  setIds([...props.modelValue, ...filteredFields.value.map((i) => i.id)])
}
function clearSelected() {
  setIds([])
}

onMounted(() => {
  if (!props.hideTemplatePanel || !props.hideSaveAsTemplate) {
    loadTemplates()
  }
})

defineExpose({ reloadTemplates: loadTemplates })
</script>

<style scoped>
.field-picker {
  width: 100%;
  border: 1px solid var(--color-border-2, #e5e6eb);
  border-radius: 6px;
  background: var(--color-fill-1, #f7f8fa);
  overflow: hidden;
}
.field-picker__templates {
  padding: 12px 12px 10px;
  border-bottom: 1px solid var(--color-border-2, #e5e6eb);
  background: #fafbfc;
}
.field-picker__templates-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.field-picker__templates-title {
  font-size: 13px;
  font-weight: 600;
  color: #1d2129;
}
.field-picker__templates-tip {
  font-size: 12px;
  color: #86909c;
}
.field-picker__template-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.field-template {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field-template:hover {
  border-color: #94bfff;
}
.field-template--active {
  border-color: #165dff;
  box-shadow: 0 0 0 1px #165dff inset;
  background: #f3f7ff;
}
.field-template__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}
.field-template__name {
  font-size: 13px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.4;
}
.field-template__meta {
  font-size: 12px;
  color: #165dff;
}
.field-template__desc {
  font-size: 12px;
  color: #86909c;
  line-height: 1.45;
}
.field-picker__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border-2, #e5e6eb);
  background: #fff;
}
.field-picker__count {
  margin-left: auto;
  color: var(--color-text-3, #86909c);
  font-size: 12px;
}
.field-picker__body {
  max-height: 560px;
  overflow: auto;
  padding: 8px 12px 12px;
  background: #fff;
}
.field-group + .field-group {
  margin-top: 12px;
}
.field-group__head {
  margin-bottom: 6px;
  font-weight: 600;
}
.field-group__meta {
  font-weight: 400;
  color: var(--color-text-3, #86909c);
  font-size: 12px;
}
.field-group__list {
  display: grid;
  gap: 2px;
  padding-left: 4px;
}
.field-item {
  display: grid;
  grid-template-columns: 18px minmax(140px, 200px) 1fr 56px;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
}
.field-item:hover {
  background: var(--color-fill-2, #f2f3f5);
}
.field-item__name {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
}
.field-item__desc {
  font-size: 13px;
  color: var(--color-text-2, #4e5969);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.field-item__type {
  font-size: 12px;
  color: var(--color-text-3, #86909c);
  text-align: right;
}

@media (max-width: 960px) {
  .field-picker__template-list {
    grid-template-columns: 1fr;
  }
}
</style>
