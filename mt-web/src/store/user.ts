import { defineStore } from 'pinia'

const TOKEN_KEY = 'yunshu-mt-token'
const USER_KEY = 'yunshu-mt-user'

export interface UserInfo {
  name: string
  account: string
  role: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    userInfo: (() => {
      try {
        return JSON.parse(localStorage.getItem(USER_KEY) || 'null') as UserInfo | null
      } catch {
        return null
      }
    })(),
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    setSession(token: string, userInfo: UserInfo) {
      this.token = token
      this.userInfo = userInfo
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
    },
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
    /** 演示环境免登录：无会话时写入默认运营账号 */
    ensureDemoSession() {
      if (this.token && this.userInfo) return
      this.setSession('mt-demo-token', {
        name: '王运营',
        account: import.meta.env.VITE_DEMO_USER || 'yunying',
        role: '平台运营',
      })
    },
  },
})
