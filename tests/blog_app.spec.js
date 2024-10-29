const { test, expect, beforeEach, describe } = require('@playwright/test')
const {login, createBlog} = require('./utils')
const { timeout, name } = require('../playwright.config')
const { log } = require('console')

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

    const usernameInput = page.getByRole('textbox', {name: 'Username'})
    const passwordInput = page.getByRole('textbox', {name: 'Password'})

    await expect(usernameInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await login(page, 'mr-david', 'secretPassword')

      const newBlogButton = page.locator('.new-blog')
      await expect(newBlogButton).toContainText('Click to add a new blog')
      await expect(newBlogButton).toBeVisible()

      const user = page.getByText('David Malan logged in')
      await expect(user).toBeVisible()

      await expect(page.getByRole('textbox', {name: 'Username'})).not.toBeVisible()
      await expect(page.getByRole('textbox', {name: 'Password'})).not.toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
        await login(page, 'mr-david', 'wrongSecretPassword')

        const newBlogButton = page.getByText('Click to add a new blog')
        await expect(newBlogButton).not.toBeVisible()

        const user = page.getByText('David Malan logged in')
        await expect(user).not.toBeVisible()

        const errorMessage = page.getByText('Username or Password is incorrect')
        await expect(errorMessage).toBeVisible()

        await expect(page.getByRole('textbox', {name: 'Username'})).toBeVisible()
        await expect(page.getByRole('textbox', {name: 'Password'})).toBeVisible()    
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await login(page, 'mr-david', 'secretPassword')

    })
  
    test('a new blog can be created', async ({ page }) => {
      const blog = {
        title: "The Inevitable Death",
        url: "http://www.death.com",
        likes: 5,
        author: "Death"
    }
      await createBlog(page, blog)

      const showButton = page.getByRole('button', {name: 'show'})
      await expect(showButton).toBeVisible({timeout: 20000})

      const title = page.locator('.blogTitle')
      await expect(title).toBeVisible()

    })

    test('a blog can be liked', async ({page}) => {
      const blog = {
        title: "The Inevitable Death",
        url: "http://www.death.com",
        likes: 5,
        author: "Death"
    }

      await createBlog(page, blog)
      await page.getByRole('button', {name: 'show'}).click()

      await page.getByRole('button', {name: 'like'}).click()

      const likes = page.locator('.blogLikes')
      await expect(likes).toContainText(`${(blog.likes + 1).toString()}  like`, {timeout: 20000})

    })

    test('a blog can be deleted by owner', async ({page}) => {
      const blog = {
        title: "The Inevitable Death",
        url: "http://www.death.com",
        likes: 5,
        author: "Death"
    }

      page.on('dialog', async dialog => {
        await dialog.accept()
      })

      await createBlog(page, blog)
      const showButton = page.getByRole('button', {name: 'show'})
      await showButton.click()

      const removeButton = page.getByRole('button', {name: 'remove'})
      await expect(removeButton).toBeVisible()
      await removeButton.click()

      await expect(showButton).not.toBeVisible()
      await expect(page.getByRole('button', {name: 'hide'})).not.toBeVisible()
      await expect(page.getByText(blog.title)).not.toBeVisible()
      await expect(page.getByText(blog.url)).not.toBeVisible()

    })

    test.only('a blog can not deleted by another user aside owner', async ({page, request}) => {
      const blog = {
        title: "The Inevitable Death",
        url: "http://www.death.com",
        likes: 5,
        author: "Death"
    }

    const newUser = {
      data: {
          name: 'Mluukai',
          username: 'mluukai',
          password: 'secretPassword'
      }
  }
      
      await createBlog(page, blog)

      await page.getByRole('button', {name: 'Log Out'}).click()

      await request.post('http://localhost:3003/api/users/', newUser)

      await login(page, 'mluukai', 'secretPassword')

      const showButton = page.getByRole('button', {name: 'show'})
      await showButton.click()
      await expect(page.getByRole('button', {name: 'remove'})).not.toBeVisible()

    })
  })
})

