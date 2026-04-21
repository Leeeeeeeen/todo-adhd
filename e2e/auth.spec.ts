/**
 * 認証フロー E2E テスト
 *
 * ログイン成功テストは Supabase auth エンドポイントをモックして実行します。
 * 実際のネットワーク接続は不要です。
 */
import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.TEST_EMAIL ?? 'e2etest@gmail.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'E2eTest123'

// Supabase auth の成功レスポンスを返すモック
const MOCK_AUTH_SUCCESS = {
  access_token: 'mock_access_token_for_e2e_test',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'mock_refresh_token',
  user: {
    id: 'mock-user-id-12345',
    aud: 'authenticated',
    role: 'authenticated',
    email: TEST_EMAIL,
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { email: TEST_EMAIL, email_verified: true },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
}

test.describe('ログインフロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  test('ログインページが表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()
  })

  test('間違ったパスワードでエラーメッセージが表示される', async ({ page }) => {
    await page.locator('input[type="email"]').fill(TEST_EMAIL)
    await page.locator('input[type="password"]').fill('wrong-password-xyz')
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(
      page.getByText('メールアドレスまたはパスワードが正しくありません')
    ).toBeVisible({ timeout: 15000 })
  })

  test('正しいログイン情報でホームへリダイレクト', async ({ page }) => {
    // Supabase auth エンドポイントをモックして成功レスポンスを返す
    await page.route('**/auth/v1/token**', async (route) => {
      const body = route.request().postDataJSON()
      if (body?.email === TEST_EMAIL && body?.password === TEST_PASSWORD) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_AUTH_SUCCESS),
        })
      } else {
        await route.continue()
      }
    })

    await page.locator('input[type="email"]').fill(TEST_EMAIL)
    await page.locator('input[type="password"]').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'ログイン' }).click()

    await expect(page).toHaveURL('/', { timeout: 15000 })
  })

  test('「ログインせずに使う」リンクが機能する', async ({ page }) => {
    await page.getByRole('link', { name: 'ログインせずに使う →' }).click()
    await expect(page).toHaveURL('/')
  })

  test('新規登録ページへのリンクが機能する', async ({ page }) => {
    await page.getByRole('main').getByRole('link', { name: '新規登録' }).click()
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
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: '登録する' })).toBeVisible()
  })

  test('8文字未満のパスワードでバリデーションエラー', async ({ page }) => {
    await page.locator('input[type="email"]').fill('new@example.com')
    await page.locator('input[type="password"]').fill('short')
    await page.getByRole('button', { name: '登録する' }).click()

    await expect(
      page.getByText('パスワードは8文字以上で設定してください')
    ).toBeVisible()
  })

  test('登録成功で確認メール送信画面に遷移', async ({ page }) => {
    // signup エンドポイントをモックして成功扱いにする
    await page.route('**/auth/v1/signup**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'new-user-id',
          email: 'newuser@gmail.com',
          confirmation_sent_at: new Date().toISOString(),
        }),
      })
    })

    await page.locator('input[type="email"]').fill('newuser@gmail.com')
    await page.locator('input[type="password"]').fill('NewUser123')
    await page.getByRole('button', { name: '登録する' }).click()

    await expect(page.getByRole('heading', { name: '確認メールを送りました' })).toBeVisible({ timeout: 5000 })
  })

  test('ログインページへのリンクが機能する', async ({ page }) => {
    await page.getByRole('main').getByRole('link', { name: 'ログイン', exact: true }).click()
    await expect(page).toHaveURL('/auth/login')
  })
})
