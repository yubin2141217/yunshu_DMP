;(function () {
  const t = ArcoProLocale.formStep

  const emptyForm = () => ({
    title: '',
    dateRange: [],
    owner: undefined,
    priority: undefined,
    department: undefined,
    goal: '',
    standard: '',
    client: undefined,
    weight: undefined,
    visibility: 'public',
  })

  const initialStep = (() => {
    try {
      const q = new URLSearchParams(window.location.search)
      const hash = (window.location.hash || '').replace(/^#/, '')
      const hashParams = new URLSearchParams(hash.includes('=') ? hash : '')
      const step = (
        q.get('step') ||
        q.get('preview') ||
        hashParams.get('step') ||
        hashParams.get('preview') ||
        (hash === 'success' || hash === 'done' || hash === '3' ? hash : '')
      ).toLowerCase()
      if (step === '3' || step === 'success' || step === 'done') return 3
    } catch (e) {
      /* ignore */
    }
    return 1
  })()

  const FormStepPage = {
    name: 'FormStepPage',
    data() {
      return {
        t,
        step: initialStep,
        loading: false,
        form: emptyForm(),
        ownerOptions: [
          { label: '张三', value: 'zhangsan' },
          { label: '李四', value: 'lisi' },
          { label: '王五', value: 'wangwu' },
          { label: '赵六', value: 'zhaoliu' },
        ],
        priorityOptions: [
          { label: '高', value: 'high' },
          { label: '中', value: 'medium' },
          { label: '低', value: 'low' },
        ],
        departmentOptions: [
          { label: '产品部', value: 'product' },
          { label: '研发部', value: 'rd' },
          { label: '运营部', value: 'ops' },
          { label: '市场部', value: 'marketing' },
        ],
        clientOptions: [
          { label: '字节跳动', value: 'bytedance' },
          { label: '阿里巴巴', value: 'alibaba' },
          { label: '腾讯', value: 'tencent' },
          { label: '美团', value: 'meituan' },
        ],
        rulesStep1: {
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
          owner: [{ required: true, message: t.ownerRequired }],
          priority: [{ required: true, message: t.priorityRequired }],
          department: [{ required: true, message: t.departmentRequired }],
        },
        rulesStep2: {
          goal: [{ required: true, message: t.goalRequired }],
          standard: [{ required: true, message: t.standardRequired }],
        },
      }
    },
    methods: {
      next() {
        if (this.step === 1 || this.step === 2) {
          const formRef = this.$refs.formRef
          if (!formRef || typeof formRef.validate !== 'function') {
            if (this.step === 1) {
              this.step = 2
              return
            }
            this.submitForm()
            return
          }
          formRef.validate((errors) => {
            if (errors) {
              ArcoVue.Message.error(t.validateFail)
              return
            }
            if (this.step === 1) {
              this.step = 2
              return
            }
            this.submitForm()
          })
          return
        }
      },
      submitForm() {
        this.loading = true
        window.setTimeout(() => {
          this.loading = false
          this.step = 3
          ArcoVue.Message.success(t.submitSuccess)
        }, 600)
      },
      prev() {
        if (this.step > 1) this.step -= 1
      },
      goHome() {
        window.location.href = 'dashboard.html'
      },
      viewList() {
        window.location.href = 'list-search-table.html'
      },
    },
    template: `
      <div class="form-step-page">
        <a-card class="general-card pro-page-card form-group-intro-card">
          <div class="form-basic-header form-basic-header--flush">
            <div class="form-basic-title">{{ t.cardTitle }}</div>
            <p class="form-basic-desc">{{ t.desc }}</p>
          </div>
        </a-card>
        <a-card class="form-step-card general-card pro-page-card">
          <a-steps
            v-if="step < 3"
            :current="step"
            small
            label-placement="vertical"
            class="form-step-steps"
          >
            <a-step :title="t.step1" />
            <a-step :title="t.step2" />
            <a-step :title="t.step3" />
          </a-steps>

          <div v-if="step === 3" class="form-step-success">
            <a-result :title="t.successTitle" :subtitle="t.successSub">
              <template #icon>
                <div class="form-step-success-icon" aria-hidden="true">
                  <svg class="form-step-success-check" viewBox="0 0 24 24" width="28" height="28" fill="none">
                    <path
                      d="M5 12.5l5 5L19 7"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </template>
              <template #extra>
                <a-space :size="12">
                  <a-button type="primary" @click="goHome">{{ t.back }}</a-button>
                  <a-button @click="viewList">{{ t.viewList }}</a-button>
                </a-space>
              </template>
            </a-result>
          </div>

          <template v-else>
            <a-form
              v-if="step === 1"
              ref="formRef"
              layout="vertical"
              class="form-step-body"
              :model="form"
              :rules="rulesStep1"
              @submit.prevent="next"
            >
              <a-form-item :label="t.titleLabel" field="title" required asterisk-position="end">
                <a-input v-model="form.title" :placeholder="t.titlePh" allow-clear />
              </a-form-item>
              <a-form-item :label="t.dateRange" field="dateRange" required asterisk-position="end">
                <a-range-picker v-model="form.dateRange" class="pro-field-block" style="width: 100%" />
              </a-form-item>
              <a-form-item :label="t.owner" field="owner" required asterisk-position="end">
                <a-select
                  v-model="form.owner"
                  :options="ownerOptions"
                  :placeholder="t.ownerPh"
                  allow-search
                  allow-clear
                />
              </a-form-item>
              <a-form-item :label="t.priority" field="priority" required asterisk-position="end">
                <a-select
                  v-model="form.priority"
                  :options="priorityOptions"
                  :placeholder="t.priorityPh"
                  allow-clear
                />
              </a-form-item>
              <a-form-item :label="t.department" field="department" required asterisk-position="end">
                <a-select
                  v-model="form.department"
                  :options="departmentOptions"
                  :placeholder="t.departmentPh"
                  allow-clear
                />
              </a-form-item>
            </a-form>
            <a-form
              v-else-if="step === 2"
              ref="formRef"
              layout="vertical"
              class="form-step-body"
              :model="form"
              :rules="rulesStep2"
              @submit.prevent="next"
            >
              <a-form-item :label="t.goal" field="goal" required asterisk-position="end">
                <a-textarea
                  v-model="form.goal"
                  :placeholder="t.goalPh"
                  :auto-size="{ minRows: 3, maxRows: 5 }"
                  :max-length="200"
                />
              </a-form-item>
              <a-form-item :label="t.standard" field="standard" required asterisk-position="end">
                <a-textarea
                  v-model="form.standard"
                  :placeholder="t.standardPh"
                  :auto-size="{ minRows: 3, maxRows: 5 }"
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
              </a-form-item>
            </a-form>
            <a-space class="form-step-actions">
              <a-button v-if="step > 1" :disabled="loading" @click="prev">{{ t.prev }}</a-button>
              <a-button v-if="step < 3" type="primary" :loading="loading" @click="next">
                {{ step === 2 ? t.submit : t.next }}
              </a-button>
            </a-space>
          </template>
        </a-card>
      </div>
    `,
  }

  mountProPage({ pageKey: 'form/step', title: '分步表单', pageComponent: FormStepPage })
})()
