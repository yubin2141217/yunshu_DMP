import { showConfirmDialog, showDialog, showSuccessToast, showToast } from 'vant'
import { applyClose, applyReset, extendTrial, fetchTrialPlanDetail } from '@/api/h5'
import { canExtendPlan } from '@/mock/h5'
import type { PlanUseStatus, TrialPlanRow } from '@/types/h5'
import { FREEZE_EXTEND_TIP } from '@/types/h5'
import { formatFreezeCountdown, getFreezeRemainMs } from '@/utils/freeze-countdown'

/** 产品方案详情页状态与操作 */
export function usePlanDetail(planId: () => number) {
  const loading = ref(false)
  const detail = ref<TrialPlanRow | null>(null)
  const activeTab = ref('usage')
  const remarkVisible = ref(false)
  const remarkMode = ref<'close' | 'reset'>('close')
  const remark = ref('')
  const trialCountdownText = ref('')
  const freezeCountdownText = ref('')
  let countdownTimer: ReturnType<typeof setInterval> | null = null

  const usageStartText = computed(() => {
    const d = detail.value
    if (!d || d.startDate === '—') return '—'
    return d.startDate.includes(' ') ? d.startDate : `${d.startDate} 00:00:00`
  })

  const usageEndText = computed(() => {
    const d = detail.value
    if (!d) return '—'
    if (d.expireTime && d.expireTime !== '—') return d.expireTime
    if (d.endDate && d.endDate !== '—') {
      return d.endDate.includes(' ') ? d.endDate : `${d.endDate} 23:59:59`
    }
    return '—'
  })

  function resolveEndTime(d: TrialPlanRow) {
    const end = d.expireTime && d.expireTime !== '—' ? d.expireTime : d.endDate
    if (!end || end === '—') return ''
    return end.includes(' ') ? end : `${end} 23:59:59`
  }

  /** 即将到期（到期时间 ≤ 3 天）才展示试用倒计时 */
  const showTrialCountdown = computed(() => {
    const d = detail.value
    if (!d) return false
    if (d.status === '即将到期') return true
    if (d.status !== '试用中') return false
    const end = resolveEndTime(d)
    if (!end) return false
    const ms = getFreezeRemainMs(end)
    return ms > 0 && ms <= 3 * 86400000
  })

  const showFreezeCountdown = computed(() => detail.value?.status === '冷冻期')

  const freezeRuleLines = computed(() => {
    const d = detail.value
    if (!d) return [] as string[]
    const raw = (d.freezeRule || '').trim()
    if (!raw || raw === '—' || raw === '无冷冻期') {
      if (raw === '无冷冻期') return ['无冷冻期']
      const list = d.freezeDaysList
      const times = list?.length || Math.max(d.totalExtend || 0, 1)
      if (list?.length) {
        return list.map((days, i) => `第${i + 1}次延期冷冻期：${days}天`)
      }
      return Array.from(
        { length: times },
        (_, i) => `第${i + 1}次试用到期后，冷冻期时长为${d.freezeDays || 0}天`
      )
    }
    if (raw.includes('；')) return raw.split('；').map((s) => s.trim()).filter(Boolean)
    if (raw.includes('\n')) return raw.split('\n').map((s) => s.trim()).filter(Boolean)
    if (/第\d+次/.test(raw) && raw.split('第').length > 2) {
      return raw.split(/(?=第\d+次)/).map((s) => s.trim()).filter(Boolean)
    }
    return [raw]
  })

  const canClose = computed(() => {
    const s = detail.value?.status
    return s === '试用中' || s === '即将到期'
  })

  const canExtendBtn = computed(() => {
    const d = detail.value
    if (!d || d.status === '申请中' || d.status === '停用') return false
    return d.remainExtendCount > 0
  })

  const showReset = computed(() => {
    const d = detail.value
    if (!d) return false
    if (d.resetPending) return true
    if (d.status !== '已到期' && d.status !== '冷冻期') return false
    if (d.remainExtendCount > 0 && canExtendPlan(d).ok) return false
    return d.status === '已到期' && d.remainExtendCount <= 0
  })

  const showActions = computed(
    () => canClose.value || canExtendBtn.value || showReset.value
  )

  function badgeText(item: TrialPlanRow) {
    return item.status
  }

  function tagType(status: PlanUseStatus): 'primary' | 'success' | 'warning' | 'danger' | 'default' {
    if (status === '试用中') return 'success'
    if (status === '即将到期') return 'warning'
    if (status === '已到期' || status === '停用') return 'danger'
    if (status === '申请中') return 'primary'
    return 'default'
  }

  function answerOf(name: string) {
    return detail.value?.customAnswers?.[name] || ''
  }

  /** 附加配置只读展示文案 */
  function configDisplayValue(cfg: { name: string; control: string }) {
    const raw = answerOf(cfg.name).trim()
    return raw || '—'
  }

  function tickCountdown() {
    const d = detail.value
    if (!d) {
      trialCountdownText.value = ''
      freezeCountdownText.value = ''
      return
    }

    const end = resolveEndTime(d)
    if (d.status === '即将到期' || d.status === '试用中') {
      const ms = end ? getFreezeRemainMs(end) : 0
      if (showTrialCountdown.value) {
        trialCountdownText.value = formatFreezeCountdown(Math.max(ms, 0))
      } else {
        trialCountdownText.value = ''
      }
      freezeCountdownText.value = ''
      return
    }

    if (d.status === '冷冻期') {
      const endTime =
        d.freezeEndTime || (d.freezeEndDate ? `${d.freezeEndDate} 23:59:59` : '')
      let remain = getFreezeRemainMs(endTime)
      if (!endTime && d.freezeDaysLeft && d.freezeDaysLeft > 0) {
        remain = d.freezeDaysLeft * 86400000
      }
      freezeCountdownText.value = formatFreezeCountdown(Math.max(remain, 0))
      trialCountdownText.value = ''
      return
    }

    trialCountdownText.value = ''
    freezeCountdownText.value = ''
  }

  function startCountdown() {
    stopCountdown()
    tickCountdown()
    countdownTimer = setInterval(tickCountdown, 1000)
  }

  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }

  async function load() {
    loading.value = true
    try {
      const res = await fetchTrialPlanDetail(planId())
      detail.value = res.code === 200 ? res.data : null
      startCountdown()
    } finally {
      loading.value = false
    }
  }

  async function handleExtend() {
    if (!detail.value) return
    const check = canExtendPlan(detail.value)
    if (!check.ok) {
      await showDialog({
        title: '提示',
        message: check.tip || FREEZE_EXTEND_TIP,
        confirmButtonText: '我知道了'
      })
      return
    }
    await showConfirmDialog({ title: '确认延期', message: '将直接执行延期，不生成申请工单。' })
    const res = await extendTrial(detail.value.id)
    if (res.code === 200) {
      showSuccessToast('延期成功')
      detail.value = res.data
      startCountdown()
    } else {
      await showDialog({
        title: '提示',
        message: res.message || FREEZE_EXTEND_TIP,
        confirmButtonText: '我知道了'
      })
    }
  }

  function openRemark(mode: 'close' | 'reset') {
    if (mode === 'reset' && detail.value?.resetPending) return
    remarkMode.value = mode
    remark.value = ''
    remarkVisible.value = true
  }

  async function submitRemark() {
    if (!detail.value) return
    if (!remark.value.trim()) {
      showToast('请填写申请说明')
      return
    }
    const res =
      remarkMode.value === 'close'
        ? await applyClose(detail.value.id, remark.value)
        : await applyReset(detail.value.id, remark.value)
    if (res.code === 200) {
      showSuccessToast('提交成功')
      await load()
    } else {
      showToast(res.message || '提交失败')
    }
  }

  onMounted(load)
  onUnmounted(stopCountdown)

  return {
    loading,
    detail,
    activeTab,
    remarkVisible,
    remarkMode,
    remark,
    usageStartText,
    usageEndText,
    showTrialCountdown,
    trialCountdownText,
    showFreezeCountdown,
    freezeCountdownText,
    freezeRuleLines,
    canClose,
    canExtendBtn,
    showReset,
    showActions,
    badgeText,
    tagType,
    answerOf,
    configDisplayValue,
    handleExtend,
    openRemark,
    submitRemark
  }
}
