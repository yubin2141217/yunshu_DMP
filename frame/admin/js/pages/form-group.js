;(function () {
  const t = ArcoProLocale.formGroup

  const modeOptions = [
    { label: '自定义', value: 'custom' },
    { label: '模式1', value: 'mode1' },
    { label: '模式2', value: 'mode2' },
  ]

  const resolutionOptions = [
    { label: '分辨率1', value: 'res1' },
    { label: '分辨率2', value: 'res2' },
    { label: '分辨率3', value: 'res3' },
  ]

  const channelOptions = [
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
  ]

  const emptyForm = () => ({
    videoMode: undefined,
    videoAcqResolution: undefined,
    videoAcqFrameRate: '',
    videoEncResolution: undefined,
    videoEncRateMin: '',
    videoEncRateMax: '',
    videoEncRateDefault: '',
    videoEncFrameRate: '',
    videoEncProfile: '',
    audioMode: undefined,
    audioAcqChannels: undefined,
    audioEncChannels: '',
    audioEncRate: '',
    audioEncProfile: '',
    description: '',
  })

  const FormGroupPage = {
    name: 'FormGroupPage',
    data() {
      return {
        t,
        loading: false,
        form: emptyForm(),
        modeOptions,
        resolutionOptions,
        channelOptions,
        /* 与表单组件页一致：列间距 32、三列栅格 */
        colProps: { xs: 24, sm: 12, md: 8 },
        rowGutter: 32,
        rules: {
          videoMode: [{ required: true, message: t.videoModeRequired }],
          videoAcqResolution: [{ required: true, message: t.videoAcqResolutionRequired }],
          audioMode: [{ required: true, message: t.audioModeRequired }],
          description: [{ required: true, message: t.descriptionRequired }],
        },
      }
    },
    methods: {
      onSubmit() {
        const formRef = this.$refs.formRef
        if (!formRef || typeof formRef.validate !== 'function') {
          this.submitForm()
          return
        }
        formRef.validate((errors) => {
          if (errors) {
            ArcoVue.Message.error(t.validateFail)
            return
          }
          this.submitForm()
        })
      },
      submitForm() {
        this.loading = true
        window.setTimeout(() => {
          this.loading = false
          ArcoVue.Message.success(t.submitSuccess)
        }, 600)
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
      <div class="form-group-page">
        <a-card class="general-card pro-page-card form-group-intro-card">
          <div class="form-basic-header form-basic-header--flush">
            <div class="form-basic-title">{{ t.cardTitle }}</div>
            <p class="form-basic-desc">{{ t.desc }}</p>
          </div>
        </a-card>
        <a-form
          ref="formRef"
          layout="vertical"
          :model="form"
          :rules="rules"
          class="form-group-form"
        >
          <a-card class="general-card pro-page-card">
            <div class="form-section-title">{{ t.video }}</div>
            <a-row :gutter="rowGutter">
              <a-col v-bind="colProps">
                <a-form-item :label="t.videoMode" field="videoMode" required asterisk-position="end">
                  <a-select
                    v-model="form.videoMode"
                    :options="modeOptions"
                    :placeholder="t.pleaseSelect"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col v-bind="colProps">
                <a-form-item :label="t.videoAcqResolution" field="videoAcqResolution" required asterisk-position="end">
                  <a-select
                    v-model="form.videoAcqResolution"
                    :options="resolutionOptions"
                    :placeholder="t.pleaseSelect"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col v-bind="colProps">
                <a-form-item :label="t.videoAcqFrameRate" field="videoAcqFrameRate">
                  <a-input
                    v-model="form.videoAcqFrameRate"
                    :placeholder="t.rangeFrame"
                    allow-clear
                    append="fps"
                  />
                </a-form-item>
              </a-col>
              <a-col v-bind="colProps">
                <a-form-item :label="t.videoEncResolution" field="videoEncResolution">
                  <a-select
                    v-model="form.videoEncResolution"
                    :options="resolutionOptions"
                    :placeholder="t.pleaseSelect"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col v-bind="colProps">
                <a-form-item :label="t.videoEncRateMin" field="videoEncRateMin">
                  <a-input
                    v-model="form.videoEncRateMin"
                    :placeholder="t.rangeRate"
                    allow-clear
                    append="bps"
                  />
                </a-form-item>
              </a-col>
              <a-col v-bind="colProps">
                <a-form-item :label="t.videoEncRateMax" field="videoEncRateMax">
                  <a-input
                    v-model="form.videoEncRateMax"
                    :placeholder="t.rangeRate"
                    allow-clear
                    append="bps"
                  />
                </a-form-item>
              </a-col>
              <a-col v-bind="colProps">
                <a-form-item :label="t.videoEncRateDefault" field="videoEncRateDefault">
                  <a-input
                    v-model="form.videoEncRateDefault"
                    :placeholder="t.rangeRate"
                    allow-clear
                    append="bps"
                  />
                </a-form-item>
              </a-col>
              <a-col v-bind="colProps">
                <a-form-item :label="t.videoEncFrameRate" field="videoEncFrameRate">
                  <a-input
                    v-model="form.videoEncFrameRate"
                    :placeholder="t.rangeFrame"
                    allow-clear
                    append="fps"
                  />
                </a-form-item>
              </a-col>
              <a-col v-bind="colProps">
                <a-form-item :label="t.videoEncProfile" field="videoEncProfile">
                  <a-input
                    v-model="form.videoEncProfile"
                    :placeholder="t.rangeRate"
                    allow-clear
                    append="bps"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>

          <a-card class="general-card pro-page-card">
            <div class="form-section-title">{{ t.audio }}</div>
            <a-row :gutter="rowGutter">
              <a-col v-bind="colProps">
                <a-form-item :label="t.audioMode" field="audioMode" required asterisk-position="end">
                  <a-select
                    v-model="form.audioMode"
                    :options="modeOptions"
                    :placeholder="t.pleaseSelect"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col v-bind="colProps">
                <a-form-item :label="t.audioAcqChannels" field="audioAcqChannels">
                  <a-select
                    v-model="form.audioAcqChannels"
                    :options="channelOptions"
                    :placeholder="t.pleaseSelect"
                    allow-clear
                  />
                </a-form-item>
              </a-col>
              <a-col v-bind="colProps">
                <a-form-item :label="t.audioEncChannels" field="audioEncChannels">
                  <a-input
                    v-model="form.audioEncChannels"
                    :placeholder="t.rangeRate"
                    allow-clear
                    append="bps"
                  />
                </a-form-item>
              </a-col>
              <a-col v-bind="colProps">
                <a-form-item :label="t.audioEncRate" field="audioEncRate">
                  <a-input
                    v-model="form.audioEncRate"
                    :placeholder="t.rangeRate"
                    allow-clear
                    append="bps"
                  />
                </a-form-item>
              </a-col>
              <a-col v-bind="colProps">
                <a-form-item :label="t.audioEncProfile" field="audioEncProfile">
                  <a-input
                    v-model="form.audioEncProfile"
                    :placeholder="t.rangeFrame"
                    allow-clear
                    append="fps"
                  />
                </a-form-item>
              </a-col>
            </a-row>
          </a-card>

          <a-card class="general-card pro-page-card">
            <div class="form-section-title">{{ t.description }}</div>
            <a-form-item
              :label="t.parameterDescription"
              field="description"
              required
              asterisk-position="end"
            >
              <a-textarea
                v-model="form.description"
                :placeholder="t.descriptionPlaceholder"
                :auto-size="{ minRows: 5, maxRows: 8 }"
                :max-length="200"
              />
            </a-form-item>
          </a-card>

          <div class="form-group-actions">
            <a-space>
              <a-button @click="onReset">{{ t.reset }}</a-button>
              <a-button type="primary" :loading="loading" @click="onSubmit">{{ t.submit }}</a-button>
            </a-space>
          </div>
        </a-form>
      </div>
    `,
  }

  mountProPage({ pageKey: 'form/group', title: '分组表单', pageComponent: FormGroupPage })
})()
