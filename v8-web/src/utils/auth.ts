export const DEMO_USER = import.meta.env.VITE_DEMO_USER || 'jigou'
export const DEMO_PASS = import.meta.env.VITE_DEMO_PASS || '123456'

const PARAMS_KEY = 'yunshu-v8-login-params'

export interface LoginCheck {
  ok: boolean
  userNameError: string
  passwordError: string
}

export function checkLogin(userName: string, password: string): LoginCheck {
  const name = String(userName || '').trim()
  const pwd = String(password || '')
  const userNameError = name ? '' : '用户名不能为空'
  const passwordError = pwd ? '' : '密码不能为空'
  if (userNameError || passwordError) {
    return { ok: false, userNameError, passwordError }
  }
  return {
    ok: name === DEMO_USER && pwd === DEMO_PASS,
    userNameError: name === DEMO_USER ? '' : '用户名不正确',
    passwordError: pwd === DEMO_PASS ? '' : '密码不正确',
  }
}

export function loadRemembered(): { userName: string; password: string; rememberPassword: boolean } {
  try {
    const saved = JSON.parse(localStorage.getItem(PARAMS_KEY) || 'null') as {
      userName?: string
      password?: string
    } | null
    if (saved?.userName && saved.password) {
      const isDemo = saved.userName === DEMO_USER && saved.password === DEMO_PASS
      if (!isDemo) {
        return { userName: saved.userName, password: saved.password, rememberPassword: true }
      }
    }
  } catch {
    /* ignore */
  }
  return { userName: '', password: '', rememberPassword: true }
}

export function persistRemember(userName: string, password: string, remember: boolean) {
  if (remember) {
    localStorage.setItem(PARAMS_KEY, JSON.stringify({ userName, password }))
    return
  }
  localStorage.removeItem(PARAMS_KEY)
}
