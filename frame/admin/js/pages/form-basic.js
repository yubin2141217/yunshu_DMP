;(function () {
  const t = ArcoProLocale.formBasic

  const emptyForm = () => ({
    title: '',
    dateRange: [],
    goal: '',
    standard: '',
    client: undefined,
    reviewers: [],
    weight: undefined,
    visibility: 'public',
  })

  const FormBasicPage = {
    name: 'FormBasicPage',
    data() {
      return {
        t,
        loading: false,
        form: emptyForm(),
        clientOptions: [
          { label: '字节跳动', value: 'bytedance' },
          { label: '阿里巴巴', value: 'alibaba' },
          { label: '腾讯', value: 'tencent' },
          { label: '美团', value: 'meituan' },
        ],
        reviewerOptions: [
          { label: '张三', value: 'zhangsan' },
          { label: '李四', value: 'lisi' },
          { label: '王五', value: 'wangwu' },
          { label: '赵六', value: 'zhaoliu' },
        ],
        isNarrow: typeof window !== 'undefined' && window.innerWidth < 768,
        rules: {
          title: [{ required: true, message: t.titleRequired }],
          dateRange: [
            {
              required: true,
              validator: (value, cb) => {
                if (!value || !Array.isArray(value) || value.length < 2 || !value[0] || !value[1]) {
                  cb(t.dateRangeRequired)
                  return
                }
                cb()
              },
            },
          ],
          goal: [{ required: true, message: t.goalRequired }],
          standard: [{ required: true, message: t.standardRequired }],
        },
      }
    },
    computed: {
      formLayout() {
        return this.isNarrow ? 'vertical' : 'horizontal'
      },
      /** 横排右对齐、窄屏纵排左对齐 */
      labelAlign() {
        return this.formLayout === 'vertical' ? 'left' : 'right'
      },
      /** 右对齐星号在前，左对齐星号在后 */
      asteriskPosition() {
        return this.labelAlign === 'left' ? 'end' : 'start'
      },
      labelColProps() {
        return this.isNarrow ? undefined : { span: 6 }
      },
      wrapperColProps() {
        return this.isNarrow ? undefined : { span: 18 }
      },
    },
    mounted() {
      this._onResize = () => {
        this.isNarrow = window.innerWidth < 768
      }
      window.addEventListener('resize', this._onResize)
    },
    beforeUnmount() {
      window.removeEventListener('resize', this._onResize)
    },
    methods: {
      /** Arco Form 已校验后触发 submit，payload 为 { values, errors }（非原生 Event，勿用 .prevent） */
      onSubmit(data) {
        if (data && data.errors) {
          ArcoVue.Message.error(t.validateFail)
          return
        }
        this.submitForm()
      },
      submitForm() {
        this.loading = true
        window.setTimeout(() => {
          this.loading = false
          ArcoVue.Message.success(t.submitSuccess)
        }, 800)
      },
      onReset() {
        this.form = emptyForm()
        const formRef = this.$refs.formRef
        if (formRef && typeof formRef.clearValidate === 'function') {
          formRef.clearValidate()
        }
      },
    },
    template: `
      <div class="form-basic-page">
        <a-card class="general-card pro-page-card form-group-intro-card">
          <div class="form-basic-header form-basic-header--flush">
            <div class="form-basic-title">{{ t.cardTitle }}</div>
            <p class="form-basic-desc">{{ t.desc }}</p>
          </div>
        </a-card>
        <a-card class="general-card pro-page-card form-basic-card">
          <div class="form-basic-body">
            <a-form
              ref="formRef"
              class="form-basic-form"
              :layout="formLayout"
              :label-align="labelAlign"
              :model="form"
              :rules="rules"
              :label-col-props="labelColProps"
              :wrapper-col-props="wrapperColProps"
              @submit="onSubmit"
            >
              <a-form-item :label="t.titleLabel" field="title" required :asterisk-position="asteriskPosition">
                <a-input v-model="form.title" :placeholder="t.titlePh" allow-clear />
              </a-form-item>
              <a-form-item :label="t.dateRange" field="dateRange" required :asterisk-position="asteriskPosition">
                <a-range-picker v-model="form.dateRange" class="pro-field-block" style="width: 100%" />
              </a-form-item>
              <a-form-item :label="t.goal" field="goal" required :asterisk-position="asteriskPosition">
                <a-textarea
                  v-model="form.goal"
                  :placeholder="t.goalPh"
                  :auto-size="{ minRows: 4, maxRows: 6 }"
                  :max-length="200"
                  show-word-limit
                />
              </a-form-item>
              <a-form-item :label="t.standard" field="standard" required :asterisk-position="asteriskPosition">
                <a-textarea
                  v-model="form.standard"
                  :placeholder="t.standardPh"
                  :auto-size="{ minRows: 4, maxRows: 6 }"
                  :max-length="200"
                  show-word-limit
                />
              </a-form-item>
              <a-form-item :label="t.client" field="client">
                <a-select
                  v-model="form.client"
                  :options="clientOptions"
                  :placeholder="t.clientPh"
                  allow-search
                  allow-clear
                />
              </a-form-item>
              <a-form-item :label="t.reviewers" field="reviewers">
                <a-select
                  v-model="form.reviewers"
                  :options="reviewerOptions"
                  :placeholder="t.reviewersPh"
                  multiple
                  allow-search
                />
              </a-form-item>
              <a-form-item :label="t.weight" field="weight">
                <a-input-number
                  v-model="form.weight"
                  :placeholder="t.weightPh"
                  :min="0"
                  :max="100"
                  hide-button
                  style="width: 100%"
                >
                  <template #suffix>%</template>
                </a-input-number>
              </a-form-item>
              <a-form-item :label="t.visibility" field="visibility">
                <a-radio-group v-model="form.visibility">
                  <a-radio value="public">{{ t.visibilityPublic }}</a-radio>
                  <a-radio value="partial">{{ t.visibilityPartial }}</a-radio>
                  <a-radio value="private">{{ t.visibilityPrivate }}</a-radio>
                </a-radio-group>
                <template #extra>
                  <span v-if="form.visibility === 'public'">{{ t.visibilityPublicTip }}</span>
                  <span v-else-if="form.visibility === 'partial'">{{ t.visibilityPartialTip }}</span>
                  <span v-else>{{ t.visibilityPrivateTip }}</span>
                </template>
              </a-form-item>
              <a-form-item
                class="form-basic-actions-item"
                :hide-label="isNarrow"
                :label-col-props="isNarrow ? undefined : { span: 6 }"
                :wrapper-col-props="isNarrow ? undefined : { offset: 6, span: 18 }"
              >
                <a-space>
                  <a-button type="primary" html-type="submit" :loading="loading">{{ t.submit }}</a-button>
                  <a-button :disabled="loading" @click="onReset">{{ t.reset }}</a-button>
                </a-space>
              </a-form-item>
            </a-form>
          </div>
        </a-card>
      </div>
    `,
  }

  mountProPage({ pageKey: 'form/basic', title: '基础表单', pageComponent: FormBasicPage })
})()
