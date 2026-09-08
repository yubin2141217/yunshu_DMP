;(function () {
  const code = String(window.ArcoProPageMeta?.code || '404')
  const allowed = ['403', '404', '500']
  const safeCode = allowed.includes(code) ? code : '404'
  const t = ArcoProLocale.exception

  const ExceptionPage = {
    name: 'ExceptionPage',
    data() {
      return {
        code: safeCode,
        t,
        imageSrc: './images/' + safeCode + '.svg?v=1.0.3',
      }
    },
    computed: {
      title() {
        return this.t[this.code + 'title']
      },
      subTitle() {
        return this.t[this.code + 'sub']
      },
      pageClass() {
        return 'exception-page--' + this.code
      },
    },
    methods: {
      goHome() {
        window.location.href = 'dashboard.html'
      },
      goBack() {
        if (window.history.length > 1) {
          window.history.back()
          return
        }
        this.goHome()
      },
    },
    template: `
      <div class="result-page-wrap exception-page" :class="pageClass">
        <a-result :title="title" :subtitle="subTitle">
          <template #icon>
            <div class="exception-page-illust" aria-hidden="true">
              <img class="exception-page-illust-img" :src="imageSrc" alt="" />
            </div>
          </template>
          <template #extra>
            <a-space :size="12">
              <a-button type="primary" @click="goHome">{{ t.back }}</a-button>
              <a-button type="outline" @click="goBack">{{ t.prev }}</a-button>
            </a-space>
          </template>
        </a-result>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'exception/' + safeCode,
    title: safeCode,
    pageComponent: ExceptionPage,
  })
})()
