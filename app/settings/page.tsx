'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SettingsPage() {
  const { settings, updateSettings, currentUser, syncStatus, lastSyncedAt, loadFromCloud } = useStore()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-white">設定</h1>

      {/* Profile */}
      <section className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">プロフィール</h2>

        <div>
          <label className="text-sm text-gray-400 block mb-2">名前（任意）</label>
          <input
            value={settings.name}
            onChange={(e) => updateSettings({ name: e.target.value })}
            placeholder="あなたの名前"
            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>
      </section>

      {/* Goal countdown */}
      <section className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">目標カウントダウン</h2>
          <button
            onClick={() => updateSettings({ showLifeCountdown: !settings.showLifeCountdown })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              settings.showLifeCountdown ? 'bg-indigo-600' : 'bg-gray-700'
            }`}
          >
            <motion.div
              animate={{ x: settings.showLifeCountdown ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
            />
          </button>
        </div>

        <p className="text-xs text-gray-600">
          設定した年齢や日付までの残り時間を表示します。
        </p>

        {/* Goal type selector */}
        <div className="flex gap-2">
          <button
            onClick={() => updateSettings({ goalType: 'age' })}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              settings.goalType === 'age'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            年齢で設定
          </button>
          <button
            onClick={() => updateSettings({ goalType: 'date' })}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              settings.goalType === 'date'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            日付で設定
          </button>
        </div>

        {settings.goalType === 'age' && (
          <>
            <div>
              <label className="text-sm text-gray-400 block mb-2">生年月日</label>
              <input
                type="date"
                value={settings.birthDate}
                onChange={(e) => updateSettings({ birthDate: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                目標年齢: <span className="text-white font-medium">{settings.goalAge ?? 80}歳</span>
              </label>
              <input
                type="range"
                min={1}
                max={120}
                value={settings.goalAge ?? 80}
                onChange={(e) => updateSettings({ goalAge: Number(e.target.value) })}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>1歳</span>
                <span>60歳（定年）</span>
                <span>120歳</span>
              </div>
            </div>
          </>
        )}

        {settings.goalType === 'date' && (
          <div>
            <label className="text-sm text-gray-400 block mb-2">目標日</label>
            <input
              type="date"
              value={settings.goalDate ?? ''}
              onChange={(e) => updateSettings({ goalDate: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>
        )}
      </section>

      {/* Sync / Account */}
      <section className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">アカウント・同期</h2>

        {currentUser ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">{currentUser.email}</p>
                <p className={`text-xs mt-0.5 ${
                  syncStatus === 'error' ? 'text-red-400' : 'text-gray-500'
                }`}>
                  {syncStatus === 'syncing' && '⏳ 同期中...'}
                  {syncStatus === 'success' && `☁ 同期済み`}
                  {syncStatus === 'error' && '⚠ 同期エラー'}
                  {syncStatus === 'idle' && '☁ クラウド同期有効'}
                  {lastSyncedAt && syncStatus !== 'syncing' && (
                    <span className="ml-2 text-gray-600">
                      {new Date(lastSyncedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => loadFromCloud(currentUser.id)}
                disabled={syncStatus === 'syncing'}
                className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-800 hover:border-indigo-700 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
              >
                手動同期
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              ログインするとクラウド同期が有効になり、複数デバイスでデータを共有できます。
            </p>
            <Link
              href="/auth/login"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl px-4 py-2 transition-colors"
            >
              ログイン / 新規登録
            </Link>
          </div>
        )}
      </section>

      {/* Data */}
      <section className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">データ</h2>
        <p className="text-xs text-gray-500">
          {currentUser
            ? 'データはクラウドに保存されています。'
            : 'データはブラウザのLocalStorageに保存されています。'}
        </p>
        <button
          onClick={() => {
            if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
              localStorage.clear()
              window.location.reload()
            }
          }}
          className="text-sm text-red-400 hover:text-red-300 border border-red-900 hover:border-red-800 rounded-xl px-4 py-2 transition-colors"
        >
          すべてのデータを削除（ローカル）
        </button>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-semibold transition-colors"
      >
        {saved ? '✓ 保存しました' : '保存する'}
      </button>

      {/* Keyboard shortcuts */}
      <section className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">キーボードショートカット</h2>
        <div className="space-y-2">
          {[
            ['⌘⇧K', 'クイックキャプチャ'],
            ['Esc', 'モーダルを閉じる'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">{desc}</span>
              <kbd className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded font-mono">{key}</kbd>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
