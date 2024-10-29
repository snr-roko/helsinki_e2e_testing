const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const blogTitleElement = page.getByText('Blog')
    await expect(blogTitleElement).toBeVisible()

    const usernameButton = page.getByRole('textbox', {name: 'username'})
    const passwordButton = page.getByRole('textbox', {name: 'password'})

    await expect(usernameButton).toBeVisible()
    await expect(passwordButton).toBeVisible()
  })
})