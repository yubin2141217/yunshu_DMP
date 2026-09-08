;(function () {
  const needColumns = [
    { title: '序号', dataIndex: 'no', width: 64 },
    { title: '数据名称', dataIndex: 'name', width: 160 },
    { title: '数据分类', dataIndex: 'category', width: 120 },
    { title: '是否必接', dataIndex: 'required', width: 96, slotName: 'required' },
    { title: '说明', dataIndex: 'desc', minWidth: 240 },
  ]
  const needRows = [
    { no: 1, name: '舆情文章主数据', category: '库表数据集', required: '必接', desc: '一条文章一条记录：供数方、归属机构、标题、区域、原文地址、内容时间等' },
    { no: 2, name: '供数方与机构对照', category: '库表数据集', required: '必接', desc: '供数方编码、机构标识须与中台已登记值一致，否则该条不入库' },
    { no: 3, name: '区域字典', category: '库表数据集', required: '建议', desc: '区域代码与名称对照；随主数据保存，本期界面不按区域切片' },
    { no: 4, name: '文章正文', category: '非结构化数据', required: '必接', desc: '原文正文；无正文时可空。本期两端不提供查阅' },
    { no: 5, name: '原文快照 / 附件', category: '非结构化数据', required: '可选', desc: '网页快照、配图、附件等，须回挂到主数据主键' },
    { no: 6, name: '文章推送', category: '接口数据', required: '必接', desc: '供数方调用中台接收接口（或按约定拉取），完成送数' },
    { no: 7, name: '入库回执', category: '接口数据', required: '建议', desc: '返回是否保存、是否计入该机构，供双方对账' },
  ]
  const categoryColumns = [
    { title: '分类', dataIndex: 'name', width: 140 },
    { title: '定义', dataIndex: 'def', minWidth: 200 },
    { title: '典型形态', dataIndex: 'form', width: 200 },
    { title: '在本中台中的用途', dataIndex: 'use', minWidth: 180 },
  ]
  const categoryRows = [
    { name: '库表数据集', def: '二维结构化记录，字段固定、可按行入库', form: '数据表、CSV/Excel、库到库同步', use: '文章主数据、字典、对照关系' },
    { name: '非结构化数据', def: '不以固定二维表表达的对象', form: '正文文本、HTML、PDF、图片、附件', use: '正文与快照，回挂主数据' },
    { name: '接口数据', def: '通过服务调用传输的实时或准实时报文', form: 'HTTPS + JSON（本期推荐）', use: '推送入库、回执、对账' },
  ]
  const metaColumns = [
    { title: '元数据项', dataIndex: 'item', width: 140 },
    { title: '必填', dataIndex: 'required', width: 72, slotName: 'required' },
    { title: '说明', dataIndex: 'desc', minWidth: 180 },
    { title: '示例', dataIndex: 'example', minWidth: 160 },
  ]
  const tableResourceMeta = [
    { item: '数据集中文名', required: '是', desc: '业务可读名称', example: '舆情文章主数据' },
    { item: '数据集编码', required: '是', desc: '全局唯一，建议 YSZT_T_ 前缀', example: 'YSZT_T_ARTICLE' },
    { item: '数据分类', required: '是', desc: '固定填「库表数据集」', example: '库表数据集' },
    { item: '主题', required: '是', desc: '本期为舆情', example: '舆情' },
    { item: '提供方', required: '是', desc: '供数方名称 + 编码', example: '清博智能 / QB001' },
    { item: '更新周期', required: '是', desc: '实时 / 小时 / 日 / 一次性', example: '实时' },
    { item: '主键', required: '是', desc: '供数方侧业务主键，用于回挂正文', example: 'article_id' },
    { item: '字符集', required: '是', desc: '推荐 UTF-8', example: 'UTF-8' },
    { item: '记录口径', required: '是', desc: '一行代表什么', example: '一条舆情原文' },
  ]
  const tableFieldColumns = [
    { title: '字段中文名', dataIndex: 'cn', width: 160 },
    { title: '字段英文名', dataIndex: 'en', width: 140 },
    { title: '类型', dataIndex: 'type', width: 120 },
    { title: '必填', dataIndex: 'required', width: 72, slotName: 'required' },
    { title: '说明', dataIndex: 'desc', minWidth: 200 },
  ]
  const tableFieldRows = [
    { cn: '供数方侧文章编号', en: 'article_id', type: 'string(64)', required: '是', desc: '供数方主键' },
    { cn: '供数方编码', en: 'supplier_code', type: 'string(32)', required: '是', desc: '对应中台供数方编码' },
    { cn: '归属机构标识', en: 'org_id', type: 'string(64)', required: '是', desc: '对应中台机构；一条只归属一个机构' },
    { cn: '区域代码', en: 'region_code', type: 'string(32)', required: '否', desc: '建议同时给区域名称' },
    { cn: '区域名称', en: 'region_name', type: 'string(64)', required: '否', desc: '' },
    { cn: '标题', en: 'title', type: 'string(512)', required: '否', desc: '空则记为「（无标题）」' },
    { cn: '原文地址', en: 'source_url', type: 'string(1024)', required: '否', desc: '' },
    { cn: '内容时间', en: 'content_time', type: 'datetime', required: '否', desc: 'yyyy-MM-dd HH:mm:ss' },
    { cn: '正文引用', en: 'content_ref', type: 'string(256)', required: '否', desc: '指向非结构化对象；正文随接口直传可空' },
  ]
  const fileResourceMeta = [
    { item: '资源中文名', required: '是', desc: '对象集合名称', example: '舆情文章正文' },
    { item: '资源编码', required: '是', desc: '建议 YSZT_U_ 前缀', example: 'YSZT_U_CONTENT' },
    { item: '数据分类', required: '是', desc: '固定填「非结构化数据」', example: '非结构化数据' },
    { item: '对象类型', required: '是', desc: '正文 / 快照 / 图片 / 附件', example: '正文' },
    { item: '允许格式', required: '是', desc: '扩展名或 MIME', example: 'txt、html' },
    { item: '大小上限', required: '是', desc: '单对象上限', example: '正文 2 MB；附件 20 MB' },
    { item: '编码', required: '是', desc: '文本类必填', example: 'UTF-8' },
    { item: '关联主键', required: '是', desc: '回挂库表哪条记录', example: 'article_id + supplier_code' },
    { item: '密级', required: '建议', desc: '按机构侧要求', example: '内部' },
  ]
  const fileInstanceColumns = [
    { title: '元数据项', dataIndex: 'item', width: 140 },
    { title: '必填', dataIndex: 'required', width: 72, slotName: 'required' },
    { title: '说明', dataIndex: 'desc', minWidth: 260 },
  ]
  const fileInstanceRows = [
    { item: '对象 ID', required: '是', desc: '供数方侧唯一' },
    { item: '文件名', required: '是', desc: '含扩展名' },
    { item: '格式', required: '是', desc: 'html / txt / pdf / jpg 等' },
    { item: '字节大小', required: '是', desc: '正整数' },
    { item: '校验值', required: '建议', desc: 'MD5 或 SHA-256' },
    { item: '关联文章编号', required: '是', desc: '必须落到库表主键；未挂主数据不计入机构统计' },
  ]
  const apiResourceMeta = [
    { item: '接口中文名', required: '是', desc: '业务可读名称', example: '舆情文章推送' },
    { item: '接口编码', required: '是', desc: '建议 YSZT_A_ 前缀', example: 'YSZT_A_ARTICLE_PUSH' },
    { item: '数据分类', required: '是', desc: '固定填「接口数据」', example: '接口数据' },
    { item: '调用方向', required: '是', desc: '供数方推送 / 中台拉取', example: '供数方推送' },
    { item: '协议', required: '是', desc: '本期 HTTPS + JSON', example: 'HTTPS' },
    { item: '方法与路径', required: '是', desc: '联调时下发正式地址', example: 'POST /api/v1/articles' },
    { item: '鉴权方式', required: '是', desc: 'Token / 签名', example: 'Header: Authorization' },
    { item: '幂等键', required: '是', desc: '本期重复送达仍分别计数，但须能识别', example: 'article_id + supplier_code' },
  ]
  const apiParamColumns = [
    { title: '参数中文名', dataIndex: 'cn', width: 140 },
    { title: '参数英文名', dataIndex: 'en', width: 140 },
    { title: '类型', dataIndex: 'type', width: 88 },
    { title: '必填', dataIndex: 'required', width: 72, slotName: 'required' },
    { title: '说明', dataIndex: 'desc', minWidth: 200 },
  ]
  const apiParamRows = [
    { cn: '供数方编码', en: 'supplierCode', type: 'string', required: '是', desc: '' },
    { cn: '归属机构标识', en: 'orgId', type: 'string', required: '是', desc: '一条只归属一个机构' },
    { cn: '文章编号', en: 'articleId', type: 'string', required: '是', desc: '供数方主键' },
    { cn: '标题', en: 'title', type: 'string', required: '否', desc: '' },
    { cn: '区域代码', en: 'regionCode', type: 'string', required: '否', desc: '' },
    { cn: '区域名称', en: 'regionName', type: 'string', required: '否', desc: '' },
    { cn: '原文地址', en: 'sourceUrl', type: 'string', required: '否', desc: '' },
    { cn: '内容时间', en: 'contentTime', type: 'string', required: '否', desc: 'yyyy-MM-dd HH:mm:ss' },
    { cn: '正文', en: 'content', type: 'string', required: '否', desc: '非结构化正文可直接放此字段' },
    { cn: '正文对象引用', en: 'contentRef', type: 'string', required: '否', desc: '已走文件通道时填写' },
  ]

  window.YunshuStandardPreviewDrawer = {
    name: 'YunshuStandardPreviewDrawer',
    props: {
      visible: { type: Boolean, default: false },
      fileName: { type: String, default: '' },
    },
    emits: ['cancel'],
    data() {
      return {
        needColumns,
        needRows,
        categoryColumns,
        categoryRows,
        metaColumns,
        tableResourceMeta,
        tableFieldColumns,
        tableFieldRows,
        fileResourceMeta,
        fileInstanceColumns,
        fileInstanceRows,
        apiResourceMeta,
        apiParamColumns,
        apiParamRows,
        metaTab: 'table',
      }
    },
    computed: {
      drawerTitle() {
        return this.fileName ? '预览 · ' + this.fileName : '预览接入标准'
      },
    },
    watch: {
      visible(val) {
        if (val) this.metaTab = 'table'
      },
    },
    methods: {
      onCancel() {
        this.$emit('cancel')
      },
    },
    template: `
      <a-drawer
        :visible="visible"
        :title="drawerTitle"
        :width="880"
        unmount-on-close
        @cancel="onCancel"
      >
        <div class="profile-page" style="margin: 0">
          <p class="profile-desc-text" style="margin-top: 0">
            一期接入舆情原文及相关附属信息。缺必接项则该条无法按标准入库。每条还须落到：供数方编码、归属机构标识、到达中台时间。
          </p>
          <div class="profile-section-title">一、需要接入的数据</div>
          <a-table :columns="needColumns" :data="needRows" :pagination="false" :bordered="false" row-key="no" size="small">
            <template #required="{ record }">
              <a-tag v-if="record.required === '必接'" color="orangered">必接</a-tag>
              <a-tag v-else-if="record.required === '建议'" color="arcoblue">建议</a-tag>
              <a-tag v-else>可选</a-tag>
            </template>
          </a-table>
          <div class="profile-section-title" style="margin-top: 20px">二、数据分类</div>
          <a-table :columns="categoryColumns" :data="categoryRows" :pagination="false" :bordered="false" row-key="name" size="small" />
          <div class="profile-section-title" style="margin-top: 20px">三、各类元数据标准</div>
          <a-tabs v-model:active-key="metaTab">
            <a-tab-pane key="table" title="库表数据集">
              <div class="profile-section-title">资源级元数据</div>
              <a-table :columns="metaColumns" :data="tableResourceMeta" :pagination="false" :bordered="false" row-key="item" size="small">
                <template #required="{ record }">{{ record.required }}</template>
              </a-table>
              <div class="profile-section-title" style="margin-top: 20px">元素级示例：舆情文章主数据字段</div>
              <a-table :columns="tableFieldColumns" :data="tableFieldRows" :pagination="false" :bordered="false" row-key="en" size="small">
                <template #required="{ record }">{{ record.required }}</template>
              </a-table>
            </a-tab-pane>
            <a-tab-pane key="file" title="非结构化数据">
              <div class="profile-section-title">资源级元数据</div>
              <a-table :columns="metaColumns" :data="fileResourceMeta" :pagination="false" :bordered="false" row-key="item" size="small">
                <template #required="{ record }">{{ record.required }}</template>
              </a-table>
              <div class="profile-section-title" style="margin-top: 20px">元素级（每个对象实例）</div>
              <a-table :columns="fileInstanceColumns" :data="fileInstanceRows" :pagination="false" :bordered="false" row-key="item" size="small">
                <template #required="{ record }">{{ record.required }}</template>
              </a-table>
              <p class="profile-desc-text" style="margin-top: 12px">
                非结构化对象不能单独计入机构统计，必须挂到一条有效的库表主数据上。
              </p>
            </a-tab-pane>
            <a-tab-pane key="api" title="接口数据">
              <div class="profile-section-title">资源级元数据</div>
              <a-table :columns="metaColumns" :data="apiResourceMeta" :pagination="false" :bordered="false" row-key="item" size="small">
                <template #required="{ record }">{{ record.required }}</template>
              </a-table>
              <div class="profile-section-title" style="margin-top: 20px">元素级示例：文章推送请求体</div>
              <a-table :columns="apiParamColumns" :data="apiParamRows" :pagination="false" :bordered="false" row-key="en" size="small">
                <template #required="{ record }">{{ record.required }}</template>
              </a-table>
              <p class="profile-desc-text" style="margin-top: 12px">
                接口元数据补充「怎么传」；报文里的业务字段仍须满足库表与非结构化的必填口径。
              </p>
            </a-tab-pane>
          </a-tabs>
        </div>
        <template #footer>
          <a-button @click="onCancel">关闭</a-button>
        </template>
      </a-drawer>
    `,
  }
})()
