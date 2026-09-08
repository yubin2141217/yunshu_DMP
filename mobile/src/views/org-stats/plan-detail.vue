<!-- 产品方案详情：方案使用 / 方案信息 -->
<template>
  <div class="page plan-detail-page">
    <van-nav-bar title="详情" left-arrow @click-left="router.back()" />
    <van-loading v-if="loading" vertical style="padding: 40px">加载中...</van-loading>
    <template v-else-if="detail">
      <div class="detail-head">
        <div class="detail-head__org">
          <div class="detail-head__logo">{{ detail.orgName.slice(0, 1) }}</div>
          <div class="detail-head__org-name">{{ detail.orgName }}</div>
        </div>
        <div class="detail-head__meta">
          <div class="meta-row">
            <span class="meta-row__label">产品名称</span>
            <span class="meta-row__value">{{ detail.productName }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-row__label">方案名称</span>
            <span class="meta-row__value">{{ detail.planName }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-row__label">所属销售</span>
            <span class="meta-row__value">{{ detail.sales || '—' }}</span>
          </div>
        </div>
      </div>

      <van-tabs v-model:active="activeTab" sticky shrink color="#1989fa" title-active-color="#1989fa">
        <van-tab title="方案使用" name="usage">
          <div class="tab-panel">
            <div class="info-card">
              <div class="info-card__title">方案使用信息</div>
              <div class="info-row">
                <span class="info-row__label">开始日期</span>
                <span class="info-row__value">{{ usageStartText }}</span>
              </div>
              <div class="info-row">
                <span class="info-row__label">结束日期</span>
                <span class="info-row__value">{{ usageEndText }}</span>
              </div>
              <div class="info-row">
                <span class="info-row__label">方案状态</span>
                <span class="info-row__value">
                  <van-tag :type="tagType(detail.status)" round>
                    {{ badgeText(detail) }}
                  </van-tag>
                </span>
              </div>
              <div v-if="showTrialCountdown" class="info-row">
                <span class="info-row__label">试用倒计时</span>
                <span class="info-row__value is-countdown is-trial">{{ trialCountdownText }}</span>
              </div>
              <div v-if="showFreezeCountdown" class="info-row">
                <span class="info-row__label">冷冻期倒计时</span>
                <span class="info-row__value is-countdown is-freeze">{{ freezeCountdownText }}</span>
              </div>
              <div class="info-row">
                <span class="info-row__label">已延期次数</span>
                <span class="info-row__value">{{ detail.extendedCount }}次</span>
              </div>
              <div class="info-row">
                <span class="info-row__label">剩余延期次数</span>
                <span class="info-row__value">{{ detail.remainExtendCount }}次</span>
              </div>
            </div>
          </div>
        </van-tab>

        <van-tab title="方案信息" name="info">
          <div class="tab-panel">
            <div class="info-card">
              <div class="info-card__title">方案信息</div>
              <div class="info-row">
                <span class="info-row__label">产品名称</span>
                <span class="info-row__value">{{ detail.productName }}</span>
              </div>
              <div class="info-row">
                <span class="info-row__label">方案名称</span>
                <span class="info-row__value">{{ detail.planName }}</span>
              </div>
              <div class="info-row">
                <span class="info-row__label">试用时间</span>
                <span class="info-row__value">{{ detail.trialTimeLabel || '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-row__label">总延期次数</span>
                <span class="info-row__value">{{ detail.totalExtend }}次</span>
              </div>

              <div class="info-divider" />
              <div class="info-block-title">冷冻期规则</div>
              <div v-if="freezeRuleLines.length" class="freeze-rules">
                <div v-for="(line, idx) in freezeRuleLines" :key="idx" class="freeze-rules__item">
                  {{ line }}
                </div>
              </div>
              <div v-else class="info-empty">—</div>

              <div class="info-divider" />
              <div class="info-block-title">方案介绍</div>
              <div class="plan-intro">{{ detail.planIntro || '—' }}</div>

              <template v-if="detail.customConfigs?.length">
                <div class="info-divider" />
                <div class="info-block-title">附加配置</div>
                <div
                  v-for="(cfg, idx) in detail.customConfigs"
                  :key="idx"
                  class="info-row extra-cfg-row"
                >
                  <span class="info-row__label">{{ cfg.name }}</span>
                  <span class="info-row__value">{{ configDisplayValue(cfg) }}</span>
                </div>
              </template>
            </div>
          </div>
        </van-tab>
      </van-tabs>

      <div v-if="showActions" class="page-bottom-space" />
      <div v-if="showActions" class="bottom-bar">
        <van-button
          v-if="canClose"
          plain
          block
          class="btn-close"
          @click="openRemark('close')"
        >
          申请关停
        </van-button>
        <van-button
          v-if="canExtendBtn"
          type="primary"
          block
          @click="handleExtend"
        >
          申请延期
        </van-button>
        <van-button
          v-if="showReset"
          type="warning"
          plain
          block
          :disabled="Boolean(detail.resetPending)"
          @click="openRemark('reset')"
        >
          {{ detail.resetPending ? '重置工单待审核' : '申请重置' }}
        </van-button>
      </div>
    </template>
    <van-empty v-else description="暂无数据" />

    <van-dialog
      v-model:show="remarkVisible"
      :title="remarkMode === 'close' ? '申请关停' : '申请重置'"
      show-cancel-button
      @confirm="submitRemark"
    >
      <van-field
        v-model="remark"
        rows="3"
        autosize
        type="textarea"
        maxlength="200"
        show-word-limit
        placeholder="请填写申请说明"
      />
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
  import { usePlanDetail } from './use-plan-detail'

  defineOptions({ name: 'OrgStatsPlanDetailPage' })

  const route = useRoute()
  const router = useRouter()
  const {
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
    configDisplayValue,
    handleExtend,
    openRemark,
    submitRemark
  } = usePlanDetail(() => Number(route.params.id))
</script>

<style scoped lang="scss">
  .plan-detail-page {
    background: #f5f6f8;
    min-height: 100vh;
  }

  .detail-head {
    background: #fff;
    padding: 14px 16px 8px;
  }

  .detail-head__org {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .detail-head__logo {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: linear-gradient(135deg, #4e8cff, #1989fa);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .detail-head__org-name {
    font-size: 16px;
    font-weight: 650;
    color: #323233;
    line-height: 1.4;
  }

  .detail-head__meta {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-bottom: 8px;
  }

  .meta-row {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  .meta-row__label {
    flex-shrink: 0;
    font-size: 13px;
    color: #969799;
  }

  .meta-row__value {
    font-size: 14px;
    color: #323233;
    line-height: 1.4;
    text-align: right;
    word-break: break-all;
  }

  .tab-panel {
    padding: 12px;
  }

  .info-card {
    background: #fff;
    border-radius: 10px;
    padding: 14px 14px 8px;
  }

  .info-card__title {
    position: relative;
    padding-left: 10px;
    margin-bottom: 12px;
    font-size: 15px;
    font-weight: 650;
    color: #323233;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 3px;
      width: 3px;
      height: 14px;
      border-radius: 2px;
      background: #1989fa;
    }
  }

  .info-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
  }

  .info-row__label {
    flex-shrink: 0;
    font-size: 14px;
    color: #969799;
  }

  .info-row__value {
    font-size: 14px;
    color: #323233;
    text-align: right;
    word-break: break-all;

    &.is-countdown {
      font-variant-numeric: tabular-nums;
      font-weight: 600;
    }

    &.is-trial {
      color: #ff976a;
    }

    &.is-freeze {
      color: #ee0a24;
    }
  }

  .info-divider {
    border-top: 1px dashed #ebedf0;
    margin: 8px 0 12px;
  }

  .info-block-title {
    font-size: 14px;
    font-weight: 600;
    color: #323233;
    margin-bottom: 8px;
  }

  .info-empty,
  .plan-intro {
    font-size: 13px;
    line-height: 1.6;
    color: #646566;
    margin-bottom: 8px;
  }

  .freeze-rules {
    margin-bottom: 8px;
  }

  .freeze-rules__item {
    font-size: 13px;
    line-height: 1.6;
    color: #646566;
  }

  .extra-cfg-row {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;

    .info-row__label {
      max-width: none;
    }

    .info-row__value {
      color: #323233;
      font-weight: 500;
      text-align: left;
      padding: 8px 10px;
      background: #f7f8fa;
      border-radius: 6px;
      line-height: 1.5;
    }
  }

  .btn-close {
    color: #323233;
    border-color: #dcdee0;
  }

  :deep(.van-tabs__wrap) {
    background: #fff;
  }
</style>
