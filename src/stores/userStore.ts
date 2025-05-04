// stores/user.ts
import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {useProtocol} from "@/stores/protocolStore.ts";
import {ProtocolError, TimeoutError} from "@/api/protocol.ts";

interface AuthState {
  user: {
    username: string | null
    isAdmin: boolean,

    orgCount: number
    orgLimit: number
  }
  tokens: {
    access: string | null
    refresh: string | null
  }
  loading: boolean
  error: string | null
}

export const useUserStore = defineStore('user', () => {
  const {protocol} = useProtocol();

  const state = ref<AuthState>({
    user: {
      username: null,
      isAdmin: false,

      orgCount: 0,
      orgLimit: 0,
    },
    tokens: {
      access: localStorage.getItem('access_token'),
      refresh: localStorage.getItem('refresh_token')
    },
    loading: false,
    error: null
  })

  const isLoggedIn = computed(() => !!state.value.tokens.access && !!state.value.user.username)
  const hasAuthData = computed(() => !!state.value.tokens.access)
  const isAdmin = computed(() => state.value.user.isAdmin)

  const login = async (username: string, password: string) => {
    state.value.loading = true
    state.value.error = null

    try {
      const response = await protocol.send('auth/login', {username, password})

      localStorage.setItem('access_token', response.token)
      localStorage.setItem('refresh_token', response.refresh_token)

      state.value.tokens = {
        access: response.token,
        refresh: response.refresh_token
      }

      await checkAuth()
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Unknown error'
      throw error
    } finally {
      state.value.loading = false
    }
  }

  const checkAuth = async () => {
    if (!state.value.tokens.access) return

    try {
      const response = await protocol.send('auth', {token: state.value.tokens.access})

      localStorage.setItem('username', response.username)
      state.value.user = {
        username: response.username,
        isAdmin: response.is_admin,

        orgCount: response.organization_count,
        orgLimit: response.organization_limit,
      }

      const exp = response.exp as number
      const expiresIn = exp * 1000 - Date.now()
      console.log('Токен истечёт через', expiresIn)
      setTimeout(refreshToken, expiresIn - 5000)
    } catch (error) {
      if (error instanceof ProtocolError) {
        if (error instanceof TimeoutError) {
          // no logout
          throw error
        }

        if (error.data && 'reason' in error.data && error.data.reason === 'token expired') {
          await refreshToken()
          await checkAuth()
          return
        }
      }

      logout()
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('username')

    state.value.tokens = {access: null, refresh: null}
    state.value.user = {
      username: null,
      isAdmin: false,

      orgLimit: 0,
      orgCount: 0,
    }
  }

  const refreshToken = async () => {
    if (!state.value.tokens.refresh) {
      throw new Error('No refresh token')
    }

    try {
      const {protocol} = useProtocol();
      const response = await protocol.send('auth/refresh', {
        refresh_token: state.value.tokens.refresh
      })

      localStorage.setItem('access_token', response.token)
      localStorage.setItem('refresh_token', response.refresh_token)

      state.value.tokens = {
        access: response.token,
        refresh: response.refresh_token
      }
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw error
      }

      logout()
      throw error
    }
  }

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    if (!state.value.tokens.access) {
      throw new Error('Not authenticated')
    }

    const {protocol} = useProtocol();
    await protocol.send('auth/update_password', {
      old_password: oldPassword,
      new_password: newPassword
    })
  }

  // Автопроверка при инициализации
  if (state.value.tokens.access) {
    checkAuth()

    protocol.addEventListener('proto-reconnect', () => {
      checkAuth()
    })
  }

  return {
    state,
    isLoggedIn,
    hasAuthData,
    isAdmin,
    login,
    checkAuth,
    logout,
    refreshToken,
    updatePassword
  }
})