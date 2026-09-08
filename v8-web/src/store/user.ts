import { defineStore } from 'pinia'

const TOKEN_KEY = 'yunshu-v8-token'
const USER_KEY = 'yunshu-v8-user'

export interface UserInfo {
  name: string
  account: string
  department: string
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
  },
})
