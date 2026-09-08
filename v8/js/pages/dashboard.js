;(function () {
  const mock = window.YunshuMock
  const summary = mock.overview()

  const DashboardPage = {
    name: 'DashboardPage',
    data() {
      return {
        refreshing: false,
        kpis: [
          {
            key: 'suppliers',
            title: '已配置供数方数量',
            value: String(summary.supplierCount),
            deltaLabel: '含停用供数方',
            icon: 'icon-user-group-solid',
            accent: '#1890FF',
          },
          {
            key: 'total',
            title: '入库总条数',
            value: Number(summary.inboundTotal).toLocaleString('zh-CN'),
            deltaLabel: '与供数统计「全部」同一口径',
            icon: 'icon-activity-solid',
            accent: '#52C41A',
          },
          {
            key: 'latest',
            title: '最近一次入库时间',
            value: summary.lastInboundAt || '暂无入库',
            deltaLabel: '按到达中台时间',
            icon: 'icon-file',
            accent: '#FA8C16',
          },
        ],
      }
    },
    methods: {
      kpiAccent(index) {
        try {
          const api = window.ArcoProChartPalette
          if (api && api.getCurrentId && api.getScheme) {
            const scheme = api.getScheme(api.getCurrentId())
            if (scheme && scheme.mode === 'theme') return 'var(--chart-1)'
          }
        } catch (_) {
          /* ignore */
        }
        return 'var(--chart-' + ((index % 10) + 1) + ')'
      },
      onRefresh() {
        if (this.refreshing) return
        this.refreshing = true
        setTimeout(() => {
          this.refreshing = false
          ArcoVue.Message.success('数据已刷新')
        }, 400)
      },
      goStats() {
        window.location.href = 'stats-list.html'
      },
      goSpec() {
        window.location.href = 'access-spec.html'
      },
    },
    template: `
      <div class="workplace-page">
        <div class="workplace-header">
          <div class="workplace-header-text">
            <h2 class="workplace-title">数据概览</h2>
            <p class="workplace-desc">查看本机构已配置供数方、入库总量与最近入库时间。不展示正文，不按区域切片。</p>
          </div>
          <div class="v8-summary-stats">
            <span>供数方<strong>{{ kpis[0].value }}</strong></span>
            <span>入库总量<strong>{{ kpis[1].value }}</strong></span>
            <span>最近入库<strong>{{ kpis[2].value }}</strong></span>
          </div>
        </div>

        <a-row :gutter="[16, 16]" class="workplace-kpi-row">
          <a-col v-for="item in kpis" :key="item.key" :xs="24" :sm="12" :lg="8">
            <a-card
              class="workplace-card general-card workplace-kpi-card v8-kpi-card"
              :bordered="true"
              :style="{ '--kpi-accent': item.accent }"
            >
              <div class="workplace-kpi-body">
                <span class="workplace-kpi-icon-wrap" aria-hidden="true">
                  <span class="workplace-kpi-icon-box">
                    <component :is="item.icon" class="workplace-kpi-icon" />
                  </span>
                </span>
                <div class="workplace-kpi-main">
                  <span class="workplace-kpi-title">{{ item.title }}</span>
                  <div class="workplace-kpi-value">{{ item.value }}</div>
                  <div class="workplace-kpi-delta">
                    <span class="workplace-kpi-delta-label">{{ item.deltaLabel }}</span>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-card class="v8-quick-card general-card" :bordered="true">
          <div class="v8-section-title">快捷进入</div>
          <a-space>
            <a-button type="primary" @click="goStats">供数统计</a-button>
            <a-button @click="goSpec">接入规范</a-button>
          </a-space>
        </a-card>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'overview',
    title: '数据概览',
    pageComponent: DashboardPage,
  })
})()
