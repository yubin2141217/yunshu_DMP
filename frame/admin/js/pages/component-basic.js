;(function () {
  const BasicComponentPage = {
    name: 'BasicComponentPage',
    data() {
      return {
        loading: false,
        progress: 0.48,
        activeTab: 'detail',
        activeTabBasic: '1',
        pagination: { current: 1, pageSize: 10, total: 86 },
        paginationSimple: { current: 1, pageSize: 10, total: 86 },
        dropdownMenuStyle: { width: 'auto' },
      }
    },
    methods: {
      syncDropdownWidth(visible) {
        if (!visible) return
        this.$nextTick(() => {
          const btn = this.$el && this.$el.querySelector('.component-basic-dropdown-trigger')
          if (!btn) return
          this.dropdownMenuStyle = { width: btn.offsetWidth + 'px' }
        })
      },
      toggleLoading() {
        this.loading = true
        setTimeout(() => {
          this.loading = false
          if (window.ArcoVue && ArcoVue.Message) {
            ArcoVue.Message.success('加载完成')
          }
        }, 1200)
      },
      showMessage(type) {
        const Msg = window.ArcoVue && ArcoVue.Message
        if (!Msg) return
        if (type === 'info') Msg.info('这是一条普通提示')
        if (type === 'success') Msg.success('操作成功')
        if (type === 'warning') Msg.warning('请注意相关风险')
        if (type === 'error') Msg.error('操作失败，请重试')
      },
      showNotification() {
        const N = window.ArcoVue && ArcoVue.Notification
        if (!N) return
        N.info({
          title: '系统通知',
          content: '有 3 条待办事项需要处理',
        })
      },
      showFeedbackModal(type) {
        const Modal = window.ArcoVue && ArcoVue.Modal
        if (!Modal) return
        const base = {
          simple: true,
          titleAlign: 'start',
          modalClass: 'pro-confirm-modal',
          width: 360,
        }
        if (type === 'info') {
          Modal.info({
            ...base,
            title: '信息提示',
            content: '该操作将同步最新配置，请确认后继续。',
          })
          return
        }
        if (type === 'success') {
          Modal.success({
            ...base,
            title: '操作成功',
            content: '数据已保存，可在列表中查看最新结果。',
          })
          return
        }
        if (type === 'warning') {
          Modal.warning({
            ...base,
            title: '风险提示',
            content: '当前环境为演示数据，部分操作不会真正生效。',
          })
          return
        }
        if (type === 'error') {
          Modal.error({
            ...base,
            title: '操作失败',
            content: '提交失败，请检查网络或稍后重试。',
          })
          return
        }
        if (type === 'confirm') {
          Modal.confirm({
            ...base,
            title: '确认删除',
            content: '删除后不可恢复，是否继续？',
            okText: '删除',
            cancelText: '取消',
            okButtonProps: { status: 'danger' },
            onOk: () => {
              const Msg = window.ArcoVue && ArcoVue.Message
              if (Msg) Msg.success('已删除')
            },
          })
        }
      },
    },
    template: `
      <div class="component-showcase-page">
        <a-alert
          class="component-showcase-tip"
          type="info"
          show-icon
          :closable="false"
        >
          展示按钮、标签、反馈、导航等基础组件常见用法，可按场景组合复用，并保持同一套尺寸与色板。
        </a-alert>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">按钮</div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">类型</div>
              <div class="component-showcase-demo">
                <a-button type="primary">主要按钮</a-button>
                <a-button>次要按钮</a-button>
                <a-button type="outline">描边按钮</a-button>
                <a-button type="dashed" class="component-basic-btn-dashed">虚线按钮</a-button>
                <a-dropdown
                  content-class="component-basic-dropdown-menu"
                  :content-style="dropdownMenuStyle"
                  @popup-visible-change="syncDropdownWidth"
                >
                  <a-button class="component-basic-dropdown-trigger">
                    下拉按钮
                    <icon-down />
                  </a-button>
                  <template #content>
                    <a-doption>选项一</a-doption>
                    <a-doption>选项二</a-doption>
                    <a-doption>选项三</a-doption>
                  </template>
                </a-dropdown>
                <a-button type="text">文字按钮</a-button>
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">状态</div>
              <div class="component-showcase-demo">
                <a-button type="primary" status="success">成功</a-button>
                <a-button type="primary" status="warning">警告</a-button>
                <a-button type="primary" status="danger">危险</a-button>
                <a-button type="outline" status="success">成功</a-button>
                <a-button type="outline" status="warning">警告</a-button>
                <a-button type="outline" status="danger">危险</a-button>
                <a-button type="primary" disabled>禁用</a-button>
                <a-button type="primary" :loading="loading" @click="toggleLoading">
                  {{ loading ? '加载中' : '触发加载' }}
                </a-button>
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">尺寸与图标</div>
              <div class="component-showcase-demo">
                <a-button type="primary" size="mini">迷你</a-button>
                <a-button type="primary" size="small">小型</a-button>
                <a-button type="primary">默认</a-button>
                <a-button type="primary" size="large">大型</a-button>
                <a-button type="primary">
                  <template #icon><icon-plus /></template>
                  新建
                </a-button>
                <a-button type="primary" shape="circle">
                  <template #icon><icon-search /></template>
                </a-button>
                <a-button shape="circle">
                  <template #icon><icon-plus /></template>
                </a-button>
                <a-button type="outline" shape="circle">
                  <template #icon><icon-settings /></template>
                </a-button>
                <a-button type="primary" class="component-basic-btn-icon-square">
                  <template #icon><icon-download /></template>
                </a-button>
                <a-button class="component-basic-btn-icon-square">
                  <template #icon><icon-refresh /></template>
                </a-button>
                <a-button type="outline" class="component-basic-btn-icon-square">
                  <template #icon><icon-notification /></template>
                </a-button>
              </div>
            </div>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">标签与徽标</div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">标签</div>
              <div class="component-showcase-demo">
                <a-tag>默认</a-tag>
                <a-tag color="orangered">紧急</a-tag>
                <a-tag color="green">已完成</a-tag>
                <a-tag color="arcoblue">进行中</a-tag>
                <a-tag closable>可关闭</a-tag>
                <a-tag size="small" color="gray">小型</a-tag>
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">边框标签</div>
              <div class="component-showcase-demo">
                <a-tag color="red" bordered>已拒绝</a-tag>
                <a-tag color="green" bordered>已通过</a-tag>
                <a-tag color="gray" bordered>已取消</a-tag>
                <a-tag color="orangered" bordered>待审核</a-tag>
                <a-tag color="arcoblue" bordered>处理中</a-tag>
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">状态</div>
              <div class="component-showcase-demo">
                <a-badge status="success" text="成功" />
                <a-badge status="processing" text="进行中" />
                <a-badge status="warning" text="警告" />
                <a-badge status="danger" text="错误" />
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">徽标</div>
              <div class="component-showcase-demo">
                <a-badge :count="8">
                  <a-button class="component-basic-btn-icon-square">
                    <template #icon><icon-notification /></template>
                  </a-button>
                </a-badge>
                <a-badge :count="99" :max-count="99">
                  <a-button class="component-basic-btn-icon-square">
                    <template #icon><icon-message /></template>
                  </a-button>
                </a-badge>
                <a-badge :count="1000" :max-count="999">
                  <a-button>消息</a-button>
                </a-badge>
                <a-badge dot :count="1">
                  <a-button class="component-basic-btn-icon-square">
                    <template #icon><icon-notification /></template>
                  </a-button>
                </a-badge>
              </div>
            </div>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">头像</div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">圆形</div>
              <div class="component-basic-avatar-row">
                <a-avatar :size="64"><icon-avatar /></a-avatar>
                <a-avatar :size="40"><icon-avatar /></a-avatar>
                <a-avatar :size="32"><icon-avatar /></a-avatar>
                <a-avatar :size="24"><icon-avatar /></a-avatar>
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">方形</div>
              <div class="component-basic-avatar-row">
                <a-avatar :size="64" shape="square"><icon-avatar /></a-avatar>
                <a-avatar :size="40" shape="square"><icon-avatar /></a-avatar>
                <a-avatar :size="32" shape="square"><icon-avatar /></a-avatar>
                <a-avatar :size="24" shape="square"><icon-avatar /></a-avatar>
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">类型</div>
              <div class="component-basic-avatar-row">
                <a-avatar :size="40" class="pro-avatar-brand"><icon-avatar /></a-avatar>
                <a-avatar :size="40" shape="square" class="pro-avatar-brand"><icon-avatar /></a-avatar>
                <a-avatar :size="40" class="pro-avatar-brand">李</a-avatar>
                <a-avatar :size="40" shape="square" class="pro-avatar-brand">王</a-avatar>
                <a-avatar
                  :size="40"
                  class="pro-avatar-brand pro-avatar-trigger"
                  trigger-type="button"
                >
                  <icon-avatar />
                  <template #trigger-icon><icon-camera /></template>
                </a-avatar>
                <a-avatar
                  :size="40"
                  shape="square"
                  class="pro-avatar-brand pro-avatar-trigger"
                  trigger-type="button"
                >
                  <icon-avatar />
                  <template #trigger-icon><icon-camera /></template>
                </a-avatar>
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">头像组</div>
              <div class="component-basic-avatar-row">
                <a-avatar-group
                  class="component-basic-avatar-stack"
                  :size="36"
                  :max-count="3"
                  :max-style="{ backgroundColor: 'var(--color-fill-3)', color: 'var(--color-text-2)' }"
                  :max-popover-trigger-props="{ contentClass: 'component-basic-avatar-group-popover' }"
                >
                  <a-avatar :style="{ backgroundColor: 'rgb(var(--primary-6))' }">张</a-avatar>
                  <a-avatar :style="{ backgroundColor: 'rgb(var(--cyan-6))' }">李</a-avatar>
                  <a-avatar :style="{ backgroundColor: 'rgb(var(--warning-6))' }">王</a-avatar>
                  <a-avatar :style="{ backgroundColor: 'rgb(var(--danger-6))' }">赵</a-avatar>
                  <a-avatar :style="{ backgroundColor: 'rgb(var(--purple-6))' }">陈</a-avatar>
                </a-avatar-group>
                <a-avatar-group
                  class="component-basic-avatar-stack"
                  shape="square"
                  :size="36"
                  :max-count="3"
                  :max-style="{ backgroundColor: 'var(--color-fill-3)', color: 'var(--color-text-2)' }"
                  :max-popover-trigger-props="{ contentClass: 'component-basic-avatar-group-popover' }"
                >
                  <a-avatar shape="square" :style="{ backgroundColor: 'rgb(var(--primary-6))' }">张</a-avatar>
                  <a-avatar shape="square" :style="{ backgroundColor: 'rgb(var(--cyan-6))' }">李</a-avatar>
                  <a-avatar shape="square" :style="{ backgroundColor: 'rgb(var(--warning-6))' }">王</a-avatar>
                  <a-avatar shape="square" :style="{ backgroundColor: 'rgb(var(--danger-6))' }">赵</a-avatar>
                  <a-avatar shape="square" :style="{ backgroundColor: 'rgb(var(--purple-6))' }">陈</a-avatar>
                </a-avatar-group>
              </div>
            </div>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">进度条</div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">线形</div>
              <div class="component-showcase-demo--stack component-basic-progress-line">
                <a-progress :percent="progress" :stroke-width="6" />
                <a-progress :percent="0.72" status="success" :stroke-width="6" />
                <a-progress :percent="0.36" status="warning" :stroke-width="6" />
                <a-progress :percent="0.18" status="danger" :stroke-width="6" />
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">环形</div>
              <div class="component-showcase-demo component-basic-progress-circle">
                <a-progress type="circle" :percent="progress" :width="64" :stroke-width="6" :path-stroke-width="6" />
                <a-progress type="circle" :percent="0.72" status="success" :width="64" :stroke-width="6" :path-stroke-width="6" />
                <a-progress type="circle" :percent="0.36" status="warning" :width="64" :stroke-width="6" :path-stroke-width="6" />
                <a-progress type="circle" :percent="0.18" status="danger" :width="64" :stroke-width="6" :path-stroke-width="6" />
              </div>
            </div>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">反馈</div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">轻提示</div>
              <div class="component-showcase-demo">
                <a-button type="outline" @click="showMessage('info')">消息提示</a-button>
                <a-button type="outline" status="success" @click="showMessage('success')">成功提示</a-button>
                <a-button type="outline" status="warning" @click="showMessage('warning')">警告提示</a-button>
                <a-button type="outline" status="danger" @click="showMessage('error')">错误提示</a-button>
                <a-button type="primary" @click="showNotification">通知提醒</a-button>
                <a-tooltip content="这是一段文字提示说明">
                  <a-button>文字提示</a-button>
                </a-tooltip>
                <a-popover title="气泡卡片">
                  <a-button>气泡卡片</a-button>
                  <template #content>
                    <p style="margin:0">可用于展示额外说明或快捷操作。</p>
                  </template>
                </a-popover>
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">操作反馈弹窗</div>
              <div class="component-showcase-demo">
                <a-button type="outline" @click="showFeedbackModal('info')">信息弹窗</a-button>
                <a-button type="outline" status="success" @click="showFeedbackModal('success')">成功弹窗</a-button>
                <a-button type="outline" status="warning" @click="showFeedbackModal('warning')">警告弹窗</a-button>
                <a-button type="outline" status="danger" @click="showFeedbackModal('error')">错误弹窗</a-button>
                <a-button type="primary" status="danger" @click="showFeedbackModal('confirm')">确认弹窗</a-button>
              </div>
            </div>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">导航</div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">面包屑</div>
              <div class="component-showcase-demo component-basic-breadcrumb">
                <icon-home class="pro-breadcrumb-icon" :size="12" />
                <a-breadcrumb>
                  <a-breadcrumb-item>首页</a-breadcrumb-item>
                  <a-breadcrumb-item>常用组件</a-breadcrumb-item>
                  <a-breadcrumb-item>基础组件</a-breadcrumb-item>
                </a-breadcrumb>
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">标签页</div>
              <a-tabs v-model:active-key="activeTab" type="rounded" class="component-basic-tabs">
                <a-tab-pane key="detail" title="详细信息">展示内容概览、业务信息与媒体参数等详细信息。</a-tab-pane>
                <a-tab-pane key="params" title="参数配置">展示视频与音频相关参数配置项。</a-tab-pane>
                <a-tab-pane key="logs" title="操作日志">展示该内容的操作记录与时间线。</a-tab-pane>
                <a-tab-pane key="related" title="关联内容">展示与当前内容关联的其他条目。</a-tab-pane>
              </a-tabs>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">标签页（基础）</div>
              <a-tabs
                v-model:active-key="activeTabBasic"
                type="rounded"
                class="component-basic-tabs-plain"
                :header-padding="false"
              >
                <a-tab-pane key="1" title="概览">展示基础信息与状态汇总。</a-tab-pane>
                <a-tab-pane key="2" title="明细">展示明细列表与筛选条件。</a-tab-pane>
                <a-tab-pane key="3" title="设置">配置展示规则与默认值。</a-tab-pane>
              </a-tabs>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">精简分页</div>
              <a-pagination
                v-model:current="paginationSimple.current"
                :total="paginationSimple.total"
                :page-size="paginationSimple.pageSize"
              />
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">完整分页</div>
              <a-pagination
                v-model:current="pagination.current"
                :total="pagination.total"
                :page-size="pagination.pageSize"
                show-total
                show-page-size
              />
            </div>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">警告提示</div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">基础</div>
              <div class="component-showcase-demo--stack">
                <a-alert type="info" show-icon>
                  信息提示：内容已自动保存为草稿，可随时继续编辑。
                </a-alert>
                <a-alert type="success" show-icon>
                  成功提示：数据同步完成，共更新 128 条记录。
                </a-alert>
                <a-alert type="warning" show-icon>
                  警告提示：当前为演示环境，提交操作不会写入真实数据。如需正式发布，请切换至生产环境后再操作。
                </a-alert>
                <a-alert type="error" show-icon closable>
                  错误提示：部分字段校验未通过，请检查标红项后重新提交。
                </a-alert>
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">带标题</div>
              <div class="component-showcase-demo--stack">
                <a-alert type="info" show-icon title="信息提示">
                  内容已自动保存为草稿，可随时继续编辑。
                </a-alert>
                <a-alert type="success" show-icon title="成功提示">
                  数据同步完成，共更新 128 条记录。
                </a-alert>
                <a-alert type="warning" show-icon title="警告提示">
                  当前为演示环境，提交操作不会写入真实数据。
                </a-alert>
                <a-alert type="error" show-icon closable title="错误提示">
                  部分字段校验未通过，请检查标红项后重新提交。
                </a-alert>
              </div>
            </div>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">加载与空状态</div>
            <div class="component-basic-status-demo">
              <a-spin tip="数据加载中..." />
            </div>
            <a-divider orientation="center">分割线</a-divider>
            <div class="component-basic-status-demo">
              <a-empty description="暂无相关数据" />
            </div>
          </a-card>
        </div>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'component/basic',
    title: ArcoProLocale.menu['menu.component.basic'] || '基础组件',
    pageComponent: BasicComponentPage,
  })
})()
