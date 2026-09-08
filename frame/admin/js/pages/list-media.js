;(function () {
  const t = ArcoProLocale.listMedia

  const FOLDERS = [
    {
      key: 'all',
      title: t.folderAll,
      children: [
        {
          key: 'campaign',
          title: t.folderCampaign,
          children: [
            { key: 'campaign-banner', title: t.folderBanner },
            { key: 'campaign-poster', title: t.folderPoster },
            { key: 'campaign-landing', title: t.folderLanding },
            { key: 'campaign-popup', title: t.folderPopup },
          ],
        },
        {
          key: 'live',
          title: t.folderLive,
          children: [
            { key: 'live-cover', title: t.folderCover },
            { key: 'live-replay', title: t.folderReplay },
            { key: 'live-sticker', title: t.folderSticker },
          ],
        },
        {
          key: 'product',
          title: t.folderProduct,
          children: [
            { key: 'product-main', title: t.folderProductMain },
            { key: 'product-detail', title: t.folderProductDetail },
            { key: 'product-compare', title: t.folderProductCompare },
          ],
        },
        {
          key: 'short-video',
          title: t.folderShortVideo,
          children: [
            { key: 'video-ugc', title: t.folderVideoUgc },
            { key: 'video-talk', title: t.folderVideoTalk },
          ],
        },
        {
          key: 'audio',
          title: t.folderAudio,
          children: [
            { key: 'audio-bgm', title: t.folderAudioBgm },
            { key: 'audio-voice', title: t.folderAudioVoice },
          ],
        },
        {
          key: 'brand',
          title: t.folderBrand,
          children: [
            { key: 'brand-logo', title: t.folderBrandLogo },
            { key: 'brand-font', title: t.folderBrandFont },
          ],
        },
        {
          key: 'doc',
          title: t.folderDoc,
          children: [
            { key: 'doc-guide', title: t.folderDocGuide },
            { key: 'doc-report', title: t.folderDocReport },
          ],
        },
      ],
    },
  ]

  const ASSET_SEED = [
    { id: 'a1', name: '开学季主视觉.png', folder: 'campaign-banner', type: 'image', size: '2.4 MB', updatedAt: '2026-08-05', owner: '林芳', starred: true },
    { id: 'a2', name: '会员日横幅-A.jpg', folder: 'campaign-banner', type: 'image', size: '1.1 MB', updatedAt: '2026-08-04', owner: '孙婷', starred: false },
    { id: 'a3', name: '直播间背景-夏日.mp4', folder: 'live-cover', type: 'video', size: '86 MB', updatedAt: '2026-08-03', owner: '赵雪', starred: true },
    { id: 'a4', name: '新品讲解片段.mp4', folder: 'live-replay', type: 'video', size: '128 MB', updatedAt: '2026-08-02', owner: '陈思远', starred: false },
    { id: 'a5', name: '商品主图-运动鞋.png', folder: 'product-main', type: 'image', size: '680 KB', updatedAt: '2026-08-01', owner: '周凯', starred: false },
    { id: 'a6', name: '活动规则海报.pdf', folder: 'campaign-poster', type: 'doc', size: '3.2 MB', updatedAt: '2026-07-30', owner: '韩梅', starred: false },
    { id: 'a7', name: 'BGM-轻快节奏.mp3', folder: 'audio-bgm', type: 'audio', size: '4.8 MB', updatedAt: '2026-07-28', owner: '李晓雯', starred: true },
    { id: 'a8', name: '开场口播.wav', folder: 'audio-voice', type: 'audio', size: '12 MB', updatedAt: '2026-07-27', owner: '王立群', starred: false },
    { id: 'a9', name: '专题页头图.webp', folder: 'campaign-landing', type: 'image', size: '420 KB', updatedAt: '2026-07-26', owner: '林芳', starred: false },
    { id: 'a10', name: '达人试穿合集.mp4', folder: 'live-replay', type: 'video', size: '210 MB', updatedAt: '2026-07-25', owner: '赵雪', starred: false },
    { id: 'a11', name: 'SKU 对比图.png', folder: 'product-compare', type: 'image', size: '920 KB', updatedAt: '2026-07-24', owner: '周凯', starred: true },
    { id: 'a12', name: '渠道投放素材包.zip', folder: 'campaign-poster', type: 'doc', size: '45 MB', updatedAt: '2026-07-22', owner: '孙婷', starred: false },
    { id: 'a13', name: '新人礼弹窗.png', folder: 'campaign-popup', type: 'image', size: '560 KB', updatedAt: '2026-07-21', owner: '韩梅', starred: false },
    { id: 'a14', name: '直播间福袋贴纸.png', folder: 'live-sticker', type: 'image', size: '180 KB', updatedAt: '2026-07-20', owner: '赵雪', starred: false },
    { id: 'a15', name: '详情页卖点长图.jpg', folder: 'product-detail', type: 'image', size: '1.8 MB', updatedAt: '2026-07-18', owner: '周凯', starred: false },
    { id: 'a16', name: '种草测评-夏日穿搭.mp4', folder: 'video-ugc', type: 'video', size: '64 MB', updatedAt: '2026-07-16', owner: '陈思远', starred: true },
    { id: 'a17', name: '卖点口播-15s.mp4', folder: 'video-talk', type: 'video', size: '28 MB', updatedAt: '2026-07-15', owner: '李晓雯', starred: false },
    { id: 'a18', name: '品牌主Logo.svg', folder: 'brand-logo', type: 'image', size: '86 KB', updatedAt: '2026-07-12', owner: '孙婷', starred: true },
    { id: 'a19', name: '品牌字体使用说明.pdf', folder: 'brand-font', type: 'doc', size: '2.1 MB', updatedAt: '2026-07-10', owner: '林芳', starred: false },
    { id: 'a20', name: '素材库使用规范.docx', folder: 'doc-guide', type: 'doc', size: '780 KB', updatedAt: '2026-07-08', owner: '王立群', starred: false },
    { id: 'a21', name: 'Q2渠道投放报告.xlsx', folder: 'doc-report', type: 'doc', size: '1.4 MB', updatedAt: '2026-07-05', owner: '韩梅', starred: false },
  ]

  const TYPE_META = {
    image: { label: t.typeImage, className: 'is-image', icon: 'icon-image', color: 'arcoblue' },
    video: { label: t.typeVideo, className: 'is-video', icon: 'icon-video-camera', color: 'green' },
    audio: { label: t.typeAudio, className: 'is-audio', icon: 'icon-file-audio', color: 'orangered' },
    doc: { label: t.typeDoc, className: 'is-doc', icon: 'icon-file', color: 'gray' },
  }

  const UPLOAD_ACCEPT =
    '.png,.jpg,.jpeg,.gif,.webp,.svg,.mp4,.mov,.webm,.mp3,.wav,.aac,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip'

  function openConfirm(options) {
    return ArcoVue.Modal.confirm({
      simple: true,
      titleAlign: 'start',
      modalClass: 'pro-confirm-modal',
      width: 360,
      ...options,
    })
  }

  function cloneTree(nodes) {
    return (nodes || []).map((node) => ({
      key: node.key,
      title: node.title,
      children: node.children ? cloneTree(node.children) : undefined,
    }))
  }

  function collectFolderKeys(node) {
    const keys = [node.key]
    ;(node.children || []).forEach((child) => {
      keys.push(...collectFolderKeys(child))
    })
    return keys
  }

  function findNode(nodes, key) {
    for (const node of nodes || []) {
      if (node.key === key) return node
      const found = findNode(node.children, key)
      if (found) return found
    }
    return null
  }

  function findParentKey(nodes, key, parentKey) {
    for (const node of nodes || []) {
      if (node.key === key) return parentKey
      const found = findParentKey(node.children, key, node.key)
      if (found != null) return found
    }
    return null
  }

  function removeNode(nodes, key) {
    const list = nodes || []
    for (let i = 0; i < list.length; i += 1) {
      if (list[i].key === key) {
        list.splice(i, 1)
        return true
      }
      if (list[i].children && removeNode(list[i].children, key)) return true
    }
    return false
  }

  function guessType(name) {
    const n = String(name || '').toLowerCase()
    if (/\.(png|jpe?g|gif|webp|svg|bmp)$/.test(n)) return 'image'
    if (/\.(mp4|mov|webm|mkv|avi)$/.test(n)) return 'video'
    if (/\.(mp3|wav|aac|flac|m4a)$/.test(n)) return 'audio'
    return 'doc'
  }

  function formatSize(size) {
    const n = Number(size) || 0
    if (n < 1024) return n + ' B'
    if (n < 1024 * 1024) return (n / 1024).toFixed(n < 10 * 1024 ? 1 : 0) + ' KB'
    return (n / (1024 * 1024)).toFixed(n < 10 * 1024 * 1024 ? 1 : 0) + ' MB'
  }

  function todayText() {
    const d = new Date()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return d.getFullYear() + '-' + m + '-' + day
  }

  function makeFolderKey() {
    return 'folder-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)
  }

  function makeAssetId() {
    return 'a-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)
  }

  const ListMediaPage = {
    name: 'ListMediaPage',
    data() {
      return {
        t,
        treeData: cloneTree(FOLDERS),
        assets: ASSET_SEED.map((item) => ({ ...item })),
        selectedKeys: ['all'],
        expandedKeys: ['all', 'campaign', 'live', 'product', 'short-video', 'audio'],
        keyword: '',
        typeFilter: '',
        starOnly: false,
        viewMode: 'grid',
        selectedIds: [],
        pagination: { current: 1, pageSize: 18 },
        uploadVisible: false,
        uploading: false,
        uploadFileList: [],
        uploadForm: { folder: 'campaign-banner' },
        folderModalVisible: false,
        folderSaving: false,
        folderForm: { parentKey: 'all', name: '' },
        uploadAccept: UPLOAD_ACCEPT,
      }
    },
    computed: {
      typeOptions() {
        return [
          { label: t.typeAll, value: '' },
          { label: t.typeImage, value: 'image' },
          { label: t.typeVideo, value: 'video' },
          { label: t.typeAudio, value: 'audio' },
          { label: t.typeDoc, value: 'doc' },
        ]
      },
      viewModeOptions() {
        return [
          { label: t.viewGrid, value: 'grid', icon: 'icon-apps' },
          { label: t.viewList, value: 'list', icon: 'icon-list' },
        ]
      },
      filteredAssets() {
        const kw = String(this.keyword || '')
          .trim()
          .toLowerCase()
        const folderKey = this.selectedKeys[0] || 'all'
        const folderKeys =
          folderKey === 'all'
            ? null
            : collectFolderKeys(findNode(this.treeData, folderKey) || { key: folderKey })
        return this.assets.filter((item) => {
          if (folderKeys && !folderKeys.includes(item.folder)) return false
          if (this.typeFilter && item.type !== this.typeFilter) return false
          if (this.starOnly && !item.starred) return false
          if (kw && !item.name.toLowerCase().includes(kw)) return false
          return true
        })
      },
      pagedAssets() {
        const start = (this.pagination.current - 1) * this.pagination.pageSize
        return this.filteredAssets.slice(start, start + this.pagination.pageSize)
      },
      pageAllSelected() {
        const ids = this.pagedAssets.map((item) => item.id)
        return ids.length > 0 && ids.every((id) => this.selectedIds.includes(id))
      },
      pageIndeterminate() {
        const ids = this.pagedAssets.map((item) => item.id)
        const count = ids.filter((id) => this.selectedIds.includes(id)).length
        return count > 0 && count < ids.length
      },
      columns() {
        return [
          { title: t.colStar, dataIndex: 'starred', width: 52, slotName: 'starred', align: 'center' },
          { title: t.colName, dataIndex: 'name', ellipsis: true, tooltip: true, slotName: 'name' },
          { title: t.colType, dataIndex: 'type', width: 88, slotName: 'type' },
          { title: t.colSize, dataIndex: 'size', width: 96 },
          { title: t.colOwner, dataIndex: 'owner', width: 100 },
          { title: t.colUpdated, dataIndex: 'updatedAt', width: 120 },
          { title: t.colOperations, dataIndex: 'operations', width: 120, slotName: 'operations', align: 'center' },
        ]
      },
    },
    methods: {
      typeMeta(type) {
        return TYPE_META[type] || TYPE_META.doc
      },
      isChecked(id) {
        return this.selectedIds.includes(id)
      },
      onTreeSelect(keys) {
        if (!keys || !keys.length) return
        this.selectedKeys = [keys[0]]
        this.pagination.current = 1
        this.selectedIds = []
      },
      onSearch() {
        this.pagination.current = 1
        this.selectedIds = []
      },
      onToggleStarOnly() {
        this.starOnly = !this.starOnly
        this.onSearch()
      },
      resolveUploadFolder() {
        const key = this.selectedKeys[0] || 'all'
        return key === 'all' ? 'campaign-banner' : key
      },
      onUpload() {
        this.uploadForm = { folder: this.resolveUploadFolder() }
        this.uploadFileList = []
        this.uploadVisible = true
      },
      closeUpload() {
        this.uploadVisible = false
        this.uploading = false
        this.uploadFileList = []
      },
      onUploadFileChange(fileList) {
        const list = Array.isArray(fileList) ? fileList : fileList && fileList.fileList
        this.uploadFileList = (list || []).slice(0, 10)
      },
      beforeUploadFile(file) {
        const raw = file && (file.file || file)
        const name = (raw && raw.name) || (file && file.name) || ''
        const size = (raw && raw.size) || (file && file.size) || 0
        if (!/\.(png|jpe?g|gif|webp|svg|mp4|mov|webm|mp3|wav|aac|pdf|docx?|xlsx?|pptx?|zip)$/i.test(name)) {
          ArcoVue.Message.warning(t.uploadFormatInvalid)
          return false
        }
        if (size > 200 * 1024 * 1024) {
          ArcoVue.Message.warning(t.uploadSizeInvalid)
          return false
        }
        return true
      },
      submitUpload() {
        if (!this.uploadForm.folder) {
          ArcoVue.Message.warning(t.uploadFolderRequired)
          return
        }
        if (!this.uploadFileList.length) {
          ArcoVue.Message.warning(t.uploadFileRequired)
          return
        }
        this.uploading = true
        setTimeout(() => {
          const date = todayText()
          const created = this.uploadFileList.map((file) => {
            const raw = file.file || file
            const name = raw.name || file.name || '未命名文件'
            return {
              id: makeAssetId(),
              name,
              folder: this.uploadForm.folder,
              type: guessType(name),
              size: formatSize(raw.size || 0),
              updatedAt: date,
              owner: t.uploadOwner,
              starred: false,
            }
          })
          this.assets = created.concat(this.assets)
          this.selectedKeys = [this.uploadForm.folder]
          if (!this.expandedKeys.includes(this.uploadForm.folder)) {
            this.expandedKeys = [...this.expandedKeys, this.uploadForm.folder]
          }
          this.pagination.current = 1
          this.selectedIds = []
          this.uploading = false
          this.uploadVisible = false
          this.uploadFileList = []
          ArcoVue.Message.success(t.uploadOk + '（' + created.length + ' 个）')
        }, 480)
      },
      openAddFolder(parentKey) {
        const key = parentKey || this.selectedKeys[0] || 'all'
        this.folderForm = { parentKey: key, name: '' }
        this.folderModalVisible = true
        this.$nextTick(() => {
          const input = this.$refs.folderNameInput
          if (input && typeof input.focus === 'function') input.focus()
        })
      },
      closeFolderModal() {
        this.folderModalVisible = false
        this.folderSaving = false
        this.folderForm = { parentKey: 'all', name: '' }
      },
      submitAddFolder() {
        const name = String(this.folderForm.name || '').trim()
        if (!name) {
          ArcoVue.Message.warning(t.addFolderEmpty)
          return
        }
        const parentKey = this.folderForm.parentKey || 'all'
        const parent = findNode(this.treeData, parentKey)
        if (!parent) {
          ArcoVue.Message.warning(t.uploadFolderRequired)
          return
        }
        this.folderSaving = true
        setTimeout(() => {
          const key = makeFolderKey()
          if (!parent.children) parent.children = []
          parent.children.push({ key, title: name })
          if (!this.expandedKeys.includes(parentKey)) {
            this.expandedKeys = [...this.expandedKeys, parentKey]
          }
          this.selectedKeys = [key]
          this.pagination.current = 1
          this.selectedIds = []
          this.folderSaving = false
          this.folderModalVisible = false
          this.folderForm = { parentKey: 'all', name: '' }
          ArcoVue.Message.success(t.addFolderOk)
        }, 180)
      },
      onDeleteFolder(node) {
        const key = node && node.key
        if (!key || key === 'all') {
          ArcoVue.Message.warning(t.deleteFolderRoot)
          return
        }
        const target = findNode(this.treeData, key)
        if (!target) return
        const keys = collectFolderKeys(target)
        openConfirm({
          title: t.deleteFolder,
          content: t.deleteFolderConfirm,
          okText: t.remove,
          cancelText: t.cancel,
          okButtonProps: { status: 'danger' },
          onOk: () => {
            const parentKey = findParentKey(this.treeData, key, null) || 'all'
            removeNode(this.treeData, key)
            const drop = new Set(keys)
            this.assets = this.assets.filter((row) => !drop.has(row.folder))
            this.expandedKeys = this.expandedKeys.filter((k) => !drop.has(k))
            if (drop.has(this.selectedKeys[0])) {
              this.selectedKeys = [parentKey]
            }
            this.selectedIds = []
            this.ensurePage()
            ArcoVue.Message.success(t.deleteFolderOk)
          },
        })
      },
      onToggleCheck(item, checked) {
        const next = checked == null ? !this.isChecked(item.id) : !!checked
        if (next) {
          if (!this.selectedIds.includes(item.id)) this.selectedIds = [...this.selectedIds, item.id]
        } else {
          this.selectedIds = this.selectedIds.filter((id) => id !== item.id)
        }
      },
      onToggleSelectAllPage(checked) {
        const ids = this.pagedAssets.map((item) => item.id)
        if (checked) {
          const set = new Set(this.selectedIds)
          ids.forEach((id) => set.add(id))
          this.selectedIds = Array.from(set)
        } else {
          const drop = new Set(ids)
          this.selectedIds = this.selectedIds.filter((id) => !drop.has(id))
        }
      },
      onClearSelection() {
        this.selectedIds = []
      },
      onCardClick(item) {
        this.onToggleCheck(item)
      },
      onToggleStar(item) {
        item.starred = !item.starred
        ArcoVue.Message.success(item.starred ? t.starOk : t.unstarOk)
      },
      onPreview(item) {
        ArcoVue.Message.info(t.previewTip + '（' + item.name + '）')
      },
      onDownload(item) {
        ArcoVue.Message.success(t.downloadOk + '（' + item.name + '）')
      },
      onDeleteOne(item) {
        openConfirm({
          title: t.remove,
          content: t.batchDeleteConfirm,
          okText: t.remove,
          cancelText: t.cancel,
          okButtonProps: { status: 'danger' },
          onOk: () => {
            this.assets = this.assets.filter((row) => row.id !== item.id)
            this.selectedIds = this.selectedIds.filter((id) => id !== item.id)
            this.ensurePage()
            ArcoVue.Message.success(t.deleteOk + '（1 条）')
          },
        })
      },
      onBatchDelete() {
        if (!this.selectedIds.length) {
          ArcoVue.Message.warning(t.selectRequired)
          return
        }
        const n = this.selectedIds.length
        openConfirm({
          title: t.batchDelete,
          content: t.batchDeleteConfirm,
          okText: t.remove,
          cancelText: t.cancel,
          okButtonProps: { status: 'danger' },
          onOk: () => {
            const drop = new Set(this.selectedIds)
            this.assets = this.assets.filter((row) => !drop.has(row.id))
            this.selectedIds = []
            this.ensurePage()
            ArcoVue.Message.success(t.deleteOk + '（' + n + ' 条）')
          },
        })
      },
      ensurePage() {
        const maxPage = Math.max(1, Math.ceil(this.filteredAssets.length / this.pagination.pageSize) || 1)
        if (this.pagination.current > maxPage) this.pagination.current = maxPage
      },
      onPageChange(page) {
        this.pagination.current = page
      },
      onTableSelectionChange(keys) {
        this.selectedIds = keys
      },
    },
    template: `
      <div class="list-media-page">
        <div class="list-media-layout">
          <div class="list-media-side">
            <a-card class="general-card pro-page-card" :bordered="false">
              <div class="list-media-tree-panel">
                <div class="list-media-tree-panel-header">
                  <span class="list-media-tree-panel-title">{{ t.folderTitle }}</span>
                </div>
                <div class="list-media-tree-body">
                  <a-tree
                    class="list-media-tree"
                    block-node
                    :data="treeData"
                    v-model:selected-keys="selectedKeys"
                    v-model:expanded-keys="expandedKeys"
                    @select="onTreeSelect"
                  >
                    <template #title="nodeData">
                      <div class="list-media-tree-node">
                        <span class="list-media-tree-node-label">{{ nodeData.title }}</span>
                        <span class="list-media-tree-node-ops" @click.stop>
                          <a-tooltip :content="t.folderOpsAdd">
                            <a-button
                              type="text"
                              size="mini"
                              class="list-media-tree-op"
                              @click="openAddFolder(nodeData.key)"
                            >
                              <template #icon><icon-plus /></template>
                            </a-button>
                          </a-tooltip>
                          <a-tooltip v-if="nodeData.key !== 'all'" :content="t.folderOpsDelete">
                            <a-button
                              type="text"
                              size="mini"
                              status="danger"
                              class="list-media-tree-op"
                              @click="onDeleteFolder(nodeData)"
                            >
                              <template #icon><icon-delete /></template>
                            </a-button>
                          </a-tooltip>
                        </span>
                      </div>
                    </template>
                  </a-tree>
                </div>
              </div>
            </a-card>
          </div>

          <div class="list-media-main">
            <a-card class="general-card" :bordered="false">
              <div class="pro-toolbar list-media-toolbar">
                <a-space wrap>
                  <a-button type="primary" @click="onUpload">
                    <template #icon><icon-upload /></template>{{ t.upload }}
                  </a-button>
                  <div class="list-media-segment">
                    <button
                      v-for="opt in viewModeOptions"
                      :key="'vm-' + opt.value"
                      type="button"
                      class="list-media-segment-item"
                      :class="{ 'is-active': viewMode === opt.value }"
                      :title="opt.label"
                      :aria-label="opt.label"
                      @click="viewMode = opt.value"
                    >
                      <component :is="opt.icon" />
                    </button>
                  </div>
                </a-space>
                <div class="pro-toolbar-right">
                  <a-button :type="starOnly ? 'outline' : 'secondary'" @click="onToggleStarOnly">
                    <template #icon>
                      <icon-star-fill v-if="starOnly" />
                      <icon-star v-else />
                    </template>{{ t.starOnly }}
                  </a-button>
                  <a-select
                    v-model="typeFilter"
                    :options="typeOptions"
                    style="width: 120px"
                    @change="onSearch"
                  />
                  <a-input-search
                    v-model="keyword"
                    allow-clear
                    :placeholder="t.searchPh"
                    style="width: 220px"
                    @search="onSearch"
                    @press-enter="onSearch"
                    @clear="onSearch"
                  />
                </div>
              </div>

              <div class="list-media-content">
                <template v-if="viewMode === 'grid'">
                  <a-empty v-if="!pagedAssets.length" :description="t.empty" />
                  <div v-else class="list-media-grid">
                    <div
                      v-for="item in pagedAssets"
                      :key="item.id"
                      class="list-media-card"
                      :class="{ 'is-selected': isChecked(item.id), 'is-starred': item.starred }"
                      @click="onCardClick(item)"
                      @dblclick.stop="onPreview(item)"
                    >
                      <div class="list-media-thumb" :class="typeMeta(item.type).className">
                        <label class="list-media-check" @click.stop>
                          <a-checkbox
                            :model-value="isChecked(item.id)"
                            @change="(checked) => onToggleCheck(item, checked)"
                          />
                        </label>
                        <button
                          type="button"
                          class="list-media-star-btn"
                          :class="{ 'is-active': item.starred }"
                          :title="item.starred ? t.unstar : t.star"
                          @click.stop="onToggleStar(item)"
                        >
                          <icon-star-fill v-if="item.starred" />
                          <icon-star v-else />
                        </button>
                        <span class="list-media-thumb-icon">
                          <component :is="typeMeta(item.type).icon" />
                        </span>
                        <div class="list-media-card-actions" @click.stop>
                          <a-button type="primary" size="mini" @click="onPreview(item)">{{ t.preview }}</a-button>
                          <a-button type="outline" size="mini" @click="onDownload(item)">{{ t.download }}</a-button>
                          <a-button type="outline" size="mini" @click="onDeleteOne(item)">{{ t.remove }}</a-button>
                        </div>
                      </div>
                      <div class="list-media-card-body">
                        <h4 class="list-media-name" :title="item.name">{{ item.name }}</h4>
                        <div class="list-media-meta">
                          <span class="list-media-type-text" :class="'is-' + item.type">{{ typeMeta(item.type).label }}</span>
                          <span class="list-media-meta-size">{{ item.size }}</span>
                        </div>
                        <div class="list-media-card-footer">
                          <span class="list-media-owner" :title="item.owner">{{ item.owner }}</span>
                          <span class="list-media-meta-date">{{ item.updatedAt }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <a-table
                  v-else
                  class="list-media-table"
                  row-key="id"
                  :columns="columns"
                  :data="pagedAssets"
                  :pagination="false"
                  :bordered="false"
                  :row-selection="{ type: 'checkbox', showCheckedAll: true, width: 48 }"
                  :selected-keys="selectedIds"
                  @selection-change="onTableSelectionChange"
                >
                  <template #starred="{ record }">
                    <button
                      type="button"
                      class="list-media-star-btn is-table"
                      :class="{ 'is-active': record.starred }"
                      :title="record.starred ? t.unstar : t.star"
                      @click="onToggleStar(record)"
                    >
                      <icon-star-fill v-if="record.starred" />
                      <icon-star v-else />
                    </button>
                  </template>
                  <template #name="{ record }">
                    <div class="list-media-table-name" :title="record.name">
                      <span class="list-media-table-type-icon" :class="'is-' + record.type">
                        <component :is="typeMeta(record.type).icon" />
                      </span>
                      <span class="list-media-table-name-text">{{ record.name }}</span>
                    </div>
                  </template>
                  <template #type="{ record }">
                    <span class="list-media-table-type">{{ typeMeta(record.type).label }}</span>
                  </template>
                  <template #operations="{ record }">
                    <div class="list-media-table-actions">
                      <a-tooltip :content="t.preview">
                        <a-button type="text" size="mini" class="list-media-table-op" @click="onPreview(record)">
                          <template #icon><icon-eye /></template>
                        </a-button>
                      </a-tooltip>
                      <a-tooltip :content="t.download">
                        <a-button type="text" size="mini" class="list-media-table-op" @click="onDownload(record)">
                          <template #icon><icon-download /></template>
                        </a-button>
                      </a-tooltip>
                      <a-tooltip :content="t.remove">
                        <a-button type="text" size="mini" status="danger" class="list-media-table-op" @click="onDeleteOne(record)">
                          <template #icon><icon-delete /></template>
                        </a-button>
                      </a-tooltip>
                    </div>
                  </template>
                </a-table>
              </div>

              <div class="list-media-pagination">
                <a-space>
                  <a-checkbox
                    :model-value="pageAllSelected"
                    :indeterminate="pageIndeterminate"
                    @change="onToggleSelectAllPage"
                  >{{ t.selectAllPage }}</a-checkbox>
                  <a-button :disabled="!selectedIds.length" @click="onBatchDelete">
                    {{ t.batchDelete }}
                  </a-button>
                  <span v-if="selectedIds.length" class="list-media-selected-tip">
                    {{ t.selectedCount }} {{ selectedIds.length }}
                    <a-link @click="onClearSelection">{{ t.cancelSelect }}</a-link>
                  </span>
                </a-space>
                <a-pagination
                  :current="pagination.current"
                  :page-size="pagination.pageSize"
                  :total="filteredAssets.length"
                  show-total
                  @change="onPageChange"
                />
              </div>
            </a-card>

            <a-modal
              v-if="uploadVisible"
              :visible="true"
              :title="t.uploadTitle"
              title-align="start"
              :width="520"
              modal-class="pro-io-modal"
              :footer="false"
              unmount-on-close
              @cancel="closeUpload"
            >
              <div class="pro-io-modal-body">
                <a-form :model="uploadForm" layout="vertical" class="list-media-upload-form">
                  <a-form-item :label="t.uploadFolder" required>
                    <a-tree-select
                      v-model="uploadForm.folder"
                      :data="treeData"
                      :tree-props="{ defaultExpandAll: true, blockNode: true }"
                      :placeholder="t.uploadFolderPh"
                      allow-search
                      dropdown-class-name="list-media-tree-select"
                    />
                  </a-form-item>
                  <a-form-item :label="t.uploadFiles" required>
                    <a-upload
                      class="pro-io-upload"
                      draggable
                      multiple
                      :accept="uploadAccept"
                      :auto-upload="false"
                      :limit="10"
                      :file-list="uploadFileList"
                      @change="onUploadFileChange"
                      @before-upload="beforeUploadFile"
                    >
                      <template #upload-button>
                        <div class="pro-upload-drag">
                          <div class="pro-upload-drag-icon"><icon-upload /></div>
                          <div class="pro-upload-drag-text">{{ t.uploadDrag }}</div>
                          <div class="pro-upload-drag-hint">{{ t.uploadDragHint }}</div>
                        </div>
                      </template>
                    </a-upload>
                  </a-form-item>
                </a-form>
                <div class="pro-io-footer">
                  <div></div>
                  <a-space>
                    <a-button @click="closeUpload">{{ t.cancel }}</a-button>
                    <a-button type="primary" :loading="uploading" @click="submitUpload">{{ t.uploadSubmit }}</a-button>
                  </a-space>
                </div>
              </div>
            </a-modal>

            <a-modal
              v-if="folderModalVisible"
              :visible="true"
              :title="t.addFolderTitle"
              title-align="start"
              :width="440"
              :footer="false"
              unmount-on-close
              @cancel="closeFolderModal"
            >
              <a-form :model="folderForm" layout="vertical">
                <a-form-item :label="t.addFolderParent">
                  <a-tree-select
                    v-model="folderForm.parentKey"
                    :data="treeData"
                    :tree-props="{ defaultExpandAll: true, blockNode: true }"
                    allow-search
                    dropdown-class-name="list-media-tree-select"
                  />
                </a-form-item>
                <a-form-item :label="t.addFolderName" required>
                  <a-input
                    ref="folderNameInput"
                    v-model="folderForm.name"
                    :placeholder="t.addFolderNamePh"
                    allow-clear
                    @press-enter="submitAddFolder"
                  />
                </a-form-item>
              </a-form>
              <div class="pro-modal-footer-actions">
                <a-space>
                  <a-button @click="closeFolderModal">{{ t.cancel }}</a-button>
                  <a-button type="primary" :loading="folderSaving" @click="submitAddFolder">{{ t.addFolder }}</a-button>
                </a-space>
              </div>
            </a-modal>
          </div>
        </div>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'list/media',
    title: t.title,
    pageComponent: ListMediaPage,
  })
})()
