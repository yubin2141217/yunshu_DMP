;(function () {
  const t = ArcoProLocale.formStepVertical

  const emptyForm = () => ({
    companyName: '',
    city: undefined,
    industry: undefined,
    contactName: '',
    mobile: '',
    position: '',
    source: undefined,
    rating: undefined,
    status: undefined,
    owner: undefined,
    address: '',
    website: '',
    employeeScale: undefined,
    establishedAt: undefined,
    licenseNo: '',
    legalPerson: '',
    email: '',
    companyType: undefined,
    region: undefined,
    businessScope: '',
    registeredCapital: '',
    annualRevenue: '',
    taxNo: '',
    bankName: '',
    bankAccount: '',
    invoiceType: undefined,
    accountName: '',
    payMethod: undefined,
    financeContact: '',
    settleCycle: undefined,
  })

  const FormStepVerticalPage = {
    name: 'FormStepVerticalPage',
    data() {
      return {
        t,
        step: 1,
        loading: false,
        form: emptyForm(),
        colProps: { xs: 24, sm: 24, md: 12 },
        rowGutter: 16,
        labelColProps: { span: 5 },
        wrapperColProps: { span: 19 },
        cityOptions: [
          { label: '北京', value: 'beijing' },
          { label: '上海', value: 'shanghai' },
          { label: '广州', value: 'guangzhou' },
          { label: '深圳', value: 'shenzhen' },
          { label: '杭州', value: 'hangzhou' },
        ],
        industryOptions: [
          { label: '互联网', value: 'internet' },
          { label: '制造业', value: 'manufacturing' },
          { label: '金融', value: 'finance' },
          { label: '教育', value: 'education' },
          { label: '零售', value: 'retail' },
        ],
        sourceOptions: [
          { label: '线上推广', value: 'online' },
          { label: '线下活动', value: 'offline' },
          { label: '老客转介', value: 'referral' },
          { label: '合作伙伴', value: 'partner' },
        ],
        ratingOptions: [
          { label: '一星', value: '1' },
          { label: '二星', value: '2' },
          { label: '三星', value: '3' },
          { label: '四星', value: '4' },
          { label: '五星', value: '5' },
        ],
        statusOptions: [
          { label: '潜在客户', value: 'lead' },
          { label: '意向客户', value: 'intent' },
          { label: '成交客户', value: 'won' },
          { label: '流失客户', value: 'lost' },
        ],
        ownerOptions: [
          { label: '张三', value: 'zhangsan' },
          { label: '李四', value: 'lisi' },
          { label: '王五', value: 'wangwu' },
          { label: '赵六', value: 'zhaoliu' },
        ],
        scaleOptions: [
          { label: '1-50 人', value: 's' },
          { label: '51-200 人', value: 'm' },
          { label: '201-1000 人', value: 'l' },
          { label: '1000 人以上', value: 'xl' },
        ],
        companyTypeOptions: [
          { label: '有限责任公司', value: 'llc' },
          { label: '股份有限公司', value: 'corp' },
          { label: '个体工商户', value: 'individual' },
          { label: '合伙企业', value: 'partnership' },
        ],
        regionOptions: [
          { label: '华北', value: 'north' },
          { label: '华东', value: 'east' },
          { label: '华南', value: 'south' },
          { label: '西部', value: 'west' },
        ],
        invoiceOptions: [
          { label: '增值税普通发票', value: 'normal' },
          { label: '增值税专用发票', value: 'special' },
        ],
        payMethodOptions: [
          { label: '银行转账', value: 'transfer' },
          { label: '支付宝', value: 'alipay' },
          { label: '微信支付', value: 'wechat' },
          { label: '支票', value: 'check' },
        ],
        settleCycleOptions: [
          { label: '月结', value: 'month' },
          { label: '季结', value: 'quarter' },
          { label: '年结', value: 'year' },
          { label: '货到付款', value: 'cod' },
        ],
        rulesStep1: {
          companyName: [{ required: true, message: t.companyNameRequired }],
          contactName: [{ required: true, message: t.contactNameRequired }],
          mobile: [{ required: true, message: t.mobileRequired }],
        },
        rulesStep2: {
          address: [{ required: true, message: t.addressRequired }],
          legalPerson: [{ required: true, message: t.legalPersonRequired }],
          email: [{ required: true, message: t.emailRequired }],
        },
        rulesStep3: {
          taxNo: [{ required: true, message: t.taxNoRequired }],
          bankAccount: [{ required: true, message: t.bankAccountRequired }],
          accountName: [{ required: true, message: t.accountNameRequired }],
        },
      }
    },
    computed: {
      stepList() {
        return [
          { key: 1, title: t.step1, desc: t.step1Desc },
          { key: 2, title: t.step2, desc: t.step2Desc },
          { key: 3, title: t.step3, desc: t.step3Desc },
          { key: 4, title: t.step4, desc: t.step4Desc },
        ]
      },
      currentRules() {
        if (this.step === 1) return this.rulesStep1
        if (this.step === 2) return this.rulesStep2
        if (this.step === 3) return this.rulesStep3
        return {}
      },
    },
    methods: {
      stepStatus(n) {
        if (this.step > n) return 'finish'
        if (this.step === n) return 'process'
        return 'wait'
      },
      validateThen(ok) {
        const formRef = this.$refs.formRef
        if (!formRef || typeof formRef.validate !== 'function') {
          ok()
          return
        }
        // Arco Form.validate：失败时 Promise resolve(errors)，不会 reject；回调同理传 errors
        formRef.validate((errors) => {
          if (errors) {
            ArcoVue.Message.error({
              content: t.validateFail,
              duration: 3000,
            })
            return
          }
          ok()
        })
      },
      next() {
        if (this.step === 1 || this.step === 2) {
          this.validateThen(() => {
            this.step += 1
          })
          return
        }
        if (this.step === 3) {
          this.validateThen(() => {
            this.loading = true
            window.setTimeout(() => {
              this.loading = false
              this.step = 4
              ArcoVue.Message.success(t.submitSuccess)
            }, 600)
          })
        }
      },
      prev() {
        if (this.step > 1 && this.step < 4) this.step -= 1
      },
      restart() {
        this.step = 1
        this.form = emptyForm()
        this.loading = false
      },
      goHome() {
        window.location.href = 'dashboard.html'
      },
    },
    template: `
      <div class="form-step-vertical-page">
        <a-card class="general-card pro-page-card form-group-intro-card">
          <div class="form-basic-header form-basic-header--flush">
            <div class="form-basic-title">{{ t.cardTitle }}</div>
            <p class="form-basic-desc">{{ t.desc }}</p>
          </div>
        </a-card>
        <a-card class="general-card pro-page-card form-step-vertical-card">
          <div v-if="step === 4" class="form-step-vertical-success form-step-success">
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
                <div class="form-step-success-panel">
                  <div class="form-step-success-panel-title">{{ t.successDetail }}</div>
                  <a-descriptions :column="1" size="medium" class="form-step-success-desc">
                    <a-descriptions-item :label="t.companyName">{{ form.companyName || '—' }}</a-descriptions-item>
                    <a-descriptions-item :label="t.contactName">{{ form.contactName || '—' }}</a-descriptions-item>
                    <a-descriptions-item :label="t.mobile">{{ form.mobile || '—' }}</a-descriptions-item>
                    <a-descriptions-item :label="t.address">{{ form.address || '—' }}</a-descriptions-item>
                    <a-descriptions-item :label="t.legalPerson">{{ form.legalPerson || '—' }}</a-descriptions-item>
                    <a-descriptions-item :label="t.taxNo">{{ form.taxNo || '—' }}</a-descriptions-item>
                  </a-descriptions>
                  <p class="form-step-success-tip">{{ t.successTip }}</p>
                </div>
                <div class="form-step-actions">
                  <a-space :size="12">
                    <a-button type="primary" @click="restart">{{ t.restart }}</a-button>
                    <a-button @click="goHome">{{ t.back }}</a-button>
                  </a-space>
                </div>
              </template>
            </a-result>
          </div>

          <a-form
            v-else
            ref="formRef"
            layout="horizontal"
            label-align="right"
            class="form-step-vertical-form"
            :model="form"
            :rules="currentRules"
            :label-col-props="labelColProps"
            :wrapper-col-props="wrapperColProps"
            feedback
            @submit.prevent="next"
          >
            <div class="form-step-vertical-layout">
              <div
                v-for="(item, index) in stepList"
                :key="item.key"
                :class="['form-step-vertical-block', 'is-' + stepStatus(index + 1)]"
              >
                <div class="form-step-vertical-block-rail">
                  <div class="form-step-vertical-node">
                    <icon-check v-if="step > index + 1" :size="12" />
                    <span v-else>{{ index + 1 }}</span>
                  </div>
                  <div
                    v-if="index < stepList.length - 1"
                    class="form-step-vertical-tail"
                  ></div>
                </div>
                <div class="form-step-vertical-block-main">
                  <div class="form-step-vertical-block-head">
                    <div class="form-step-vertical-block-title">{{ item.title }}</div>
                    <div class="form-step-vertical-block-desc">{{ item.desc }}</div>
                  </div>

                  <div v-if="step === 1 && index === 0" class="form-step-vertical-panel">
                    <a-row :gutter="rowGutter">
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.companyName" field="companyName" required asterisk-position="start">
                          <a-input v-model="form.companyName" :placeholder="t.companyNamePh" allow-clear>
                            <template #suffix>
                              <a-tooltip :content="t.companyNameTip" position="top">
                                <span class="form-step-vertical-tip-icon" tabindex="0">
                                  <icon-info-circle :size="14" />
                                </span>
                              </a-tooltip>
                            </template>
                          </a-input>
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.position" field="position">
                          <a-input v-model="form.position" :placeholder="t.positionPh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.city" field="city">
                          <a-select
                            v-model="form.city"
                            :options="cityOptions"
                            :placeholder="t.cityPh"
                            allow-search
                            allow-clear
                          />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.source" field="source">
                          <a-select
                            v-model="form.source"
                            :options="sourceOptions"
                            :placeholder="t.sourcePh"
                            allow-clear
                          />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.industry" field="industry">
                          <a-select
                            v-model="form.industry"
                            :options="industryOptions"
                            :placeholder="t.industryPh"
                            allow-clear
                          />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.rating" field="rating">
                          <a-select
                            v-model="form.rating"
                            :options="ratingOptions"
                            :placeholder="t.ratingPh"
                            allow-clear
                          />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.contactName" field="contactName" required asterisk-position="start">
                          <a-input v-model="form.contactName" :placeholder="t.contactNamePh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.status" field="status">
                          <a-select
                            v-model="form.status"
                            :options="statusOptions"
                            :placeholder="t.statusPh"
                            allow-clear
                          />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.mobile" field="mobile" required asterisk-position="start">
                          <a-input v-model="form.mobile" :placeholder="t.mobilePh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.owner" field="owner">
                          <a-select
                            v-model="form.owner"
                            :options="ownerOptions"
                            :placeholder="t.ownerPh"
                            allow-search
                            allow-clear
                          />
                        </a-form-item>
                      </a-col>
                    </a-row>
                    <a-row :gutter="rowGutter">
                      <a-col v-bind="colProps">
                        <a-form-item
                          class="form-step-vertical-actions"
                          :label-col-props="{ span: 0 }"
                          :wrapper-col-props="{ offset: labelColProps.span, span: wrapperColProps.span }"
                        >
                          <a-space>
                            <a-button type="primary" :loading="loading" @click="next">{{ t.next }}</a-button>
                          </a-space>
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </div>

                  <div v-else-if="step === 2 && index === 1" class="form-step-vertical-panel">
                    <a-row :gutter="rowGutter">
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.address" field="address" required asterisk-position="start">
                          <a-input v-model="form.address" :placeholder="t.addressPh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.website" field="website">
                          <a-input v-model="form.website" :placeholder="t.websitePh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.employeeScale" field="employeeScale">
                          <a-select
                            v-model="form.employeeScale"
                            :options="scaleOptions"
                            :placeholder="t.employeeScalePh"
                            allow-clear
                          />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.establishedAt" field="establishedAt">
                          <a-date-picker
                            v-model="form.establishedAt"
                            style="width: 100%"
                            :placeholder="t.establishedAtPh"
                          />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.licenseNo" field="licenseNo">
                          <a-input v-model="form.licenseNo" :placeholder="t.licenseNoPh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.companyType" field="companyType">
                          <a-select
                            v-model="form.companyType"
                            :options="companyTypeOptions"
                            :placeholder="t.companyTypePh"
                            allow-clear
                          />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.legalPerson" field="legalPerson" required asterisk-position="start">
                          <a-input v-model="form.legalPerson" :placeholder="t.legalPersonPh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.region" field="region">
                          <a-select
                            v-model="form.region"
                            :options="regionOptions"
                            :placeholder="t.regionPh"
                            allow-clear
                          />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.email" field="email" required asterisk-position="start">
                          <a-input v-model="form.email" :placeholder="t.emailPh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.businessScope" field="businessScope">
                          <a-input v-model="form.businessScope" :placeholder="t.businessScopePh" allow-clear />
                        </a-form-item>
                      </a-col>
                    </a-row>
                    <a-row :gutter="rowGutter">
                      <a-col v-bind="colProps">
                        <a-form-item
                          class="form-step-vertical-actions"
                          :label-col-props="{ span: 0 }"
                          :wrapper-col-props="{ offset: labelColProps.span, span: wrapperColProps.span }"
                        >
                          <a-space>
                            <a-button :disabled="loading" @click="prev">{{ t.prev }}</a-button>
                            <a-button type="primary" :loading="loading" @click="next">{{ t.next }}</a-button>
                          </a-space>
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </div>

                  <div v-else-if="step === 3 && index === 2" class="form-step-vertical-panel">
                    <a-row :gutter="rowGutter">
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.registeredCapital" field="registeredCapital">
                          <a-input v-model="form.registeredCapital" :placeholder="t.capitalPh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.annualRevenue" field="annualRevenue">
                          <a-input v-model="form.annualRevenue" :placeholder="t.annualRevenuePh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.taxNo" field="taxNo" required asterisk-position="start">
                          <a-input v-model="form.taxNo" :placeholder="t.taxNoPh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.invoiceType" field="invoiceType">
                          <a-select
                            v-model="form.invoiceType"
                            :options="invoiceOptions"
                            :placeholder="t.invoiceTypePh"
                            allow-clear
                          />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.bankName" field="bankName">
                          <a-input v-model="form.bankName" :placeholder="t.bankNamePh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.bankAccount" field="bankAccount" required asterisk-position="start">
                          <a-input v-model="form.bankAccount" :placeholder="t.bankAccountPh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.accountName" field="accountName" required asterisk-position="start">
                          <a-input v-model="form.accountName" :placeholder="t.accountNamePh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.financeContact" field="financeContact">
                          <a-input v-model="form.financeContact" :placeholder="t.financeContactPh" allow-clear />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.payMethod" field="payMethod">
                          <a-select
                            v-model="form.payMethod"
                            :options="payMethodOptions"
                            :placeholder="t.payMethodPh"
                            allow-clear
                          />
                        </a-form-item>
                      </a-col>
                      <a-col v-bind="colProps">
                        <a-form-item :label="t.settleCycle" field="settleCycle">
                          <a-select
                            v-model="form.settleCycle"
                            :options="settleCycleOptions"
                            :placeholder="t.settleCyclePh"
                            allow-clear
                          />
                        </a-form-item>
                      </a-col>
                    </a-row>
                    <a-row :gutter="rowGutter">
                      <a-col v-bind="colProps">
                        <a-form-item
                          class="form-step-vertical-actions"
                          :label-col-props="{ span: 0 }"
                          :wrapper-col-props="{ offset: labelColProps.span, span: wrapperColProps.span }"
                        >
                          <a-space>
                            <a-button :disabled="loading" @click="prev">{{ t.prev }}</a-button>
                            <a-button type="primary" :loading="loading" @click="next">{{ t.submit }}</a-button>
                          </a-space>
                        </a-form-item>
                      </a-col>
                    </a-row>
                  </div>
                </div>
              </div>
            </div>
          </a-form>
        </a-card>
      </div>
    `,
  }

  mountProPage({
    pageKey: 'form/step-vertical',
    title: '纵向分布',
    pageComponent: FormStepVerticalPage,
  })
})()
