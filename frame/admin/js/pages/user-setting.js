;(function () {
  const t = ArcoProLocale.userSetting
  const avatarCropMixin = ArcoProAvatarCrop.createMixin(t)

  const UserSettingPage = {
    name: 'UserSettingPage',
    mixins: [avatarCropMixin],
    data() {
      const authUser = (window.AdminAuth && AdminAuth.getUserInfo()) || { name: '王立群' }
      const userInfo = {
        name: 'wangliqun',
        realName: authUser.name || '王立群',
        accountId: 'wangliqun',
        phoneNumber: '15000000000',
        email: 'wanglq@company.com',
        department: '产品设计部',
        jobTitle: '高级产品经理',
        employeeNo: 'E20210086',
        office: '北京 · 海淀区',
        gender: 'male',
        birthday: '1992-08-16',
        registrationTime: '2013-05-10 12:10:00',
        lastLogin: '2026-08-08 09:32:18',
        verified: true,
      }
      const formDefaults = {
        realName: userInfo.realName,
        name: userInfo.name,
        accountId: userInfo.accountId,
        gender: userInfo.gender,
        birthday: userInfo.birthday,
        phoneNumber: userInfo.phoneNumber,
        email: userInfo.email,
        department: userInfo.department,
        jobTitle: userInfo.jobTitle,
        employeeNo: userInfo.employeeNo,
        office: userInfo.office,
        registrationTime: userInfo.registrationTime,
      }
      let activeTab = 'basic'
      try {
        const tab = new URLSearchParams(window.location.search).get('tab')
        if (tab === 'security' || tab === 'basic' || tab === 'verified') activeTab = tab
      } catch (_) {
        /* ignore */
      }
      return {
        t,
        activeTab,
        avatarUrl: '',
        avatarObjectUrl: '',
        userInfo,
        formDefaults,
        form: { ...formDefaults },
        genderOptions: [
          { label: t.genderMale, value: 'male' },
          { label: t.genderFemale, value: 'female' },
        ],
        departmentOptions: [
          { label: '产品设计部', value: '产品设计部' },
          { label: '研发中心', value: '研发中心' },
          { label: '市场运营部', value: '市场运营部' },
          { label: '人力资源部', value: '人力资源部' },
          { label: '财务部', value: '财务部' },
        ],
        securityItems: [
          {
            key: 'password',
            icon: 'icon-lock',
            title: t.securityPassword,
            value: t.securityPasswordTips,
            action: 'edit',
          },
          {
            key: 'question',
            icon: 'icon-safe',
            title: t.securityQuestion,
            value: '',
            placeholder: t.securityQuestionPlaceholder,
            action: 'set',
          },
          {
            key: 'phone',
            icon: 'icon-mobile',
            title: t.securityPhone,
            value: '150******50',
            action: 'edit',
          },
          {
            key: 'email',
            icon: 'icon-email',
            title: t.securityEmail,
            value: '',
            placeholder: t.securityEmailPlaceholder,
            action: 'set',
          },
        ],
        securityModalVisible: false,
        securityModalKey: '',
        securityModalTitle: '',
        securityForm: {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
          question: undefined,
          answer: '',
          phone: '',
          email: '',
          code: '',
        },
        securityQuestionOptions: [
          { label: '您的出生地是？', value: 'birthplace' },
          { label: '您母亲的姓名是？', value: 'mother' },
          { label: '您小学的校名是？', value: 'school' },
        ],
        verifiedEditVisible: false,
        verifiedEditForm: {
          enterpriseName: '',
          organizationCode: '',
          legalPersonName: '',
          certificationNumber: '',
        },
        verifiedDetailVisible: false,
        verifiedDetailRecord: null,
        verifiedInfo: {
          accountType: '企业账号',
          status: '已认证',
          verifiedTime: '2018-10-22 14:53:12',
          legalPersonName: '李**',
          certificateType: '中国身份证',
          certificationNumber: '130************123',
          enterpriseName: '低调有实力的企业',
          enterpriseCertificateType: '企业营业执照',
          organizationCode: '7*******9',
        },
        verifiedRecords: [
          {
            key: '1',
            authType: '企业证件认证',
            authContent: '企业实名认证，法人姓名：李**',
            authStatus: 'waiting',
            createdTime: '2021-02-28 10:30:50',
          },
          {
            key: '2',
            authType: '企业证件认证',
            authContent: '企业实名认证，法人姓名：李**',
            authStatus: 'success',
            createdTime: '2020-05-13 08:00:00',
          },
        ],
        verifiedColumns: [
          { title: t.verifiedAuthType, dataIndex: 'authType' },
          { title: t.verifiedAuthContent, dataIndex: 'authContent' },
          { title: t.verifiedAuthStatus, slotName: 'authStatus', width: 120 },
          { title: t.verifiedCreatedTime, dataIndex: 'createdTime', width: 180 },
          { title: t.verifiedOperation, slotName: 'operation', width: 140 },
        ],
      }
    },
    methods: {
      maskPhone(phone) {
        const value = String(phone || '')
        if (value.length < 7) return value
        return `${value.slice(0, 3)}****${value.slice(-4)}`
      },
      maskEmail(email) {
        const value = String(email || '')
        const at = value.indexOf('@')
        if (at <= 0) return value
        const name = value.slice(0, at)
        const domain = value.slice(at)
        const keep = Math.min(4, name.length)
        return `${name.slice(0, keep)}****${domain}`
      },
      syncShellUserProfile() {
        const profile = {
          name: this.form.realName,
          account: this.form.name,
          email: this.form.email,
          department: this.form.department,
          role: this.form.jobTitle,
        }
        if (window.AdminAuth && typeof AdminAuth.setUserInfo === 'function') {
          AdminAuth.setUserInfo(profile)
        }
        const vm = this.$root
        if (vm && vm.userInfo) {
          vm.userInfo = { ...vm.userInfo, ...profile }
        }
      },
      syncHeaderFromForm() {
        this.userInfo = {
          ...this.userInfo,
          realName: this.form.realName,
          name: this.form.name,
          accountId: this.form.accountId,
          gender: this.form.gender,
          birthday: this.form.birthday,
          phoneNumber: this.form.phoneNumber,
          email: this.form.email,
          department: this.form.department,
          jobTitle: this.form.jobTitle,
          employeeNo: this.form.employeeNo,
          office: this.form.office,
          registrationTime: this.form.registrationTime,
        }
        this.syncShellUserProfile()
      },
      onSave() {
        this.$refs.basicForm.validate((errors) => {
          if (errors) return
          this.syncHeaderFromForm()
          this.formDefaults = { ...this.form }
          ArcoVue.Message.success(t.saveSuccess)
        })
      },
      onReset() {
        this.form = { ...this.formDefaults }
        this.syncHeaderFromForm()
        this.$refs.basicForm && this.$refs.basicForm.clearValidate()
      },
      resetSecurityForm() {
        this.securityForm = {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
          question: undefined,
          answer: '',
          phone: this.userInfo.phoneNumber || '',
          email: this.userInfo.email || '',
          code: '',
        }
      },
      openSecurityModal(item) {
        this.securityModalKey = item.key
        this.securityModalTitle = item.action === 'edit' ? `${t.btnEdit}${item.title}` : `${t.btnSet}${item.title}`
        this.resetSecurityForm()
        this.securityModalVisible = true
      },
      onSecurityAction(item) {
        this.openSecurityModal(item)
      },
      onSecurityModalCancel() {
        this.securityModalVisible = false
      },
      onSendSecurityCode() {
        ArcoVue.Message.success(t.securityCodeSent)
      },
      onSecurityModalOk() {
        const key = this.securityModalKey
        const form = this.securityForm
        if (key === 'password') {
          if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
            ArcoVue.Message.warning(t.securityFormRequired)
            return
          }
          if (form.newPassword !== form.confirmPassword) {
            ArcoVue.Message.warning(t.securityPasswordMismatch)
            return
          }
        }
        if (key === 'question' && (!form.question || !form.answer)) {
          ArcoVue.Message.warning(t.securityFormRequired)
          return
        }
        if (key === 'phone' && (!form.phone || !form.code)) {
          ArcoVue.Message.warning(t.securityFormRequired)
          return
        }
        if (key === 'email' && (!form.email || !form.code)) {
          ArcoVue.Message.warning(t.securityFormRequired)
          return
        }

        const index = this.securityItems.findIndex((item) => item.key === key)
        if (index > -1) {
          const next = { ...this.securityItems[index] }
          if (key === 'password') {
            next.value = t.securityPasswordTips
            next.action = 'edit'
          } else if (key === 'question') {
            next.value = t.securityQuestionSetTips
            next.action = 'edit'
          } else if (key === 'phone') {
            next.value = this.maskPhone(form.phone)
            next.action = 'edit'
            this.userInfo.phoneNumber = form.phone
            this.form.phoneNumber = form.phone
          } else if (key === 'email') {
            next.value = this.maskEmail(form.email)
            next.action = 'edit'
            this.userInfo.email = form.email
            this.form.email = form.email
          }
          this.securityItems.splice(index, 1, next)
        }

        this.securityModalVisible = false
        ArcoVue.Message.success(t.securitySaveSuccess)
      },
      onEditVerified() {
        this.verifiedEditForm = {
          enterpriseName: this.verifiedInfo.enterpriseName,
          organizationCode: this.verifiedInfo.organizationCode,
          legalPersonName: this.verifiedInfo.legalPersonName,
          certificationNumber: this.verifiedInfo.certificationNumber,
        }
        this.verifiedEditVisible = true
      },
      onVerifiedEditCancel() {
        this.verifiedEditVisible = false
      },
      onVerifiedEditOk() {
        const form = this.verifiedEditForm
        if (!form.enterpriseName || !form.organizationCode || !form.legalPersonName || !form.certificationNumber) {
          ArcoVue.Message.warning(t.securityFormRequired)
          return
        }
        this.verifiedInfo = {
          ...this.verifiedInfo,
          enterpriseName: form.enterpriseName,
          organizationCode: form.organizationCode,
          legalPersonName: form.legalPersonName,
          certificationNumber: form.certificationNumber,
        }
        this.verifiedEditVisible = false
        ArcoVue.Message.success(t.verifiedEditSuccess)
      },
      onViewRecord(record) {
        this.verifiedDetailRecord = { ...record }
        this.verifiedDetailVisible = true
      },
      onVerifiedDetailCancel() {
        this.verifiedDetailVisible = false
        this.verifiedDetailRecord = null
      },
      onRevokeRecord(record) {
        ArcoVue.Modal.confirm({
          simple: true,
          titleAlign: 'start',
          modalClass: 'pro-confirm-modal',
          width: 360,
          title: t.verifiedRevokeTitle,
          content: t.verifiedRevokeConfirm,
          okText: t.verifiedRevoke,
          cancelText: t.cropCancel,
          okButtonProps: { status: 'danger' },
          onOk: () => {
            const index = this.verifiedRecords.findIndex((item) => item.key === record.key)
            if (index > -1) {
              this.verifiedRecords.splice(index, 1)
            }
            ArcoVue.Message.success(t.revokeSuccess)
          },
        })
      },
    },
    mounted() {
      try {
        const params = new URLSearchParams(window.location.search)
        if (params.get('tab') === 'security' && params.get('action') === 'password') {
          const item = this.securityItems.find((row) => row.key === 'password')
          if (item) this.$nextTick(() => this.openSecurityModal(item))
        }
      } catch (_) {
        /* ignore */
      }
    },
    template: `
      <div class="user-setting-page">
        <a-card class="pro-page-card user-setting-header-card" :bordered="false">
          <div class="user-setting-header">
            <div class="user-setting-identity">
              <div
                class="user-setting-avatar-wrap"
                :title="t.changeAvatar"
                role="button"
                tabindex="0"
                @click="onAvatarClick"
                @keydown.enter.prevent="onAvatarClick"
              >
                <input
                  ref="avatarInput"
                  class="user-setting-avatar-input"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  @change="onAvatarChange"
                  @click.stop
                />
                <div class="user-setting-avatar-shell" :class="{ 'has-image': !!avatarUrl }">
                  <img v-if="avatarUrl" class="user-setting-avatar-img" :src="avatarUrl" alt="avatar" />
                  <a-avatar
                    v-else
                    :size="72"
                    class="pro-avatar-brand user-setting-avatar-fallback"
                    :auto-fix-font-size="false"
                  >
                    <icon-avatar />
                  </a-avatar>
                </div>
                <span class="user-setting-avatar-camera" aria-hidden="true"><icon-camera /></span>
              </div>
              <div class="user-setting-identity-meta">
                <div class="user-setting-identity-name">{{ userInfo.realName }}</div>
                <div class="user-setting-identity-account">
                  {{ t.labelAccount }}：{{ userInfo.name }}
                </div>
              </div>
            </div>
            <div class="user-setting-header-content">
              <div class="user-setting-field-grid">
                <div class="user-setting-field">
                  <div class="user-setting-field-label">{{ t.labelVerified }}</div>
                  <div class="user-setting-field-value">
                    <a-tag v-if="userInfo.verified" color="green" size="small" class="user-setting-verified-tag">
                      {{ t.valueVerified }}
                    </a-tag>
                    <a-tag v-else color="orangered" size="small" class="user-setting-verified-tag">
                      {{ t.valueNotVerified }}
                    </a-tag>
                  </div>
                </div>
                <div class="user-setting-field">
                  <div class="user-setting-field-label">{{ t.labelPhone }}</div>
                  <div class="user-setting-field-value">
                    <span class="user-setting-field-text">{{ maskPhone(userInfo.phoneNumber) }}</span>
                  </div>
                </div>
                <div class="user-setting-field">
                  <div class="user-setting-field-label">{{ t.labelEmail }}</div>
                  <div class="user-setting-field-value">
                    <span class="user-setting-field-text">{{ maskEmail(userInfo.email) }}</span>
                  </div>
                </div>
                <div class="user-setting-field">
                  <div class="user-setting-field-label">{{ t.labelDepartment }}</div>
                  <div class="user-setting-field-value">
                    <span class="user-setting-field-text">{{ userInfo.department }}</span>
                  </div>
                </div>
                <div class="user-setting-field">
                  <div class="user-setting-field-label">{{ t.labelJobTitle }}</div>
                  <div class="user-setting-field-value">
                    <span class="user-setting-field-text">{{ userInfo.jobTitle }}</span>
                  </div>
                </div>
                <div class="user-setting-field">
                  <div class="user-setting-field-label">{{ t.labelRegistrationTime }}</div>
                  <div class="user-setting-field-value">
                    <span class="user-setting-field-text">{{ userInfo.registrationTime }}</span>
                  </div>
                </div>
                <div class="user-setting-field">
                  <div class="user-setting-field-label">{{ t.labelOffice }}</div>
                  <div class="user-setting-field-value">
                    <span class="user-setting-field-text">{{ userInfo.office }}</span>
                  </div>
                </div>
                <div class="user-setting-field">
                  <div class="user-setting-field-label">{{ t.labelLastLogin }}</div>
                  <div class="user-setting-field-value">
                    <span class="user-setting-field-text">{{ userInfo.lastLogin }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-card>

        <a-card class="pro-page-card user-setting-tabs-card" :bordered="false">
          <a-tabs
            v-model:active-key="activeTab"
            type="rounded"
            class="user-setting-tabs"
            :header-padding="false"
          >
            <a-tab-pane key="basic" :title="t.basicInfo">
              <a-form
                ref="basicForm"
                :model="form"
                layout="horizontal"
                auto-label-width
                class="user-setting-form"
              >
                <a-form-item
                  field="realName"
                  :label="t.infoRealName"
                  :rules="[{ required: true, message: t.infoRealNamePlaceholder }]"
                >
                  <a-input v-model="form.realName" :placeholder="t.infoRealNamePlaceholder" allow-clear />
                </a-form-item>
                <a-form-item field="name" :label="t.infoAccount">
                  <a-input v-model="form.name" disabled />
                </a-form-item>
                <a-form-item
                  field="gender"
                  :label="t.infoGender"
                  :rules="[{ required: true, message: t.infoGenderPlaceholder }]"
                >
                  <a-radio-group v-model="form.gender" :options="genderOptions" />
                </a-form-item>
                <a-form-item
                  field="birthday"
                  :label="t.infoBirthday"
                  :rules="[{ required: true, message: t.infoBirthdayPlaceholder }]"
                >
                  <a-date-picker
                    v-model="form.birthday"
                    style="width: 100%"
                    :placeholder="t.infoBirthdayPlaceholder"
                    allow-clear
                  />
                </a-form-item>
                <a-form-item
                  field="phoneNumber"
                  :label="t.infoPhone"
                  :rules="[{ required: true, message: t.infoPhonePlaceholder }]"
                >
                  <a-input v-model="form.phoneNumber" :placeholder="t.infoPhonePlaceholder" allow-clear />
                </a-form-item>
                <a-form-item
                  field="email"
                  :label="t.infoEmail"
                  :rules="[{ required: true, type: 'email', message: t.infoEmailPlaceholder }]"
                >
                  <a-input v-model="form.email" :placeholder="t.infoEmailPlaceholder" allow-clear />
                </a-form-item>
                <a-form-item
                  field="department"
                  :label="t.infoDepartment"
                  :rules="[{ required: true, message: t.infoDepartmentPlaceholder }]"
                >
                  <a-select
                    v-model="form.department"
                    :options="departmentOptions"
                    :placeholder="t.placeholderSelect"
                    allow-clear
                  />
                </a-form-item>
                <a-form-item
                  field="jobTitle"
                  :label="t.infoJobTitle"
                  :rules="[{ required: true, message: t.infoJobTitlePlaceholder }]"
                >
                  <a-input v-model="form.jobTitle" :placeholder="t.infoJobTitlePlaceholder" allow-clear />
                </a-form-item>
                <a-form-item field="employeeNo" :label="t.infoEmployeeNo">
                  <a-input v-model="form.employeeNo" :placeholder="t.infoEmployeeNoPlaceholder" allow-clear />
                </a-form-item>
                <a-form-item field="office" :label="t.infoOffice">
                  <a-input v-model="form.office" :placeholder="t.infoOfficePlaceholder" allow-clear />
                </a-form-item>
                <a-form-item field="registrationTime" :label="t.infoHireDate">
                  <a-input v-model="form.registrationTime" disabled />
                </a-form-item>
                <a-form-item>
                  <a-space>
                    <a-button type="primary" @click="onSave">{{ t.save }}</a-button>
                    <a-button @click="onReset">{{ t.reset }}</a-button>
                  </a-space>
                </a-form-item>
              </a-form>
            </a-tab-pane>

            <a-tab-pane key="security" :title="t.security">
              <div class="user-setting-security">
                <div
                  v-for="item in securityItems"
                  :key="item.key"
                  class="user-setting-security-item"
                  role="button"
                  tabindex="0"
                  @click="onSecurityAction(item)"
                  @keydown.enter.prevent="onSecurityAction(item)"
                >
                  <div class="user-setting-security-title">
                    <span class="user-setting-security-icon" aria-hidden="true">
                      <component :is="item.icon" />
                    </span>
                    <span>{{ item.title }}</span>
                  </div>
                  <div class="user-setting-security-content">
                    <div
                      class="user-setting-security-text"
                      :class="{ 'is-placeholder': !item.value }"
                    >
                      {{ item.value || item.placeholder }}
                    </div>
                    <a-button type="text" class="user-setting-security-action" @click.stop="onSecurityAction(item)">
                      {{ item.action === 'edit' ? t.btnEdit : t.btnSet }}
                    </a-button>
                  </div>
                </div>
              </div>
            </a-tab-pane>

            <a-tab-pane key="verified" :title="t.tabVerified">
              <div class="user-setting-verified">
                <div class="user-setting-verified-head">
                  <div class="user-setting-verified-title">{{ t.verifiedEnterprise }}</div>
                  <a-button type="text" class="user-setting-verified-action" @click="onEditVerified">
                    <template #icon><icon-edit /></template>
                    {{ t.editVerifiedSubject }}
                  </a-button>
                </div>
                <div class="user-setting-verified-enterprise">
                  <div class="user-setting-verified-grid">
                    <div class="user-setting-verified-item">
                      <div class="user-setting-verified-label">{{ t.verifiedAccountType }}</div>
                      <div class="user-setting-verified-value">{{ verifiedInfo.accountType }}</div>
                    </div>
                    <div class="user-setting-verified-item">
                      <div class="user-setting-verified-label">{{ t.verifiedStatus }}</div>
                      <div class="user-setting-verified-value">
                        <a-tag color="green" size="small">{{ verifiedInfo.status }}</a-tag>
                      </div>
                    </div>
                    <div class="user-setting-verified-item">
                      <div class="user-setting-verified-label">{{ t.verifiedTime }}</div>
                      <div class="user-setting-verified-value">{{ verifiedInfo.verifiedTime }}</div>
                    </div>
                    <div class="user-setting-verified-item">
                      <div class="user-setting-verified-label">{{ t.verifiedLegalPerson }}</div>
                      <div class="user-setting-verified-value">{{ verifiedInfo.legalPersonName }}</div>
                    </div>
                    <div class="user-setting-verified-item">
                      <div class="user-setting-verified-label">{{ t.verifiedCertType }}</div>
                      <div class="user-setting-verified-value">{{ verifiedInfo.certificateType }}</div>
                    </div>
                    <div class="user-setting-verified-item">
                      <div class="user-setting-verified-label">{{ t.verifiedCertNumber }}</div>
                      <div class="user-setting-verified-value">{{ verifiedInfo.certificationNumber }}</div>
                    </div>
                    <div class="user-setting-verified-item">
                      <div class="user-setting-verified-label">{{ t.verifiedEnterpriseName }}</div>
                      <div class="user-setting-verified-value">{{ verifiedInfo.enterpriseName }}</div>
                    </div>
                    <div class="user-setting-verified-item">
                      <div class="user-setting-verified-label">{{ t.verifiedEnterpriseCertType }}</div>
                      <div class="user-setting-verified-value">{{ verifiedInfo.enterpriseCertificateType }}</div>
                    </div>
                    <div class="user-setting-verified-item">
                      <div class="user-setting-verified-label">{{ t.verifiedOrgCode }}</div>
                      <div class="user-setting-verified-value">{{ verifiedInfo.organizationCode }}</div>
                    </div>
                  </div>
                </div>

                <div class="user-setting-verified-title user-setting-verified-records-title">
                  {{ t.verifiedRecords }}
                </div>
                <a-table
                  :columns="verifiedColumns"
                  :data="verifiedRecords"
                  :pagination="false"
                  row-key="key"
                  :bordered="false"
                >
                  <template #authStatus="{ record }">
                    <a-badge
                      v-if="record.authStatus === 'waiting'"
                      status="processing"
                      :text="t.verifiedStatusWaiting"
                    />
                    <a-badge
                      v-else
                      status="success"
                      :text="t.verifiedStatusSuccess"
                    />
                  </template>
                  <template #operation="{ record }">
                    <a-space :size="4">
                      <a-button
                        type="text"
                        size="small"
                        class="user-setting-verified-op"
                        @click="onViewRecord(record)"
                      >
                        <template #icon><icon-eye /></template>
                        {{ t.verifiedView }}
                      </a-button>
                      <a-button
                        v-if="record.authStatus === 'waiting'"
                        type="text"
                        size="small"
                        status="danger"
                        class="user-setting-verified-op"
                        @click="onRevokeRecord(record)"
                      >
                        <template #icon><icon-undo /></template>
                        {{ t.verifiedRevoke }}
                      </a-button>
                    </a-space>
                  </template>
                </a-table>
              </div>
            </a-tab-pane>
          </a-tabs>
        </a-card>

        <a-modal
          :visible="verifiedEditVisible"
          :title="t.editVerifiedSubject"
          :width="520"
          :mask-closable="false"
          unmount-on-close
          @ok="onVerifiedEditOk"
          @cancel="onVerifiedEditCancel"
        >
          <a-form :model="verifiedEditForm" layout="vertical">
            <a-form-item :label="t.verifiedEnterpriseName" required>
              <a-input v-model="verifiedEditForm.enterpriseName" :placeholder="t.verifiedEnterpriseNamePlaceholder" allow-clear />
            </a-form-item>
            <a-form-item :label="t.verifiedOrgCode" required>
              <a-input v-model="verifiedEditForm.organizationCode" :placeholder="t.verifiedOrgCodePlaceholder" allow-clear />
            </a-form-item>
            <a-form-item :label="t.verifiedLegalPerson" required>
              <a-input v-model="verifiedEditForm.legalPersonName" :placeholder="t.verifiedLegalPersonPlaceholder" allow-clear />
            </a-form-item>
            <a-form-item :label="t.verifiedCertNumber" required>
              <a-input v-model="verifiedEditForm.certificationNumber" :placeholder="t.verifiedCertNumberPlaceholder" allow-clear />
            </a-form-item>
          </a-form>
        </a-modal>

        <a-modal
          :visible="verifiedDetailVisible"
          :title="t.verifiedDetailTitle"
          :width="560"
          :footer="false"
          unmount-on-close
          @cancel="onVerifiedDetailCancel"
        >
          <a-descriptions v-if="verifiedDetailRecord" :column="1" size="large" class="user-setting-verified-detail">
            <a-descriptions-item :label="t.verifiedAuthType">{{ verifiedDetailRecord.authType }}</a-descriptions-item>
            <a-descriptions-item :label="t.verifiedAuthContent">{{ verifiedDetailRecord.authContent }}</a-descriptions-item>
            <a-descriptions-item :label="t.verifiedAuthStatus">
              <a-badge
                v-if="verifiedDetailRecord.authStatus === 'waiting'"
                status="processing"
                :text="t.verifiedStatusWaiting"
              />
              <a-badge v-else status="success" :text="t.verifiedStatusSuccess" />
            </a-descriptions-item>
            <a-descriptions-item :label="t.verifiedCreatedTime">{{ verifiedDetailRecord.createdTime }}</a-descriptions-item>
          </a-descriptions>
        </a-modal>

        <a-modal
          :visible="securityModalVisible"
          :title="securityModalTitle"
          :width="480"
          :mask-closable="false"
          unmount-on-close
          @ok="onSecurityModalOk"
          @cancel="onSecurityModalCancel"
        >
          <a-form :model="securityForm" layout="vertical" class="user-setting-security-form">
            <template v-if="securityModalKey === 'password'">
              <a-form-item :label="t.securityOldPassword" required>
                <a-input-password v-model="securityForm.oldPassword" :placeholder="t.securityOldPasswordPlaceholder" allow-clear />
              </a-form-item>
              <a-form-item :label="t.securityNewPassword" required>
                <a-input-password v-model="securityForm.newPassword" :placeholder="t.securityNewPasswordPlaceholder" allow-clear />
              </a-form-item>
              <a-form-item :label="t.securityConfirmPassword" required>
                <a-input-password v-model="securityForm.confirmPassword" :placeholder="t.securityConfirmPasswordPlaceholder" allow-clear />
              </a-form-item>
            </template>
            <template v-else-if="securityModalKey === 'question'">
              <a-form-item :label="t.securityQuestionLabel" required>
                <a-select
                  v-model="securityForm.question"
                  :options="securityQuestionOptions"
                  :placeholder="t.placeholderSelect"
                  allow-clear
                />
              </a-form-item>
              <a-form-item :label="t.securityAnswerLabel" required>
                <a-input v-model="securityForm.answer" :placeholder="t.securityAnswerPlaceholder" allow-clear />
              </a-form-item>
            </template>
            <template v-else-if="securityModalKey === 'phone'">
              <a-form-item :label="t.securityPhoneLabel" required>
                <a-input v-model="securityForm.phone" :placeholder="t.infoPhonePlaceholder" allow-clear />
              </a-form-item>
              <a-form-item :label="t.securityCodeLabel" required>
                <div class="user-setting-security-code-row">
                  <a-input v-model="securityForm.code" :placeholder="t.securityCodePlaceholder" allow-clear />
                  <a-button type="outline" @click="onSendSecurityCode">{{ t.securitySendCode }}</a-button>
                </div>
              </a-form-item>
            </template>
            <template v-else-if="securityModalKey === 'email'">
              <a-form-item :label="t.securityEmailLabel" required>
                <a-input v-model="securityForm.email" :placeholder="t.infoEmailPlaceholder" allow-clear />
              </a-form-item>
              <a-form-item :label="t.securityCodeLabel" required>
                <div class="user-setting-security-code-row">
                  <a-input v-model="securityForm.code" :placeholder="t.securityCodePlaceholder" allow-clear />
                  <a-button type="outline" @click="onSendSecurityCode">{{ t.securitySendCode }}</a-button>
                </div>
              </a-form-item>
            </template>
          </a-form>
        </a-modal>

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

  mountProPage({ pageKey: 'user/setting', title: '用户设置', pageComponent: UserSettingPage })
})()
