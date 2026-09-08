/** 接入规范预览辅助数据：字段示例对齐 MT「数据标准管理」勾选字段模型 */

export const fieldColumns = [
  { title: '字段名', dataIndex: 'name', width: 160 },
  { title: '描述', dataIndex: 'description', minWidth: 180 },
  { title: '数据类型', dataIndex: 'dataType', width: 100 },
  { title: '业务分类', dataIndex: 'bizCategory', width: 100 },
  { title: '必填', dataIndex: 'required', width: 88 },
  { title: '长度', dataIndex: 'length', width: 80 },
]

/** 与 MT 全局标准默认勾选字段一致，供文档型预览兜底 */
export const tableFieldRows = [
  { name: 'supplier_code', description: '供数方编码，库表路径据此识别来源厂商', dataType: 'String', bizCategory: '运维管理', required: '必填', length: '32' },
  { name: 'org_id', description: '归属机构编码；对应机构供数配置中的机构编码', dataType: 'String', bizCategory: '运维管理', required: '必填', length: '64' },
  { name: 'platform', description: '平台类型', dataType: 'String', bizCategory: '平台', required: '必填', length: '—' },
  { name: 'platform_name', description: '平台名称', dataType: 'String', bizCategory: '平台', required: '必填', length: '—' },
  { name: 'news_uuid', description: '文章唯一的标识', dataType: 'String', bizCategory: '文章', required: '必填', length: '64' },
  { name: 'news_title', description: '信息标题', dataType: 'String', bizCategory: '文章', required: '非必填', length: '512' },
  { name: 'media_name', description: '发布者昵称', dataType: 'String', bizCategory: '作者', required: '非必填', length: '—' },
  { name: 'news_is_origin', description: '是否原创', dataType: 'String', bizCategory: '标注', required: '非必填', length: '—' },
]

export const schemePreviewMeta = [
  { item: '数据源类型', example: '库表数据集' },
  { item: '数据库类型', example: 'MySQL' },
  { item: '主机 / 端口', example: '10.0.1.12:3306' },
  { item: '数据库名', example: 'yunshu_ods' },
  { item: '抽取频次', example: '每小时' },
  { item: '更新规则', example: '增量（content_time）' },
  { item: 'IP 白名单管控', example: '是' },
]
