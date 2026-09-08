;(function () {
  const DEFAULT_HTML =
    '<h2>活动说明</h2>' +
    '<p>本编辑器为静态原型示意，支持常见排版操作。可将富文本内容用于公告、帮助文档、运营文案等场景。</p>' +
    '<ul><li>支持标题、加粗、斜体、列表</li><li>支持对齐与撤销重做（浏览器原生）</li><li>内容可预览 HTML 渲染效果</li></ul>'

  const RichTextComponentPage = {
    name: 'RichTextComponentPage',
    data() {
      return {
        html: DEFAULT_HTML,
        previewHtml: DEFAULT_HTML,
        showPreview: false,
        heading: 'p',
      }
    },
    methods: {
      focusEditor() {
        const el = this.$refs.editorBody
        if (el) el.focus()
      },
      exec(cmd, value) {
        this.focusEditor()
        try {
          document.execCommand(cmd, false, value)
        } catch (e) {
          /* ignore */
        }
        this.syncHtml()
      },
      setHeading(tag) {
        this.heading = tag
        this.focusEditor()
        try {
          document.execCommand('formatBlock', false, tag)
        } catch (e) {
          /* ignore */
        }
        this.syncHtml()
      },
      syncHtml() {
        const el = this.$refs.editorBody
        if (el) this.html = el.innerHTML
      },
      insertLink() {
        const url = window.prompt('请输入链接地址', 'https://')
        if (!url) return
        this.exec('createLink', url)
      },
      clearFormat() {
        this.exec('removeFormat')
        this.exec('formatBlock', 'p')
        this.heading = 'p'
      },
      resetContent() {
        const el = this.$refs.editorBody
        if (el) el.innerHTML = DEFAULT_HTML
        this.html = DEFAULT_HTML
        this.previewHtml = DEFAULT_HTML
        this.showPreview = false
        if (window.ArcoVue && ArcoVue.Message) {
          ArcoVue.Message.success('已恢复默认内容')
        }
      },
      preview() {
        this.syncHtml()
        this.previewHtml = this.html
        this.showPreview = true
        if (window.ArcoVue && ArcoVue.Message) {
          ArcoVue.Message.info('已更新预览')
        }
      },
      saveDraft() {
        this.syncHtml()
        if (window.ArcoVue && ArcoVue.Message) {
          ArcoVue.Message.success('草稿已保存（原型模拟）')
        }
      },
    },
    mounted() {
      this.$nextTick(() => {
        const el = this.$refs.editorBody
        if (el) el.innerHTML = this.html
      })
    },
    template: `
      <div class="component-showcase-page">
        <a-alert
          class="component-showcase-tip"
          type="info"
          show-icon
          :closable="false"
        >
          富文本组件原型：工具栏 + 可编辑区域，演示排版与预览交互（无第三方编辑器依赖）。
        </a-alert>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">基础编辑器</div>
            <div class="component-editor">
              <div class="component-editor-toolbar">
                <a-select
                  :model-value="heading"
                  :style="{ width: '120px' }"
                  size="small"
                  :options="[
                    { label: '正文', value: 'p' },
                    { label: '标题 1', value: 'h1' },
                    { label: '标题 2', value: 'h2' },
                    { label: '标题 3', value: 'h3' },
                  ]"
                  @change="setHeading"
                />
                <span class="component-editor-divider"></span>
                <a-button-group size="small">
                  <a-button type="text" class="component-editor-tool-btn" @click="exec('bold')"><template #icon><icon-bold /></template></a-button>
                  <a-button type="text" class="component-editor-tool-btn" @click="exec('italic')"><template #icon><icon-italic /></template></a-button>
                  <a-button type="text" class="component-editor-tool-btn" @click="exec('underline')"><template #icon><icon-underline /></template></a-button>
                  <a-button type="text" class="component-editor-tool-btn" @click="exec('strikeThrough')"><template #icon><icon-strikethrough /></template></a-button>
                </a-button-group>
                <span class="component-editor-divider"></span>
                <a-button-group size="small">
                  <a-button type="text" class="component-editor-tool-btn" @click="exec('justifyLeft')"><template #icon><icon-align-left /></template></a-button>
                  <a-button type="text" class="component-editor-tool-btn" @click="exec('justifyCenter')"><template #icon><icon-align-center /></template></a-button>
                  <a-button type="text" class="component-editor-tool-btn" @click="exec('justifyRight')"><template #icon><icon-align-right /></template></a-button>
                </a-button-group>
                <span class="component-editor-divider"></span>
                <a-button-group size="small">
                  <a-button type="text" class="component-editor-tool-btn" @click="exec('insertUnorderedList')"><template #icon><icon-list /></template></a-button>
                  <a-button type="text" class="component-editor-tool-btn" @click="exec('insertOrderedList')"><template #icon><icon-ordered-list /></template></a-button>
                  <a-button type="text" class="component-editor-tool-btn" @click="insertLink"><template #icon><icon-link /></template></a-button>
                </a-button-group>
                <span class="component-editor-divider"></span>
                <a-button-group size="small">
                  <a-button type="text" class="component-editor-tool-btn" @click="exec('undo')"><template #icon><icon-undo /></template></a-button>
                  <a-button type="text" class="component-editor-tool-btn" @click="exec('redo')"><template #icon><icon-redo /></template></a-button>
                  <a-button type="text" class="component-editor-tool-btn" @click="clearFormat"><template #icon><icon-eraser /></template></a-button>
                </a-button-group>
              </div>
              <div
                ref="editorBody"
                class="component-editor-body"
                contenteditable="true"
                data-placeholder="请输入正文内容…"
                @input="syncHtml"
                @blur="syncHtml"
              ></div>
            </div>
            <div class="component-editor-actions">
              <a-space>
                <a-button type="primary" @click="saveDraft">保存草稿</a-button>
                <a-button @click="preview">预览</a-button>
                <a-button @click="resetContent">重置</a-button>
              </a-space>
            </div>
          </a-card>
        </div>

        <div v-if="showPreview" class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">预览效果</div>
            <div class="component-editor-preview" v-html="previewHtml"></div>
          </a-card>
        </div>

        <div class="component-showcase-group">
          <a-card class="pro-page-card component-showcase-card">
            <div class="component-showcase-group-title">使用说明</div>
            <a-descriptions :column="1" size="large" bordered>
              <a-descriptions-item label="适用场景">公告、帮助中心、运营文案、邮件模板等长文本编辑。</a-descriptions-item>
              <a-descriptions-item label="输出格式">HTML 片段，可存入业务字段后在详情页渲染。</a-descriptions-item>
              <a-descriptions-item label="原型说明">当前为浏览器 contentEditable 示意；工程化项目可替换为 TinyMCE / Quill 等。</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </div>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'component/rich-text',
    title: ArcoProLocale.menu['menu.component.richText'] || '富文本组件',
    pageComponent: RichTextComponentPage,
  })
})()
