import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-white mb-2">認証エラー</h1>
        <p className="text-gray-400 text-sm mb-6">ログイン処理中にエラーが発生しました</p>
        <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 text-sm">
          ログインページへ戻る →
        </Link>
      </div>
    </div>
  )
}
