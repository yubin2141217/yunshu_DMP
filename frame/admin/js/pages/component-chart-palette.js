;(function () {
  const soft = (hex, alpha) =>
    window.ArcoProChartPalette ? ArcoProChartPalette.soft(hex, alpha) : hex

  const ChartPalettePage = {
    name: 'ChartPalettePage',
    data() {
      return {
        activeId: 'theme',
        schemes: [],
      }
    },
    created() {
      this.syncFromStore()
    },
    mounted() {
      this._onPalette = () => this.syncFromStore()
      window.addEventListener('arco-pro-chart-palette-change', this._onPalette)
      window.addEventListener('arco-pro-theme-change', this._onPalette)
    },
    beforeUnmount() {
      window.removeEventListener('arco-pro-chart-palette-change', this._onPalette)
      window.removeEventListener('arco-pro-theme-change', this._onPalette)
    },
    methods: {
      syncFromStore() {
        const api = window.ArcoProChartPalette
        if (!api) return
        this.activeId = api.getCurrentId()
        this.schemes = api.schemes.map((s) => api.schemeForDisplay(s))
      },
      softBg(hex, alpha) {
        return soft(hex, alpha)
      },
      swatchClass(cols) {
        if (cols === 10) return 'chart-palette-swatches cols-10'
        if (cols === 8) return 'chart-palette-swatches cols-8'
        if (cols === 6) return 'chart-palette-swatches cols-6'
        return 'chart-palette-swatches'
      },
      metaLabel(c) {
        return c.name ? c.id + ' ' + c.name : c.id
      },
      selectScheme(id) {
        if (!window.ArcoProChartPalette) return
        ArcoProChartPalette.set(id)
        this.syncFromStore()
        if (window.ArcoVue && ArcoVue.Message) {
          const scheme = ArcoProChartPalette.getScheme(id)
          ArcoVue.Message.success('已切换：' + (scheme.title || id))
        }
      },
    },
    template: `
      <div class="chart-palette-page component-showcase-page">
        <a-alert
          class="component-showcase-tip"
          type="info"
          show-icon
          :closable="false"
        >
          默认使用「主题单色」（跟随顶栏主题色）。点击下方方案可切换，并同步到图表组件与指标卡片中的图表色；选择会跨页保持。
        </a-alert>

        <a-card
          v-for="scheme in schemes"
          :key="scheme.id"
          class="pro-page-card chart-palette-scheme"
          :class="{ 'is-active': activeId === scheme.id }"
          :bordered="true"
          hoverable
          @click="selectScheme(scheme.id)"
        >
          <div class="chart-palette-scheme-head">
            <h2 class="chart-palette-scheme-title">{{ scheme.title }}</h2>
            <div class="chart-palette-scheme-actions">
              <a-tag v-if="scheme.badge" color="arcoblue" size="small">{{ scheme.badge }}</a-tag>
              <a-button
                size="mini"
                type="primary"
                @click.stop="selectScheme(scheme.id)"
              >
                <template v-if="activeId === scheme.id" #icon>
                  <icon-check-circle />
                </template>
                {{ activeId === scheme.id ? '当前方案' : '应用' }}
              </a-button>
            </div>
          </div>
          <p class="chart-palette-why">{{ scheme.why }}</p>

          <div :class="swatchClass(scheme.cols)">
            <div v-for="c in scheme.colors" :key="scheme.id + '-sw-' + c.id">
              <div class="chart-palette-chip" :style="{ background: c.hex }"></div>
              <div
                v-if="!scheme.noSoft"
                class="chart-palette-soft"
                :style="{ background: softBg(c.hex, scheme.softAlpha || 0.14) }"
              ></div>
              <div class="chart-palette-meta">
                <b>{{ metaLabel(c) }}</b>{{ c.hex }}
              </div>
            </div>
          </div>
        </a-card>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'chart/palette',
    title: ArcoProLocale.menu['menu.chart.palette'] || '图表配色',
    pageComponent: ChartPalettePage,
  })
})()
