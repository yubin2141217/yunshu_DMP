;(function () {
  const defaultForm = () => ({
    text: 'www.VibePM.net',
    password: '******',
    number: 1280,
    tags: ['运营', '投放'],
    frameRate: '',
    keyword: '',
    rangeStart: '',
    rangeEnd: '',
    areaCode: '',
    phone: '',
    username: '',
    select: undefined,
    multi: [],
    cascader: [],
    treeSelect: [],
    brand: '',
    category: '',
    radio: 'high',
    radioButton: 'medium',
    checkbox: ['text', 'video'],
    pillRadio: '1',
    pillCheck: ['1'],
    segment: '1',
    enabled: false,
    enabledText: true,
    date: undefined,
    dateRange: [],
    time: undefined,
    timeRange: [],
    dateTime: undefined,
    dateTimeRange: [],
    rate: 4,
    rateText: 4,
    slider: 60,
    marker: '#14C9C9',
    color: '#165DFF',
    remark: '',
    mention: '',
    autocomplete: '',
    verifyCode: '',
    disabledName: '只读账号（不可编辑）',
    disabledChannel: 'online',
    disabledDate: '2024-06-15',
    disabledRadio: 'high',
    disabledCheckbox: ['text', 'video'],
    fileList: [],
    dragFileList: [],
    btnFileList: [
      {
        uid: '-1',
        name: '投放预算表.xlsx',
        status: 'done',
      },
      {
        uid: '-2',
        name: '活动明细.csv',
        status: 'done',
      },
      {
        uid: '-3',
        name: '渠道周报.docx',
        status: 'done',
      },
    ],
  })

  const defaultValidate = () => ({
    account: '',
    email: '',
    channel: undefined,
    period: [],
  })

  const FormComponentPage = {
    name: 'FormComponentPage',
    data() {
      return {
        form: defaultForm(),
        validateForm: defaultValidate(),
        layoutForm: {
          name: '投放计划 A',
          channel: 'online',
          remark: '',
        },
        layoutFormVertical: {
          name: '投放计划 A',
          channel: 'online',
          remark: '',
        },
        inlineForm: {
          keyword: '',
          status: 'running',
        },
        statusOptions: [
          { label: '投放中', value: 'running' },
          { label: '已暂停', value: 'paused' },
          { label: '已结束', value: 'ended' },
        ],
        errors: {
          account: '',
          email: '',
          channel: '',
          period: '',
        },
        selectOptions: [
          { label: '线上', value: 'online' },
          { label: '线下', value: 'offline' },
          { label: '混合', value: 'hybrid' },
        ],
        platformOptions: [
          { label: '抖音', value: 'douyin' },
          { label: '快手', value: 'kuaishou' },
          { label: '小红书', value: 'xiaohongshu' },
          { label: 'B 站', value: 'bilibili' },
        ],
        mentionData: ['运营', '投放', '设计', '研发', '产品'],
        autocompleteData: [
          '华东投放计划',
          '华南品牌活动',
          '华北拉新专项',
          '全国大促预热',
          '私域转化实验',
        ],
        regionOptions: [
          {
            label: '华东',
            value: 'east',
            children: [
              {
                label: '上海',
                value: 'shanghai',
                children: [
                  { label: '黄浦区', value: 'huangpu' },
                  { label: '徐汇区', value: 'xuhui' },
                  { label: '浦东新区', value: 'pudong' },
                  { label: '静安区', value: 'jingan' },
                  { label: '闵行区', value: 'minhang' },
                ],
              },
              {
                label: '浙江',
                value: 'zhejiang',
                children: [
                  { label: '杭州', value: 'hangzhou' },
                  { label: '宁波', value: 'ningbo' },
                  { label: '温州', value: 'wenzhou' },
                  { label: '嘉兴', value: 'jiaxing' },
                  { label: '金华', value: 'jinhua' },
                ],
              },
              {
                label: '江苏',
                value: 'jiangsu',
                children: [
                  { label: '南京', value: 'nanjing' },
                  { label: '苏州', value: 'suzhou' },
                  { label: '无锡', value: 'wuxi' },
                  { label: '常州', value: 'changzhou' },
                  { label: '南通', value: 'nantong' },
                ],
              },
              {
                label: '安徽',
                value: 'anhui',
                children: [
                  { label: '合肥', value: 'hefei' },
                  { label: '芜湖', value: 'wuhu' },
                  { label: '蚌埠', value: 'bengbu' },
                ],
              },
              {
                label: '山东',
                value: 'shandong',
                children: [
                  { label: '济南', value: 'jinan' },
                  { label: '青岛', value: 'qingdao' },
                  { label: '烟台', value: 'yantai' },
                  { label: '潍坊', value: 'weifang' },
                ],
              },
              {
                label: '福建',
                value: 'fujian',
                children: [
                  { label: '福州', value: 'fuzhou' },
                  { label: '厦门', value: 'xiamen' },
                  { label: '泉州', value: 'quanzhou' },
                ],
              },
            ],
          },
          {
            label: '华南',
            value: 'south',
            children: [
              {
                label: '广东',
                value: 'guangdong',
                children: [
                  { label: '广州', value: 'guangzhou' },
                  { label: '深圳', value: 'shenzhen' },
                  { label: '珠海', value: 'zhuhai' },
                  { label: '佛山', value: 'foshan' },
                  { label: '东莞', value: 'dongguan' },
                  { label: '惠州', value: 'huizhou' },
                ],
              },
              {
                label: '广西',
                value: 'guangxi',
                children: [
                  { label: '南宁', value: 'nanning' },
                  { label: '桂林', value: 'guilin' },
                  { label: '柳州', value: 'liuzhou' },
                ],
              },
              {
                label: '海南',
                value: 'hainan',
                children: [
                  { label: '海口', value: 'haikou' },
                  { label: '三亚', value: 'sanya' },
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
                children: [
                  { label: '朝阳区', value: 'chaoyang' },
                  { label: '海淀区', value: 'haidian' },
                  { label: '东城区', value: 'dongcheng' },
                  { label: '西城区', value: 'xicheng' },
                  { label: '丰台区', value: 'fengtai' },
                ],
              },
              {
                label: '天津',
                value: 'tianjin',
                children: [
                  { label: '和平区', value: 'heping' },
                  { label: '河西区', value: 'hexi' },
                  { label: '南开区', value: 'nankai' },
                ],
              },
              {
                label: '河北',
                value: 'hebei',
                children: [
                  { label: '石家庄', value: 'shijiazhuang' },
                  { label: '唐山', value: 'tangshan' },
                  { label: '保定', value: 'baoding' },
                ],
              },
              {
                label: '山西',
                value: 'shanxi',
                children: [
                  { label: '太原', value: 'taiyuan' },
                  { label: '大同', value: 'datong' },
                ],
              },
            ],
          },
          {
            label: '华中',
            value: 'central',
            children: [
              {
                label: '湖北',
                value: 'hubei',
                children: [
                  { label: '武汉', value: 'wuhan' },
                  { label: '宜昌', value: 'yichang' },
                  { label: '襄阳', value: 'xiangyang' },
                ],
              },
              {
                label: '湖南',
                value: 'hunan',
                children: [
                  { label: '长沙', value: 'changsha' },
                  { label: '株洲', value: 'zhuzhou' },
                  { label: '岳阳', value: 'yueyang' },
                ],
              },
              {
                label: '河南',
                value: 'henan',
                children: [
                  { label: '郑州', value: 'zhengzhou' },
                  { label: '洛阳', value: 'luoyang' },
                  { label: '开封', value: 'kaifeng' },
                ],
              },
              {
                label: '江西',
                value: 'jiangxi',
                children: [
                  { label: '南昌', value: 'nanchang' },
                  { label: '赣州', value: 'ganzhou' },
                  { label: '九江', value: 'jiujiang' },
                ],
              },
            ],
          },
          {
            label: '西南',
            value: 'southwest',
            children: [
              {
                label: '四川',
                value: 'sichuan',
                children: [
                  { label: '成都', value: 'chengdu' },
                  { label: '绵阳', value: 'mianyang' },
                  { label: '宜宾', value: 'yibin' },
                ],
              },
              {
                label: '重庆',
                value: 'chongqing',
                children: [
                  { label: '渝中区', value: 'yuzhong' },
                  { label: '江北区', value: 'jiangbei' },
                  { label: '渝北区', value: 'yubei' },
                ],
              },
              {
                label: '云南',
                value: 'yunnan',
                children: [
                  { label: '昆明', value: 'kunming' },
                  { label: '大理', value: 'dali' },
                  { label: '丽江', value: 'lijiang' },
                ],
              },
              {
                label: '贵州',
                value: 'guizhou',
                children: [
                  { label: '贵阳', value: 'guiyang' },
                  { label: '遵义', value: 'zunyi' },
                ],
              },
            ],
          },
          {
            label: '西北',
            value: 'northwest',
            children: [
              {
                label: '陕西',
                value: 'shaanxi',
                children: [
                  { label: '西安', value: 'xian' },
                  { label: '咸阳', value: 'xianyang' },
                  { label: '宝鸡', value: 'baoji' },
                ],
              },
              {
                label: '甘肃',
                value: 'gansu',
                children: [
                  { label: '兰州', value: 'lanzhou' },
                  { label: '天水', value: 'tianshui' },
                ],
              },
              {
                label: '新疆',
                value: 'xinjiang',
                children: [
                  { label: '乌鲁木齐', value: 'urumqi' },
                  { label: '喀什', value: 'kashi' },
                ],
              },
            ],
          },
          {
            label: '东北',
            value: 'northeast',
            children: [
              {
                label: '辽宁',
                value: 'liaoning',
                children: [
                  { label: '沈阳', value: 'shenyang' },
                  { label: '大连', value: 'dalian' },
                  { label: '鞍山', value: 'anshan' },
                ],
              },
              {
                label: '吉林',
                value: 'jilin',
                children: [
                  { label: '长春', value: 'changchun' },
                  { label: '吉林市', value: 'jilin-city' },
                ],
              },
              {
                label: '黑龙江',
                value: 'heilongjiang',
                children: [
                  { label: '哈尔滨', value: 'harbin' },
                  { label: '大庆', value: 'daqing' },
                  { label: '齐齐哈尔', value: 'qiqihar' },
                ],
              },
            ],
          },
        ],
        treeSelectData: [
          {
            title: '分组一',
            key: 'group1',
            children: [
              {
                title: '子分组一',
                key: 'group1-sub',
                children: [
                  { title: '选择项一', key: 'group1-opt1' },
                  { title: '选择项二', key: 'group1-opt2' },
                ],
              },
            ],
          },
          {
            title: '分组二',
            key: 'group2',
            children: [
              {
                title: '子集菜单一',
                key: 'group2-sub',
                children: [
                  { title: '选择项一', key: 'group2-opt1' },
                  { title: '选择项二', key: 'group2-opt2' },
                ],
              },
            ],
          },
        ],
        brandOpen: false,
        brandLetter: 'all',
        brandLetters: ['all', '#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'W', 'X', 'Y', 'Z'],
        brandOptions: [
          { name: '阿玛尼', letter: 'A' },
          { name: '爱登堡', letter: 'A' },
          { name: '阿尼三', letter: 'A' },
          { name: '爱肯', letter: 'A' },
          { name: '奥帝伦', letter: 'A' },
          { name: '安踏', letter: 'A' },
          { name: '阿迪达斯', letter: 'A' },
          { name: '艾莱依', letter: 'A' },
          { name: '奥康', letter: 'A' },
          { name: '艾格', letter: 'A' },
          { name: '百丽', letter: 'B' },
          { name: '波司登', letter: 'B' },
          { name: '彪马', letter: 'B' },
          { name: '班尼路', letter: 'B' },
          { name: '报喜鸟', letter: 'B' },
          { name: 'Chanel', letter: 'C' },
          { name: 'CK', letter: 'C' },
          { name: '森马', letter: 'S' },
          { name: '七匹狼', letter: '#' },
          { name: '361度', letter: '#' },
          { name: '优衣库', letter: 'Y' },
          { name: '雅戈尔', letter: 'Y' },
          { name: '李宁', letter: 'L' },
          { name: '耐克', letter: 'N' },
          { name: '太平鸟', letter: 'T' },
          { name: '特步', letter: 'T' },
          { name: '周大福', letter: 'Z' },
          { name: '周生生', letter: 'Z' },
        ],
        categoryOpen: false,
        categoryL1: 'bags',
        categoryTree: [
          {
            key: 'bags',
            label: '箱包/鞋靴',
            groups: [
              {
                title: '女包',
                items: ['真皮包', '手提包', '小方包', '贝壳包', '单肩包', '斜挎包', '晚宴包', '化妆包'],
              },
              {
                title: '男包',
                items: ['公文包', '电脑包', '商务包', '手拿包', '腰包', '胸包'],
              },
              {
                title: '双肩包',
                items: ['休闲双肩包', '电脑双肩包', '旅行双肩包', '儿童双肩包'],
              },
              {
                title: '旅行箱',
                items: ['拉杆箱', '登机箱', '万向轮箱', '铝框箱', '布箱'],
              },
            ],
          },
          {
            key: 'apparel',
            label: '女装/男装',
            groups: [
              {
                title: '女装',
                items: ['连衣裙', 'T恤', '衬衫', '外套', '半身裙', '牛仔裤'],
              },
              {
                title: '男装',
                items: ['夹克', '衬衫', '西裤', '卫衣', 'polo衫', '休闲裤'],
              },
            ],
          },
          {
            key: 'digital',
            label: '家电/数码',
            groups: [
              {
                title: '大家电',
                items: ['冰箱', '洗衣机', '空调', '电视'],
              },
              {
                title: '数码',
                items: ['手机', '平板', '笔记本', '耳机', '相机'],
              },
            ],
          },
          {
            key: 'beauty',
            label: '美妆/洗护',
            groups: [
              {
                title: '护肤',
                items: ['洁面', '精华', '面霜', '面膜'],
              },
              {
                title: '彩妆',
                items: ['口红', '粉底', '眼影', '眉笔'],
              },
            ],
          },
          {
            key: 'sports',
            label: '运动/户外',
            groups: [
              {
                title: '运动服',
                items: ['运动套装', '跑步鞋', '瑜伽服'],
              },
              {
                title: '户外',
                items: ['冲锋衣', '登山包', '帐篷'],
              },
            ],
          },
        ],
        radioOptions: [
          { label: '高', value: 'high' },
          { label: '中', value: 'medium' },
          { label: '低', value: 'low' },
        ],
        checkboxOptions: [
          { label: '图文', value: 'text' },
          { label: '视频', value: 'video' },
          { label: '直播', value: 'live' },
          { label: '互动 H5', value: 'h5' },
        ],
        pillRadioOptions: [
          { label: '单选项一', value: '1' },
          { label: '单选项二', value: '2' },
          { label: '单选项三', value: '3' },
          { label: '单选项四', value: '4' },
        ],
        pillCheckOptions: [
          { label: '复选项一', value: '1' },
          { label: '复选项二', value: '2' },
          { label: '复选项三', value: '3' },
          { label: '复选项四', value: '4' },
        ],
        segmentOptions: [
          { label: '选项一', value: '1' },
          { label: '选项二', value: '2' },
          { label: '选项三', value: '3' },
          { label: '选项四', value: '4' },
        ],
        markerOptions: [
          '#14C9C9',
          '#F7BA1E',
          '#3491FA',
          '#00B42A',
          '#F5319D',
          '#F77234',
          '#722ED1',
        ],
      }
    },
    computed: {
      filteredBrands() {
        const letter = this.brandLetter
        if (letter === 'all') return this.brandOptions
        return this.brandOptions.filter((b) => b.letter === letter)
      },
      activeCategoryNode() {
        return this.categoryTree.find((n) => n.key === this.categoryL1) || this.categoryTree[0]
      },
      rateTextLabel() {
        const v = Number(this.form.rateText) || 0
        if (v <= 0) return '未评分'
        if (v <= 1) return '极差'
        if (v <= 2) return '失望'
        if (v <= 3) return '一般'
        if (v <= 4) return '满意'
        return '惊喜'
      },
    },
    methods: {
      onFileChange(fileList) {
        this.form.fileList = fileList
      },
      onDragFileChange(fileList) {
        this.form.dragFileList = fileList
      },
      onBtnFileChange(fileList) {
        this.form.btnFileList = fileList
      },
      beforeBtnUpload(file) {
        const raw = file && (file.file || file)
        const name = (raw && raw.name) || (file && file.name) || ''
        const size = (raw && raw.size) || (file && file.size) || 0
        if (!/\.(jpe?g|png|pdf|xlsx|docx)$/i.test(name)) {
          ArcoVue.Message.warning('文件格式不符合要求，仅支持 jpg、png、pdf、xlsx、docx')
          return false
        }
        if (size > 10 * 1024 * 1024) {
          ArcoVue.Message.warning('文件过大，单文件不能超过 10MB')
          return false
        }
        return true
      },
      beforeDragUpload(file) {
        const raw = file && (file.file || file)
        const name = (raw && raw.name) || (file && file.name) || ''
        const size = (raw && raw.size) || (file && file.size) || 0
        if (!/\.(xlsx|xls|csv)$/i.test(name)) {
          ArcoVue.Message.warning('文件格式不符合要求，仅支持 Excel / CSV（.xlsx、.xls、.csv）')
          return false
        }
        if (size > 10 * 1024 * 1024) {
          ArcoVue.Message.warning('文件过大，单文件不能超过 10MB')
          return false
        }
        return true
      },
      beforeImageUpload(file) {
        const raw = file && (file.file || file)
        const name = (raw && raw.name) || (file && file.name) || ''
        const type = (raw && raw.type) || (file && file.type) || ''
        const isImage = /^image\//.test(type) || /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(name)
        if (!isImage) {
          ArcoVue.Message.warning('文件格式不符合要求，仅支持图片文件')
          return false
        }
        return true
      },
      brandLetterLabel(letter) {
        return letter === 'all' ? '全部' : letter
      },
      selectBrand(name) {
        this.form.brand = name
        this.brandOpen = false
      },
      clearBrand(e) {
        if (e) {
          e.preventDefault()
          e.stopPropagation()
        }
        this.form.brand = ''
        this.brandOpen = false
      },
      selectCategory(name) {
        this.form.category = name
        this.categoryOpen = false
      },
      clearCategory(e) {
        if (e) {
          e.preventDefault()
          e.stopPropagation()
        }
        this.form.category = ''
        this.categoryOpen = false
      },
      onBrandVisible(visible) {
        this.brandOpen = visible
      },
      onCategoryVisible(visible) {
        this.categoryOpen = visible
      },
      isPillChecked(value) {
        return this.form.pillCheck.indexOf(value) >= 0
      },
      togglePillCheck(value) {
        const list = this.form.pillCheck
        const i = list.indexOf(value)
        if (i >= 0) list.splice(i, 1)
        else list.push(value)
      },
      fieldStatus(key) {
        return this.errors[key] ? 'error' : undefined
      },
      validateField(key) {
        const v = this.validateForm
        if (key === 'account') {
          this.errors.account = v.account.trim() ? '' : '请输入账号名称'
        } else if (key === 'email') {
          if (!v.email.trim()) this.errors.email = '请输入邮箱地址'
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) this.errors.email = '邮箱格式不正确'
          else this.errors.email = ''
        } else if (key === 'channel') {
          this.errors.channel = v.channel ? '' : '请选择投放渠道'
        } else if (key === 'period') {
          this.errors.period = v.period && v.period.length === 2 ? '' : '请选择有效期'
        }
        return !this.errors[key]
      },
      validateAll() {
        const keys = ['account', 'email', 'channel', 'period']
        const ok = keys.map((k) => this.validateField(k)).every(Boolean)
        if (ok) ArcoVue.Message.success('校验通过')
        else ArcoVue.Message.error('请完善标红字段')
        return ok
      },
      clearValidate() {
        this.validateForm = defaultValidate()
        this.errors = { account: '', email: '', channel: '', period: '' }
      },
      submitInline() {
        ArcoVue.Message.success('已提交筛选条件')
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
          本页展示常用表单控件用法，业务场景请参考「表单页面」下的分组表单 / 分步表单。
        </a-alert>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">输入类</div>
            <a-form layout="vertical">
              <a-row :gutter="32">
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="文本输入 Input">
                    <a-input v-model="form.text" placeholder="请输入" allow-clear />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="密码输入 InputPassword">
                    <a-input-password v-model="form.password" placeholder="请输入密码" allow-clear />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="数字输入 InputNumber">
                    <a-input-number
                      v-model="form.number"
                      :min="0"
                      :max="999999"
                      :step="10"
                      class="pro-field-block"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="标签输入 InputTag">
                    <a-input-tag v-model="form.tags" placeholder="回车添加标签" allow-clear />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="单位后缀 Append">
                    <a-input
                      v-model="form.frameRate"
                      placeholder="请输入金额"
                      allow-clear
                      append="元"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="搜索输入 Search">
                    <a-input
                      v-model="form.keyword"
                      placeholder="输入搜索关键词"
                      allow-clear
                    >
                      <template #suffix>
                        <icon-search />
                      </template>
                    </a-input>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="前缀图标 Prefix">
                    <a-input v-model="form.username" placeholder="输入用户名称" allow-clear>
                      <template #prefix>
                        <icon-avatar-user />
                      </template>
                    </a-input>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="数值范围 Range">
                    <a-input-group class="component-form-range">
                      <a-input v-model="form.rangeStart" placeholder="开始数值" allow-clear />
                      <span class="component-form-range-sep">~</span>
                      <a-input v-model="form.rangeEnd" placeholder="结束数值" allow-clear />
                    </a-input-group>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="电话组合 InputGroup">
                    <a-input-group class="component-form-phone">
                      <a-input
                        v-model="form.areaCode"
                        class="component-form-phone-code"
                        placeholder="区号"
                        allow-clear
                      />
                      <a-input
                        v-model="form.phone"
                        class="component-form-phone-number"
                        placeholder="电话号码"
                        allow-clear
                      />
                    </a-input-group>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="提及 Mention">
                    <a-mention
                      v-model="form.mention"
                      :data="mentionData"
                      placeholder="输入 @ 选择协作人"
                      allow-clear
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="自动完成 AutoComplete">
                    <a-auto-complete
                      v-model="form.autocomplete"
                      :data="autocompleteData"
                      placeholder="输入计划关键词"
                      allow-clear
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="验证码 VerificationCode">
                    <a-verification-code v-model="form.verifyCode" :length="6" />
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item label="多行文本 Textarea">
                    <a-textarea
                      v-model="form.remark"
                      placeholder="请输入备注"
                      :auto-size="{ minRows: 3, maxRows: 6 }"
                      :max-length="200"
                      show-word-limit
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
        </div>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">选择类</div>
            <a-form layout="vertical">
              <a-row :gutter="32">
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="单选下拉 Select">
                    <a-select
                      v-model="form.select"
                      :options="selectOptions"
                      placeholder="请选择"
                      allow-clear
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="多选下拉 Select Multiple">
                    <a-select
                      v-model="form.multi"
                      multiple
                      :max-tag-count="2"
                      :options="platformOptions"
                      placeholder="请选择"
                      allow-clear
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="级联选择 Cascader">
                    <a-cascader
                      v-model="form.cascader"
                      :options="regionOptions"
                      path-mode
                      allow-clear
                      placeholder="请选择"
                      class="pro-field-block"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="树选择 TreeSelect">
                    <a-tree-select
                      v-model="form.treeSelect"
                      :data="treeSelectData"
                      :tree-props="{ defaultExpandAll: true, blockNode: true }"
                      tree-checkable
                      allow-clear
                      placeholder="选择选项"
                      dropdown-class-name="component-form-tree-select"
                      class="pro-field-block"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="品牌选择器 Brand">
                    <a-trigger
                      trigger="click"
                      position="bl"
                      :popup-visible="brandOpen"
                      :popup-translate="[0, 4]"
                      unmount-on-close
                      @popup-visible-change="onBrandVisible"
                    >
                      <div
                        class="component-form-picker"
                        :class="{ 'is-open': brandOpen, 'has-value': !!form.brand }"
                      >
                        <span
                          class="component-form-picker-value"
                          :class="{ 'is-placeholder': !form.brand }"
                        >{{ form.brand || '请选择品牌' }}</span>
                        <span
                          v-if="form.brand"
                          class="arco-icon-hover component-form-picker-clear"
                          role="button"
                          aria-label="清除"
                          @click="clearBrand"
                        >
                          <icon-close :size="10" />
                        </span>
                        <icon-down class="component-form-picker-arrow" :class="{ 'is-up': brandOpen }" />
                      </div>
                      <template #content>
                        <div class="component-form-brand-panel" @click.stop>
                          <div class="component-form-brand-letters">
                            <button
                              v-for="letter in brandLetters"
                              :key="'bl-' + letter"
                              type="button"
                              class="component-form-brand-letter"
                              :class="{ 'is-active': brandLetter === letter }"
                              @click="brandLetter = letter"
                            >{{ brandLetterLabel(letter) }}</button>
                          </div>
                          <div class="component-form-brand-grid">
                            <button
                              v-for="item in filteredBrands"
                              :key="'brand-' + item.name"
                              type="button"
                              class="component-form-brand-item"
                              :class="{ 'is-active': form.brand === item.name }"
                              @click="selectBrand(item.name)"
                            >{{ item.name }}</button>
                            <div v-if="!filteredBrands.length" class="component-form-picker-empty">暂无品牌</div>
                          </div>
                        </div>
                      </template>
                    </a-trigger>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="分类选择器 Category">
                    <a-trigger
                      trigger="click"
                      position="bl"
                      :popup-visible="categoryOpen"
                      :popup-translate="[0, 4]"
                      unmount-on-close
                      @popup-visible-change="onCategoryVisible"
                    >
                      <div
                        class="component-form-picker"
                        :class="{ 'is-open': categoryOpen, 'has-value': !!form.category }"
                      >
                        <span
                          class="component-form-picker-value"
                          :class="{ 'is-placeholder': !form.category }"
                        >{{ form.category || '请选择分类' }}</span>
                        <span
                          v-if="form.category"
                          class="arco-icon-hover component-form-picker-clear"
                          role="button"
                          aria-label="清除"
                          @click="clearCategory"
                        >
                          <icon-close :size="10" />
                        </span>
                        <icon-down class="component-form-picker-arrow" :class="{ 'is-up': categoryOpen }" />
                      </div>
                      <template #content>
                        <div class="component-form-category-panel" @click.stop>
                          <div class="component-form-category-side">
                            <button
                              v-for="node in categoryTree"
                              :key="'cat-l1-' + node.key"
                              type="button"
                              class="component-form-category-l1"
                              :class="{ 'is-active': categoryL1 === node.key }"
                              @click="categoryL1 = node.key"
                            >{{ node.label }}</button>
                          </div>
                          <div class="component-form-category-main">
                            <div
                              v-for="group in activeCategoryNode.groups"
                              :key="'cat-g-' + group.title"
                              class="component-form-category-row"
                            >
                              <div class="component-form-category-l2">{{ group.title }}</div>
                              <div class="component-form-category-items">
                                <button
                                  v-for="item in group.items"
                                  :key="'cat-i-' + group.title + '-' + item"
                                  type="button"
                                  class="component-form-category-item"
                                  :class="{ 'is-active': form.category === item }"
                                  @click="selectCategory(item)"
                                >{{ item }}</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                    </a-trigger>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="单选 Radio">
                    <a-radio-group v-model="form.radio" :options="radioOptions" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="多选 Checkbox">
                    <a-checkbox-group v-model="form.checkbox" :options="checkboxOptions" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="按钮单选 Radio Button">
                    <a-radio-group v-model="form.radioButton" type="button" :options="radioOptions" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="胶囊单选 Pill Radio">
                    <div class="component-form-pills">
                      <button
                        v-for="opt in pillRadioOptions"
                        :key="'pr-' + opt.value"
                        type="button"
                        class="component-form-pill"
                        :class="{ 'is-active': form.pillRadio === opt.value }"
                        @click="form.pillRadio = opt.value"
                      >{{ opt.label }}</button>
                    </div>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="胶囊多选 Pill Checkbox">
                    <div class="component-form-pills">
                      <button
                        v-for="opt in pillCheckOptions"
                        :key="'pc-' + opt.value"
                        type="button"
                        class="component-form-pill"
                        :class="{ 'is-active': isPillChecked(opt.value) }"
                        @click="togglePillCheck(opt.value)"
                      >{{ opt.label }}</button>
                    </div>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="分段选择 Segmented">
                    <div class="component-form-segment">
                      <button
                        v-for="opt in segmentOptions"
                        :key="'sg-' + opt.value"
                        type="button"
                        class="component-form-segment-item"
                        :class="{ 'is-active': form.segment === opt.value }"
                        @click="form.segment = opt.value"
                      >{{ opt.label }}</button>
                    </div>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
        </div>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">日期与时间</div>
            <a-form layout="vertical">
              <a-row :gutter="32">
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="日期选择 DatePicker">
                    <a-date-picker
                      v-model="form.date"
                      format="YYYY-MM-DD"
                      class="pro-field-block"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="日期范围 RangePicker">
                    <a-range-picker
                      v-model="form.dateRange"
                      format="YYYY-MM-DD"
                      class="pro-field-block"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="时间选择 TimePicker">
                    <a-time-picker
                      v-model="form.time"
                      format="HH:mm:ss"
                      class="pro-field-block"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="时间范围 TimeRange">
                    <a-time-picker
                      v-model="form.timeRange"
                      type="time-range"
                      format="HH:mm"
                      class="pro-field-block"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="日期和时间 DateTime">
                    <a-date-picker
                      v-model="form.dateTime"
                      show-time
                      format="YYYY-MM-DD HH:mm"
                      class="pro-field-block"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="日期时间范围 DateTimeRange">
                    <a-range-picker
                      v-model="form.dateTimeRange"
                      show-time
                      format="YYYY-MM-DD HH:mm:ss"
                      separator="~"
                      class="pro-field-block"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
        </div>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">其它组件</div>
            <a-form layout="vertical">
              <a-row :gutter="32">
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="评分 Rate">
                    <a-rate class="component-form-rate" v-model="form.rate" allow-half allow-clear />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="评分（带文字）">
                    <div class="component-form-rate-with-text">
                      <a-rate class="component-form-rate" v-model="form.rateText" allow-half allow-clear />
                      <span class="component-form-rate-label">{{ rateTextLabel }}</span>
                    </div>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="开关 Switch">
                    <a-space size="16">
                      <a-switch v-model="form.enabled" />
                      <a-switch
                        v-model="form.enabledText"
                        checked-text="开"
                        unchecked-text="关"
                      />
                    </a-space>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item :label="'滑块 Slider：' + form.slider">
                    <a-slider v-model="form.slider" :min="0" :max="100" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="标记选择器 Marker">
                    <div class="component-form-markers">
                      <button
                        v-for="color in markerOptions"
                        :key="'mk-' + color"
                        type="button"
                        class="component-form-marker"
                        :class="{ 'is-active': form.marker === color }"
                        :style="{ backgroundColor: color }"
                        :aria-label="color"
                        @click="form.marker = color"
                      >
                        <span v-if="form.marker === color" class="component-form-marker-check">✓</span>
                      </button>
                    </div>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="颜色选择器 ColorPicker">
                    <a-color-picker v-model="form.color" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
        </div>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">上传</div>
            <a-form layout="vertical">
              <a-row :gutter="32">
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="图片上传 Upload">
                    <a-upload
                      list-type="picture-card"
                      accept="image/*"
                      :limit="3"
                      :auto-upload="false"
                      :file-list="form.fileList"
                      @change="onFileChange"
                      @before-upload="beforeImageUpload"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="按钮上传 Button Upload">
                    <a-upload
                      class="component-form-btn-upload"
                      list-type="text"
                      accept=".jpg,.jpeg,.png,.pdf,.xlsx,.docx"
                      :auto-upload="false"
                      :limit="5"
                      :file-list="form.btnFileList"
                      @change="onBtnFileChange"
                      @before-upload="beforeBtnUpload"
                    >
                      <template #upload-button>
                        <div class="component-form-btn-upload-trigger">
                          <a-button>+ 上传文件</a-button>
                          <div class="component-form-upload-tip" @click.stop.prevent>
                            <icon-info-circle :size="14" />
                            <span>支持 jpg、png、pdf、xlsx、docx，单文件不超过 10MB</span>
                          </div>
                        </div>
                      </template>
                    </a-upload>
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="拖拽上传 Drag Upload">
                    <a-upload
                      class="pro-io-upload"
                      draggable
                      accept=".xlsx,.xls,.csv"
                      :auto-upload="false"
                      :limit="1"
                      :file-list="form.dragFileList"
                      @change="onDragFileChange"
                      @before-upload="beforeDragUpload"
                    >
                      <template #upload-button>
                        <div class="pro-upload-drag">
                          <div class="pro-upload-drag-icon"><icon-upload /></div>
                          <div class="pro-upload-drag-text">点击或拖拽文件到此处</div>
                          <div class="pro-upload-drag-hint">仅支持 Excel / CSV 文件，单文件不超过 10MB</div>
                        </div>
                      </template>
                    </a-upload>
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
        </div>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">禁用状态</div>
            <a-form layout="vertical">
              <a-row :gutter="32">
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="禁用输入 Input">
                    <a-input v-model="form.disabledName" disabled />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="禁用下拉 Select">
                    <a-select
                      v-model="form.disabledChannel"
                      :options="selectOptions"
                      disabled
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="禁用日期选择 DatePicker">
                    <a-date-picker
                      v-model="form.disabledDate"
                      format="YYYY-MM-DD"
                      class="pro-field-block"
                      disabled
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="禁用单选 Radio">
                    <a-radio-group
                      v-model="form.disabledRadio"
                      :options="radioOptions"
                      disabled
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="禁用多选 Checkbox">
                    <a-checkbox-group
                      v-model="form.disabledCheckbox"
                      :options="checkboxOptions"
                      disabled
                    />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </a-card>
        </div>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">校验反馈</div>
            <a-alert type="warning" show-icon :closable="false" class="component-form-tip">
              失焦或点击「校验」时触发错误态：红描边、浅红底与下方提示文案。
            </a-alert>
            <a-form layout="vertical" class="component-form-validate">
              <a-row :gutter="32">
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item
                    label="账号名称"
                    required
                    asterisk-position="end"
                    :validate-status="fieldStatus('account')"
                    :help="errors.account || undefined"
                  >
                    <a-input
                      v-model="validateForm.account"
                      placeholder="请输入账号名称"
                      allow-clear
                      @blur="validateField('account')"
                      @clear="validateField('account')"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item
                    label="邮箱地址"
                    required
                    asterisk-position="end"
                    :validate-status="fieldStatus('email')"
                    :help="errors.email || undefined"
                  >
                    <a-input
                      v-model="validateForm.email"
                      placeholder="name@example.com"
                      allow-clear
                      @blur="validateField('email')"
                      @clear="validateField('email')"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item
                    label="投放渠道"
                    required
                    asterisk-position="end"
                    :validate-status="fieldStatus('channel')"
                    :help="errors.channel || undefined"
                  >
                    <a-select
                      v-model="validateForm.channel"
                      :options="selectOptions"
                      placeholder="请选择投放渠道"
                      allow-clear
                      @change="validateField('channel')"
                      @clear="validateField('channel')"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item
                    label="有效期"
                    required
                    asterisk-position="end"
                    :validate-status="fieldStatus('period')"
                    :help="errors.period || undefined"
                  >
                    <a-range-picker
                      v-model="validateForm.period"
                      class="pro-field-block"
                      @change="validateField('period')"
                      @clear="validateField('period')"
                    />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="静态错误态（仅样式）" validate-status="error" help="这是固定展示的错误提示">
                    <a-input error model-value="错误示例内容" allow-clear />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12" :md="8">
                  <a-form-item label="下拉错误态（仅样式）" validate-status="error" help="请重新选择选项">
                    <a-select placeholder="请选择" :options="selectOptions" />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-space>
                <a-button type="primary" status="danger" @click="validateAll">校验</a-button>
                <a-button @click="clearValidate">清空校验</a-button>
              </a-space>
            </a-form>
          </a-card>
        </div>

        <div class="component-form-group">
          <a-card class="pro-page-card component-form-card">
            <div class="component-form-group-title">表单布局</div>
            <div class="component-form-layout-grid">
              <div class="component-form-layout-block">
                <div class="component-form-layout-label">水平 Horizontal</div>
                <a-form :model="layoutForm" layout="horizontal" auto-label-width>
                  <a-form-item label="计划名称" field="name">
                    <a-input v-model="layoutForm.name" placeholder="请输入计划名称" allow-clear />
                  </a-form-item>
                  <a-form-item label="投放渠道" field="channel">
                    <a-select
                      v-model="layoutForm.channel"
                      :options="selectOptions"
                      placeholder="请选择"
                      allow-clear
                    />
                  </a-form-item>
                  <a-form-item label="备注" field="remark">
                    <a-textarea
                      v-model="layoutForm.remark"
                      placeholder="请输入备注"
                      :auto-size="{ minRows: 2, maxRows: 4 }"
                    />
                  </a-form-item>
                </a-form>
              </div>
              <div class="component-form-layout-block">
                <div class="component-form-layout-label">垂直 Vertical</div>
                <a-form :model="layoutFormVertical" layout="vertical">
                  <a-form-item label="计划名称" field="name">
                    <a-input v-model="layoutFormVertical.name" placeholder="请输入计划名称" allow-clear />
                  </a-form-item>
                  <a-form-item label="投放渠道" field="channel">
                    <a-select
                      v-model="layoutFormVertical.channel"
                      :options="selectOptions"
                      placeholder="请选择"
                      allow-clear
                    />
                  </a-form-item>
                  <a-form-item label="备注" field="remark">
                    <a-textarea
                      v-model="layoutFormVertical.remark"
                      placeholder="请输入备注"
                      :auto-size="{ minRows: 2, maxRows: 4 }"
                    />
                  </a-form-item>
                </a-form>
              </div>
            </div>
            <div class="component-form-layout-label">行内 Inline</div>
            <a-form
              class="component-form-inline-form"
              :model="inlineForm"
              layout="inline"
            >
              <a-form-item label="关键词" field="keyword">
                <a-input v-model="inlineForm.keyword" placeholder="搜索计划" allow-clear />
              </a-form-item>
              <a-form-item label="状态" field="status">
                <a-select
                  v-model="inlineForm.status"
                  :options="statusOptions"
                  placeholder="请选择"
                  style="width: 140px"
                />
              </a-form-item>
              <a-form-item class="component-form-inline-actions" hide-label>
                <a-space>
                  <a-button type="primary" @click="submitInline">查询</a-button>
                  <a-button @click="inlineForm.keyword = ''; inlineForm.status = 'running'">
                    重置
                  </a-button>
                </a-space>
              </a-form-item>
            </a-form>
          </a-card>
        </div>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'component/form',
    title: ArcoProLocale.menu['menu.component.form'] || '表单组件',
    pageComponent: FormComponentPage,
  })
})()
