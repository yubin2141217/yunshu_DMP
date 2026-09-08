;(function () {
  let dynamicKey = 5
  let memberTableKey = 5
  let memberCardKey = 5

  /** 大区 → 城市 → 区县；级联选前两级，右侧下拉联动区县 */
  const REGION_CITY_DISTRICT = [
    {
      label: '华东',
      value: 'east',
      children: [
        {
          label: '上海',
          value: 'shanghai',
          districts: [
            { label: '黄浦区', value: 'huangpu' },
            { label: '徐汇区', value: 'xuhui' },
            { label: '长宁区', value: 'changning' },
            { label: '静安区', value: 'jingan' },
            { label: '浦东新区', value: 'pudong' },
            { label: '闵行区', value: 'minhang' },
            { label: '宝山区', value: 'baoshan' },
            { label: '嘉定区', value: 'jiading' },
          ],
        },
        {
          label: '杭州',
          value: 'hangzhou',
          districts: [
            { label: '上城区', value: 'shangcheng' },
            { label: '拱墅区', value: 'gongshu' },
            { label: '西湖区', value: 'xihu' },
            { label: '滨江区', value: 'binjiang' },
            { label: '萧山区', value: 'xiaoshan' },
            { label: '余杭区', value: 'yuhang' },
            { label: '临平区', value: 'linping' },
            { label: '钱塘区', value: 'qiantang' },
          ],
        },
        {
          label: '南京',
          value: 'nanjing',
          districts: [
            { label: '玄武区', value: 'xuanwu' },
            { label: '秦淮区', value: 'qinhuai' },
            { label: '建邺区', value: 'jianye' },
            { label: '鼓楼区', value: 'gulou_nj' },
            { label: '雨花台区', value: 'yuhuatai' },
            { label: '江宁区', value: 'jiangning' },
          ],
        },
        {
          label: '苏州',
          value: 'suzhou',
          districts: [
            { label: '姑苏区', value: 'gusu' },
            { label: '虎丘区', value: 'huqiu' },
            { label: '吴中区', value: 'wuzhong' },
            { label: '相城区', value: 'xiangcheng' },
            { label: '吴江区', value: 'wujiang' },
            { label: '工业园区', value: 'sip' },
          ],
        },
        {
          label: '合肥',
          value: 'hefei',
          districts: [
            { label: '瑶海区', value: 'yaohai' },
            { label: '庐阳区', value: 'luyang' },
            { label: '蜀山区', value: 'shushan' },
            { label: '包河区', value: 'baohe' },
            { label: '高新区', value: 'gaoxin_hf' },
          ],
        },
      ],
    },
    {
      label: '华南',
      value: 'south',
      children: [
        {
          label: '深圳',
          value: 'shenzhen',
          districts: [
            { label: '福田区', value: 'futian' },
            { label: '罗湖区', value: 'luohu' },
            { label: '南山区', value: 'nanshan' },
            { label: '宝安区', value: 'baoan' },
            { label: '龙岗区', value: 'longgang' },
            { label: '龙华区', value: 'longhua' },
            { label: '坪山区', value: 'pingshan' },
          ],
        },
        {
          label: '广州',
          value: 'guangzhou',
          districts: [
            { label: '天河区', value: 'tianhe' },
            { label: '越秀区', value: 'yuexiu' },
            { label: '海珠区', value: 'haizhu' },
            { label: '荔湾区', value: 'liwan' },
            { label: '白云区', value: 'baiyun' },
            { label: '番禺区', value: 'panyu' },
            { label: '黄埔区', value: 'huangpu_gz' },
          ],
        },
        {
          label: '东莞',
          value: 'dongguan',
          districts: [
            { label: '南城街道', value: 'nancheng' },
            { label: '东城街道', value: 'dongcheng' },
            { label: '莞城街道', value: 'guancheng' },
            { label: '松山湖', value: 'ssl' },
            { label: '虎门镇', value: 'humen' },
          ],
        },
        {
          label: '厦门',
          value: 'xiamen',
          districts: [
            { label: '思明区', value: 'siming' },
            { label: '湖里区', value: 'huli' },
            { label: '集美区', value: 'jimei' },
            { label: '海沧区', value: 'haicang' },
            { label: '同安区', value: 'tongan' },
          ],
        },
      ],
    },
    {
      label: '华北',
      value: 'north',
      children: [
        {
          label: '北京',
          value: 'beijing',
          districts: [
            { label: '东城区', value: 'dongcheng_bj' },
            { label: '西城区', value: 'xicheng' },
            { label: '朝阳区', value: 'chaoyang' },
            { label: '海淀区', value: 'haidian' },
            { label: '丰台区', value: 'fengtai' },
            { label: '通州区', value: 'tongzhou' },
            { label: '昌平区', value: 'changping' },
            { label: '大兴区', value: 'daxing' },
          ],
        },
        {
          label: '天津',
          value: 'tianjin',
          districts: [
            { label: '和平区', value: 'heping' },
            { label: '河东区', value: 'hedong' },
            { label: '河西区', value: 'hexi' },
            { label: '南开区', value: 'nankai' },
            { label: '滨海新区', value: 'binhai' },
          ],
        },
        {
          label: '石家庄',
          value: 'shijiazhuang',
          districts: [
            { label: '长安区', value: 'changan_sjz' },
            { label: '桥西区', value: 'qiaoxi' },
            { label: '新华区', value: 'xinhua_sjz' },
            { label: '裕华区', value: 'yuhua' },
            { label: '高新区', value: 'gaoxin_sjz' },
          ],
        },
      ],
    },
    {
      label: '西南',
      value: 'southwest',
      children: [
        {
          label: '成都',
          value: 'chengdu',
          districts: [
            { label: '锦江区', value: 'jinjiang' },
            { label: '青羊区', value: 'qingyang' },
            { label: '金牛区', value: 'jinniu' },
            { label: '武侯区', value: 'wuhou' },
            { label: '成华区', value: 'chenghua' },
            { label: '高新区', value: 'gaoxin_cd' },
            { label: '天府新区', value: 'tianfu' },
          ],
        },
        {
          label: '重庆',
          value: 'chongqing',
          districts: [
            { label: '渝中区', value: 'yuzhong' },
            { label: '江北区', value: 'jiangbei' },
            { label: '南岸区', value: 'nanan' },
            { label: '沙坪坝区', value: 'shapingba' },
            { label: '渝北区', value: 'yubei' },
            { label: '两江新区', value: 'liangjiang' },
          ],
        },
        {
          label: '昆明',
          value: 'kunming',
          districts: [
            { label: '五华区', value: 'wuhua' },
            { label: '盘龙区', value: 'panlong' },
            { label: '官渡区', value: 'guandu' },
            { label: '西山区', value: 'xishan_km' },
            { label: '呈贡区', value: 'chenggong' },
          ],
        },
      ],
    },
    {
      label: '华中',
      value: 'central',
      children: [
        {
          label: '武汉',
          value: 'wuhan',
          districts: [
            { label: '江岸区', value: 'jiangan' },
            { label: '江汉区', value: 'jianghan' },
            { label: '硚口区', value: 'qiaokou' },
            { label: '武昌区', value: 'wuchang' },
            { label: '洪山区', value: 'hongshan' },
            { label: '东湖高新区', value: 'donghu' },
          ],
        },
        {
          label: '长沙',
          value: 'changsha',
          districts: [
            { label: '芙蓉区', value: 'furong' },
            { label: '天心区', value: 'tianxin' },
            { label: '岳麓区', value: 'yuelu' },
            { label: '开福区', value: 'kaifu' },
            { label: '雨花区', value: 'yuhua_cs' },
          ],
        },
        {
          label: '郑州',
          value: 'zhengzhou',
          districts: [
            { label: '中原区', value: 'zhongyuan' },
            { label: '二七区', value: 'erqi' },
            { label: '金水区', value: 'jinshui' },
            { label: '惠济区', value: 'huiji' },
            { label: '郑东新区', value: 'zhengdong' },
          ],
        },
      ],
    },
  ]

  function toCascaderOptions(tree) {
    return tree.map((region) => ({
      label: region.label,
      value: region.value,
      children: (region.children || []).map((city) => ({
        label: city.label,
        value: city.value,
      })),
    }))
  }

  function findCityNode(tree, regionKey, cityKey) {
    const region = tree.find((item) => item.value === regionKey)
    if (!region) return null
    return (region.children || []).find((item) => item.value === cityKey) || null
  }

  const searchTableLocale = ArcoProLocale.searchTable
  const treeTableLocale = ArcoProLocale.listTreeTable
  const { ticketTypes, priorities, statusLabels, assignees, customers, employeeRoles } = ArcoProMock

  function emptyTicketFilter() {
    return {
      id: '',
      title: '',
      ticketType: '',
      priority: '',
      createdTime: [],
      status: '',
      assignee: '',
      customer: '',
      keyword: '',
    }
  }

  function emptyMemberFilter() {
    return {
      name: '',
      account: '',
      phone: '',
      enabled: '',
      role: '',
      createdTime: [],
    }
  }

  function emptySingleLineFilter() {
    return {
      id: '',
      title: '',
      ticketType: '',
    }
  }

  const FormExtendedPage = {
    name: 'FormExtendedPage',
    data() {
      return {
        searchTableT: searchTableLocale,
        treeTableT: treeTableLocale,
        ticketFilter: emptyTicketFilter(),
        memberFilter: emptyMemberFilter(),
        singleLineFilter: emptySingleLineFilter(),
        searchExpanded: false,
        isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
        linkForm: {
          regionCity: ['east', 'hangzhou'],
          district: 'xihu',
        },
        regionOptions: toCascaderOptions(REGION_CITY_DISTRICT),
        districtOptions: findCityNode(REGION_CITY_DISTRICT, 'east', 'hangzhou')?.districts || [],
        dynamicItems: [
          { key: 1, name: '抖音信息流', budget: 5000 },
          { key: 2, name: '小红书笔记', budget: 3000 },
          { key: 3, name: '微信公众号', budget: 2000 },
          { key: 4, name: '微博推广', budget: 1500 },
        ],
        memberTableItems: [
          { key: 1, name: '张小刚', jobNo: '10001', dept: '销售部', editing: false },
          { key: 2, name: '李小红', jobNo: '10002', dept: '市场部', editing: false },
          { key: 3, name: '王小明', jobNo: '10003', dept: '技术部', editing: false },
          { key: 4, name: '赵小华', jobNo: '10004', dept: '运营部', editing: false },
        ],
        memberTableDragIndex: -1,
        memberTableDragOverIndex: -1,
        memberCardItems: [
          { key: 1, name: '', email: '', wechat: '' },
          { key: 2, name: '', email: '', wechat: '' },
          { key: 3, name: '', email: '', wechat: '' },
          { key: 4, name: '', email: '', wechat: '' },
        ],
        transferData: [
          { value: 'user', label: '用户管理' },
          { value: 'role', label: '角色管理' },
          { value: 'dept', label: '部门管理' },
          { value: 'menu', label: '菜单配置' },
          { value: 'dict', label: '字典管理' },
          { value: 'log', label: '操作日志', disabled: true },
          { value: 'audit', label: '审计中心' },
          { value: 'notify', label: '消息通知' },
          { value: 'export', label: '数据导出' },
          { value: 'report', label: '报表中心' },
          { value: 'settings', label: '系统设置' },
          { value: 'file', label: '文件管理' },
          { value: 'announce', label: '公告发布' },
          { value: 'backup', label: '数据备份' },
          { value: 'api', label: 'API 授权' },
          { value: 'profile', label: '个人中心' },
          { value: 'tenant', label: '租户管理' },
          { value: 'workflow', label: '流程配置' },
          { value: 'schedule', label: '定时任务' },
          { value: 'monitor', label: '服务监控' },
          { value: 'cache', label: '缓存管理' },
          { value: 'config', label: '参数配置' },
          { value: 'i18n', label: '多语言配置' },
          { value: 'security', label: '安全策略' },
        ],
        transferValue: ['user', 'role', 'menu'],
        transferTitles: ['待选权限', '已选权限'],
      }
    },
    computed: {
      ticketTypeOptions() {
        return ticketTypes.map((label, value) => ({ label, value }))
      },
      priorityOptions() {
        return priorities.map((label, value) => ({ label, value }))
      },
      ticketStatusOptions() {
        return statusLabels.map((label, value) => ({ label, value }))
      },
      assigneeOptions() {
        return assignees.map((label) => ({ label, value: label }))
      },
      customerOptions() {
        return customers.map((label) => ({ label, value: label }))
      },
      memberStatusOptions() {
        return [
          { label: treeTableLocale.statusEnabled, value: true },
          { label: treeTableLocale.statusDisabled, value: false },
        ]
      },
      memberRoleOptions() {
        return employeeRoles.map((label) => ({ label, value: label }))
      },
      hasAdvancedTicketFilters() {
        const f = this.ticketFilter
        if (f.priority !== '' && f.priority != null) return true
        if (f.status !== '' && f.status != null) return true
        if (f.createdTime && f.createdTime.length === 2) return true
        if (f.assignee) return true
        if (f.customer) return true
        if (f.keyword) return true
        return false
      },
    },
    mounted() {
      this._onResize = () => {
        this.isMobile = window.innerWidth <= 768
      }
      window.addEventListener('resize', this._onResize)
    },
    beforeUnmount() {
      if (this._onResize) window.removeEventListener('resize', this._onResize)
    },
    methods: {
      toggleTicketSearchExpand() {
        this.searchExpanded = !this.searchExpanded
      },
      onTicketFilterSearch() {
        ArcoVue.Message.success('已应用工单筛选条件（演示）')
      },
      onTicketFilterReset() {
        this.ticketFilter = emptyTicketFilter()
        this.searchExpanded = false
        ArcoVue.Message.info('工单筛选已重置')
      },
      onMemberFilterSearch() {
        ArcoVue.Message.success('已应用成员筛选条件（演示）')
      },
      onMemberFilterReset() {
        this.memberFilter = emptyMemberFilter()
        ArcoVue.Message.info('成员筛选已重置')
      },
      onSingleLineFilterSearch() {
        ArcoVue.Message.success('已应用单行筛选条件（演示）')
      },
      onSingleLineFilterReset() {
        this.singleLineFilter = emptySingleLineFilter()
        ArcoVue.Message.info('单行筛选已重置')
      },
      onRegionCityChange(value) {
        const path = Array.isArray(value) ? value : []
        const regionKey = path[0]
        const cityKey = path[1]
        const city = regionKey && cityKey ? findCityNode(REGION_CITY_DISTRICT, regionKey, cityKey) : null
        this.districtOptions = city ? city.districts.slice() : []
        const stillValid = this.districtOptions.some((item) => item.value === this.linkForm.district)
        if (!stillValid) {
          this.linkForm.district = undefined
        }
      },
      addDynamicItem() {
        this.dynamicItems.push({
          key: dynamicKey++,
          name: '',
          budget: undefined,
        })
      },
      removeDynamicItem(key) {
        if (this.dynamicItems.length <= 1) {
          ArcoVue.Message.warning('至少保留一项')
          return
        }
        this.dynamicItems = this.dynamicItems.filter((item) => item.key !== key)
      },
      submitDynamic() {
        const invalid = this.dynamicItems.some(
          (item) => !String(item.name || '').trim() || item.budget == null
        )
        if (invalid) {
          ArcoVue.Message.error('请完善渠道名称与预算')
          return
        }
        ArcoVue.Message.success('动态表单已保存')
      },
      editMemberTableItem(key) {
        const editing = this.memberTableItems.find((item) => item.editing)
        if (editing && editing.key !== key) {
          ArcoVue.Modal.confirm({
            simple: true,
            titleAlign: 'start',
            modalClass: 'pro-confirm-modal',
            width: 360,
            title: '未保存的编辑',
            content: '当前有未保存的编辑内容，是否放弃并切换到其它项？',
            okText: '放弃并切换',
            cancelText: '继续编辑',
            onOk: () => {
              this.discardMemberTableEdit(editing)
              this.beginMemberTableEdit(key)
            },
          })
          return
        }
        this.beginMemberTableEdit(key)
      },
      beginMemberTableEdit(key) {
        const target = this.memberTableItems.find((item) => item.key === key)
        if (!target) return
        target._snapshot = {
          name: target.name,
          jobNo: target.jobNo,
          dept: target.dept,
        }
        this.memberTableItems.forEach((item) => {
          item.editing = item.key === key
        })
      },
      discardMemberTableEdit(item) {
        if (!item) return
        if (item.isNew) {
          this.memberTableItems = this.memberTableItems.filter((row) => row.key !== item.key)
          return
        }
        if (item._snapshot) {
          item.name = item._snapshot.name
          item.jobNo = item._snapshot.jobNo
          item.dept = item._snapshot.dept
          delete item._snapshot
        }
        item.editing = false
      },
      saveMemberTableItem(item) {
        if (!String(item.name || '').trim() || !String(item.jobNo || '').trim() || !String(item.dept || '').trim()) {
          ArcoVue.Message.error('请完善成员姓名、工号与部门')
          return
        }
        item.editing = false
        item.isNew = false
        delete item._snapshot
        ArcoVue.Message.success('成员已保存')
      },
      removeMemberTableItem(key) {
        if (this.memberTableItems.length <= 1) {
          ArcoVue.Message.warning('至少保留一名成员')
          return
        }
        this.memberTableItems = this.memberTableItems.filter((item) => item.key !== key)
      },
      addMemberTableItem() {
        const editing = this.memberTableItems.find((item) => item.editing)
        if (editing) {
          ArcoVue.Modal.confirm({
            simple: true,
            titleAlign: 'start',
            modalClass: 'pro-confirm-modal',
            width: 360,
            title: '未保存的编辑',
            content: '当前有未保存的编辑内容，是否放弃并继续添加新成员？',
            okText: '放弃并添加',
            cancelText: '继续编辑',
            onOk: () => {
              this.discardMemberTableEdit(editing)
              this.memberTableItems.push({
                key: memberTableKey++,
                name: '',
                jobNo: '',
                dept: '',
                editing: true,
                isNew: true,
              })
            },
          })
          return
        }
        this.memberTableItems.push({
          key: memberTableKey++,
          name: '',
          jobNo: '',
          dept: '',
          editing: true,
          isNew: true,
        })
      },
      onMemberTableDragStart(index, e) {
        this.memberTableDragIndex = index
        e.dataTransfer.effectAllowed = 'move'
        try {
          e.dataTransfer.setData('text/plain', String(index))
        } catch (_) {}
      },
      onMemberTableDragOver(index, e) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (this.memberTableDragOverIndex !== index) {
          this.memberTableDragOverIndex = index
        }
      },
      onMemberTableDragLeave(index) {
        if (this.memberTableDragOverIndex === index) {
          this.memberTableDragOverIndex = -1
        }
      },
      onMemberTableDrop(index) {
        const from = this.memberTableDragIndex
        this.memberTableDragIndex = -1
        this.memberTableDragOverIndex = -1
        if (from < 0 || from === index) return
        const next = this.memberTableItems.slice()
        const [item] = next.splice(from, 1)
        next.splice(index, 0, item)
        this.memberTableItems = next
      },
      onMemberTableDragEnd() {
        this.memberTableDragIndex = -1
        this.memberTableDragOverIndex = -1
      },
      addMemberCardItem() {
        this.memberCardItems.push({
          key: memberCardKey++,
          name: '',
          email: '',
          wechat: '',
        })
      },
      removeMemberCardItem(key) {
        if (this.memberCardItems.length <= 1) {
          ArcoVue.Message.warning('至少保留一张成员卡片')
          return
        }
        this.memberCardItems = this.memberCardItems.filter((item) => item.key !== key)
      },
    },
    template: `
      <div class="component-form-page">
        <a-alert
          class="component-form-tip"
          type="info"
          show-icon
          :closable="false"
        >
          本页展示列表筛选区、行式动态增减、可编辑表格、卡片式动态增减、级联联动与穿梭框等扩展表单用法，基础控件与布局请参考「表单组件」。
        </a-alert>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">多行筛选表单</div>
            <a-row class="pro-search-panel">
              <a-col :flex="isMobile ? '100%' : 1">
                <a-form
                  class="pro-search-form"
                  :model="memberFilter"
                  :layout="isMobile ? 'vertical' : 'horizontal'"
                  :label-col-props="isMobile ? undefined : { flex: '6em' }"
                  :wrapper-col-props="isMobile ? undefined : { flex: 1 }"
                  label-align="left"
                >
                  <a-row :gutter="16">
                    <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="name" :label="treeTableT.colName">
                        <a-input
                          v-model="memberFilter.name"
                          :placeholder="treeTableT.phName"
                          allow-clear
                          @press-enter="onMemberFilterSearch"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="account" :label="treeTableT.colAccount">
                        <a-input
                          v-model="memberFilter.account"
                          :placeholder="treeTableT.phAccount"
                          allow-clear
                          @press-enter="onMemberFilterSearch"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="phone" :label="treeTableT.colPhone">
                        <a-input
                          v-model="memberFilter.phone"
                          :placeholder="treeTableT.phPhone"
                          allow-clear
                          @press-enter="onMemberFilterSearch"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="enabled" :label="treeTableT.colStatus">
                        <a-select
                          v-model="memberFilter.enabled"
                          :options="memberStatusOptions"
                          :placeholder="treeTableT.selectDefault"
                          allow-clear
                        />
                      </a-form-item>
                    </a-col>
                    <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="role" :label="treeTableT.colRole">
                        <a-select
                          v-model="memberFilter.role"
                          :options="memberRoleOptions"
                          :placeholder="treeTableT.selectDefault"
                          allow-clear
                        />
                      </a-form-item>
                    </a-col>
                    <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="createdTime" :label="treeTableT.colCreatedTime">
                        <a-range-picker v-model="memberFilter.createdTime" class="pro-field-block" />
                      </a-form-item>
                    </a-col>
                  </a-row>
                </a-form>
              </a-col>
              <a-divider v-if="!isMobile" class="pro-search-divider" direction="vertical" />
              <a-col
                :flex="isMobile ? '100%' : '86px'"
                class="pro-search-actions"
                :class="{ 'is-mobile': isMobile }"
              >
                <a-button type="primary" @click="onMemberFilterSearch">
                  <template #icon><icon-search /></template>{{ treeTableT.search }}
                </a-button>
                <a-button @click="onMemberFilterReset">
                  <template #icon><icon-refresh /></template>{{ treeTableT.reset }}
                </a-button>
              </a-col>
            </a-row>
          </a-card>
        </div>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">单行筛选表单</div>
            <a-row class="pro-search-panel pro-search-panel--single">
              <a-col :flex="isMobile ? '100%' : 1">
                <a-form
                  class="pro-search-form is-collapsed"
                  :model="singleLineFilter"
                  :layout="isMobile ? 'vertical' : 'horizontal'"
                  :label-col-props="isMobile ? undefined : { flex: '6em' }"
                  :wrapper-col-props="isMobile ? undefined : { flex: 1 }"
                  label-align="left"
                >
                  <a-row :gutter="16">
                    <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="id" :label="searchTableT.colId">
                        <a-input
                          v-model="singleLineFilter.id"
                          :placeholder="searchTableT.phId"
                          allow-clear
                          @press-enter="onSingleLineFilterSearch"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="title" :label="searchTableT.colTitle">
                        <a-input
                          v-model="singleLineFilter.title"
                          :placeholder="searchTableT.phTitle"
                          allow-clear
                          @press-enter="onSingleLineFilterSearch"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="ticketType" :label="searchTableT.colTicketType">
                        <a-select
                          v-model="singleLineFilter.ticketType"
                          :options="ticketTypeOptions"
                          :placeholder="searchTableT.selectDefault"
                          allow-clear
                        />
                      </a-form-item>
                    </a-col>
                  </a-row>
                </a-form>
              </a-col>
              <a-col
                :flex="isMobile ? '100%' : 'none'"
                class="pro-search-actions is-collapsed"
                :class="{ 'is-mobile': isMobile }"
              >
                <a-button type="primary" @click="onSingleLineFilterSearch">
                  <template #icon><icon-search /></template>{{ searchTableT.search }}
                </a-button>
                <a-button @click="onSingleLineFilterReset">
                  <template #icon><icon-refresh /></template>{{ searchTableT.reset }}
                </a-button>
              </a-col>
            </a-row>
          </a-card>
        </div>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">可折叠筛选表单</div>
            <a-row class="pro-search-panel">
              <a-col :flex="isMobile ? '100%' : 1">
                <a-form
                  class="pro-search-form"
                  :class="{ 'is-collapsed': !searchExpanded }"
                  :model="ticketFilter"
                  :layout="isMobile ? 'vertical' : 'horizontal'"
                  :label-col-props="isMobile ? undefined : { flex: '6em' }"
                  :wrapper-col-props="isMobile ? undefined : { flex: 1 }"
                  label-align="left"
                >
                  <a-row :gutter="16">
                    <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="id" :label="searchTableT.colId">
                        <a-input
                          v-model="ticketFilter.id"
                          :placeholder="searchTableT.phId"
                          allow-clear
                          @press-enter="onTicketFilterSearch"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="title" :label="searchTableT.colTitle">
                        <a-input
                          v-model="ticketFilter.title"
                          :placeholder="searchTableT.phTitle"
                          allow-clear
                          @press-enter="onTicketFilterSearch"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="ticketType" :label="searchTableT.colTicketType">
                        <a-select
                          v-model="ticketFilter.ticketType"
                          :options="ticketTypeOptions"
                          :placeholder="searchTableT.selectDefault"
                          allow-clear
                        />
                      </a-form-item>
                    </a-col>
                    <a-col v-show="searchExpanded" :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="priority" :label="searchTableT.colPriority">
                        <a-select
                          v-model="ticketFilter.priority"
                          :options="priorityOptions"
                          :placeholder="searchTableT.selectDefault"
                          allow-clear
                        />
                      </a-form-item>
                    </a-col>
                    <a-col v-show="searchExpanded" :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="createdTime" :label="searchTableT.colCreatedTime">
                        <a-range-picker v-model="ticketFilter.createdTime" class="pro-field-block" />
                      </a-form-item>
                    </a-col>
                    <a-col v-show="searchExpanded" :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="status" :label="searchTableT.colStatus">
                        <a-select
                          v-model="ticketFilter.status"
                          :options="ticketStatusOptions"
                          :placeholder="searchTableT.selectDefault"
                          allow-clear
                        />
                      </a-form-item>
                    </a-col>
                    <a-col v-show="searchExpanded" :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="assignee" :label="searchTableT.colAssignee">
                        <a-select
                          v-model="ticketFilter.assignee"
                          :options="assigneeOptions"
                          :placeholder="searchTableT.selectDefault"
                          allow-clear
                        />
                      </a-form-item>
                    </a-col>
                    <a-col v-show="searchExpanded" :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="customer" :label="searchTableT.colCustomer">
                        <a-select
                          v-model="ticketFilter.customer"
                          :options="customerOptions"
                          :placeholder="searchTableT.selectDefault"
                          allow-clear
                          allow-search
                        />
                      </a-form-item>
                    </a-col>
                    <a-col v-show="searchExpanded" :xs="24" :sm="isMobile ? 24 : 12" :md="8">
                      <a-form-item field="keyword" :label="searchTableT.colKeyword">
                        <a-input
                          v-model="ticketFilter.keyword"
                          :placeholder="searchTableT.phKeyword"
                          allow-clear
                          @press-enter="onTicketFilterSearch"
                        />
                      </a-form-item>
                    </a-col>
                  </a-row>
                </a-form>
              </a-col>
              <a-divider v-if="!isMobile" class="pro-search-divider" direction="vertical" />
              <a-col
                :flex="isMobile ? '100%' : searchExpanded ? '86px' : 'none'"
                class="pro-search-actions"
                :class="{ 'is-collapsed': !searchExpanded || isMobile, 'is-mobile': isMobile }"
              >
                <a-button type="primary" @click="onTicketFilterSearch">
                  <template #icon><icon-search /></template>{{ searchTableT.search }}
                </a-button>
                <a-button @click="onTicketFilterReset">
                  <template #icon><icon-refresh /></template>{{ searchTableT.reset }}
                </a-button>
                <a-button type="text" class="pro-search-toggle" @click="toggleTicketSearchExpand">
                  <span class="pro-search-toggle-text">
                    {{ searchExpanded ? searchTableT.collapse : searchTableT.expand }}
                    <span
                      v-if="!searchExpanded && hasAdvancedTicketFilters"
                      class="pro-search-toggle-dot"
                    ></span>
                  </span>
                  <icon-up v-if="searchExpanded" class="pro-search-toggle-icon" />
                  <icon-down v-else class="pro-search-toggle-icon" />
                </a-button>
              </a-col>
            </a-row>
          </a-card>
        </div>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">行式动态增减</div>
            <a-form layout="vertical" class="component-form-extended-dynamic">
              <div class="component-form-extended-dynamic-head">
                <div class="component-form-extended-dynamic-col">渠道名称</div>
                <div class="component-form-extended-dynamic-col">预算（元）</div>
                <div class="component-form-extended-dynamic-col-action"></div>
              </div>
              <div
                v-for="item in dynamicItems"
                :key="item.key"
                class="component-form-extended-dynamic-row"
              >
                <div class="component-form-extended-dynamic-col">
                  <a-input v-model="item.name" placeholder="请输入渠道名称" allow-clear />
                </div>
                <div class="component-form-extended-dynamic-col">
                  <a-input-number
                    v-model="item.budget"
                    :min="0"
                    :max="999999"
                    :step="100"
                    placeholder="预算"
                    class="pro-field-block"
                  />
                </div>
                <div class="component-form-extended-dynamic-col-action">
                  <a-button
                    status="danger"
                    type="outline"
                    @click="removeDynamicItem(item.key)"
                  >
                    删除
                  </a-button>
                </div>
              </div>
              <div class="component-form-extended-dynamic-footer">
                <a-button type="dashed" @click="addDynamicItem">
                  <template #icon><icon-plus /></template>
                  添加渠道
                </a-button>
                <a-button type="primary" @click="submitDynamic">保存</a-button>
              </div>
            </a-form>
          </a-card>
        </div>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">可编辑表格</div>
            <div class="component-form-extended-member-table">
              <div class="component-form-extended-member-table-head">
                <div>员工姓名</div>
                <div>工号</div>
                <div>所属部门</div>
                <div>排序</div>
                <div>操作</div>
              </div>
              <div
                v-for="(item, index) in memberTableItems"
                :key="item.key"
                class="component-form-extended-member-table-row"
                :class="{
                  'is-editing': item.editing,
                  'is-dragging': memberTableDragIndex === index,
                  'is-drag-over': memberTableDragOverIndex === index && memberTableDragIndex !== index,
                }"
                @dragover="onMemberTableDragOver(index, $event)"
                @dragleave="onMemberTableDragLeave(index)"
                @drop.prevent="onMemberTableDrop(index)"
              >
                <template v-if="item.editing">
                  <div class="component-form-extended-member-table-col">
                    <a-input v-model="item.name" placeholder="请输入成员姓名" allow-clear />
                  </div>
                  <div class="component-form-extended-member-table-col">
                    <a-input v-model="item.jobNo" placeholder="请输入工号" allow-clear />
                  </div>
                  <div class="component-form-extended-member-table-col">
                    <a-input v-model="item.dept" placeholder="请输入部门" allow-clear />
                  </div>
                  <div
                    class="component-form-extended-member-table-sort"
                    title="拖拽排序"
                    draggable="true"
                    @dragstart="onMemberTableDragStart(index, $event)"
                    @dragend="onMemberTableDragEnd"
                  >
                    <icon-drag-dot />
                  </div>
                  <div class="component-form-extended-member-table-ops">
                    <a-button type="text" @click="saveMemberTableItem(item)">
                      <template #icon><icon-check-circle /></template>
                      保存
                    </a-button>
                    <a-button type="text" @click="removeMemberTableItem(item.key)">
                      <template #icon><icon-delete /></template>
                      删除
                    </a-button>
                  </div>
                </template>
                <template v-else>
                  <div>{{ item.name }}</div>
                  <div>{{ item.jobNo }}</div>
                  <div>{{ item.dept }}</div>
                  <div
                    class="component-form-extended-member-table-sort"
                    title="拖拽排序"
                    draggable="true"
                    @dragstart="onMemberTableDragStart(index, $event)"
                    @dragend="onMemberTableDragEnd"
                  >
                    <icon-drag-dot />
                  </div>
                  <div class="component-form-extended-member-table-ops">
                    <a-button type="text" @click="editMemberTableItem(item.key)">
                      <template #icon><icon-edit /></template>
                      编辑
                    </a-button>
                    <a-button type="text" @click="removeMemberTableItem(item.key)">
                      <template #icon><icon-delete /></template>
                      删除
                    </a-button>
                  </div>
                </template>
              </div>
              <button type="button" class="component-form-extended-member-table-add" @click="addMemberTableItem">
                <icon-plus-circle />
                添加成员
              </button>
            </div>
          </a-card>
        </div>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">卡片式动态增减</div>
            <div class="component-form-extended-member-cards">
              <div
                v-for="item in memberCardItems"
                :key="item.key"
                class="component-form-extended-member-card"
              >
                <button
                  type="button"
                  class="component-form-extended-member-card-close"
                  aria-label="删除成员"
                  @click="removeMemberCardItem(item.key)"
                >
                  <icon-close />
                </button>
                <a-form layout="vertical" :model="item">
                  <a-form-item label="成员姓名" required>
                    <a-input v-model="item.name" placeholder="成员姓名" allow-clear />
                  </a-form-item>
                  <a-form-item label="邮箱地址" required>
                    <a-input v-model="item.email" placeholder="邮箱地址" allow-clear />
                  </a-form-item>
                  <a-form-item label="微信账号">
                    <a-input v-model="item.wechat" placeholder="微信账号" allow-clear />
                  </a-form-item>
                </a-form>
              </div>
              <a-button
                type="dashed"
                long
                class="component-form-extended-member-card-add"
                aria-label="添加成员卡片"
                @click="addMemberCardItem"
              >
                <template #icon><icon-plus /></template>
              </a-button>
            </div>
          </a-card>
        </div>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">级联联动</div>
            <a-form layout="vertical">
              <a-row :gutter="32">
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="所属大区 / 城市">
                    <a-cascader
                      v-model="linkForm.regionCity"
                      :options="regionOptions"
                      placeholder="请选择大区 / 城市"
                      path-mode
                      allow-clear
                      @change="onRegionCityChange"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="城市区（联动）">
                    <a-select
                      v-model="linkForm.district"
                      :options="districtOptions"
                      placeholder="请先选择城市"
                      :disabled="!districtOptions.length"
                      allow-clear
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              <p class="component-form-hint">
                左侧级联选择大区与城市后，右侧城市区下拉会同步可选范围；切换城市时若原区县不在新列表中将自动清空。
              </p>
            </a-form>
          </a-card>
        </div>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">穿梭框</div>
            <a-transfer
              class="component-form-extended-transfer"
              :data="transferData"
              v-model="transferValue"
              :title="transferTitles"
            />
          </a-card>
        </div>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'component/form-extended',
    title: ArcoProLocale.menu['menu.component.formExtended'] || '扩展表单',
    pageComponent: FormExtendedPage,
  })
})()
