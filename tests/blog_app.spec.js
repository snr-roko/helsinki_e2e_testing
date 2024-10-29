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

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      const usernameInput = page.getByRole('textbox', {name: 'username'})
      const passwordInput = page.getByRole('textbox', {name: 'password'})

      await usernameInput.fill('mr-david')
      await passwordInput.fill('secretPassword')

      const loginButton = page.getByRole('button')
      await loginButton.click()
      const newBlogButton = page.locator('.new-blog')
      await newBlogButton.click()
    })
  
    test.only('a new blog can be created', async ({ page }) => {
      const blog = {
        title: "The Inevitable Death",
        url: "http://www.death.com",
        likes: 5,
        author: "Death"
    }
      const blogTitle = page.getByPlaceholder('Blog Title')
      const blogAuthor = page.getByPlaceholder('Blog Author')
      const blogURL = page.getByPlaceholder('Blog URL')
      const blogLikes = page.getByPlaceholder('Blog Likes')
      
      await blogTitle.fill(blog.title)
      await blogAuthor.fill(blog.author)
      await blogURL.fill(blog.url)
      await blogLikes.fill(blog.likes.toString())

      const newBlogSubmit = page.locator('.newBlogSubmit')
      await newBlogSubmit.click()

      const showButton = page.getByRole('button', {name: 'show'})
      await expect(showButton).toBeVisible({timeout: 20000})

      const title = page.locator('.blogTitle')
      await expect(title).toBeVisible()

    })
  })
})

