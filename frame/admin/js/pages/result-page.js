;(function () {
  const meta = window.ArcoProPageMeta || {}
  const allowed = ['success', 'waiting', 'warning', 'error']
  const type = allowed.includes(meta.type) ? meta.type : 'success'
  const t = ArcoProLocale.result

  const pageMeta = {
    success: { key: 'result/success', title: '成功页面', iconClass: 'is-success' },
    waiting: { key: 'result/waiting', title: '等待页面', iconClass: 'is-waiting' },
    warning: { key: 'result/warning', title: '警告页面', iconClass: 'is-warning' },
    error: { key: 'result/error', title: '失败页面', iconClass: 'is-error' },
  }[type]

  const ResultPage = {
    name: 'ResultPage',
    data() {
      return { type, t, iconClass: pageMeta.iconClass }
    },
    computed: {
      title() {
        if (this.type === 'waiting') return t.waitingTitle
        if (this.type === 'warning') return t.warningTitle
        if (this.type === 'error') return t.errorTitle
        return t.successTitle
      },
      subtitle() {
        if (this.type === 'waiting') return t.waitingSub
        if (this.type === 'warning') return t.warningSub
        if (this.type === 'error') return t.errorSub
        return t.successSub
      },
    },
    methods: {
      goHome() {
        window.location.href = 'dashboard.html'
      },
      viewList() {
        window.location.href = 'list-search-table.html'
      },
      onRetry() {
        ArcoVue.Message.info(t.retryTip)
      },
      onRefresh() {
        ArcoVue.Message.info(t.refreshTip)
      },
      onAcknowledge() {
        ArcoVue.Message.info(t.acknowledgeTip)
      },
    },
    template: `
      <div class="result-page">
        <a-card class="result-page-card">
          <div class="result-page-body">
            <a-result :title="title" :subtitle="subtitle">
              <template #icon>
                <div class="result-page-icon" :class="iconClass" aria-hidden="true">
                  <svg
                    v-if="type === 'success'"
                    class="result-page-icon-svg"
                    viewBox="0 0 24 24"
                    width="28"
                    height="28"
                    fill="none"
                  >
                    <path
                      d="M5 12.5l5 5L19 7"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <svg
                    v-else-if="type === 'waiting'"
                    class="result-page-icon-svg"
                    viewBox="0 0 24 24"
                    width="28"
                    height="28"
                    fill="none"
                  >
                    <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="2" />
                    <path
                      d="M12 8v4.5l3 2"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <svg
                    v-else-if="type === 'warning'"
                    class="result-page-icon-svg"
                    viewBox="0 0 24 24"
                    width="28"
                    height="28"
                    fill="none"
                  >
                    <path
                      d="M12 4.5L21 20H3L12 4.5z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M12 10v4.5"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                    />
                    <circle cx="12" cy="17.5" r="1.2" fill="currentColor" />
                  </svg>
                  <svg
                    v-else
                    class="result-page-icon-svg"
                    viewBox="0 0 24 24"
                    width="28"
                    height="28"
                    fill="none"
                  >
                    <path
                      d="M7 7l10 10M17 7L7 17"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </div>
              </template>
              <template #extra>
                <a-space :size="12">
                  <a-button type="primary" @click="goHome">{{ t.back }}</a-button>
                  <a-button v-if="type === 'success'" @click="viewList">{{ t.viewList }}</a-button>
                  <a-button v-else-if="type === 'waiting'" @click="onRefresh">{{ t.refresh }}</a-button>
                  <a-button v-else-if="type === 'warning'" @click="onAcknowledge">{{ t.acknowledge }}</a-button>
                  <a-button v-else @click="onRetry">{{ t.retry }}</a-button>
                </a-space>
              </template>
            </a-result>
          </div>
        </a-card>
      </div>
    `,
  }

  mountProPage({
    pageKey: pageMeta.key,
    title: pageMeta.title,
    pageComponent: ResultPage,
  })
})()
