;(function () {
  const t = ArcoProLocale.userHome
  const user = AdminAuth.getUserInfo()
  const avatarCropMixin = ArcoProAvatarCrop.createMixin(t)

  const avatarColors = [
    'rgb(var(--primary-6))',
    'rgb(var(--cyan-6))',
    'rgb(var(--warning-6))',
    'rgb(var(--danger-6))',
    'rgb(var(--purple-6))',
  ]

  const UserHomePage = {
    name: 'UserHomePage',
    mixins: [avatarCropMixin],
    data() {
      return {
        t,
        userName: user.name || 'admin',
        avatarUrl: '',
        avatarObjectUrl: '',
        profile: {
          title: '前端艺术家',
          dept: '前端',
          location: '北京',
        },
        projects: [
          { name: '企业级产品设计系统', desc: 'Arco Design System', members: 929, avatars: ['张', '李', '王'] },
          { name: '火山引擎智能应用', desc: 'The Volcano Engine', members: 155, avatars: ['陈', '赵', '周'] },
          { name: 'OCR文本识别', desc: 'OCR text recognition', members: 883, avatars: ['吴', '郑', '钱'] },
          { name: '内容资源管理', desc: 'Content resource management', members: 337, avatars: ['孙', '李', '周'] },
          { name: '今日头条内容管理', desc: 'Toutiao content management', members: 658, avatars: ['王', '冯', '陈'] },
          { name: '智能机器人', desc: 'Intelligent Robot Project', members: 292, avatars: ['褚', '卫', '蒋'] },
        ],
        activities: [
          {
            action: '发布了项目 Arco Design System',
            detail: '企业级产品设计系统',
            avatar: '王',
            color: avatarColors[0],
            time: '刚刚',
          },
          {
            action: '更新了文档《组件库接入指南》',
            detail: '火山引擎智能应用',
            avatar: '李',
            color: avatarColors[1],
            time: '2 小时前',
          },
          {
            action: '完成了 OCR 模型评测报告',
            detail: 'OCR文本识别',
            avatar: '陈',
            color: avatarColors[2],
            time: '昨天 18:30',
          },
          {
            action: '合并了内容资源管理 v1.2 分支',
            detail: '内容资源管理',
            avatar: '赵',
            color: avatarColors[3],
            time: '08-06 14:20',
          },
          {
            action: '审核了图文内容：年终特别策划',
            detail: '今日头条内容管理',
            avatar: '周',
            color: avatarColors[4],
            time: '08-05 09:12',
          },
          {
            action: '创建了智能机器人对话流程',
            detail: '智能机器人',
            avatar: '吴',
            color: avatarColors[0],
            time: '08-04 16:45',
          },
          {
            action: '修复了登录态过期跳转问题',
            detail: '企业级产品设计系统',
            avatar: '郑',
            color: avatarColors[1],
            time: '08-03 11:08',
          },
        ],
        teams: [
          { name: '火山引擎智能应用团队', count: 69, color: avatarColors[0] },
          { name: '企业级产品设计团队', count: 5489, color: avatarColors[1] },
          { name: '前端/UE小分队', count: 3132, color: avatarColors[2] },
          { name: '内容识别插件小分队', count: 77, color: avatarColors[3] },
        ],
        notices: [
          { title: '系统将于本周日凌晨 2:00 进行例行维护', type: '公告', time: '10 分钟前' },
          { title: '你有 3 条待处理的内容审核任务', type: '待办', time: '1 小时前' },
          { title: '「前端/UE小分队」新增成员邀请待确认', type: '团队', time: '昨天 09:20' },
          { title: 'Arco Design System 项目周报已生成', type: '项目', time: '08-06 17:40' },
          { title: '账号安全提醒：建议开启两步验证', type: '安全', time: '08-05 11:05' },
        ],
        avatarColors,
      }
    },
    methods: {
      onMore(label) {
        ArcoVue.Message.info(label)
      },
    },
    template: `
      <div class="user-home-page">
        <div class="user-home-header">
          <a-space direction="vertical" align="center" :size="12">
            <div
              class="user-home-avatar-wrap"
              :title="t.changeAvatar"
              role="button"
              tabindex="0"
              @click="onAvatarClick"
              @keydown.enter.prevent="onAvatarClick"
            >
              <input
                ref="avatarInput"
                class="user-home-avatar-input"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                @change="onAvatarChange"
                @click.stop
              />
              <div class="user-home-avatar-shell" :class="{ 'has-image': !!avatarUrl }">
                <img v-if="avatarUrl" class="user-home-avatar-img" :src="avatarUrl" alt="avatar" />
                <a-avatar
                  v-else
                  :size="64"
                  class="pro-avatar-brand user-home-avatar-fallback"
                  :auto-fix-font-size="false"
                >
                  <icon-avatar />
                </a-avatar>
              </div>
              <span class="user-home-avatar-camera" aria-hidden="true"><icon-camera /></span>
            </div>
            <a-typography-title :heading="6" class="user-home-name">{{ userName }}</a-typography-title>
            <div class="user-home-msg">
              <a-space :size="18">
                <span class="user-home-msg-item">
                  <icon-user />
                  <a-typography-text>{{ profile.title }}</a-typography-text>
                </span>
                <span class="user-home-msg-item">
                  <icon-home />
                  <a-typography-text>{{ profile.dept }}</a-typography-text>
                </span>
                <span class="user-home-msg-item">
                  <icon-location />
                  <a-typography-text>{{ profile.location }}</a-typography-text>
                </span>
              </a-space>
            </div>
          </a-space>
        </div>

        <a-row :gutter="16" class="user-home-content">
          <a-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18" :xxl="18">
            <a-card class="general-card" :title="t.myProjects">
              <template #extra>
                <a-link @click="onMore(t.viewMore)">{{ t.viewMore }}</a-link>
              </template>
              <a-row :gutter="16">
                <a-col
                  v-for="(item, i) in projects"
                  :key="i"
                  :xs="12"
                  :sm="12"
                  :md="12"
                  :lg="12"
                  :xl="8"
                  :xxl="8"
                  class="user-home-project-item"
                >
                  <a-card class="user-home-project-card" :bordered="true">
                    <a-space direction="vertical" :size="8">
                      <a-typography-text><b>{{ item.name }}</b></a-typography-text>
                      <a-typography-text type="secondary">{{ item.desc }}</a-typography-text>
                      <a-space align="center" :size="8">
                        <a-avatar-group :size="24" :max-count="3">
                          <a-avatar
                            v-for="(name, ai) in item.avatars"
                            :key="ai"
                            :style="{ backgroundColor: avatarColors[ai % avatarColors.length] }"
                          >{{ name }}</a-avatar>
                        </a-avatar-group>
                        <a-typography-text type="secondary">{{ t.andOthers.replace('{n}', item.members) }}</a-typography-text>
                      </a-space>
                    </a-space>
                  </a-card>
                </a-col>
              </a-row>
            </a-card>

            <a-card class="general-card user-home-block" :title="t.latestNews">
              <template #extra>
                <a-link @click="onMore(t.viewAll)">{{ t.viewAll }}</a-link>
              </template>
              <a-list :bordered="false" class="user-home-activity-list">
                <a-list-item v-for="(item, i) in activities" :key="i" class="user-home-activity-item">
                  <a-list-item-meta>
                    <template #avatar>
                      <a-avatar :size="36" class="pro-avatar-brand" :style="{ backgroundColor: item.color }">
                        {{ item.avatar }}
                      </a-avatar>
                    </template>
                    <template #title>
                      <span class="user-home-activity-title">{{ item.action }}</span>
                    </template>
                    <template #description>
                      <span class="user-home-activity-desc">{{ item.detail }}</span>
                    </template>
                  </a-list-item-meta>
                  <template #actions>
                    <a-typography-text type="secondary" class="user-home-activity-time">{{ item.time }}</a-typography-text>
                  </template>
                </a-list-item>
              </a-list>
            </a-card>
          </a-col>

          <a-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6" :xxl="6" class="user-home-side">
            <a-card class="general-card" :title="t.myTeam">
              <a-list :bordered="false" class="user-home-team-list">
                <a-list-item v-for="(item, i) in teams" :key="i" class="user-home-team-item">
                  <a-list-item-meta :title="item.name" :description="t.teamCount.replace('{n}', item.count)">
                    <template #avatar>
                      <a-avatar :size="32" :style="{ backgroundColor: item.color }">
                        {{ item.name.slice(0, 1) }}
                      </a-avatar>
                    </template>
                  </a-list-item-meta>
                </a-list-item>
              </a-list>
            </a-card>

            <a-card class="general-card user-home-block" :title="t.siteNotice">
              <a-list :bordered="false" class="user-home-notice-list">
                <a-list-item v-for="(item, i) in notices" :key="i" class="user-home-notice-item">
                  <a-list-item-meta>
                    <template #title>
                      <span class="user-home-notice-title-row">
                        <a-tag size="small" class="user-home-notice-tag">{{ item.type }}</a-tag>
                        <span class="user-home-notice-title">{{ item.title }}</span>
                      </span>
                    </template>
                  </a-list-item-meta>
                  <template #actions>
                    <a-typography-text type="secondary" class="user-home-notice-time">{{ item.time }}</a-typography-text>
                  </template>
                </a-list-item>
              </a-list>
            </a-card>
          </a-col>
        </a-row>

        <a-modal
          :visible="cropVisible"
          :title="t.cropTitle"
          :width="468"
          :mask-closable="false"
          unmount-on-close
          modal-class="avatar-crop-modal"
          @cancel="onCropCancel"
        >
          <div class="avatar-crop">
            <div
              class="avatar-crop-stage"
              :class="{ 'is-dragging': cropDragging }"
              @mousedown.prevent="onCropPointerDown"
              @mousemove="onCropPointerMove"
              @mouseup="onCropPointerUp"
              @mouseleave="onCropPointerUp"
              @wheel.prevent="onCropWheel"
            >
              <img
                v-if="cropSourceUrl"
                ref="cropImage"
                class="avatar-crop-image"
                :src="cropSourceUrl"
                :style="cropImageStyle"
                alt="crop"
                draggable="false"
                @load="onCropImageLoad"
              />
              <div class="avatar-crop-mask" aria-hidden="true"></div>
            </div>
            <div class="avatar-crop-toolbar">
              <span class="avatar-crop-toolbar-label">{{ t.cropZoom }}</span>
              <a-slider v-model="cropZoom" :min="1" :max="3" :step="0.01" :show-tooltip="false" />
            </div>
          </div>
          <template #footer>
            <a-space>
              <a-button @click="onCropCancel">{{ t.cropCancel }}</a-button>
              <a-button @click="onCropReselect">{{ t.cropReselect }}</a-button>
              <a-button type="primary" :disabled="!cropReady" @click="onCropConfirm">{{ t.cropConfirm }}</a-button>
            </a-space>
          </template>
        </a-modal>
      </div>
    `,
  }

  mountProPage({ pageKey: 'user/home', title: '个人主页', pageComponent: UserHomePage })
})()
