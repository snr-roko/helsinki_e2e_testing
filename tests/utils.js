const login = async (page, username, password) => {
    const usernameInput = page.getByRole('textbox', {name: 'Username'})
    const passwordInput = page.getByRole('textbox', {name: 'Password'})

    await usernameInput.fill(username)
    await passwordInput.fill(password)

    const loginButton = page.getByRole('button')
    await loginButton.click()    
}

const createBlog = async (page, blog) => {
    const newBlogButton = page.locator('.new-blog')
    await newBlogButton.click()

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
}

module.exports = {login, createBlog}