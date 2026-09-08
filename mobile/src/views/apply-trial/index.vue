<!-- 申请试用 · 四步（选机构→选产品→选方案→申请信息） -->
<template>
  <div class="page page-with-tab">
    <van-nav-bar :title="editingOrderId ? '编辑申请' : '申请试用'" />
    <van-loading v-if="editLoading" vertical style="padding: 40px">回填申请数据...</van-loading>
    <template v-else>
    <div class="apply-banner">
      <div class="apply-banner__content">
        <div class="apply-banner__title">申请开通试用</div>
        <div class="apply-banner__sub">快速申请 · 便捷开通 · 立即体验</div>
      </div>
      <div class="apply-banner__art" aria-hidden="true">
        <span class="art-doc" />
        <span class="art-pen" />
        <span class="art-clock" />
      </div>
    </div>
    <van-steps :active="step" active-color="#1989fa" class="apply-steps">
      <van-step>选择机构</van-step>
      <van-step>选择产品</van-step>
      <van-step>选择方案</van-step>
      <van-step>申请信息</van-step>
    </van-steps>

    <!-- Step1 机构 -->
    <div v-show="step === 0" class="section-card">
      <van-cell
        title="机构简称"
        is-link
        :value="selectedOrg?.name || '请选择'"
        @click="router.push({ name: 'OrgSearch' })"
      />
      <template v-if="selectedOrg">
        <van-tabs v-model:active="orgTrialTab" shrink>
          <van-tab :title="`试用中(${orgTrials.active.length})`">
            <div v-if="!orgTrials.active.length" class="muted pad">暂无数据</div>
            <div v-for="(row, i) in orgTrials.active" :key="i" class="trial-row">
              <div>{{ row.productName }}</div>
              <div class="muted">方案：{{ shortName(row.planName) }}</div>
              <div class="muted">{{ row.startDate }} ~ {{ row.endDate }}</div>
            </div>
          </van-tab>
          <van-tab :title="`已到期(${orgTrials.expired.length})`">
            <div v-if="!orgTrials.expired.length" class="muted pad">暂无数据</div>
            <div v-for="(row, i) in orgTrials.expired" :key="i" class="trial-row">
              <div>{{ row.productName }}</div>
              <div class="muted">方案：{{ shortName(row.planName) }}</div>
              <div class="muted">{{ row.startDate }} ~ {{ row.endDate }}</div>
            </div>
          </van-tab>
        </van-tabs>
      </template>
      <div class="page-bottom-space" />
      <div class="bottom-bar">
        <van-button type="primary" block :disabled="!selectedOrg" @click="goStep2">下一步</van-button>
      </div>
    </div>

    <!-- Step2 产品 -->
    <div v-show="step === 1">
      <van-search
        v-model="productKeyword"
        placeholder="搜索产品名称"
        @search="loadProducts"
        @clear="loadProducts"
      />
      <van-empty v-if="!products.length" description="暂无可选产品" />
      <div
        v-for="item in products"
        :key="item.id"
        class="product-row"
        :class="{ active: selectedProductId === item.id }"
      >
        <div class="product-row__head" @click="selectedProductId = item.id">
          <img
            v-if="item.logo"
            :src="item.logo"
            class="product-row__logo"
            alt=""
          />
          <div v-else class="product-row__logo product-row__logo--empty">
            {{ item.name.slice(0, 1) }}
          </div>
          <div class="product-row__meta">
            <div class="product-row__name">{{ item.name }}</div>
            <div class="product-row__org-types">
              <van-tag
                v-for="t in item.orgTypes || []"
                :key="t"
                type="primary"
                plain
                class="org-type-tag"
              >
                {{ t }}
              </van-tag>
              <span v-if="!item.orgTypes?.length" class="muted">—</span>
            </div>
          </div>
          <van-icon
            v-if="selectedProductId === item.id"
            name="checked"
            color="#1989fa"
            class="product-row__check"
          />
        </div>
        <div class="product-row__intro" @click="openProductDetail(item)">
          {{ item.intro || '—' }}
        </div>
      </div>
      <div class="page-bottom-space" />
      <div class="bottom-bar">
        <van-button block @click="step = 0">上一步</van-button>
        <van-button type="primary" block :disabled="!selectedProductId" @click="goStep3">
          下一步
        </van-button>
      </div>
    </div>

    <!-- Step3 方案列表 -->
    <div v-show="step === 2">
      <van-search
        v-model="planKeyword"
        placeholder="搜索方案名称"
        @search="loadPlans"
        @clear="loadPlans"
      />
      <van-empty v-if="!plans.length" description="暂无可选方案" />
      <div
        v-for="item in plans"
        :key="item.id"
        class="plan-row"
        :class="{
          active: selectedPlanId === item.id,
          disabled: isPlanBlocked(item)
        }"
        @click="handlePlanRowClick(item)"
      >
        <div v-if="selectedPlanId === item.id" class="plan-row__badge">已选</div>
        <div v-if="item.occupyStatus" class="plan-row__status-line">
          <van-tag :type="occupyTagType(item.occupyStatus)" class="plan-row__trial">
            {{ item.occupyStatus }}
          </van-tag>
        </div>
        <div class="plan-row__name">{{ item.name }}</div>
        <div class="plan-row__meta">
          <div class="plan-meta-grid">
            <div class="plan-meta-cell">
              <span class="meta-label">试用时间</span>
              <span class="meta-value">{{ item.trialTimeLabel }}</span>
            </div>
            <div class="plan-meta-cell">
              <span class="meta-label">总延期次数</span>
              <span class="meta-value">{{ item.totalExtend }} 次</span>
            </div>
          </div>
          <div class="plan-meta-extra">
            <span class="meta-tip">
              <van-icon name="info-o" class="meta-tip__icon" />
              1次延期默认为30天
            </span>
            <button
              type="button"
              class="freeze-rule-link"
              @click.stop="openFreezeRules(item)"
            >
              冷冻期规则
              <van-icon name="arrow" />
            </button>
          </div>
        </div>
        <div class="plan-row__desc" @click.stop="openPlanDetail(item)">
          <div class="desc-text">{{ listIntroText(item.intro) }}</div>
        </div>
      </div>
      <div class="page-bottom-space" />
      <div class="bottom-bar">
        <van-button block @click="step = 1">上一步</van-button>
        <van-button type="primary" block :disabled="!selectedPlanId" @click="goStep4">
          下一步
        </van-button>
      </div>
    </div>

    <!-- Step4 回显前三步 + 方案附加配置 + 申请信息 -->
    <div v-show="step === 3">
      <div class="section-card">
        <div class="section-title">试用机构</div>
        <van-cell title="机构简称" :value="selectedOrg?.name || '—'" />
        <van-cell title="所属销售" :value="selectedOrg?.sales || '—'" />
      </div>
      <div class="section-card collapsible-card">
        <div class="section-title collapsible-title" @click="productExpanded = !productExpanded">
          <span>试用产品</span>
          <van-icon :name="productExpanded ? 'arrow-up' : 'arrow-down'" />
        </div>
        <van-cell title="产品名称" :value="selectedProduct?.name || '—'" />
        <van-cell
          v-show="productExpanded"
          title="产品介绍"
          :label="selectedProduct?.intro || '—'"
        />
      </div>
      <div class="section-card collapsible-card">
        <div class="section-title collapsible-title" @click="planExpanded = !planExpanded">
          <span>试用方案</span>
          <van-icon :name="planExpanded ? 'arrow-up' : 'arrow-down'" />
        </div>
        <van-cell title="方案名称" :value="selectedPlan?.name || '—'" />
        <template v-if="planExpanded">
          <van-cell title="试用时间" :value="selectedPlan?.trialTimeLabel || '—'" />
          <van-cell
            title="总延期次数"
            :value="selectedPlan ? String(selectedPlan.totalExtend) : '—'"
          />
          <van-cell title="方案介绍" :label="selectedPlan?.intro || '—'" />
        </template>
      </div>
      <div v-if="selectedPlan?.customConfigs?.length" class="section-card">
        <div class="section-title">方案附加配置</div>
        <template v-for="(cfg, idx) in selectedPlan.customConfigs" :key="idx">
          <div v-if="cfg.control === 'input'" class="cfg-block">
            <div class="cfg-label">
              <span v-if="cfg.required" class="required-mark">*</span>{{ cfg.name }}
            </div>
            <van-field
              v-model="customAnswers[cfg.name]"
              class="cfg-input-field"
              :class="{ 'cfg-input-field--hint': isTextConfigHint(cfg) }"
              :border="false"
              maxlength="100"
              show-word-limit
              :placeholder="cfg.tip ? '' : `请填写${cfg.name}`"
              @focus="onTextConfigFocus(cfg)"
            />
          </div>
          <div v-else-if="cfg.control === 'radio'" class="cfg-block">
            <div class="cfg-label">
              <span v-if="cfg.required" class="required-mark">*</span>{{ cfg.name }}
            </div>
            <div v-if="cfg.tip" class="cfg-tip">{{ cfg.tip }}</div>
            <van-radio-group
              v-model="customAnswers[cfg.name]"
              :class="['cfg-options', cfg.options.length > 3 ? 'cfg-options--wrap' : '']"
              :direction="cfg.options.length > 3 ? 'vertical' : 'horizontal'"
            >
              <van-radio v-for="opt in cfg.options" :key="opt" :name="opt">{{ opt }}</van-radio>
            </van-radio-group>
          </div>
          <div v-else class="cfg-block">
            <div class="cfg-label">
              <span v-if="cfg.required" class="required-mark">*</span>{{ cfg.name }}
            </div>
            <div v-if="cfg.tip" class="cfg-tip">{{ cfg.tip }}</div>
            <van-checkbox-group
              v-model="checkboxAnswers[cfg.name]"
              :class="['cfg-options', 'cfg-options--grid']"
              direction="horizontal"
            >
              <van-checkbox v-for="opt in cfg.options" :key="opt" :name="opt" shape="square">
                {{ opt }}
              </van-checkbox>
            </van-checkbox-group>
          </div>
        </template>
      </div>
      <div class="section-card">
        <div class="section-title">
          <span class="required-mark">*</span>申请说明
        </div>
        <van-field
          v-model="remark"
          rows="4"
          autosize
          type="textarea"
          maxlength="500"
          show-word-limit
          placeholder="请填写本次试用申请说明"
        />
      </div>
      <div class="page-bottom-space" />
      <div class="bottom-bar">
        <van-button block @click="step = 2">上一步</van-button>
        <van-button type="primary" block :loading="submitting" @click="handleSubmit">提交</van-button>
      </div>
    </div>

    <!-- 产品详情 · 底部抽屉 -->
    <van-popup
      v-model:show="productSheetVisible"
      position="bottom"
      round
      :style="{ maxHeight: '80%' }"
    >
      <div class="sheet sheet--scroll">
        <div class="sheet__title">产品详情</div>
        <div class="product-detail-head">
          <img
            v-if="productSheet?.logo"
            :src="productSheet.logo"
            class="product-detail-logo"
            alt="产品logo"
          />
          <div v-else class="product-detail-logo product-detail-logo--empty">
            {{ productSheet?.name?.slice(0, 1) || '—' }}
          </div>
          <div class="product-detail-meta">
            <div class="sheet__name">{{ productSheet?.name }}</div>
            <div class="product-detail-org-types">
              <van-tag
                v-for="t in productSheet?.orgTypes || []"
                :key="t"
                type="primary"
                plain
                class="org-type-tag"
              >
                {{ t }}
              </van-tag>
              <span v-if="!productSheet?.orgTypes?.length" class="muted">—</span>
            </div>
          </div>
        </div>
        <div class="sheet-block">
          <div class="sheet-block__label">产品介绍</div>
          <div class="scrollable-text">{{ productSheet?.intro || '—' }}</div>
        </div>
        <van-button type="primary" block class="sheet__btn" @click="productSheetVisible = false">
          关闭
        </van-button>
      </div>
    </van-popup>

    <!-- 冷冻期规则 · 底部抽屉 -->
    <van-popup
      v-model:show="freezeRulesVisible"
      position="bottom"
      round
      :style="{ minHeight: '32%' }"
    >
      <div class="sheet">
        <div class="sheet__title">冷冻期规则</div>
        <div v-if="freezeRulesPlan" class="sheet-block">
          <div
            v-for="(line, idx) in freezeRuleLines(freezeRulesPlan)"
            :key="idx"
            class="freeze-rule-line"
          >
            {{ line }}
          </div>
          <div v-if="!freezeRulesPlan.totalExtend" class="muted">无冷冻期</div>
        </div>
        <van-button type="primary" block class="sheet__btn" @click="freezeRulesVisible = false">
          关闭
        </van-button>
      </div>
    </van-popup>

    <!-- 方案详情 · 底部抽屉 -->
    <van-popup v-model:show="planSheetVisible" position="bottom" round :style="{ minHeight: '40%' }">
      <div class="sheet">
        <div class="sheet__title">方案详情</div>
        <van-cell title="方案名称" :value="planSheet?.name" />
        <van-cell title="试用时间" :value="planSheet?.trialTimeLabel" />
        <van-cell title="总延期次数" :value="planSheet ? `${planSheet.totalExtend} 次` : '—'" />
        <div v-if="planSheet" class="sheet-extend-hint">
          <span class="meta-tip">
            <van-icon name="info-o" class="meta-tip__icon" />
            1次延期默认为30天
          </span>
          <button type="button" class="freeze-rule-link" @click="openFreezeRules(planSheet)">
            冷冻期规则
            <van-icon name="arrow" />
          </button>
        </div>
        <div class="sheet-block sheet-block--cell">
          <div class="sheet-block__label">方案介绍</div>
          <div class="scrollable-text">{{ planSheet?.intro || '—' }}</div>
        </div>
        <van-button type="primary" block class="sheet__btn" @click="planSheetVisible = false">
          关闭
        </van-button>
      </div>
    </van-popup>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { showDialog, showToast } from 'vant'
  import {
    fetchApplyDetail,
    fetchOrgTrials,
    fetchPlansByProduct,
    fetchProductDetail,
    fetchProducts,
    searchOrgs,
    submitTrialApply
  } from '@/api/h5'
  import { shortPlanName } from '@/mock/h5'
  import type { OrgItem, OrgTrialRecord, PlanOption, ProductDetail, ProductItem } from '@/types/h5'
  import { PLAN_ALREADY_APPLIED_TIP } from '@/types/h5'

  defineOptions({ name: 'ApplyTrialPage' })

  const router = useRouter()
  const route = useRoute()
  const step = ref(0)
  const orgTrialTab = ref(0)
  const selectedOrg = ref<OrgItem | null>(null)
  const orgTrials = reactive<{ active: OrgTrialRecord[]; expired: OrgTrialRecord[] }>({
    active: [],
    expired: []
  })
  const products = ref<ProductItem[]>([])
  const plans = ref<PlanOption[]>([])
  const selectedProductId = ref<number | null>(null)
  const selectedPlanId = ref<number | null>(null)
  const selectedProduct = computed(
    () => products.value.find((p) => p.id === selectedProductId.value) || null
  )
  const selectedPlan = computed(() => plans.value.find((p) => p.id === selectedPlanId.value) || null)
  const productKeyword = ref('')
  const planKeyword = ref('')
  const remark = ref('')
  const customAnswers = reactive<Record<string, string>>({})
  const checkboxAnswers = reactive<Record<string, string[]>>({})
  const submitting = ref(false)
  const productExpanded = ref(false)
  const planExpanded = ref(false)
  const productSheetVisible = ref(false)
  const productSheet = ref<ProductDetail | null>(null)
  const planSheetVisible = ref(false)
  const planSheet = ref<PlanOption | null>(null)
  const freezeRulesVisible = ref(false)
  const freezeRulesPlan = ref<PlanOption | null>(null)
  /** 编辑中的工单 ID（草稿 / 已驳回） */
  const editingOrderId = ref<number | null>(null)
  const editLoading = ref(false)

  function shortName(name: string) {
    return shortPlanName(name)
  }

  /** 列表简介截断，避免超长文案触发行截断样式异常 */
  function listIntroText(text?: string, max = 56) {
    const s = (text || '').trim()
    if (!s) return '—'
    return s.length > max ? `${s.slice(0, max)}…` : s
  }

  async function openProductDetail(item: ProductItem) {
    const res = await fetchProductDetail(item.id)
    if (res.code === 200 && res.data) {
      productSheet.value = res.data
      productSheetVisible.value = true
    } else {
      showToast(res.message || '加载产品详情失败')
    }
  }

  function openPlanDetail(item: PlanOption) {
    planSheet.value = item
    planSheetVisible.value = true
  }

  async function loadOrgTrials(orgId: number) {
    const res = await fetchOrgTrials(orgId)
    if (res.code === 200) {
      orgTrials.active = res.data.active
      orgTrials.expired = res.data.expired
    }
  }

  async function loadProducts() {
    if (!selectedOrg.value) return
    const res = await fetchProducts(selectedOrg.value.id, productKeyword.value)
    products.value = res.code === 200 ? res.data : []
    if (products.value.length === 1) {
      selectedProductId.value = products.value[0].id
    }
  }

  async function loadPlans() {
    if (!selectedOrg.value || !selectedProductId.value) return
    const res = await fetchPlansByProduct(
      selectedProductId.value,
      selectedOrg.value.id,
      planKeyword.value
    )
    plans.value = res.code === 200 ? res.data : []
    const selectable = plans.value.filter((p) => !isPlanBlocked(p))
    if (
      selectedPlanId.value &&
      !selectable.some((p) => p.id === selectedPlanId.value)
    ) {
      selectedPlanId.value = null
    }
    if (!selectedPlanId.value && selectable.length === 1) {
      selectedPlanId.value = selectable[0].id
    }
  }

  function freezeRuleLines(plan: PlanOption): string[] {
    const list = plan.freezeDaysList
    const total = plan.totalExtend || list?.length || 0
    if (!total) return ['无冷冻期']
    if (list?.length) {
      return list.map((days, i) => `第${i + 1}次延期冷冻期：${days}天`)
    }
    return Array.from(
      { length: total },
      (_, i) => `第${i + 1}次延期冷冻期：${plan.freezeDays}天`
    )
  }

  function openFreezeRules(item: PlanOption) {
    freezeRulesPlan.value = item
    freezeRulesVisible.value = true
  }

  function isPlanBlocked(item: PlanOption) {
    if (item.allowRepeatApply) return false
    return Boolean(item.occupyStatus || item.inTrial)
  }

  function occupyTagType(
    status: NonNullable<PlanOption['occupyStatus']>
  ): 'primary' | 'success' | 'warning' | 'danger' | 'default' {
    if (status === '试用中') return 'warning'
    if (status === '已到期') return 'default'
    return 'danger'
  }

  function handlePlanRowClick(item: PlanOption) {
    if (isPlanBlocked(item)) {
      showToast({
        message: PLAN_ALREADY_APPLIED_TIP,
        duration: 2500,
        position: 'middle',
        className: 'plan-occupy-toast'
      })
      return
    }
    selectedPlanId.value = item.id
  }

  async function goStep2() {
    productKeyword.value = ''
    selectedProductId.value = null
    await loadProducts()
    step.value = 1
  }

  async function goStep3() {
    planKeyword.value = ''
    selectedPlanId.value = null
    await loadPlans()
    step.value = 2
  }

  function defaultValuesForConfig(cfg: PlanOption['customConfigs'][number]) {
    const indexes = cfg.defaultIndexes || []
    if (cfg.control === 'checkbox') {
      return indexes.map((i) => cfg.options[i]).filter(Boolean)
    }
    if (indexes.length) return cfg.options[indexes[0]] || ''
    return ''
  }

  /** 文本框：用提示信息预填展示；聚焦后清空 */
  function initTextConfigAnswer(cfg: PlanOption['customConfigs'][number], saved?: string) {
    if (saved !== undefined) return saved
    const def = defaultValuesForConfig(cfg) as string
    if (def) return def
    return cfg.tip || ''
  }

  function isTextConfigHint(cfg: PlanOption['customConfigs'][number]) {
    return Boolean(cfg.tip && customAnswers[cfg.name] === cfg.tip)
  }

  function textConfigValue(cfg: PlanOption['customConfigs'][number]) {
    const raw = String(customAnswers[cfg.name] || '').trim()
    if (cfg.tip && raw === cfg.tip) return ''
    return raw
  }

  function onTextConfigFocus(cfg: PlanOption['customConfigs'][number]) {
    if (isTextConfigHint(cfg)) {
      customAnswers[cfg.name] = ''
    }
  }

  function goStep4() {
    if (!selectedPlan.value) return
    Object.keys(customAnswers).forEach((k) => delete customAnswers[k])
    Object.keys(checkboxAnswers).forEach((k) => delete checkboxAnswers[k])
    selectedPlan.value.customConfigs.forEach((cfg) => {
      if (cfg.control === 'checkbox') {
        checkboxAnswers[cfg.name] = defaultValuesForConfig(cfg) as string[]
      } else if (cfg.control === 'input') {
        customAnswers[cfg.name] = initTextConfigAnswer(cfg)
      } else {
        customAnswers[cfg.name] = defaultValuesForConfig(cfg) as string
      }
    })
    productExpanded.value = false
    planExpanded.value = false
    step.value = 3
  }

  function applyCustomAnswers(saved?: Record<string, string>) {
    Object.keys(customAnswers).forEach((k) => delete customAnswers[k])
    Object.keys(checkboxAnswers).forEach((k) => delete checkboxAnswers[k])
    const plan = selectedPlan.value
    if (!plan) return
    plan.customConfigs.forEach((cfg) => {
      const hasSaved = saved && Object.prototype.hasOwnProperty.call(saved, cfg.name)
      const raw = hasSaved ? saved![cfg.name] ?? '' : undefined
      if (cfg.control === 'checkbox') {
        checkboxAnswers[cfg.name] = hasSaved
          ? raw
            ? raw.split('、').filter(Boolean)
            : []
          : (defaultValuesForConfig(cfg) as string[])
      } else if (cfg.control === 'input') {
        customAnswers[cfg.name] = initTextConfigAnswer(
          cfg,
          hasSaved ? raw || '' : undefined
        )
      } else {
        customAnswers[cfg.name] = hasSaved ? raw || '' : (defaultValuesForConfig(cfg) as string)
      }
    })
  }

  /** 按工单详情回填四步表单，并定位到申请信息页 */
  async function loadEditOrder(editId: number) {
    editLoading.value = true
    try {
      const res = await fetchApplyDetail(editId)
      if (res.code !== 200 || !res.data) {
        showToast(res.message || '加载工单失败')
        return
      }
      const order = res.data
      if (order.status !== '草稿' && order.status !== '未通过') {
        showToast('当前工单不可编辑')
        return
      }

      editingOrderId.value = order.id
      remark.value = order.applyRemark || ''

      const orgId = order.orgId
      if (!orgId) {
        showToast('工单缺少机构信息，无法回填')
        return
      }
      const orgRes = await searchOrgs(order.orgName)
      const matched =
        orgRes.code === 200
          ? orgRes.data.find((o) => o.id === orgId) ||
            orgRes.data.find((o) => o.name === order.orgName)
          : undefined
      selectedOrg.value = matched || {
        id: orgId,
        name: order.orgName,
        logo: '',
        sales: '',
        region: '',
        orgType: '',
        unit: order.orgUnit
      }
      await loadOrgTrials(orgId)

      productKeyword.value = ''
      await loadProducts()
      let productId = order.productId
      if (!productId) {
        productId = products.value.find((p) => p.name === order.productName)?.id
      }
      if (!productId) {
        showToast('未找到原申请产品，请重新选择')
        step.value = 1
        return
      }
      selectedProductId.value = productId

      planKeyword.value = ''
      await loadPlans()
      let planId = order.planId
      if (!planId) {
        planId = plans.value.find((p) => p.name === order.planName)?.id
      }
      if (!planId) {
        showToast('未找到原申请方案，请重新选择')
        step.value = 2
        return
      }
      selectedPlanId.value = planId
      applyCustomAnswers(order.customAnswers)
      productExpanded.value = false
      planExpanded.value = false
      step.value = 3
    } finally {
      editLoading.value = false
    }
  }

  function selectPlan(item: PlanOption) {
    handlePlanRowClick(item)
  }

  async function handleSubmit() {
    if (!selectedOrg.value || !selectedProductId.value || !selectedPlanId.value) {
      showToast('请完善申请信息')
      return
    }
    if (!remark.value.trim()) {
      showToast('请填写申请说明')
      return
    }
    const plan = selectedPlan.value
    if (plan?.customConfigs?.length) {
      for (const cfg of plan.customConfigs) {
        if (!cfg.required) continue
        if (cfg.control === 'checkbox') {
          if (!(checkboxAnswers[cfg.name] || []).length) {
            showToast(`请选择「${cfg.name}」`)
            return
          }
        } else if (cfg.control === 'input') {
          if (!textConfigValue(cfg)) {
            showToast(`请填写「${cfg.name}」`)
            return
          }
        } else if (!String(customAnswers[cfg.name] || '').trim()) {
          showToast(`请选择「${cfg.name}」`)
          return
        }
      }
    }
    const answers: Record<string, string> = {}
    plan?.customConfigs?.forEach((cfg) => {
      if (cfg.control === 'checkbox') {
        answers[cfg.name] = (checkboxAnswers[cfg.name] || []).join('、')
      } else if (cfg.control === 'input') {
        answers[cfg.name] = textConfigValue(cfg)
      } else {
        answers[cfg.name] = String(customAnswers[cfg.name] || '').trim()
      }
    })
    submitting.value = true
    try {
      const res = await submitTrialApply({
        orgId: selectedOrg.value.id,
        productId: selectedProductId.value,
        planId: selectedPlanId.value,
        remark: remark.value,
        customAnswers: answers,
        editId: editingOrderId.value || undefined
      })
      if (res.code === 200) {
        const orderNo = (res.data as { orderNo?: string } | null)?.orderNo
        await showDialog({
          title: '提交成功',
          message: orderNo
            ? `试用申请已提交，工单号：${orderNo}。即将前往「我的申请」查看进度。`
            : '试用申请已提交，即将前往「我的申请」查看进度。',
          confirmButtonText: '查看我的申请'
        })
        router.replace({ path: '/apply', query: { tab: 'my' } })
      } else {
        showToast(res.message || '提交失败')
      }
    } finally {
      submitting.value = false
    }
  }

  watch(
    () => route.query.orgId,
    async (orgId) => {
      if (!orgId || route.query.editId) return
      selectedOrg.value = {
        id: Number(orgId),
        name: String(route.query.orgName || ''),
        logo: '',
        sales: String(route.query.sales || ''),
        region: String(route.query.region || ''),
        orgType: String(route.query.orgType || ''),
        unit: String(route.query.unit || '')
      }
      await loadOrgTrials(Number(orgId))
      step.value = 0
    },
    { immediate: true }
  )

  watch(
    () => route.query.editId,
    (editId) => {
      if (!editId) {
        editingOrderId.value = null
        return
      }
      void loadEditOrder(Number(editId))
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .apply-banner {
    position: relative;
    margin: 0;
    padding: 20px 18px 22px;
    overflow: hidden;
    background: linear-gradient(135deg, #1a6dff 0%, #3b8cff 45%, #69b1ff 100%);
    color: #fff;
  }

  .apply-banner__content {
    position: relative;
    z-index: 1;
    max-width: 68%;
  }

  .apply-banner__title {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.3;
    letter-spacing: 0.5px;
  }

  .apply-banner__sub {
    margin-top: 8px;
    font-size: 13px;
    opacity: 0.92;
  }

  .apply-banner__art {
    position: absolute;
    right: 18px;
    bottom: 10px;
    width: 96px;
    height: 72px;
    opacity: 0.9;
  }

  .art-doc,
  .art-pen,
  .art-clock {
    position: absolute;
    border-radius: 6px;
    background: rgb(255 255 255 / 22%);
    border: 1px solid rgb(255 255 255 / 35%);
  }

  .art-doc {
    width: 46px;
    height: 56px;
    right: 28px;
    bottom: 8px;
  }

  .art-pen {
    width: 8px;
    height: 42px;
    right: 18px;
    bottom: 14px;
    transform: rotate(28deg);
    border-radius: 4px;
  }

  .art-clock {
    width: 28px;
    height: 28px;
    right: 0;
    bottom: 36px;
    border-radius: 50%;
  }

  .apply-steps {
    padding: 12px;
    background: #fff;
  }

  .pad {
    padding: 12px 0;
  }

  .trial-row {
    padding: 10px 0;
    border-bottom: 1px solid #f2f3f5;
    font-size: 13px;
    line-height: 1.6;
  }

  .product-row {
    position: relative;
    margin: 12px;
    padding: 14px;
    background: #fff;
    border-radius: 10px;
    border: 1px solid #ebedf0;
    -webkit-tap-highlight-color: transparent;

    &.active {
      border-color: #1989fa;
      background: #f0f7ff;
    }
  }

  .product-row__head {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
  }

  .product-row__logo {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    object-fit: contain;
    background: #f7f8fa;
    flex-shrink: 0;

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1989fa;
      color: #fff;
      font-size: 18px;
      font-weight: 700;
    }
  }

  .product-row__meta {
    flex: 1;
    min-width: 0;
  }

  .product-row__name {
    font-size: 15px;
    font-weight: 600;
    color: #323233;
    line-height: 1.35;
    word-break: break-all;
  }

  .product-row__org-types {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  }

  .product-row__check {
    flex-shrink: 0;
    margin-top: 2px;
    font-size: 18px;
  }

  .product-row__intro {
    margin-top: 10px;
    font-size: 13px;
    line-height: 1.5;
    color: #646566;
    word-break: break-word;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
  }

  .plan-row {
    position: relative;
    margin: 12px;
    padding: 14px;
    background: #fff;
    border-radius: 10px;
    border: 1px solid #ebedf0;
    overflow: hidden;

    &.active {
      border-color: #1989fa;
      background: #f0f7ff;
    }

    &.disabled {
      opacity: 0.55;
    }
  }

  .plan-row__badge {
    position: absolute;
    top: 0;
    right: 0;
    background: #1989fa;
    color: #fff;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 0 10px 0 8px;
  }

  .plan-row__status-line {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .plan-row__trial {
    flex-shrink: 0;
  }

  .plan-row__name {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 10px;
    padding: 6px 40px 6px 0;
    color: #323233;
    user-select: none;
  }

  .plan-row__desc {
    margin-top: 8px;
    padding: 8px 10px;
    background: #f7f8fa;
    border-radius: 8px;
    cursor: pointer;
  }

  .plan-row__meta {
    margin-bottom: 10px;
  }

  .plan-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
  }

  .plan-meta-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    font-size: 13px;
  }

  .plan-meta-extra {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 10px;
    padding: 8px 10px;
    background: #f7f8fa;
    border-radius: 8px;
  }

  .meta-tip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    font-size: 12px;
    line-height: 1.4;
    font-weight: normal;
    color: #969799;
  }

  .meta-tip__icon {
    flex-shrink: 0;
    font-size: 13px;
    color: #c8c9cc;
  }

  .freeze-rule-link {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    padding: 0;
    border: none;
    background: transparent;
    font-size: 12px;
    line-height: 1.4;
    color: #1989fa;
    cursor: pointer;

    .van-icon {
      font-size: 12px;
    }
  }

  .sheet-extend-hint {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 0 16px 8px;
    padding: 8px 10px;
    background: #f7f8fa;
    border-radius: 8px;
  }

  .freeze-rule-line {
    font-size: 14px;
    line-height: 1.6;
    color: #323233;
    padding: 4px 0;
  }

  .meta-label {
    color: #969799;
    flex-shrink: 0;
  }

  .meta-value {
    color: #323233;
    font-weight: 500;
    min-width: 0;
  }

  .desc-text {
    font-size: 13px;
    line-height: 1.5;
    max-height: calc(13px * 1.5 * 2);
    color: #646566;
    overflow: hidden;
    word-break: break-word;
  }

  .link {
    color: #1989fa;
    font-size: 13px;
    font-weight: 500;
    flex-shrink: 0;
  }

  .cfg-block {
    padding: 12px 0;
    border-bottom: 1px solid #f2f3f5;

    &:last-child {
      border-bottom: none;
    }
  }

  .cfg-label {
    font-size: 14px;
    margin-bottom: 4px;
    color: #323233;
    font-weight: 500;
  }

  .cfg-tip {
    font-size: 12px;
    line-height: 1.4;
    color: #969799;
    margin-bottom: 10px;
  }

  .cfg-block :deep(.van-field) {
    padding: 0;
  }

  .cfg-block :deep(.cfg-input-field.van-field) {
    padding: 8px 12px;
    background: #f7f8fa;
    border-radius: 8px;
  }

  .cfg-block :deep(.cfg-input-field--hint .van-field__control) {
    color: #c8c9cc;
  }

  .cfg-block :deep(.cfg-input-field .van-field__word-limit) {
    margin-top: 4px;
    color: #969799;
  }

  .cfg-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 16px;
  }

  .cfg-options--wrap :deep(.van-radio) {
    margin-right: 0;
  }

  .cfg-options--grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 12px;
  }

  .cfg-options--grid :deep(.van-checkbox) {
    margin-right: 0;
    align-items: flex-start;
  }

  .cfg-block :deep(.van-radio-group),
  .cfg-block :deep(.van-checkbox-group) {
    width: 100%;
  }

  .collapsible-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
  }

  .sheet {
    padding: 16px 16px calc(16px + env(safe-area-inset-bottom));

    &--scroll {
      max-height: 80vh;
      overflow-y: auto;
    }

    &__title {
      text-align: center;
      font-size: 16px;
      font-weight: 650;
      margin-bottom: 12px;
    }

    &__name {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    &__btn {
      margin-top: 12px;
    }
  }

  .product-detail-head {
    display: flex;
    gap: 12px;
    margin-bottom: 14px;
  }

  .product-detail-logo {
    width: 64px;
    height: 64px;
    border-radius: 10px;
    object-fit: contain;
    background: #f2f3f5;
    flex-shrink: 0;

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1989fa;
      color: #fff;
      font-size: 22px;
      font-weight: 700;
    }
  }

  .product-detail-meta {
    flex: 1;
    min-width: 0;
  }

  .product-detail-org-types {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .sheet-block {
    margin-bottom: 14px;
    padding-top: 10px;
    border-top: 1px solid #f2f3f5;

    &--cell {
      margin: 0 16px 8px;
      padding: 12px 0 0;
      border-top: 1px solid #ebedf0;
    }

    &__label {
      font-size: 14px;
      font-weight: 600;
      color: #323233;
      margin-bottom: 8px;
    }

    &__value {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 13px;
      color: #646566;
    }
  }

  .scrollable-text {
    max-height: 220px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 10px 12px;
    background: #f7f8fa;
    border-radius: 8px;
    font-size: 14px;
    line-height: 1.6;
    color: #646566;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .org-type-tag {
    margin: 0;
  }
</style>
