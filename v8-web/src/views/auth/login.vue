<template>
  <div class="login-container login-container--cover">
    <div class="login-content">
      <div class="login-form-card">
        <div class="login-logo">
          <span class="pro-logo-mark" aria-hidden="true">
            <IconThunderbolt />
          </span>
          <span class="login-logo-text">云数中台 · V8</span>
        </div>
        <div class="login-form-title">账号登录</div>
        <div class="login-form-sub-title">核验本机构入库量，下载接入规范并转交供数方</div>
        <div class="login-form-fields">
          <div class="login-form-field login-form-field--user" :class="{ 'is-error': !!userNameError }">
            <a-input
              v-model="userName"
              placeholder="请输入登录账号"
              allow-clear
              @input="userNameError = ''"
              @press-enter="handleSubmit"
            >
              <template #prefix><IconUser /></template>
            </a-input>
            <div v-if="userNameError" class="login-form-field-error">{{ userNameError }}</div>
          </div>
          <div class="login-form-field login-form-field--password" :class="{ 'is-error': !!passwordError }">
            <a-input-password
              v-model="password"
              placeholder="请输入登录密码"
              allow-clear
              @input="passwordError = ''"
              @press-enter="handleSubmit"
            >
              <template #prefix><IconLock /></template>
            </a-input-password>
            <div v-if="passwordError" class="login-form-field-error">{{ passwordError }}</div>
          </div>
          <div class="login-form-password-actions">
            <a-checkbox v-model="rememberPassword">记住密码</a-checkbox>
            <a-typography-text type="secondary" class="login-forget" @click="openForget">忘记密码</a-typography-text>
          </div>
          <a-button type="primary" long class="login-form-submit" :loading="loading" html-type="button" @click="handleSubmit">
            登录
          </a-button>
          <a-button type="text" long class="login-form-register-btn" html-type="button" @click="openRegister">注册账号</a-button>
          <div class="login-form-demo-hint">
            <IconInfoCircle />
            <span>演示账号：jigou / 123456</span>
          </div>
        </div>
      </div>
      <footer class="login-footer">© 2026 云数中台</footer>
    </div>

    <a-modal
      :visible="forgetVisible"
      title="忘记密码"
      title-align="start"
      :width="420"
      unmount-on-close
      ok-text="重置密码"
      :ok-loading="forgetSubmitting"
      :on-before-ok="submitForget"
      @cancel="forgetVisible = false"
    >
      <a-form :model="forgetForm" layout="vertical" class="login-auth-form">
        <a-form-item label="邮箱" required :validate-status="forgetErrors.email ? 'error' : undefined" :help="forgetErrors.email || undefined">
          <a-input v-model="forgetForm.email" placeholder="请输入邮箱" allow-clear @input="forgetErrors.email = ''" />
        </a-form-item>
        <a-form-item label="邮箱验证码" required :validate-status="forgetErrors.code ? 'error' : undefined" :help="forgetErrors.code || undefined">
          <div class="login-auth-code">
            <a-input v-model="forgetForm.code" placeholder="请输入验证码" allow-clear maxlength="6" @input="forgetErrors.code = ''" />
            <a-button type="text" :disabled="forgetCountdown > 0" @click="sendForgetCode">{{ forgetCodeText }}</a-button>
          </div>
        </a-form-item>
        <a-form-item label="新密码" required :validate-status="forgetErrors.password ? 'error' : undefined" :help="forgetErrors.password || undefined">
          <a-input-password v-model="forgetForm.password" placeholder="请输入新密码" allow-clear @input="forgetErrors.password = ''" />
        </a-form-item>
        <a-form-item label="确认密码" required :validate-status="forgetErrors.confirm ? 'error' : undefined" :help="forgetErrors.confirm || undefined">
          <a-input-password v-model="forgetForm.confirm" placeholder="请再次输入密码" allow-clear @input="forgetErrors.confirm = ''" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal
      :visible="registerVisible"
      title="注册账号"
      title-align="start"
      :width="420"
      unmount-on-close
      ok-text="立即注册"
      :ok-loading="registerSubmitting"
      :on-before-ok="submitRegister"
      @cancel="registerVisible = false"
    >
      <a-form :model="registerForm" layout="vertical" class="login-auth-form">
        <a-form-item label="用户名" required :validate-status="registerErrors.userName ? 'error' : undefined" :help="registerErrors.userName || undefined">
          <a-input v-model="registerForm.userName" placeholder="请输入用户名" allow-clear @input="registerErrors.userName = ''" />
        </a-form-item>
        <a-form-item label="邮箱" required :validate-status="registerErrors.email ? 'error' : undefined" :help="registerErrors.email || undefined">
          <a-input v-model="registerForm.email" placeholder="请输入邮箱" allow-clear @input="registerErrors.email = ''" />
        </a-form-item>
        <a-form-item label="邮箱验证码" required :validate-status="registerErrors.code ? 'error' : undefined" :help="registerErrors.code || undefined">
          <div class="login-auth-code">
            <a-input v-model="registerForm.code" placeholder="请输入验证码" allow-clear maxlength="6" @input="registerErrors.code = ''" />
            <a-button type="text" :disabled="registerCountdown > 0" @click="sendRegisterCode">{{ registerCodeText }}</a-button>
          </div>
        </a-form-item>
        <a-form-item label="密码" required :validate-status="registerErrors.password ? 'error' : undefined" :help="registerErrors.password || undefined">
          <a-input-password v-model="registerForm.password" placeholder="请设置登录密码" allow-clear @input="registerErrors.password = ''" />
        </a-form-item>
        <a-form-item label="确认密码" required :validate-status="registerErrors.confirm ? 'error' : undefined" :help="registerErrors.confirm || undefined">
          <a-input-password v-model="registerForm.confirm" placeholder="请再次输入密码" allow-clear @input="registerErrors.confirm = ''" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconInfoCircle, IconLock, IconThunderbolt, IconUser } from '@arco-design/web-vue/es/icon'
