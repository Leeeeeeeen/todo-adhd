/**
 * タスク操作 E2E テスト
 *
 * ログイン済み状態でテストするため、環境変数が必要:
 *   TEST_EMAIL=your-test@example.com
 *   TEST_PASSWORD=your-password
 */
import { test, expect, Page } from '@playwright/test'

const TEST_EMAIL = process.env.TEST_EMAIL ?? 'test@example.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD ?? 'testpassword123'

// ────────────────────────────────────────────
// ゲストモードのテスト（ログイン不要）
// ────────────────────────────────────────────
test.describe('ゲストモード: タスク基本操作', () => {
  test.beforeEach(async ({ page }) => {
    // ローカルストレージをクリアしてクリーンな状態にする
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    // ゲストとして使う
    const guestLink = page.getByRole('link', { name: 'ログインせずに使う →' })
    if (await guestLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await guestLink.click()
    }
    await page.goto('/todos')
  })

  test('タスクを追加できる', async ({ page }) => {
    // 「+ 追加」ボタンをクリック
    await page.getByRole('button', { name: '+ 追加' }).click()

    // モーダルが開いたら「何をやる？」プレースホルダーの入力欄に入力
    await page.getByPlaceholder('何をやる？').fill('E2Eテスト用タスク')

    // 「追加する」ボタンで保存（exact: true で他のボタンと区別）
    await page.getByRole('button', { name: '追加する', exact: true }).click()

    await expect(page.getByText('E2Eテスト用タスク')).toBeVisible({ timeout: 5000 })
  })
})

// ────────────────────────────────────────────
// ログイン済みユーザーのテスト
// ────────────────────────────────────────────
test.describe('ログイン済み: タスク操作', () => {
  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page)
    await page.goto('/todos')
  })

  test('タスク一覧ページが表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'タスク一覧' })).toBeVisible()
    await expect(page.getByRole('button', { name: '+ 追加' })).toBeVisible()
  })

  test('タスクを追加して一覧に表示される', async ({ page }) => {
    const taskTitle = `テストタスク_${Date.now()}`
    await addTask(page, taskTitle)

    // フィルターが「未着手」なので追加したタスクが表示されるはず
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 })
  })

  test('タスクを完了としてマークできる', async ({ page }) => {
    const taskTitle = `完了テスト_${Date.now()}`
    await addTask(page, taskTitle)

    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 })

    // タスクアイテムの円形チェックボタンをクリック（完了アニメーション）
    const taskRow = page.getByText(taskTitle).locator('../../../..')
    await taskRow.locator('button.rounded-full').first().click()

    // アニメーション完了まで待機 (600ms + 余裕)
    await page.waitForTimeout(1000)

    // 「未着手」フィルターでは完了タスクは非表示になる
    await expect(page.getByText(taskTitle)).not.toBeVisible({ timeout: 5000 })

    // 「完了」フィルターに切り替えて確認
    await page.getByRole('button', { name: '完了' }).click()
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 })
  })

  test('タスクを削除できる', async ({ page }) => {
    const taskTitle = `削除テスト_${Date.now()}`
    await addTask(page, taskTitle)

    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 })

    // タスク行をホバーして削除ボタン（✕）を表示
    const taskRow = page.getByText(taskTitle).locator('../../../..')
    await taskRow.hover()

    // ✕ボタン（title="削除"）をクリック
    await taskRow.locator('button[title="削除"]').click()

    // 確認ダイアログが出るので「削除」ボタンを押す
    await page.getByRole('button', { name: '削除' }).click()

    await expect(page.getByText(taskTitle)).not.toBeVisible({ timeout: 5000 })
  })

  test('タスクを後回しにできる', async ({ page }) => {
    const taskTitle = `後回しテスト_${Date.now()}`
    await addTask(page, taskTitle)

    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 })

    // ホバーして後回しボタン（title="後回し"）をクリック
    const taskRow = page.getByText(taskTitle).locator('../../../..')
    await taskRow.hover()
    await taskRow.locator('button[title="後回し"]').click()

    // postponeCount が増えたことを確認（3回以上で警告バッジが表示される）
    // まずは1回なので警告はない — エラーにならないことを確認
    await expect(page.getByText(taskTitle)).toBeVisible()
  })
})

// ────────────────────────────────────────────
// ヘルパー関数
// ────────────────────────────────────────────

async function loginIfNeeded(page: Page) {
  await page.goto('/')

  // ログインリンクが表示されていたらログインフローへ
  const loginLink = page.getByRole('link', { name: 'ログインせずに使う →' })
  const needsLogin = await loginLink.isVisible({ timeout: 3000 }).catch(() => false)
  if (!needsLogin) return

  await page.goto('/auth/login')
  await page.locator('input[type="email"]').fill(TEST_EMAIL)
  await page.locator('input[type="password"]').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await expect(page).toHaveURL('/', { timeout: 15000 })
}

async function addTask(page: Page, title: string) {
  await page.getByRole('button', { name: '+ 追加' }).click()
  await page.getByPlaceholder('何をやる？').fill(title)
  await page.getByRole('button', { name: '追加する', exact: true }).click()
  await page.waitForTimeout(300)
}
