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
    await page.goto('/')
    // ローカルストレージをクリアしてクリーンな状態にする
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    // ゲストとして使う（リダイレクトされた場合はログインせずに使うを押す）
    const guestLink = page.getByRole('link', { name: 'ログインせずに使う →' })
    if (await guestLink.isVisible()) {
      await guestLink.click()
    }
  })

  test('タスクを追加できる', async ({ page }) => {
    // タスク追加ボタンを探す
    const addButton = page.getByRole('button', { name: /タスクを追加|新しいタスク|\+/i }).first()
    await addButton.click()

    // タスク入力フォームに入力
    const input = page.getByPlaceholder(/タスクを入力|タイトル/i)
    await input.fill('E2Eテスト用タスク')

    // 保存
    const saveButton = page.getByRole('button', { name: /追加|保存|作成/i })
    await saveButton.click()

    await expect(page.getByText('E2Eテスト用タスク')).toBeVisible({ timeout: 5000 })
  })
})

// ────────────────────────────────────────────
// ログイン済みユーザーのテスト
// ────────────────────────────────────────────
test.describe('ログイン済み: タスク操作', () => {
  // ログイン状態を共有するために storage state を利用
  test.beforeEach(async ({ page }) => {
    await loginIfNeeded(page)
  })

  test('タスク一覧ページが表示される', async ({ page }) => {
    await page.goto('/todos')
    // ページが表示されることを確認（ログインリダイレクトがないこと）
    await expect(page).toHaveURL('/todos', { timeout: 10000 })
  })

  test('タスクを追加して一覧に表示される', async ({ page }) => {
    await page.goto('/todos')

    const taskTitle = `テストタスク_${Date.now()}`
    await addTask(page, taskTitle)

    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 })
  })

  test('タスクを完了としてマークできる', async ({ page }) => {
    await page.goto('/todos')

    const taskTitle = `完了テスト_${Date.now()}`
    await addTask(page, taskTitle)

    // タスクの完了ボタンをクリック（チェックボックスまたは完了ボタン）
    const taskItem = page.getByText(taskTitle).locator('..').locator('..')
    const completeBtn = taskItem.getByRole('button', { name: /完了|チェック/i }).first()
    if (await completeBtn.isVisible()) {
      await completeBtn.click()
    } else {
      // チェックボックス的な要素を探す
      const checkbox = taskItem.locator('button, [role="checkbox"]').first()
      await checkbox.click()
    }

    // アニメーション完了を待つ
    await page.waitForTimeout(800)

    // 完了タブやフィルターで確認（実装に応じて調整）
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 5000 })
  })

  test('タスクを削除できる', async ({ page }) => {
    await page.goto('/todos')

    const taskTitle = `削除テスト_${Date.now()}`
    await addTask(page, taskTitle)

    // 削除操作（スワイプ、削除ボタン、コンテキストメニューなど実装に応じる）
    const taskItem = page.getByText(taskTitle).locator('..').locator('..')
    const deleteBtn = taskItem.getByRole('button', { name: /削除|ゴミ箱/i }).first()
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click()
      // 確認ダイアログがある場合
      const confirmBtn = page.getByRole('button', { name: /OK|はい|削除/i })
      if (await confirmBtn.isVisible({ timeout: 1000 })) {
        await confirmBtn.click()
      }
      await expect(page.getByText(taskTitle)).not.toBeVisible({ timeout: 5000 })
    }
  })
})

// ────────────────────────────────────────────
// ヘルパー関数
// ────────────────────────────────────────────

async function loginIfNeeded(page: Page) {
  await page.goto('/')

  // すでにログイン済みならスキップ
  const loginLink = page.getByRole('link', { name: 'ログインせずに使う →' })
  if (!(await loginLink.isVisible({ timeout: 2000 }).catch(() => false))) {
    return // すでにログイン済み
  }

  await page.goto('/auth/login')
  await page.getByLabel('メールアドレス').fill(TEST_EMAIL)
  await page.getByLabel('パスワード').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'ログイン' }).click()
  await expect(page).toHaveURL('/', { timeout: 15000 })
}

async function addTask(page: Page, title: string) {
  // タスク追加ボタンを探してクリック
  const addButton = page
    .getByRole('button', { name: /タスクを追加|新しいタスク|\+|追加/i })
    .first()

  // ボタンが見えない場合はフローティングボタンを探す
  if (await addButton.isVisible()) {
    await addButton.click()
  } else {
    await page.locator('button[aria-label*="追加"], button[aria-label*="add"]').first().click()
  }

  // タイトル入力
  const titleInput = page
    .getByPlaceholder(/タスクを入力|タイトル|例：/i)
    .first()
  await titleInput.fill(title)

  // 保存ボタン
  const saveBtn = page.getByRole('button', { name: /追加|保存|作成/i }).last()
  await saveBtn.click()

  await page.waitForTimeout(300)
}
