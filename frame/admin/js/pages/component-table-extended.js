;(function () {
  const statusMap = {
    online: { text: '已上线', color: 'green' },
    offline: { text: '已下线', color: 'gray' },
    draft: { text: '草稿', color: 'orangered' },
  }

  const priorityMap = {
    high: { text: '高', color: 'red' },
    medium: { text: '中', color: 'orangered' },
    low: { text: '低', color: 'arcoblue' },
  }

  function makeRows(n) {
    const names = [
      '内容运营周报看板',
      '新用户增长实验',
      '支付结算对账任务',
      '风控规则审核池',
      '客服工单响应看板',
      '经营数据总览',
      '会员日活动排期',
      '渠道投放素材库',
      '直播间转化漏斗',
      '售后质检抽样',
      '商品主图合规检查',
      '发票开具异常复核',
      '短信触达效果分析',
      '优惠券核销监控',
      '库存预警处置单',
      '供应商对账清单',
      '权限变更审批流',
      '接口可用性巡检',
      '埋点校验与补报',
      'A/B 实验结案报告',
      '社区内容精选池',
      '达人合作结算单',
      '退款时效专项治理',
      '首页推荐策略迭代',
      '跨境订单清关跟踪',
      '班次排班覆盖检查',
    ]
    const owners = ['王立群', '李晓雯', '陈思远', '赵敏', '周杰', '林芳', '韩梅']
    const statuses = ['online', 'offline', 'draft']
    const priorities = ['high', 'medium', 'low']
    return Array.from({ length: n }, (_, i) => ({
      key: String(i + 1),
      id: 'PRJ' + String(1000 + i),
      name: names[i % names.length],
      owner: owners[i % owners.length],
      status: statuses[i % statuses.length],
      priority: priorities[i % priorities.length],
      count: 12 + ((i * 7) % 80),
      updatedAt: '2026-0' + ((i % 8) + 1) + '-' + String(10 + (i % 18)).padStart(2, '0'),
    }))
  }

  const TableExtendedPage = {
    name: 'TableExtendedPage',
    data() {
      const basicData = makeRows(5)
      return {
        basicColumns: [
          { title: '编号', dataIndex: 'id', width: 110 },
          { title: '名称', dataIndex: 'name', minWidth: 160 },
          { title: '负责人', dataIndex: 'owner', width: 100 },
          { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
          { title: '更新时间', dataIndex: 'updatedAt', width: 130 },
        ],
        basicData,
        stripeData: makeRows(4),
        size: 'medium',
        selectedKeys: ['1', '3'],
        selectColumns: [
          { title: '编号', dataIndex: 'id', width: 110 },
          { title: '名称', dataIndex: 'name', minWidth: 160 },
          { title: '负责人', dataIndex: 'owner', width: 100 },
          { title: '优先级', dataIndex: 'priority', width: 90, slotName: 'priority' },
          {
            title: '操作',
            dataIndex: 'operations',
            width: 140,
            slotName: 'operations',
          },
        ],
        selectData: makeRows(5),
        expandColumns: [
          { title: '编号', dataIndex: 'id', width: 110 },
          { title: '名称', dataIndex: 'name', minWidth: 180 },
          { title: '负责人', dataIndex: 'owner', width: 100 },
          { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
        ],
        expandData: makeRows(4).map((row, i) => ({
          ...row,
          detail:
            '该任务包含 ' +
            (3 + i) +
            ' 个子项，最近一次同步于 ' +
            row.updatedAt +
            '，由 ' +
            row.owner +
            ' 负责推进。',
        })),
        treeColumns: [
          { title: '组织 / 成员', dataIndex: 'name', minWidth: 200 },
          { title: '角色', dataIndex: 'role', width: 120 },
          { title: '人数', dataIndex: 'count', width: 90 },
          { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
        ],
        treeData: [
          {
            key: '1',
            name: '华东大区',
            role: '区域',
            count: 28,
            status: 'online',
            children: [
              { key: '1-1', name: '上海分部', role: '分部', count: 12, status: 'online' },
              { key: '1-2', name: '杭州分部', role: '分部', count: 9, status: 'online' },
              { key: '1-3', name: '南京分部', role: '分部', count: 7, status: 'draft' },
            ],
          },
          {
            key: '2',
            name: '华南大区',
            role: '区域',
            count: 19,
            status: 'online',
            children: [
              { key: '2-1', name: '深圳分部', role: '分部', count: 11, status: 'online' },
              { key: '2-2', name: '广州分部', role: '分部', count: 8, status: 'offline' },
            ],
          },
        ],
        fixedColumns: [
          { title: '编号', dataIndex: 'id', width: 110, fixed: 'left' },
          { title: '名称', dataIndex: 'name', width: 200 },
          { title: '负责人', dataIndex: 'owner', width: 100 },
          { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
          { title: '优先级', dataIndex: 'priority', width: 90, slotName: 'priority' },
          { title: '数量', dataIndex: 'count', width: 90 },
          { title: '更新时间', dataIndex: 'updatedAt', width: 130 },
          { title: '备注', dataIndex: 'name', width: 180 },
          {
            title: '操作',
            dataIndex: 'operations',
            width: 140,
            fixed: 'right',
            slotName: 'operations',
          },
        ],
        fixedData: makeRows(6),
        sortColumns: [
          {
            title: '编号',
            dataIndex: 'id',
            width: 110,
            sortable: { sortDirections: ['ascend', 'descend'] },
          },
          { title: '名称', dataIndex: 'name', minWidth: 160 },
          {
            title: '数量',
            dataIndex: 'count',
            width: 100,
            sortable: { sortDirections: ['ascend', 'descend'] },
          },
          {
            title: '状态',
            dataIndex: 'status',
            width: 120,
            slotName: 'status',
            filterable: {
              filters: [
                { text: '已上线', value: 'online' },
                { text: '已下线', value: 'offline' },
                { text: '草稿', value: 'draft' },
              ],
              filter: (values, record) => values.includes(record.status),
              multiple: true,
            },
          },
          { title: '更新时间', dataIndex: 'updatedAt', width: 130 },
        ],
        sortData: makeRows(6),
        pageColumns: [
          { title: '编号', dataIndex: 'id', width: 110 },
          { title: '名称', dataIndex: 'name', minWidth: 160 },
          { title: '负责人', dataIndex: 'owner', width: 100 },
          { title: '状态', dataIndex: 'status', width: 100, slotName: 'status' },
          { title: '数量', dataIndex: 'count', width: 90 },
          { title: '更新时间', dataIndex: 'updatedAt', width: 130 },
          {
            title: '操作',
            dataIndex: 'operations',
            width: 140,
            slotName: 'operations',
          },
        ],
        pageData: makeRows(23),
        pagination: {
          current: 1,
          pageSize: 5,
          total: 23,
          showTotal: true,
          showPageSize: true,
          pageSizeOptions: [5, 10, 20],
        },
      }
    },
    computed: {
      pagedData() {
        const start = (this.pagination.current - 1) * this.pagination.pageSize
        return this.pageData.slice(start, start + this.pagination.pageSize)
      },
    },
    methods: {
      statusInfo(key) {
        return statusMap[key] || { text: key, color: 'gray' }
      },
      priorityInfo(key) {
        return priorityMap[key] || { text: key, color: 'gray' }
      },
      onSelectionChange(keys) {
        this.selectedKeys = keys
      },
      onPageChange(current) {
        this.pagination.current = current
      },
      onPageSizeChange(pageSize) {
        this.pagination.pageSize = pageSize
        this.pagination.current = 1
      },
      onView(record) {
        if (window.ArcoVue && ArcoVue.Message) {
          ArcoVue.Message.info('查看：' + record.name)
        }
      },
      onEdit(record) {
        if (window.ArcoVue && ArcoVue.Message) {
          ArcoVue.Message.success('编辑：' + record.name)
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
          本页展示表格扩展用法：基础表、斑马纹与尺寸、行选择、展开行、树形数据、排序筛选、固定列与分页，业务列表页请参考「页面模板」。
        </a-alert>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">基础表格</div>
            <a-table
              :columns="basicColumns"
              :data="basicData"
              row-key="key"
              :pagination="false"
              :bordered="false"
            >
              <template #status="{ record }">
                <a-tag :color="statusInfo(record.status).color" size="small">
                  {{ statusInfo(record.status).text }}
                </a-tag>
              </template>
            </a-table>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">斑马纹与尺寸</div>
            <div class="component-showcase-row" style="margin-bottom: 16px">
              <div class="component-showcase-demo">
                <a-radio-group v-model="size" type="button" size="small">
                  <a-radio value="medium">默认</a-radio>
                  <a-radio value="small">紧凑</a-radio>
                  <a-radio value="mini">迷你</a-radio>
                </a-radio-group>
              </div>
            </div>
            <a-table
              :columns="basicColumns"
              :data="stripeData"
              row-key="key"
              :pagination="false"
              :bordered="false"
              :stripe="true"
              :size="size"
            >
              <template #status="{ record }">
                <a-tag :color="statusInfo(record.status).color" size="small">
                  {{ statusInfo(record.status).text }}
                </a-tag>
              </template>
            </a-table>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">行选择</div>
            <a-table
              :columns="selectColumns"
              :data="selectData"
              row-key="key"
              :pagination="false"
              :bordered="false"
              :row-selection="{ type: 'checkbox', showCheckedAll: true, width: 48 }"
              :selected-keys="selectedKeys"
              @selection-change="onSelectionChange"
            >
              <template #priority="{ record }">
                <a-tag :color="priorityInfo(record.priority).color" size="small">
                  {{ priorityInfo(record.priority).text }}
                </a-tag>
              </template>
              <template #operations="{ record }">
                <a-space class="pro-table-ops" :size="4">
                  <a-button type="text" size="small" @click="onView(record)">查看</a-button>
                  <a-button type="text" size="small" @click="onEdit(record)">编辑</a-button>
                </a-space>
              </template>
            </a-table>
            <p class="component-showcase-hint" style="margin: 12px 0 0; color: var(--color-text-3); font-size: 13px">
              已选 {{ selectedKeys.length }} 项
            </p>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">可展开行</div>
            <a-table
              :columns="expandColumns"
              :data="expandData"
              row-key="key"
              :pagination="false"
              :bordered="false"
              :expandable="{ width: 48 }"
              :default-expanded-keys="['1']"
            >
              <template #expand-icon="{ expanded }">
                <icon-minus v-if="expanded" :size="10" />
                <icon-plus v-else :size="10" />
              </template>
              <template #expand-row="{ record }">
                <div style="padding: 8px 12px; color: var(--color-text-2); line-height: 1.6">
                  {{ record.detail }}
                </div>
              </template>
              <template #status="{ record }">
                <a-tag :color="statusInfo(record.status).color" size="small">
                  {{ statusInfo(record.status).text }}
                </a-tag>
              </template>
            </a-table>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">树形数据</div>
            <a-table
              class="component-table-tree"
              :columns="treeColumns"
              :data="treeData"
              row-key="key"
              :pagination="false"
              :bordered="false"
              default-expand-all-rows
            >
              <template #expand-icon="{ expanded }">
                <icon-caret-down-fill
                  class="component-table-tree-switcher-icon"
                  :class="{ 'is-expanded': expanded }"
                />
              </template>
              <template #status="{ record }">
                <a-tag :color="statusInfo(record.status).color" size="small">
                  {{ statusInfo(record.status).text }}
                </a-tag>
              </template>
            </a-table>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">排序与筛选</div>
            <a-table
              :columns="sortColumns"
              :data="sortData"
              row-key="key"
              :pagination="false"
              :bordered="false"
            >
              <template #status="{ record }">
                <a-tag :color="statusInfo(record.status).color" size="small">
                  {{ statusInfo(record.status).text }}
                </a-tag>
              </template>
            </a-table>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">固定列</div>
            <a-table
              :columns="fixedColumns"
              :data="fixedData"
              row-key="key"
              :pagination="false"
              :bordered="false"
              :scroll="{ x: 1200 }"
            >
              <template #status="{ record }">
                <a-tag :color="statusInfo(record.status).color" size="small">
                  {{ statusInfo(record.status).text }}
                </a-tag>
              </template>
              <template #priority="{ record }">
                <a-tag :color="priorityInfo(record.priority).color" size="small">
                  {{ priorityInfo(record.priority).text }}
                </a-tag>
              </template>
              <template #operations="{ record }">
                <a-space class="pro-table-ops" :size="4">
                  <a-button type="text" size="small" @click="onView(record)">查看</a-button>
                  <a-button type="text" size="small" @click="onEdit(record)">编辑</a-button>
                </a-space>
              </template>
            </a-table>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">分页表格</div>
            <a-table
              :columns="pageColumns"
              :data="pagedData"
              row-key="key"
              :pagination="false"
              :bordered="false"
            >
              <template #status="{ record }">
                <a-tag :color="statusInfo(record.status).color" size="small">
                  {{ statusInfo(record.status).text }}
                </a-tag>
              </template>
              <template #operations="{ record }">
                <a-space class="pro-table-ops" :size="4">
                  <a-button type="text" size="small" @click="onView(record)">查看</a-button>
                  <a-button type="text" size="small" @click="onEdit(record)">编辑</a-button>
                </a-space>
              </template>
            </a-table>
            <div class="pro-table-footer" style="margin-top: 12px">
              <div></div>
              <a-pagination
                v-model:current="pagination.current"
                v-model:page-size="pagination.pageSize"
                :total="pagination.total"
                :page-size-options="pagination.pageSizeOptions"
                show-total
                show-page-size
                @change="onPageChange"
                @page-size-change="onPageSizeChange"
              />
            </div>
          </a-card>
        </div>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'component/table-extended',
    title: ArcoProLocale.menu['menu.component.tableExtended'] || '表格组件',
    pageComponent: TableExtendedPage,
  })
})()
