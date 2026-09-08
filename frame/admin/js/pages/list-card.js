;(function () {
  const COVER_TONES = ['tone-a', 'tone-b', 'tone-c', 'tone-d']
  const TAGS = ['图文', '视频']
  const CARD_TITLES = [
    '每日推荐视频集',
    '抖音短视频候选集',
    '国际新闻集合',
    '财经早报精选',
    '科技前沿速递',
    '生活好物分享',
  ]

  const SERVICE_SEED = [
    {
      title: '视频内容质检规则',
      desc: '针对横版短视频封面、标题与违规词的自动巡检。',
      status: '进行中',
      statusColor: 'arcoblue',
      owner: '陈明',
      duration: '7 天',
    },
    {
      title: '图文合规审核',
      desc: '检查图文内容敏感信息与版权声明完整性。',
      status: '已完成',
      statusColor: 'green',
      owner: '林芳',
      duration: '3 天',
    },
    {
      title: '评论区服务质量',
      desc: '抽样评估客服回复时效与话术规范。',
      status: '待开始',
      statusColor: 'orangered',
      owner: '王磊',
      duration: '14 天',
    },
    {
      title: '直播间互动质检',
      desc: '监测直播话术、挂链与互动节奏是否达标。',
      status: '进行中',
      statusColor: 'arcoblue',
      owner: '赵雪',
      duration: '5 天',
    },
    {
      title: '商品详情页抽检',
      desc: '核对主图、卖点文案与活动价展示一致性。',
      status: '已完成',
      statusColor: 'green',
      owner: '周凯',
      duration: '2 天',
    },
    {
      title: '用户反馈闭环',
      desc: '跟踪差评与投诉工单的处理时效与满意度。',
      status: '进行中',
      statusColor: 'arcoblue',
      owner: '孙婷',
      duration: '10 天',
    },
  ]

  function buildContentItems(count) {
    const mock = ArcoProMock.cardListItems || []
    return Array.from({ length: count }, (_, i) => {
      const base = mock[i % Math.max(mock.length, 1)] || {}
      return {
        id: i + 1,
        title: base.title || CARD_TITLES[i % CARD_TITLES.length],
        desc: base.desc || '这是一段描述文字，用于展示卡片列表的内容摘要。',
        tag: base.tag || TAGS[i % TAGS.length],
        count: base.count != null ? base.count + i * 17 : 1000 + i * 37,
        author: base.author || 'Admin',
        updatedAt: '2026-06-' + String(10 + (i % 18)).padStart(2, '0'),
        tone: COVER_TONES[i % COVER_TONES.length],
      }
    })
  }

  function buildServiceItems(count) {
    return Array.from({ length: count }, (_, i) => {
      const seed = SERVICE_SEED[i % SERVICE_SEED.length]
      return {
        id: 's' + (i + 1),
        ...seed,
        title: seed.title + (i >= SERVICE_SEED.length ? ' #' + (Math.floor(i / SERVICE_SEED.length) + 1) : ''),
        count: (seed.count != null ? seed.count : 20) + i * 3,
      }
    })
  }

  function slicePage(list, current, pageSize) {
    const start = (current - 1) * pageSize
    return list.slice(start, start + pageSize)
  }

  const ListCardPage = {
    name: 'ListCardPage',
    data() {
      return {
        title: ArcoProLocale.menu['menu.list.cardList'],
        activeTab: 'standard',
        items: buildContentItems(36),
        serviceItems: buildServiceItems(18),
        pagination: {
          current: 1,
          pageSize: 12,
        },
      }
    },
    computed: {
      activeSource() {
        if (this.activeTab === 'service') return this.serviceItems
        return this.items
      },
      pagedItems() {
        return slicePage(this.activeSource, this.pagination.current, this.pagination.pageSize)
      },
      paginationTotal() {
        return this.activeSource.length
      },
    },
    watch: {
      activeTab() {
        this.pagination = { ...this.pagination, current: 1 }
      },
    },
    methods: {
      onCardClick(item) {
        ArcoVue.Message.info(item.title)
      },
      onServiceAction(action, item) {
        ArcoVue.Message.success(action + '：' + item.title)
      },
      onPageChange(page) {
        this.pagination = { ...this.pagination, current: page }
      },
      onPageSizeChange(pageSize) {
        this.pagination = { ...this.pagination, current: 1, pageSize }
      },
    },
    template: `
      <div class="list-card-page">
        <a-tabs v-model:active-key="activeTab" type="rounded" class="list-card-tabs">
          <a-tab-pane key="standard" title="标准卡片" />
          <a-tab-pane key="horizontal" title="横版卡片" />
          <a-tab-pane key="cover" title="封面卡片" />
          <a-tab-pane key="service" title="服务卡片" />
        </a-tabs>

        <a-row v-if="activeTab === 'standard'" :gutter="[16, 16]">
          <a-col v-for="item in pagedItems" :key="item.id" :xs="24" :sm="12" :md="8" :lg="6">
            <a-card class="list-card-item" hoverable @click="onCardClick(item)">
              <div class="list-card-cover" :class="item.tone"></div>
              <div class="list-card-title-row">
                <a-typography-paragraph :ellipsis="{ rows: 1 }" class="list-card-title">{{ item.title }}</a-typography-paragraph>
                <a-tag size="small" class="list-card-title-tag">{{ item.tag }}</a-tag>
              </div>
              <a-typography-paragraph type="secondary" :ellipsis="{ rows: 2 }" class="list-card-desc">{{ item.desc }}</a-typography-paragraph>
              <div class="list-card-footer">
                <a-space>
                  <a-avatar :size="24" class="pro-avatar-brand pro-avatar-default" :auto-fix-font-size="false"><icon-avatar /></a-avatar>
                  <a-typography-text class="list-card-meta">{{ item.author }}</a-typography-text>
                </a-space>
                <a-space :size="16" class="list-card-footer-right">
                  <a-typography-text type="secondary" class="list-card-meta">{{ item.count }} 次浏览</a-typography-text>
                  <a-typography-text type="secondary" class="list-card-meta">{{ item.updatedAt }}</a-typography-text>
                </a-space>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-row v-else-if="activeTab === 'horizontal'" :gutter="[16, 16]">
          <a-col v-for="item in pagedItems" :key="'h-' + item.id" :xs="24" :sm="24" :md="12" :lg="12">
            <a-card class="list-card-item list-card-item--horizontal" hoverable @click="onCardClick(item)">
              <div class="list-card-horizontal">
                <div class="list-card-cover list-card-cover--side" :class="item.tone"></div>
                <div class="list-card-horizontal-body">
                  <div class="list-card-title-row">
                    <a-typography-paragraph :ellipsis="{ rows: 1 }" class="list-card-title">{{ item.title }}</a-typography-paragraph>
                    <a-tag size="small" class="list-card-title-tag">{{ item.tag }}</a-tag>
                  </div>
                  <a-typography-paragraph type="secondary" :ellipsis="{ rows: 2 }" class="list-card-desc list-card-desc--compact">{{ item.desc }}</a-typography-paragraph>
                  <div class="list-card-footer list-card-footer--flush">
                    <a-space>
                      <a-avatar :size="24" class="pro-avatar-brand pro-avatar-default" :auto-fix-font-size="false"><icon-avatar /></a-avatar>
                      <a-typography-text class="list-card-meta">{{ item.author }}</a-typography-text>
                    </a-space>
                    <a-space :size="16" class="list-card-footer-right">
                      <a-typography-text type="secondary" class="list-card-meta">{{ item.count }} 次浏览</a-typography-text>
                      <a-typography-text type="secondary" class="list-card-meta">{{ item.updatedAt }}</a-typography-text>
                    </a-space>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-row v-else-if="activeTab === 'cover'" :gutter="[16, 16]">
          <a-col v-for="item in pagedItems" :key="'c-' + item.id" :xs="24" :sm="12" :md="8" :lg="6">
            <a-card class="list-card-item list-card-item--cover" hoverable :bordered="false" @click="onCardClick(item)">
              <template #cover>
                <div class="list-card-cover list-card-cover--tall" :class="item.tone">
                  <span class="list-card-cover-badge">{{ item.tag }}</span>
                </div>
              </template>
              <div class="list-card-title-row">
                <a-typography-paragraph :ellipsis="{ rows: 1 }" class="list-card-title">{{ item.title }}</a-typography-paragraph>
                <a-typography-text type="secondary" class="list-card-meta list-card-title-date">{{ item.updatedAt }}</a-typography-text>
              </div>
              <a-typography-paragraph type="secondary" :ellipsis="{ rows: 2 }" class="list-card-desc">{{ item.desc }}</a-typography-paragraph>
              <div class="list-card-footer">
                <a-space>
                  <a-avatar :size="24" class="pro-avatar-brand pro-avatar-default" :auto-fix-font-size="false"><icon-avatar /></a-avatar>
                  <a-typography-text class="list-card-meta">{{ item.author }}</a-typography-text>
                </a-space>
                <a-typography-text type="secondary" class="list-card-meta">{{ item.count }} 次浏览</a-typography-text>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <a-row v-else-if="activeTab === 'service'" :gutter="[16, 16]">
          <a-col v-for="item in pagedItems" :key="item.id" :xs="24" :sm="12" :md="8" :lg="8">
            <a-card class="list-card-item list-card-item--service" hoverable>
              <div class="list-card-service-head">
                <a-typography-paragraph :ellipsis="{ rows: 1 }" class="list-card-title">{{ item.title }}</a-typography-paragraph>
                <a-tag size="small" :color="item.statusColor">{{ item.status }}</a-tag>
              </div>
              <a-typography-paragraph type="secondary" :ellipsis="{ rows: 2 }" class="list-card-desc">{{ item.desc }}</a-typography-paragraph>
              <div class="list-card-service-meta">
                <div class="list-card-service-row">
                  <span class="list-card-service-label">负责人</span>
                  <span>{{ item.owner }}</span>
                </div>
                <div class="list-card-service-row">
                  <span class="list-card-service-label">周期</span>
                  <span>{{ item.duration }}</span>
                </div>
                <div class="list-card-service-row">
                  <span class="list-card-service-label">已处理</span>
                  <span>{{ item.count }} 条</span>
                </div>
              </div>
              <div class="list-card-service-actions">
                <a-button type="text" size="small" @click="onServiceAction('查看', item)">查看</a-button>
                <a-divider direction="vertical" />
                <a-button type="text" size="small" @click="onServiceAction('编辑', item)">编辑</a-button>
              </div>
            </a-card>
          </a-col>
        </a-row>

        <div class="list-card-pagination">
          <a-pagination
            v-model:current="pagination.current"
            :total="paginationTotal"
            :page-size="pagination.pageSize"
            :page-size-options="[8, 12, 16]"
            show-total
            show-page-size
            @change="onPageChange"
            @page-size-change="onPageSizeChange"
          />
        </div>
      </div>
    `,
  }

  mountProPage({ pageKey: 'list/card', title: '卡片列表', pageComponent: ListCardPage })
})()
