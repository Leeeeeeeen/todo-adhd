/**
 * 認証フロー E2E テスト
 *
 * 実行前に環境変数を設定してください:
 *   TEST_EMAIL=your-test@example.com
 *   TEST_PASSWORD=your-password
 *
 * または .env.test.local ファイルに記載してください。
 * テスト用アカウントは Supabase ダッシュボードで事前に作成しておいてください。
 */
import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.TEST_EMAIL ?? 'test@example.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'testpassword123'

test.describe('ログインフロー', () => {
  test.beforeEach(async ({ page }) => {
    // セッションをクリアするためローカルストレージをリセット
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/auth/login')
  })

  test('ログインページが表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード')).toBeVisible()
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()
  })

  test('間違ったパスワードでエラーメッセージが表示される', async ({ page }) => {
    await page.getByLabel('メールアドレス').fill(TEST_EMAIL)
    await page.getByLabel('パスワード').fill('wrong-password-xyz')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(
      page.getByText('メールアドレスまたはパスワードが正しくありません')
    ).toBeVisible({ timeout: 10000 })
  })

  test('正しいログイン情報でホームへリダイレクト', async ({ page }) => {
    await page.getByLabel('メールアドレス').fill(TEST_EMAIL)
    await page.getByLabel('パスワード').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'ログイン' }).click()

    // ホームページへリダイレクト
    await expect(page).toHaveURL('/', { timeout: 15000 })
  })

  test('「ログインせずに使う」リンクが機能する', async ({ page }) => {
    await page.getByRole('link', { name: 'ログインせずに使う →' }).click()
    await expect(page).toHaveURL('/')
  })

  test('新規登録ページへのリンクが機能する', async ({ page }) => {
    await page.getByRole('link', { name: '新規登録' }).click()
    await expect(page).toHaveURL('/auth/signup')
    await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible()
  })
})

test.describe('新規登録フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup')
  })

  test('新規登録ページが表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible()
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード（8文字以上）')).toBeVisible()
    await expect(page.getByRole('button', { name: '登録する' })).toBeVisible()
  })

  test('8文字未満のパスワードでバリデーションエラー', async ({ page }) => {
    await page.getByLabel('メールアドレス').fill('new@example.com')
    await page.getByLabel('パスワード（8文字以上）').fill('short')
    await page.getByRole('button', { name: '登録する' }).click()

    await expect(
      page.getByText('パスワードは8文字以上で設定してください')
    ).toBeVisible()
  })

  test('ログインページへのリンクが機能する', async ({ page }) => {
    await page.getByRole('link', { name: 'ログイン' }).click()
    await expect(page).toHaveURL('/auth/login')
  })
})
