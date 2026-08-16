import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from '../lib/api'

const AuthContext =
  createContext(null)

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  async function refreshUser() {
    try {
      const current =
        await getMe()

      setUser(current)

      return current
    } catch (error) {
      setUser(null)
      throw error
    }
  }

  useEffect(() => {
    getMe()
      .then((current) => {
        setUser(current)
      })
      .catch(() => {
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  async function login(
    email,
    password
  ) {
    const current =
      await apiLogin(
        email,
        password
      )

    setUser(current)

    return current
  }

  async function register(
    values
  ) {
    await apiRegister(values)

    try {
      const current =
        await refreshUser()

      return {
        user: current,
        requiresVerification: false,
      }
    } catch (error) {
      if (
        error.status === 403 ||
        error.status === 401
      ) {
        return {
          user: null,
          requiresVerification: true,
        }
      }

      throw error
    }
  }

  async function logout() {
    try {
      await apiLogout()
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticated: Boolean(user),
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    )
  }

  return context
}
