'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/store/useStore'

export function useAuth() {
  const { currentUser, setCurrentUser, loadFromCloud } = useStore()

  useEffect(() => {
    const supabase = createClient()

    // 初期セッション確認
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user = session.user
        setCurrentUser({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name ?? user.user_metadata?.name,
          avatarUrl: user.user_metadata?.avatar_url,
        })
        loadFromCloud(user.id)
      }
    })

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const user = session.user
          setCurrentUser({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name ?? user.user_metadata?.name,
            avatarUrl: user.user_metadata?.avatar_url,
          })
          if (event === 'SIGNED_IN') {
            loadFromCloud(user.id)
          }
        } else {
          setCurrentUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setCurrentUser, loadFromCloud])

  return { user: currentUser }
}