import { loginApi } from '@/api/v8'
import { useUserStore } from '@/store/user'
import { checkLogin, loadRemembered, persistRemember } from '@/utils/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEMO_CODE = '123456'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const remembered = loadRemembered()
const userName = ref(remembered.userName)
const password = ref(remembered.password)
const rememberPassword = ref(remembered.rememberPassword)
const userNameError = ref('')
const passwordError = ref('')
const loading = ref(false)

const forgetVisible = ref(false)
const registerVisible = ref(false)
const forgetSubmitting = ref(false)
const registerSubmitting = ref(false)
const forgetCodeSent = ref(false)
const registerCodeSent = ref(false)
const forgetCountdown = ref(0)
const registerCountdown = ref(0)
let forgetTimer: ReturnType<typeof setInterval> | null = null
let registerTimer: ReturnType<typeof setInterval> | null = null

const forgetForm = reactive({ email: '', code: '', password: '', confirm: '' })
const registerForm = reactive({ userName: '', email: '', code: '', password: '', confirm: '' })
const forgetErrors = reactive({ email: '', code: '', password: '', confirm: '' })
const registerErrors = reactive({ userName: '', email: '', code: '', password: '', confirm: '' })

const forgetCodeText = computed(() => {
  if (forgetCountdown.value > 0) return `${forgetCountdown.value}S`
  return forgetCodeSent.value ? '重新发送' : '发送验证码'
})
const registerCodeText = computed(() => {
  if (registerCountdown.value > 0) return `${registerCountdown.value}S`
  return registerCodeSent.value ? '重新发送' : '发送验证码'
})

function emailError(email: string) {
  const value = String(email || '').trim()
  if (!value) return '请输入邮箱'
  if (!EMAIL_RE.test(value)) return '请输入正确的邮箱地址'
  return ''
}

function startCountdown(kind: 'forget' | 'register') {
  const tick = () => {
    if (kind === 'forget') {
      if (forgetCountdown.value <= 1) {
        if (forgetTimer) clearInterval(forgetTimer)
        forgetTimer = null
        forgetCountdown.value = 0
        return
      }
      forgetCountdown.value -= 1
      return
    }
    if (registerCountdown.value <= 1) {
      if (registerTimer) clearInterval(registerTimer)
      registerTimer = null
      registerCountdown.value = 0
      return
    }
    registerCountdown.value -= 1
  }
  if (kind === 'forget') {
    if (forgetTimer) clearInterval(forgetTimer)
    forgetCountdown.value = 60
    forgetTimer = setInterval(tick, 1000)
    return
  }
  if (registerTimer) clearInterval(registerTimer)
  registerCountdown.value = 60
  registerTimer = setInterval(tick, 1000)
}

