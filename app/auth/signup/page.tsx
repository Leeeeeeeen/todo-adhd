'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください')
      return
    }
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('このメールアドレスはすでに登録されています')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-white mb-2">確認メールを送りました</h2>
          <p className="text-gray-400 text-sm mb-6">
            <span className="text-white font-medium">{email}</span> に確認メールを送りました。
            メール内のリンクをクリックして登録を完了してください。
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            ログインページへ →
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⏳</div>
          <h1 className="text-2xl font-bold text-white">新規登録</h1>
          <p className="text-gray-500 text-sm mt-2">無料で始められます</p>
        </div>

        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1.5">パスワード（8文字以上）</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl py-3 font-semibold transition-colors"
            >
              {loading ? '登録中...' : '登録する'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300">
            ログイン
          </Link>
        </p>
        <p className="text-center mt-2">
          <Link href="/" className="text-gray-600 hover:text-gray-500 text-xs">
            ログインせずに使う →
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
