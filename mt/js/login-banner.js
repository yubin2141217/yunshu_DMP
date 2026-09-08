;(function () {
  if (AdminAuth.isLoggedIn()) {
    window.location.href = 'dashboard.html'
    return
  }

  const { createApp } = Vue
  const ArcoVue = window.ArcoVue
  const t = ArcoProLocale.login
  document.title = t.pageTitle + ' - Vibe Design Pro'
  const DEMO_CODE = '123456'
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const CODE_COUNTDOWN = 60

  function emptyForgetForm() {
    return { email: '', code: '', password: '', confirm: '' }
  }

  function emptyRegisterForm() {
    return { userName: '', email: '', code: '', password: '', confirm: '' }
  }

  function emptyForgetErrors() {
    return { email: '', code: '', password: '', confirm: '' }
  }

  function emptyRegisterErrors() {
    return { userName: '', email: '', code: '', password: '', confirm: '' }
  }

  function hasErrors(errors) {
    return Object.keys(errors).some((key) => !!errors[key])
  }

  const app = createApp({
    data() {
      const form = AdminAuth.resolveLoginFormDefaults()
      return {
        userName: form.userName,
        password: form.password,
        rememberPassword: form.rememberPassword,
        userNameError: '',
        passwordError: '',
        loading: false,
        artSrc: './images/login-illustration-01.svg',
        t,
        forgetVisible: false,
        registerVisible: false,
        forgetForm: emptyForgetForm(),
        registerForm: emptyRegisterForm(),
        forgetErrors: emptyForgetErrors(),
        registerErrors: emptyRegisterErrors(),
        forgetCountdown: 0,
        registerCountdown: 0,
        forgetCodeSent: false,
        registerCodeSent: false,
        forgetSubmitting: false,
        registerSubmitting: false,
        _forgetTimer: null,
        _registerTimer: null,
      }
    },
    computed: {
      forgetCodeBtnText() {
        if (this.forgetCountdown > 0) return `${this.forgetCountdown}S`
        return this.forgetCodeSent ? this.t.codeResend : this.t.codeSend
      },
      registerCodeBtnText() {
        if (this.registerCountdown > 0) return `${this.registerCountdown}S`
        return this.registerCodeSent ? this.t.codeResend : this.t.codeSend
      },
    },
    beforeUnmount() {
      this.clearCountdown('forget')
      this.clearCountdown('register')
    },
    methods: {
      tip(type, content) {
        if (window.ArcoVue && ArcoVue.Message) ArcoVue.Message[type](content)
      },
      handleSubmit() {
        const name = String(this.userName || '').trim()
        const pwd = String(this.password || '')
        this.userNameError = name ? '' : this.t.userNameErr
        this.passwordError = pwd ? '' : this.t.passwordErr
        if (this.userNameError || this.passwordError) return
        const cred = AdminAuth.validateCredentials(name, pwd)
        if (!cred.userNameOk) this.userNameError = this.t.userNameInvalid
        if (!cred.passwordOk) this.passwordError = this.t.passwordInvalid
        if (this.userNameError || this.passwordError) return
        this.loading = true
        setTimeout(() => {
          this.loading = false
          AdminAuth.login(
            { userName: name, password: pwd },
            this.rememberPassword
          )
          window.location.href = 'dashboard.html'
        }, 400)
      },
      onUserNameInput() {
        if (this.userNameError) this.userNameError = ''
      },
      onPasswordInput() {
        if (this.passwordError) this.passwordError = ''
      },
      onUserNameFocus() {
        if (this.userNameError) this.userNameError = ''
      },
      onPasswordFocus() {
        if (this.passwordError) this.passwordError = ''
      },
      openForget() {
        this.forgetForm = emptyForgetForm()
        this.forgetErrors = emptyForgetErrors()
        this.forgetCodeSent = false
        this.clearCountdown('forget')
        this.forgetVisible = true
      },
      closeForget() {
        this.forgetVisible = false
        this.clearCountdown('forget')
      },
      openRegister() {
        this.registerForm = emptyRegisterForm()
        this.registerErrors = emptyRegisterErrors()
        this.registerCodeSent = false
        this.clearCountdown('register')
        this.registerVisible = true
      },
      closeRegister() {
        this.registerVisible = false
        this.clearCountdown('register')
      },
      clearForgetError(field) {
        if (this.forgetErrors[field]) this.forgetErrors[field] = ''
      },
      clearRegisterError(field) {
        if (this.registerErrors[field]) this.registerErrors[field] = ''
      },
      clearCountdown(kind) {
        const timerKey = kind === 'forget' ? '_forgetTimer' : '_registerTimer'
        const countKey = kind === 'forget' ? 'forgetCountdown' : 'registerCountdown'
        if (this[timerKey]) {
          clearInterval(this[timerKey])
          this[timerKey] = null
        }
        this[countKey] = 0
      },
      startCountdown(kind) {
        const timerKey = kind === 'forget' ? '_forgetTimer' : '_registerTimer'
        const countKey = kind === 'forget' ? 'forgetCountdown' : 'registerCountdown'
        this.clearCountdown(kind)
        this[countKey] = CODE_COUNTDOWN
        this[timerKey] = setInterval(() => {
          if (this[countKey] <= 1) {
            this.clearCountdown(kind)
            return
          }
          this[countKey] -= 1
        }, 1000)
      },
      getEmailError(email) {
        const value = String(email || '').trim()
        if (!value) return this.t.emailRequired
        if (!EMAIL_RE.test(value)) return this.t.emailInvalid
        return ''
      },
      getCodeError(sent, code) {
        if (!sent) return this.t.codeSendFirst
        if (!String(code || '').trim()) return this.t.codeRequired
        if (String(code).trim() !== DEMO_CODE) return this.t.codeInvalid
        return ''
      },
      getPasswordError(password) {
        const value = String(password || '')
        if (!value) return this.t.passwordRequired
        if (value.length < 6) return this.t.passwordMin
        return ''
      },
      getConfirmError(password, confirm) {
        if (!String(confirm || '')) return this.t.passwordConfirmRequired
        if (String(password || '') !== String(confirm || '')) return this.t.passwordMismatch
        return ''
      },
      sendForgetCode() {
        if (this.forgetCountdown > 0) return
        const emailError = this.getEmailError(this.forgetForm.email)
        this.forgetErrors.email = emailError
        if (emailError) return
        this.forgetCodeSent = true
        this.clearForgetError('code')
        this.startCountdown('forget')
        this.tip('success', this.t.codeSent)
      },
      sendRegisterCode() {
        if (this.registerCountdown > 0) return
        const emailError = this.getEmailError(this.registerForm.email)
        this.registerErrors.email = emailError
        if (emailError) return
        this.registerCodeSent = true
        this.clearRegisterError('code')
        this.startCountdown('register')
        this.tip('success', this.t.codeSent)
      },
      submitForget() {
        const form = this.forgetForm
        const errors = emptyForgetErrors()
        errors.email = this.getEmailError(form.email)
        errors.code = this.getCodeError(this.forgetCodeSent, form.code)
        errors.password = this.getPasswordError(form.password)
        errors.confirm = this.getConfirmError(form.password, form.confirm)
        this.forgetErrors = errors
        if (hasErrors(errors)) return false
        this.forgetSubmitting = true
        return new Promise((resolve) => {
          setTimeout(() => {
            this.forgetSubmitting = false
            this.clearCountdown('forget')
            this.forgetVisible = false
            this.tip('success', this.t.forgetSuccess)
            resolve(true)
          }, 400)
        })
      },
      submitRegister() {
        const form = this.registerForm
        const errors = emptyRegisterErrors()
        errors.userName = String(form.userName || '').trim() ? '' : this.t.userNameRequired
        errors.email = this.getEmailError(form.email)
        errors.code = this.getCodeError(this.registerCodeSent, form.code)
        errors.password = this.getPasswordError(form.password)
        errors.confirm = this.getConfirmError(form.password, form.confirm)
        this.registerErrors = errors
        if (hasErrors(errors)) return false
        this.registerSubmitting = true
        return new Promise((resolve) => {
          setTimeout(() => {
            this.registerSubmitting = false
            this.userName = form.userName
            this.password = ''
            this.clearCountdown('register')
            this.registerVisible = false
            this.tip('success', this.t.registerSuccess)
            resolve(true)
          }, 400)
        })
      },
    },
    template: `
      <div class="login-container">
        <div class="login-logo">
          <span class="pro-logo-mark" aria-hidden="true">
            <icon-logo class="pro-logo-mark-icon" />
          </span>
          <span class="login-logo-text">Vibe Design Pro</span>
        </div>
        <div class="login-banner">
          <div class="login-banner-deco" aria-hidden="true">
            <span class="login-banner-deco__orb login-banner-deco__orb--b"></span>
            <span class="login-banner-deco__orb login-banner-deco__orb--c"></span>
            <span class="login-banner-deco__ring login-banner-deco__ring--lg"></span>
            <span class="login-banner-deco__ring login-banner-deco__ring--md"></span>
            <span class="login-banner-deco__ring login-banner-deco__ring--sm"></span>
            <span class="login-banner-deco__blob login-banner-deco__blob--tl"></span>
            <span class="login-banner-deco__blob login-banner-deco__blob--br"></span>
            <span class="login-banner-deco__spark login-banner-deco__spark--1"></span>
            <span class="login-banner-deco__spark login-banner-deco__spark--2"></span>
            <span class="login-banner-deco__spark login-banner-deco__spark--3"></span>
            <span class="login-banner-deco__spark login-banner-deco__spark--4"></span>
          </div>
          <div class="login-carousel-item">
            <div class="login-carousel-title">{{ t.slogan1 }}</div>
            <div class="login-carousel-sub-title">{{ t.subSlogan1 }}</div>
            <div class="login-carousel-art login-carousel-art--a" aria-hidden="true">
              <img :src="artSrc" alt="" />
            </div>
          </div>
        </div>
        <div class="login-content">
          <div class="login-form-wrapper">
            <div class="login-form-title">{{ t.title }}</div>
            <div class="login-form-sub-title">{{ t.subTitle }}</div>
            <div class="login-form-fields">
              <div class="login-form-field login-form-field--user" :class="{ 'is-error': !!userNameError }" @focusin="onUserNameFocus">
                <a-input
                  v-model="userName"
                  :placeholder="t.userNamePh"
                  :error="!!userNameError"
                  allow-clear
                  @input="onUserNameInput"
                  @clear="onUserNameInput"
                  @press-enter="handleSubmit"
                >
                  <template #prefix><i class="pro-fa-icon fa-light fa-user" aria-hidden="true"></i></template>
                </a-input>
                <div v-if="userNameError" class="login-form-field-error">{{ userNameError }}</div>
              </div>
              <div class="login-form-field login-form-field--password" :class="{ 'is-error': !!passwordError }" @focusin="onPasswordFocus">
                <a-input-password
                  v-model="password"
                  :placeholder="t.passwordPh"
                  :error="!!passwordError"
                  allow-clear
                  @input="onPasswordInput"
                  @clear="onPasswordInput"
                  @press-enter="handleSubmit"
                >
                  <template #prefix><icon-lock /></template>
                </a-input-password>
                <div v-if="passwordError" class="login-form-field-error">{{ passwordError }}</div>
              </div>
              <div class="login-form-password-actions">
                <a-checkbox v-model="rememberPassword">{{ t.remember }}</a-checkbox>
                <a-typography-text type="secondary" class="login-forget" @click="openForget">{{ t.forget }}</a-typography-text>
              </div>
              <a-button type="primary" long :loading="loading" class="login-form-submit" @click="handleSubmit">{{ t.loginBtn }}</a-button>
              <a-button type="text" long class="login-form-register-btn" @click="openRegister">{{ t.register }}</a-button>
              <div class="login-form-demo-hint">
                <i class="login-form-demo-hint-icon pro-fa-icon fa-light fa-circle-info" aria-hidden="true"></i>
                <span>{{ t.demoAccount }}</span>
              </div>
            </div>
          </div>
          <footer class="login-footer pro-footer">© 2026 VibePM  产品经理智能协作平台</footer>
        </div>

        <a-modal
          :visible="forgetVisible"
          :title="t.forgetTitle"
          title-align="start"
          :width="420"
          unmount-on-close
          :ok-text="t.forgetSubmit"
          :cancel-text="t.cancel"
          :ok-loading="forgetSubmitting"
          :on-before-ok="submitForget"
          @cancel="closeForget"
        >
          <a-form :model="forgetForm" layout="vertical" class="login-auth-form">
            <a-form-item
              :label="t.email"
              required
              :validate-status="forgetErrors.email ? 'error' : undefined"
              :help="forgetErrors.email || undefined"
              @focusin="clearForgetError('email')"
            >
              <a-input
                v-model="forgetForm.email"
                :placeholder="t.emailPh"
                :error="!!forgetErrors.email"
                allow-clear
                @input="clearForgetError('email')"
                @clear="clearForgetError('email')"
              />
            </a-form-item>
            <a-form-item
              :label="t.code"
              required
              :validate-status="forgetErrors.code ? 'error' : undefined"
              :help="forgetErrors.code || undefined"
            >
              <div class="login-auth-code" :class="{ 'is-error': !!forgetErrors.code }" @focusin="clearForgetError('code')">
                <a-input
                  v-model="forgetForm.code"
                  :placeholder="t.codePh"
                  allow-clear
                  maxlength="6"
                  @input="clearForgetError('code')"
                  @clear="clearForgetError('code')"
                />
                <a-button type="text" :disabled="forgetCountdown > 0" @click="sendForgetCode">{{ forgetCodeBtnText }}</a-button>
              </div>
            </a-form-item>
            <a-form-item
              :label="t.newPassword"
              required
              :validate-status="forgetErrors.password ? 'error' : undefined"
              :help="forgetErrors.password || undefined"
              @focusin="clearForgetError('password')"
            >
              <a-input-password
                v-model="forgetForm.password"
                :placeholder="t.newPasswordPh"
                :error="!!forgetErrors.password"
                allow-clear
                @input="clearForgetError('password')"
                @clear="clearForgetError('password')"
              />
            </a-form-item>
            <a-form-item
              :label="t.passwordConfirm"
              required
              :validate-status="forgetErrors.confirm ? 'error' : undefined"
              :help="forgetErrors.confirm || undefined"
              @focusin="clearForgetError('confirm')"
            >
              <a-input-password
                v-model="forgetForm.confirm"
                :placeholder="t.passwordConfirmRequired"
                :error="!!forgetErrors.confirm"
                allow-clear
                @input="clearForgetError('confirm')"
                @clear="clearForgetError('confirm')"
              />
            </a-form-item>
          </a-form>
        </a-modal>

        <a-modal
          :visible="registerVisible"
          :title="t.registerTitle"
          title-align="start"
          :width="420"
          unmount-on-close
          :ok-text="t.registerSubmit"
          :cancel-text="t.cancel"
          :ok-loading="registerSubmitting"
          :on-before-ok="submitRegister"
          @cancel="closeRegister"
        >
          <a-form :model="registerForm" layout="vertical" class="login-auth-form">
            <a-form-item
              :label="t.userName"
              required
              :validate-status="registerErrors.userName ? 'error' : undefined"
              :help="registerErrors.userName || undefined"
              @focusin="clearRegisterError('userName')"
            >
              <a-input
                v-model="registerForm.userName"
                :placeholder="t.registerUserNamePh"
                :error="!!registerErrors.userName"
                allow-clear
                @input="clearRegisterError('userName')"
                @clear="clearRegisterError('userName')"
              />
            </a-form-item>
            <a-form-item
              :label="t.email"
              required
              :validate-status="registerErrors.email ? 'error' : undefined"
              :help="registerErrors.email || undefined"
              @focusin="clearRegisterError('email')"
            >
              <a-input
                v-model="registerForm.email"
                :placeholder="t.emailPh"
                :error="!!registerErrors.email"
                allow-clear
                @input="clearRegisterError('email')"
                @clear="clearRegisterError('email')"
              />
            </a-form-item>
            <a-form-item
              :label="t.code"
              required
              :validate-status="registerErrors.code ? 'error' : undefined"
              :help="registerErrors.code || undefined"
            >
              <div class="login-auth-code" :class="{ 'is-error': !!registerErrors.code }" @focusin="clearRegisterError('code')">
                <a-input
                  v-model="registerForm.code"
                  :placeholder="t.codePh"
                  allow-clear
                  maxlength="6"
                  @input="clearRegisterError('code')"
                  @clear="clearRegisterError('code')"
                />
                <a-button type="text" :disabled="registerCountdown > 0" @click="sendRegisterCode">{{ registerCodeBtnText }}</a-button>
              </div>
            </a-form-item>
            <a-form-item
              :label="t.password"
              required
              :validate-status="registerErrors.password ? 'error' : undefined"
              :help="registerErrors.password || undefined"
              @focusin="clearRegisterError('password')"
            >
              <a-input-password
                v-model="registerForm.password"
                :placeholder="t.registerPasswordPh"
                :error="!!registerErrors.password"
                allow-clear
                @input="clearRegisterError('password')"
                @clear="clearRegisterError('password')"
              />
            </a-form-item>
            <a-form-item
              :label="t.passwordConfirm"
              required
              :validate-status="registerErrors.confirm ? 'error' : undefined"
              :help="registerErrors.confirm || undefined"
              @focusin="clearRegisterError('confirm')"
            >
              <a-input-password
                v-model="registerForm.confirm"
                :placeholder="t.passwordConfirmRequired"
                :error="!!registerErrors.confirm"
                allow-clear
                @input="clearRegisterError('confirm')"
                @clear="clearRegisterError('confirm')"
              />
            </a-form-item>
          </a-form>
        </a-modal>
      </div>
    `,
  })
  const loginVm = app
    .use(ArcoVue)
    .use(window.ArcoVueIcon)
    .mount('#app')

  /** 按主题主色替换插图品牌色（保留肤色/深色/白色），避免 hue-rotate 偏色 */
  const ART_SRC = './images/login-illustration-01.svg'
  let artSvgCache = ''
  let artBlobUrl = ''

  function parseHex(hex) {
    let h = String(hex || '').replace('#', '').trim()
    if (h.length === 3) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('')
    }
    if (h.length !== 6) return null
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    }
  }

  function toHex(r, g, b) {
    const n = (v) =>
      Math.max(0, Math.min(255, Math.round(v)))
        .toString(16)
        .padStart(2, '0')
    return '#' + n(r) + n(g) + n(b)
  }

  function mixHex(hex, whiteAmount) {
    const c = parseHex(hex)
    if (!c) return hex
    const t = Math.max(0, Math.min(1, whiteAmount))
    return toHex(c.r + (255 - c.r) * t, c.g + (255 - c.g) * t, c.b + (255 - c.b) * t)
  }

  function resolveThemeHex() {
    const theme = window.ArcoProTheme
    const colorId = theme && typeof theme.getInitialColorId === 'function' ? theme.getInitialColorId() : 'indigo'
    return (
      (theme && typeof theme.getThemeColor === 'function' && theme.getThemeColor(colorId)) ||
      getComputedStyle(document.documentElement).getPropertyValue('--pro-theme-color-hex').trim() ||
      '#6C5CE7'
    )
  }

  function recolorArtSvg(svg, themeHex) {
    const main = themeHex
    // 提高浅色占比，避免插图在紫色 Banner 上糊成一团
    const map = {
      '#6876b3': main,
      '#8c96c5': mixHex(main, 0.32),
      '#adb5d6': mixHex(main, 0.52),
      '#d4d8ea': mixHex(main, 0.78),
      '#eff0f7': mixHex(main, 0.92),
      '#bac0dc': mixHex(main, 0.62),
    }
    let out = svg
    Object.keys(map).forEach((from) => {
      out = out.replace(new RegExp(from, 'gi'), map[from])
    })
    return out
  }

  function applyArtThemeTint() {
    if (!artSvgCache) return
    const colored = recolorArtSvg(artSvgCache, resolveThemeHex())
    if (artBlobUrl) URL.revokeObjectURL(artBlobUrl)
    artBlobUrl = URL.createObjectURL(new Blob([colored], { type: 'image/svg+xml' }))
    if (loginVm) loginVm.artSrc = artBlobUrl
  }

  function scheduleApplyArtThemeTint() {
    requestAnimationFrame(applyArtThemeTint)
  }

  fetch(ART_SRC)
    .then((res) => (res.ok ? res.text() : Promise.reject(new Error('art fetch failed'))))
    .then((svg) => {
      artSvgCache = svg
      scheduleApplyArtThemeTint()
    })
    .catch(() => {})

  window.addEventListener('arco-pro-theme-change', scheduleApplyArtThemeTint)
})()
