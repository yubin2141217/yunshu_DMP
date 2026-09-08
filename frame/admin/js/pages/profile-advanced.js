;(function () {
  const t = ArcoProLocale.profileAdvanced

  const ProfileAdvancedPage = {
    name: 'ProfileAdvancedPage',
    data() {
      return {
        t,
        activeTab: 'detail',
        currentStep: 2,
        info: {
          id: 'LIVE-20260918-216',
          title: '秋季新品发布会 · 直播回放精剪版',
          type: '直播回放',
          channel: '天猫直播 / 抖音直播 / B 站',
          campaign: '2026 秋季新品发布会',
          series: '新品发布系列 · S3',
          owner: '陈思远',
          department: '直播电商中心',
          priority: 'medium',
          status: 'reviewing',
          language: '中文（普通话）',
          region: '中国大陆 / 港澳',
          audience: '25–40 岁都市消费人群',
          tags: '新品发布、直播精剪、种草转化',
          version: 'v2.3（终审候选）',
          sourceFile: 'autumn-launch-replay-master.mov',
          storage: 'OSS · media/live/2026/09/',
          copyright: '品牌市场部 · 自有版权',
          license: '站内投放 + 付费信息流（90 天）',
          budget: '¥128,000',
          expectedViews: '320 万+',
          createdAt: '2026-09-12 11:28:00',
          updatedAt: '2026-09-18 15:06:00',
          publishAt: '2026-09-22 19:30:00',
          duration: '28:45',
          size: '1.62 GB',
          resolution: '3840×2160',
          aspectRatio: '16:9',
          codec: 'H.264 High',
          container: 'MP4',
          fps: '60 fps',
          bitrate: '18000 kbps',
          colorSpace: 'Rec.709 / SDR',
          sampleRate: '48 kHz',
          channels: '立体声',
          audioBitrate: '256 kbps',
          audioCodec: 'AAC-LC',
          subtitle: '中英双语 · SRT 外挂',
          brightness: '46',
          contrast: '54',
          saturation: '50',
          sharpness: '42',
          denoise: '轻度',
          hdr: '关闭',
          lut: 'Autumn Warm Soft',
          watermark: '品牌角标 · 左上',
          loudness: '-16 LUFS',
          fadeIn: '0.8 s',
          fadeOut: '1.2 s',
          description:
            '秋季新品发布会主会场直播回放精剪，保留开场、核心卖点讲解、达人试穿与限时优惠三段高潮，并已嵌入商品卡片时间点。审核通过后同步分发至天猫、抖音与 B 站直播间回放位。',
        },
        steps: [
          { title: t.stepCreate, description: '2026-09-12 11:28' },
          { title: t.stepSubmit, description: '2026-09-16 17:40' },
          { title: t.stepReview, description: t.stepReviewing },
          { title: t.stepPublish, description: '预计 09-22' },
        ],
        logs: [
          {
            time: '2026-09-18 15:06',
            user: '周可',
            action: '补充目标人群与投放预算，提交复审',
            color: 'arcoblue',
          },
          {
            time: '2026-09-17 20:12',
            user: '林晓',
            action: '驳回：商品卡片时间点与库存 SKU 不一致，需修正',
            color: 'red',
          },
          {
            time: '2026-09-17 09:55',
            user: '韩梅',
            action: '完成画质与响度技术校验，通过',
            color: 'green',
          },
          {
            time: '2026-09-16 17:40',
            user: '陈思远',
            action: '提交审核，附带直播场次纪要与商品清单',
            color: 'arcoblue',
          },
          {
            time: '2026-09-15 14:08',
            user: '陈思远',
            action: '上传 v2.3 精剪成片并关联字幕文件',
            color: 'arcoblue',
          },
          {
            time: '2026-09-12 11:28',
            user: '陈思远',
            action: '创建内容条目，导入直播源片',
            color: 'gray',
          },
        ],
        relatedColumns: [
          { title: t.colName, dataIndex: 'name', ellipsis: true, tooltip: true },
          { title: t.colType, dataIndex: 'type', width: 90 },
          { title: t.colOwner, dataIndex: 'owner', width: 100 },
          { title: t.colSize, dataIndex: 'size', width: 100 },
          { title: t.colStatus, dataIndex: 'status', slotName: 'status', width: 100 },
          { title: t.colUpdated, dataIndex: 'updatedAt', width: 160 },
        ],
        relatedData: [
          {
            key: '1',
            name: '开场品牌短片.mp4',
            type: '视频',
            owner: '林晓',
            size: '186 MB',
            status: 'online',
            updatedAt: '2026-09-14 16:20',
          },
          {
            key: '2',
            name: '核心卖点讲解分镜.docx',
            type: '文档',
            owner: '周可',
            size: '2.4 MB',
            status: 'online',
            updatedAt: '2026-09-15 10:33',
          },
          {
            key: '3',
            name: '商品卡片时间轴.xlsx',
            type: '表格',
            owner: '韩梅',
            size: '680 KB',
            status: 'reviewing',
            updatedAt: '2026-09-18 11:02',
          },
          {
            key: '4',
            name: '中英双语字幕.srt',
            type: '字幕',
            owner: '陈思远',
            size: '96 KB',
            status: 'online',
            updatedAt: '2026-09-15 14:08',
          },
          {
            key: '5',
            name: '达人试穿花絮合集.zip',
            type: '压缩包',
            owner: '林晓',
            size: '420 MB',
            status: 'draft',
            updatedAt: '2026-09-17 19:44',
          },
          {
            key: '6',
            name: '限时优惠贴片.png',
            type: '图片',
            owner: '周可',
            size: '3.1 MB',
            status: 'online',
            updatedAt: '2026-09-16 08:55',
          },
        ],
        statusMap: {
          online: { color: 'green', text: t.statusOnline },
          draft: { color: 'gray', text: t.statusDraft },
          reviewing: { color: 'orangered', text: t.statusReviewing },
        },
      }
    },
    methods: {
      onEdit() {
        ArcoVue.Message.info(t.editTip)
      },
      onApprove() {
        ArcoVue.Message.success(t.approveTip)
      },
      onReject() {
        ArcoVue.Message.warning(t.rejectTip)
      },
      onExport() {
        ArcoVue.Message.success(t.exportTip)
      },
    },
    template: `
      <div class="profile-page profile-advanced">
        <a-card class="pro-page-card profile-header-card" :bordered="false">
          <div class="profile-header">
            <div class="profile-header-top">
              <div class="profile-header-main">
                <a-typography-title :heading="5" class="profile-header-title">
                  {{ info.title }}
                </a-typography-title>
                <div class="profile-header-tags">
                  <a-tag :color="statusMap.reviewing.color">{{ statusMap.reviewing.text }}</a-tag>
                  <a-tag color="orangered">{{ t.priorityMedium }}</a-tag>
                </div>
              </div>
              <a-space class="profile-toolbar" wrap>
                <a-button type="primary" @click="onApprove">{{ t.approve }}</a-button>
                <a-button status="danger" @click="onReject">{{ t.reject }}</a-button>
                <a-button @click="onEdit">{{ t.edit }}</a-button>
                <a-button @click="onExport">{{ t.export }}</a-button>
              </a-space>
            </div>
            <div class="profile-header-meta">
              <div class="profile-meta-item">
                <span class="profile-meta-label">{{ t.contentId }}</span>
                <span class="profile-meta-value">{{ info.id }}</span>
              </div>
              <div class="profile-meta-item">
                <span class="profile-meta-label">{{ t.owner }}</span>
                <span class="profile-meta-value">{{ info.owner }}</span>
              </div>
              <div class="profile-meta-item">
                <span class="profile-meta-label">{{ t.department }}</span>
                <span class="profile-meta-value">{{ info.department }}</span>
              </div>
              <div class="profile-meta-item">
                <span class="profile-meta-label">{{ t.updatedAt }}</span>
                <span class="profile-meta-value">{{ info.updatedAt }}</span>
              </div>
            </div>
          </div>
        </a-card>

        <a-card class="pro-page-card" :title="t.processTitle" :bordered="false">
          <a-steps :current="currentStep" small label-placement="vertical" class="profile-steps">
            <a-step
              v-for="(step, index) in steps"
              :key="index"
              :title="step.title"
              :description="step.description"
            />
          </a-steps>
        </a-card>

        <a-card class="pro-page-card profile-tabs-card" :bordered="false">
          <a-tabs v-model:active-key="activeTab" type="rounded" class="profile-tabs">
            <a-tab-pane key="detail" :title="t.tabDetail">
              <a-typography-title :heading="6" class="profile-section-title">{{ t.overview }}</a-typography-title>
              <a-descriptions :column="3" size="large" class="profile-block profile-descriptions profile-descriptions--wide">
                <a-descriptions-item :label="t.contentType">{{ info.type }}</a-descriptions-item>
                <a-descriptions-item :label="t.channel">{{ info.channel }}</a-descriptions-item>
                <a-descriptions-item :label="t.campaign">{{ info.campaign }}</a-descriptions-item>
                <a-descriptions-item :label="t.series">{{ info.series }}</a-descriptions-item>
                <a-descriptions-item :label="t.language">{{ info.language }}</a-descriptions-item>
                <a-descriptions-item :label="t.region">{{ info.region }}</a-descriptions-item>
                <a-descriptions-item :label="t.audience">{{ info.audience }}</a-descriptions-item>
                <a-descriptions-item :label="t.tags">{{ info.tags }}</a-descriptions-item>
                <a-descriptions-item :label="t.version">{{ info.version }}</a-descriptions-item>
                <a-descriptions-item :label="t.createdAt">{{ info.createdAt }}</a-descriptions-item>
                <a-descriptions-item :label="t.publishAt">{{ info.publishAt }}</a-descriptions-item>
                <a-descriptions-item :label="t.duration">{{ info.duration }}</a-descriptions-item>
                <a-descriptions-item :label="t.fileSize">{{ info.size }}</a-descriptions-item>
                <a-descriptions-item :label="t.sourceFile">{{ info.sourceFile }}</a-descriptions-item>
                <a-descriptions-item :label="t.description" :span="3">
                  <span class="profile-desc-text">{{ info.description }}</span>
                </a-descriptions-item>
              </a-descriptions>

              <a-divider />

              <a-typography-title :heading="6" class="profile-section-title">{{ t.businessInfo }}</a-typography-title>
              <a-descriptions :column="3" size="large" class="profile-block profile-descriptions profile-descriptions--wide">
                <a-descriptions-item :label="t.budget">{{ info.budget }}</a-descriptions-item>
                <a-descriptions-item :label="t.expectedViews">{{ info.expectedViews }}</a-descriptions-item>
                <a-descriptions-item :label="t.copyright">{{ info.copyright }}</a-descriptions-item>
                <a-descriptions-item :label="t.license">{{ info.license }}</a-descriptions-item>
                <a-descriptions-item :label="t.storage" :span="3">{{ info.storage }}</a-descriptions-item>
              </a-descriptions>

              <a-divider />

              <a-typography-title :heading="6" class="profile-section-title">{{ t.mediaInfo }}</a-typography-title>
              <a-descriptions :column="3" size="large" class="profile-descriptions">
                <a-descriptions-item :label="t.resolution">{{ info.resolution }}</a-descriptions-item>
                <a-descriptions-item :label="t.aspectRatio">{{ info.aspectRatio }}</a-descriptions-item>
                <a-descriptions-item :label="t.container">{{ info.container }}</a-descriptions-item>
                <a-descriptions-item :label="t.codec">{{ info.codec }}</a-descriptions-item>
                <a-descriptions-item :label="t.fps">{{ info.fps }}</a-descriptions-item>
                <a-descriptions-item :label="t.bitrate">{{ info.bitrate }}</a-descriptions-item>
                <a-descriptions-item :label="t.colorSpace">{{ info.colorSpace }}</a-descriptions-item>
                <a-descriptions-item :label="t.audioCodec">{{ info.audioCodec }}</a-descriptions-item>
                <a-descriptions-item :label="t.sampleRate">{{ info.sampleRate }}</a-descriptions-item>
                <a-descriptions-item :label="t.channels">{{ info.channels }}</a-descriptions-item>
                <a-descriptions-item :label="t.audioBitrate">{{ info.audioBitrate }}</a-descriptions-item>
                <a-descriptions-item :label="t.subtitle">{{ info.subtitle }}</a-descriptions-item>
              </a-descriptions>
            </a-tab-pane>

            <a-tab-pane key="params" :title="t.tabParams">
              <a-row :gutter="24">
                <a-col :xs="24" :md="12">
                  <a-typography-title :heading="6" class="profile-section-title">{{ t.videoParams }}</a-typography-title>
                  <a-descriptions :column="1" bordered size="large">
                    <a-descriptions-item :label="t.brightness">{{ info.brightness }}</a-descriptions-item>
                    <a-descriptions-item :label="t.contrast">{{ info.contrast }}</a-descriptions-item>
                    <a-descriptions-item :label="t.saturation">{{ info.saturation }}</a-descriptions-item>
                    <a-descriptions-item :label="t.sharpness">{{ info.sharpness }}</a-descriptions-item>
                    <a-descriptions-item :label="t.denoise">{{ info.denoise }}</a-descriptions-item>
                    <a-descriptions-item :label="t.hdr">{{ info.hdr }}</a-descriptions-item>
                    <a-descriptions-item :label="t.lut">{{ info.lut }}</a-descriptions-item>
                    <a-descriptions-item :label="t.watermark">{{ info.watermark }}</a-descriptions-item>
                  </a-descriptions>
                </a-col>
                <a-col :xs="24" :md="12">
                  <a-typography-title :heading="6" class="profile-section-title">{{ t.audioParams }}</a-typography-title>
                  <a-descriptions :column="1" bordered size="large">
                    <a-descriptions-item :label="t.sampleRate">{{ info.sampleRate }}</a-descriptions-item>
                    <a-descriptions-item :label="t.channels">{{ info.channels }}</a-descriptions-item>
                    <a-descriptions-item :label="t.audioBitrate">{{ info.audioBitrate }}</a-descriptions-item>
                    <a-descriptions-item :label="t.audioCodec">{{ info.audioCodec }}</a-descriptions-item>
                    <a-descriptions-item :label="t.loudness">{{ info.loudness }}</a-descriptions-item>
                    <a-descriptions-item :label="t.fadeIn">{{ info.fadeIn }}</a-descriptions-item>
                    <a-descriptions-item :label="t.fadeOut">{{ info.fadeOut }}</a-descriptions-item>
                    <a-descriptions-item :label="t.subtitle">{{ info.subtitle }}</a-descriptions-item>
                  </a-descriptions>
                </a-col>
              </a-row>
            </a-tab-pane>

            <a-tab-pane key="logs" :title="t.tabLogs">
              <a-timeline class="profile-timeline">
                <a-timeline-item v-for="(log, i) in logs" :key="i" :dot-color="log.color">
                  <div class="profile-log-item">
                    <div class="profile-log-meta">
                      <span class="profile-log-time">{{ log.time }}</span>
                      <a-tag size="small">{{ log.user }}</a-tag>
                    </div>
                    <div class="profile-log-action">{{ log.action }}</div>
                  </div>
                </a-timeline-item>
              </a-timeline>
            </a-tab-pane>

            <a-tab-pane key="related" :title="t.tabRelated">
              <a-table
                :columns="relatedColumns"
                :data="relatedData"
                :pagination="false"
                row-key="key"
              >
                <template #status="{ record }">
                  <a-tag :color="statusMap[record.status].color" size="small">
                    {{ statusMap[record.status].text }}
                  </a-tag>
                </template>
              </a-table>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </div>
    `,
  }

  mountProPage({ pageKey: 'profile/advanced', title: '高级详情页', pageComponent: ProfileAdvancedPage })
})()
