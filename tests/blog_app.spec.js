const { test, expect, beforeEach, describe } = require('@playwright/test')
const exp = require('constants')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/reset-tests/')

    const newUser = {
        data: {
            name: 'David Malan',
            username: 'mr-david',
            password: 'secretPassword'
        }
    }
    await request.post('http://localhost:3003/api/users/', newUser)
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    const blogTitleElement = page.getByText('Blog')
    await expect(blogTitleElement).toBeVisible()

    const usernameInput = page.getByRole('textbox', {name: 'username'})
    const passwordInput = page.getByRole('textbox', {name: 'password'})

    await expect(usernameInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      const usernameInput = page.getByRole('textbox', {name: 'username'})
      const passwordInput = page.getByRole('textbox', {name: 'password'})

      await usernameInput.fill('mr-david')
      await passwordInput.fill('secretPassword')

      const loginButton = page.getByRole('button')
      await loginButton.click()

      const newBlogButton = page.locator('.new-blog')
      await expect(newBlogButton).toContainText('Click to add a new blog')
      await expect(newBlogButton).toBeVisible()

      const user = page.getByText('David Malan logged in')
      await expect(user).toBeVisible()

      await expect(usernameInput).not.toBeVisible()
      await expect(passwordInput).not.toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
        const usernameInput = page.getByRole('textbox', {name: 'username'})
        const passwordInput = page.getByRole('textbox', {name: 'password'})
  
        await usernameInput.fill('mr-david')
        await passwordInput.fill('wrongSecretPassword')
  
        const loginButton = page.getByRole('button')
        await loginButton.click()
  
        const newBlogButton = page.getByText('Click to add a new blog')
        await expect(newBlogButton).not.toBeVisible()

        const user = page.getByText('David Malan logged in')
        await expect(user).not.toBeVisible()

        const errorMessage = page.getByText('Username or Password is incorrect')
        await expect(errorMessage).toBeVisible()

        await expect(usernameInput).toBeVisible()
        await expect(passwordInput).toBeVisible()    
    })
  })
})