async function handleSubmit() {
  const result = checkLogin(userName.value, password.value)
  userNameError.value = result.userNameError
  passwordError.value = result.passwordError
  if (!result.ok) return
  loading.value = true
  try {
    const res = await loginApi(userName.value, password.value)
    persistRemember(userName.value.trim(), password.value, rememberPassword.value)
    userStore.setSession(res.token, res.userInfo)
    Message.success('登录成功')
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') && !route.query.redirect.startsWith('//')
      ? route.query.redirect
      : '/overview'
    await router.replace(redirect === '/login' ? '/overview' : redirect)
  } catch (e) {
    passwordError.value = (e as Error).message || '登录出错，请刷新重试'
  } finally {
    loading.value = false
  }
}

function openForget() {
  Object.assign(forgetForm, { email: '', code: '', password: '', confirm: '' })
  Object.assign(forgetErrors, { email: '', code: '', password: '', confirm: '' })
  forgetCodeSent.value = false
  forgetVisible.value = true
}

function openRegister() {
  Object.assign(registerForm, { userName: '', email: '', code: '', password: '', confirm: '' })
  Object.assign(registerErrors, { userName: '', email: '', code: '', password: '', confirm: '' })
  registerCodeSent.value = false
  registerVisible.value = true
}

function sendForgetCode() {
  if (forgetCountdown.value > 0) return
  forgetErrors.email = emailError(forgetForm.email)
  if (forgetErrors.email) return
  forgetCodeSent.value = true
  startCountdown('forget')
  Message.success('验证码已发送（演示码：123456）')
}

function sendRegisterCode() {
  if (registerCountdown.value > 0) return
  registerErrors.email = emailError(registerForm.email)
  if (registerErrors.email) return
  registerCodeSent.value = true
  startCountdown('register')
  Message.success('验证码已发送（演示码：123456）')
}

function submitForget() {
  forgetErrors.email = emailError(forgetForm.email)
  forgetErrors.code = !forgetCodeSent.value
    ? '请先发送验证码'
    : String(forgetForm.code || '').trim() === DEMO_CODE
      ? ''
      : String(forgetForm.code || '').trim()
        ? '验证码错误，演示码为 123456'
        : '请输入邮箱验证码'
  forgetErrors.password = forgetForm.password.length >= 6 ? '' : forgetForm.password ? '密码至少 6 位' : '请输入密码'
  forgetErrors.confirm = forgetForm.confirm
    ? forgetForm.confirm === forgetForm.password
      ? ''
      : '两次输入的密码不一致'
    : '请再次输入密码'
  if (forgetErrors.email || forgetErrors.code || forgetErrors.password || forgetErrors.confirm) return false
  forgetSubmitting.value = true
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      forgetSubmitting.value = false
      forgetVisible.value = false
      Message.success('密码重置成功，请使用新密码登录')
      resolve(true)
    }, 400)
  })
}

function submitRegister() {
  registerErrors.userName = String(registerForm.userName || '').trim() ? '' : '请输入用户名'
  registerErrors.email = emailError(registerForm.email)
  registerErrors.code = !registerCodeSent.value
    ? '请先发送验证码'
    : String(registerForm.code || '').trim() === DEMO_CODE
      ? ''
      : String(registerForm.code || '').trim()
        ? '验证码错误，演示码为 123456'
        : '请输入邮箱验证码'
  registerErrors.password = registerForm.password.length >= 6 ? '' : registerForm.password ? '密码至少 6 位' : '请输入密码'
  registerErrors.confirm = registerForm.confirm
    ? registerForm.confirm === registerForm.password
      ? ''
      : '两次输入的密码不一致'
    : '请再次输入密码'
  if (registerErrors.userName || registerErrors.email || registerErrors.code || registerErrors.password || registerErrors.confirm) {
    return false
  }
  registerSubmitting.value = true
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      registerSubmitting.value = false
      userName.value = registerForm.userName
      password.value = ''
      registerVisible.value = false
      Message.success('注册成功，请登录')
      resolve(true)
    }, 400)
  })
}

onUnmounted(() => {
  if (forgetTimer) clearInterval(forgetTimer)
  if (registerTimer) clearInterval(registerTimer)
})
</script>
