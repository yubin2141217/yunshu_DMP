;(function () {
  const t = ArcoProLocale.profile

  const ProfileBasicPage = {
    name: 'ProfileBasicPage',
    data() {
      return {
        t,
        info: {
          id: 'CRS-20260718-042',
          title: '城市夜跑训练营 · 第 3 期课程回放',
          status: 'online',
          owner: '周明',
          department: '运动内容组',
          updatedAt: '2026-07-28 21:16:00',
          createdAt: '2026-07-18 10:05:00',
          publishAt: '2026-07-20 08:00:00',
          category: '运动健康',
          contentType: '系列课程',
          channel: 'App 课程中心 / 微信视频号',
          language: '中文（普通话）',
          region: '中国大陆',
          duration: '48:22',
          fileSize: '1.28 GB',
          storage: 'OSS · cn-beijing',
          cover: 'night-run-s3-cover.jpg',
          tags: '夜跑, 体能, 课程回放',
          description:
            '第 3 期城市夜跑训练营完整课程回放，含热身、间歇跑、拉伸与教练点评。支持倍速播放与章节跳转，面向 App 会员与视频号学员同步分发。',
          mode: '固定匹配',
          codec: 'H.265',
          profile: 'Main',
          resolution: '2560×1440',
          aspectRatio: '16:9',
          fps: '60 fps',
          bitrate: '8000 kbps',
          colorSpace: 'Rec.709',
          container: 'MP4',
          brightness: '46',
          contrast: '54',
          saturation: '52',
          hue: '-2',
          sharpen: '40',
          denoise: '中等',
          stabilize: '开启',
          hdr: 'HLG',
          watermark: '城市夜跑 · 左下角',
          lut: 'NightRun_Cool_v2',
          sampleRate: '48 kHz',
          channels: '立体声',
          audioBitrate: '256 kbps',
          audioCodec: 'AAC-LC',
          audioProfile: 'LC',
          volumeNorm: '开启',
          noiseGate: '关闭',
          adaptMode: '多端自适应',
          maxWidth: '2560',
          minBitrate: '1500 kbps',
          maxBitrate: '10000 kbps',
          cdn: '已启用',
          drm: '未启用',
          subtitle: '中文字幕轨 ×1',
        },
      }
    },
    methods: {
      onEdit() {
        ArcoVue.Message.info(t.editTip)
      },
      onExport() {
        ArcoVue.Message.success(t.exportTip)
      },
      onBack() {
        window.location.href = 'list-search-table.html'
      },
    },
    template: `
      <div class="profile-page">
        <a-card class="pro-page-card profile-header-card" :bordered="false">
          <div class="profile-header">
            <div class="profile-header-top">
              <div class="profile-header-main">
                <a-typography-title :heading="5" class="profile-header-title">
                  {{ info.title }}
                </a-typography-title>
                <div class="profile-header-tags">
                  <a-tag color="green">{{ t.statusOnline }}</a-tag>
                  <a-tag color="arcoblue">{{ info.category }}</a-tag>
                </div>
              </div>
              <a-space class="profile-toolbar">
                <a-button type="primary" @click="onEdit">{{ t.edit }}</a-button>
                <a-button @click="onExport">{{ t.export }}</a-button>
                <a-button @click="onBack">{{ t.back }}</a-button>
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

        <a-card class="pro-page-card" :title="t.overview" :bordered="false">
          <a-descriptions :column="3" size="large" class="profile-descriptions profile-descriptions--wide">
            <a-descriptions-item :label="t.contentType">{{ info.contentType }}</a-descriptions-item>
            <a-descriptions-item :label="t.channel">{{ info.channel }}</a-descriptions-item>
            <a-descriptions-item :label="t.language">{{ info.language }}</a-descriptions-item>
            <a-descriptions-item :label="t.region">{{ info.region }}</a-descriptions-item>
            <a-descriptions-item :label="t.duration">{{ info.duration }}</a-descriptions-item>
            <a-descriptions-item :label="t.fileSize">{{ info.fileSize }}</a-descriptions-item>
            <a-descriptions-item :label="t.createdAt">{{ info.createdAt }}</a-descriptions-item>
            <a-descriptions-item :label="t.publishAt">{{ info.publishAt }}</a-descriptions-item>
            <a-descriptions-item :label="t.storage">{{ info.storage }}</a-descriptions-item>
            <a-descriptions-item :label="t.cover">{{ info.cover }}</a-descriptions-item>
            <a-descriptions-item :label="t.tags" :span="2">{{ info.tags }}</a-descriptions-item>
            <a-descriptions-item :label="t.description" :span="3">
              <span class="profile-desc-text">{{ info.description }}</span>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card class="pro-page-card" :title="t.videoInfo" :bordered="false">
          <a-descriptions :column="3" size="large" class="profile-descriptions">
            <a-descriptions-item :label="t.videoMode">{{ info.mode }}</a-descriptions-item>
            <a-descriptions-item :label="t.codec">{{ info.codec }}</a-descriptions-item>
            <a-descriptions-item :label="t.profile">{{ info.profile }}</a-descriptions-item>
            <a-descriptions-item :label="t.resolution">{{ info.resolution }}</a-descriptions-item>
            <a-descriptions-item :label="t.aspectRatio">{{ info.aspectRatio }}</a-descriptions-item>
            <a-descriptions-item :label="t.fps">{{ info.fps }}</a-descriptions-item>
            <a-descriptions-item :label="t.bitrate">{{ info.bitrate }}</a-descriptions-item>
            <a-descriptions-item :label="t.colorSpace">{{ info.colorSpace }}</a-descriptions-item>
            <a-descriptions-item :label="t.container">{{ info.container }}</a-descriptions-item>
            <a-descriptions-item :label="t.status">
              <a-badge status="success" :text="t.statusOnline" />
            </a-descriptions-item>
            <a-descriptions-item :label="t.subtitle">{{ info.subtitle }}</a-descriptions-item>
            <a-descriptions-item :label="t.drm">{{ info.drm }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card class="pro-page-card" :title="t.video" :bordered="false">
          <a-descriptions :column="3" size="large" class="profile-descriptions">
            <a-descriptions-item :label="t.brightness">{{ info.brightness }}</a-descriptions-item>
            <a-descriptions-item :label="t.hue">{{ info.hue }}</a-descriptions-item>
            <a-descriptions-item :label="t.stabilize">{{ info.stabilize }}</a-descriptions-item>
            <a-descriptions-item :label="t.contrast">{{ info.contrast }}</a-descriptions-item>
            <a-descriptions-item :label="t.sharpen">{{ info.sharpen }}</a-descriptions-item>
            <a-descriptions-item :label="t.hdr">{{ info.hdr }}</a-descriptions-item>
            <a-descriptions-item :label="t.saturation">{{ info.saturation }}</a-descriptions-item>
            <a-descriptions-item :label="t.denoise">{{ info.denoise }}</a-descriptions-item>
            <a-descriptions-item :label="t.watermark">{{ info.watermark }}</a-descriptions-item>
            <a-descriptions-item :label="t.lut" :span="3">{{ info.lut }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card class="pro-page-card" :title="t.audio" :bordered="false">
          <a-descriptions :column="3" size="large" class="profile-descriptions">
            <a-descriptions-item :label="t.sampleRate">{{ info.sampleRate }}</a-descriptions-item>
            <a-descriptions-item :label="t.channels">{{ info.channels }}</a-descriptions-item>
            <a-descriptions-item :label="t.audioBitrate">{{ info.audioBitrate }}</a-descriptions-item>
            <a-descriptions-item :label="t.audioCodec">{{ info.audioCodec }}</a-descriptions-item>
            <a-descriptions-item :label="t.audioProfile">{{ info.audioProfile }}</a-descriptions-item>
            <a-descriptions-item :label="t.volumeNorm">{{ info.volumeNorm }}</a-descriptions-item>
            <a-descriptions-item :label="t.noiseGate">{{ info.noiseGate }}</a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-card class="pro-page-card" :title="t.adapt" :bordered="false">
          <a-descriptions :column="3" size="large" class="profile-descriptions profile-descriptions--wide">
            <a-descriptions-item :label="t.adaptMode">{{ info.adaptMode }}</a-descriptions-item>
            <a-descriptions-item :label="t.maxWidth">{{ info.maxWidth }}</a-descriptions-item>
            <a-descriptions-item :label="t.cdn">{{ info.cdn }}</a-descriptions-item>
            <a-descriptions-item :label="t.minBitrate">{{ info.minBitrate }}</a-descriptions-item>
            <a-descriptions-item :label="t.maxBitrate">{{ info.maxBitrate }}</a-descriptions-item>
            <a-descriptions-item :label="t.storage">{{ info.storage }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
      </div>
    `,
  }

  mountProPage({ pageKey: 'profile/basic', title: '基础详情页', pageComponent: ProfileBasicPage })
})()
