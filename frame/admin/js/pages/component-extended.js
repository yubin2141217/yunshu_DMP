;(function () {
  const ExtendedComponentPage = {
    name: 'ExtendedComponentPage',
    data() {
      return {
        collapseKeys: ['1'],
        accordionKeys: ['1'],
        stepDemos: [1, 2, 3, 4],
        dotStepTitles: ['提交申请', '部门审批', '行政审批', '申请成功'],
        timelineBasic: [
          { label: '2024-01-08', content: '项目立项，完成需求评审与排期' },
          { label: '2024-03-15', content: '完成核心模块开发，进入联调阶段' },
          { label: '2024-05-20', content: '通过内测验收，开放灰度发布' },
          { label: '2024-07-01', content: '正式上线，开放全量用户访问' },
          { label: '2024-09-12', content: '完成首轮迭代，上线数据看板能力' },
        ],
        timelineIcon: [
          {
            date: '2015-09-09',
            title: '发布 1.0 版本',
            desc: '完成核心功能上线，开放首批内测',
            danger: false,
          },
          {
            date: '2015-09-20',
            title: '发布 2.0 版本',
            desc: '支持批量导入与权限分组管理',
            danger: false,
          },
          {
            date: '2016-09-10',
            title: '严重故障',
            desc: '服务异常中断约 2 小时，已完成恢复',
            danger: true,
          },
          {
            date: '2016-09-19',
            title: '发布 3.0 版本',
            desc: '重构消息中心，提升推送稳定性',
            danger: false,
          },
          {
            date: '2016-11-15',
            title: '发布 4.0 版本',
            desc: '新增数据看板与自定义报表',
            danger: false,
          },
        ],
        timelineHorizontal: [
          { label: '阶段一', content: '需求评审完成' },
          { label: '阶段二', content: '设计稿确认' },
          { label: '阶段三', content: '开发联调中' },
          { label: '阶段四', content: '待验收上线' },
        ],
        treeData: [
          {
            title: '总公司',
            key: '0',
            children: [
              {
                title: '华东大区',
                key: '0-0',
                children: [
                  { title: '上海分部', key: '0-0-0' },
                  { title: '杭州分部', key: '0-0-1' },
                  { title: '南京分部', key: '0-0-2' },
                ],
              },
              {
                title: '华南大区',
                key: '0-1',
                children: [
                  { title: '深圳分部', key: '0-1-0' },
                  { title: '广州分部', key: '0-1-1' },
                  { title: '厦门分部', key: '0-1-2', disabled: true },
                ],
              },
              {
                title: '华北大区',
                key: '0-2',
                children: [
                  { title: '北京分部', key: '0-2-0' },
                  { title: '天津分部', key: '0-2-1' },
                ],
              },
            ],
          },
          {
            title: '支撑中心',
            key: '1',
            children: [
              { title: '人力资源', key: '1-0' },
              { title: '财务中心', key: '1-1' },
              { title: '信息技术', key: '1-2' },
            ],
          },
        ],
        treeSelectedKeys: ['0-0-0'],
        treeExpandedKeys: ['0', '0-0', '0-1', '0-2', '1'],
        treeCheckedKeys: ['0-0-0', '0-0-1', '1-0'],
        treeCheckExpandedKeys: ['0', '0-0', '0-1', '0-2', '1'],
      }
    },
    computed: {
      treeNodeCount() {
        const walk = (nodes) =>
          (nodes || []).reduce(
            (sum, node) => sum + 1 + walk(node.children),
            0
          )
        return walk(this.treeData)
      },
    },
    methods: {
      stepTitle(current, index) {
        if (index < current) return '已完成'
        if (index === current) return '进行中'
        return '待进行'
      },
      dotStepDesc(current, index) {
        return index <= current ? '2020-10-14 12:00' : '等待审批'
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
          展示时间轴、步骤条、折叠面板、树型等扩展组件的常见用法，可直接在业务页中复用。
        </a-alert>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">时间轴</div>
            <div class="component-basic-timeline-grid">
              <div class="component-showcase-row">
                <div class="component-showcase-label">常用</div>
                <a-timeline class="component-basic-timeline-basic">
                  <a-timeline-item
                    v-for="item in timelineBasic"
                    :key="item.label"
                  >
                    {{ item.content }}
                    <template #label>
                      <span class="component-basic-timeline-date">
                        <icon-clock-circle />
                        {{ item.label }}
                      </span>
                    </template>
                  </a-timeline-item>
                </a-timeline>
              </div>
              <div class="component-showcase-row">
                <div class="component-showcase-label">图标</div>
                <a-timeline class="component-basic-timeline-icon">
                  <a-timeline-item
                    v-for="item in timelineIcon"
                    :key="item.date"
                  >
                    <template #dot>
                      <span
                        class="component-basic-timeline-dot"
                        :class="{ 'component-basic-timeline-dot--danger': item.danger }"
                      >
                        <icon-bug v-if="item.danger" />
                        <icon-location v-else />
                      </span>
                    </template>
                    <div class="component-basic-timeline-body">
                      <div class="component-basic-timeline-main">
                        <div class="component-basic-timeline-title">{{ item.title }}</div>
                        <div class="component-basic-timeline-desc">{{ item.desc }}</div>
                      </div>
                      <div class="component-basic-timeline-date">
                        <icon-clock-circle />
                        {{ item.date }}
                      </div>
                    </div>
                  </a-timeline-item>
                </a-timeline>
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">横向</div>
              <a-timeline class="component-basic-timeline-horizontal" direction="horizontal">
                <a-timeline-item
                  v-for="item in timelineHorizontal"
                  :key="item.label"
                  :label="item.label"
                >
                  {{ item.content }}
                </a-timeline-item>
              </a-timeline>
            </div>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">步骤条</div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">常用</div>
              <div class="component-basic-steps-stack">
                <a-steps
                  v-for="current in stepDemos"
                  :key="'basic-' + current"
                  :current="current"
                  small
                  label-placement="vertical"
                >
                  <a-step v-for="i in 4" :key="i" :title="stepTitle(current, i)" />
                </a-steps>
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">点状</div>
              <div class="component-basic-steps-stack">
                <a-steps
                  v-for="current in stepDemos"
                  :key="'dot-' + current"
                  type="dot"
                  :current="current"
                  label-placement="vertical"
                >
                  <a-step
                    v-for="(title, idx) in dotStepTitles"
                    :key="title"
                    :title="title"
                    :description="dotStepDesc(current, idx + 1)"
                  />
                </a-steps>
              </div>
            </div>
            <div class="component-showcase-row">
              <div class="component-showcase-label">垂直</div>
              <div class="component-basic-steps-vertical-row">
                <a-steps
                  v-for="current in stepDemos"
                  :key="'vertical-' + current"
                  direction="vertical"
                  small
                  :current="current"
                >
                  <a-step
                    v-for="i in 4"
                    :key="i"
                    :title="stepTitle(current, i)"
                    description="步骤的描述信息"
                  />
                </a-steps>
              </div>
            </div>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">折叠面板</div>
            <div class="component-basic-collapse-grid">
              <div class="component-showcase-row">
                <div class="component-showcase-label">常用</div>
                <a-collapse v-model:active-key="collapseKeys">
                  <a-collapse-item header="什么是扩展组件？" key="1">
                    扩展组件覆盖步骤条、时间轴、折叠面板等结构化展示能力，适合流程、历程与内容收纳场景。
                  </a-collapse-item>
                  <a-collapse-item header="步骤条适合哪些场景？" key="2">
                    分步表单、审批流转、安装向导等需要明确阶段进度的场景。
                  </a-collapse-item>
                  <a-collapse-item header="时间轴适合哪些场景？" key="3">
                    版本发布记录、运维事件、操作日志等按时间展开的信息流。
                  </a-collapse-item>
                </a-collapse>
              </div>
              <div class="component-showcase-row">
                <div class="component-showcase-label">手风琴</div>
                <a-collapse v-model:active-key="accordionKeys" accordion>
                  <a-collapse-item header="什么是手风琴面板？" key="1">
                    手风琴模式下同一时间仅允许展开一个面板，展开新项时会自动收起其他项。
                  </a-collapse-item>
                  <a-collapse-item header="适合哪些业务场景？" key="2">
                    FAQ 问答、设置分组、帮助中心等希望聚焦当前阅读内容、避免多面板同时展开的场景。
                  </a-collapse-item>
                  <a-collapse-item header="与常用折叠有何区别？" key="3">
                    常用折叠可同时展开多个面板；手风琴通过 accordion 属性限制为互斥展开。
                  </a-collapse-item>
                </a-collapse>
              </div>
            </div>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">树型</div>
            <div class="component-basic-tree-grid">
              <div class="component-showcase-row">
                <div class="component-showcase-label">常用</div>
                <div class="component-extended-tree-panel">
                  <div class="component-extended-tree-header">
                    <span class="component-extended-tree-header-title">组织架构</span>
                    <span class="component-extended-tree-header-count">
                      {{ treeSelectedKeys.length }} / {{ treeNodeCount }}
                    </span>
                  </div>
                  <div class="component-extended-tree-body">
                    <a-tree
                      class="component-extended-tree"
                      block-node
                      :data="treeData"
                      v-model:selected-keys="treeSelectedKeys"
                      v-model:expanded-keys="treeExpandedKeys"
                    />
                  </div>
                </div>
              </div>
              <div class="component-showcase-row">
                <div class="component-showcase-label">复选框</div>
                <div class="component-extended-tree-panel">
                  <div class="component-extended-tree-header">
                    <span class="component-extended-tree-header-title">选择部门</span>
                    <span class="component-extended-tree-header-count">
                      {{ treeCheckedKeys.length }} / {{ treeNodeCount }}
                    </span>
                  </div>
                  <div class="component-extended-tree-body">
                    <a-tree
                      class="component-extended-tree"
                      block-node
                      checkable
                      :data="treeData"
                      v-model:checked-keys="treeCheckedKeys"
                      v-model:expanded-keys="treeCheckExpandedKeys"
                    />
                  </div>
                </div>
              </div>
            </div>
          </a-card>
        </div>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'component/extended',
    title: ArcoProLocale.menu['menu.component.extended'] || '扩展组件',
    pageComponent: ExtendedComponentPage,
  })
})()
