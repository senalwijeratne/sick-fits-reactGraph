const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { randomBytes } = require("crypto")
const { promisify } = require("util")

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // todo: check if they're logged in

    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args
        }
      },
      info
    )

    return item
  },

  updateItem(parent, args, ctx, info) {
    // get a copy of the update
    const updates = { ...args }
    // remove the ID from the update
    delete updates.id
    // updateItemrun the update method
    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      }
    })
  },

  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id }
    // 1. find the item
    const item = await ctx.db.query.item({ where }, `{id title}`)
    // 2. check if they own that item and/or have the permission
    // todo:
    // 3. delete it
    return ctx.db.mutation.deleteItem({ where }, info)
  },

  async signup(parent, args, ctx, info) {
    // lowercase their email
    args.email = args.email.toLowerCase()
    // hash their password
    const password = await bcrypt.hash(args.password, 10)
    // create the user in the DB
    const user = await ctx.db.mutation.createUser({
      data: {
        ...args,
        password,
        permissions: { set: ["USER"] }
      },
      info
    })
    // create JWT for the user
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // set the jwt as a cookie on the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    })

    // return the user
    return user
  },

  async signin(parent, { email, password }, ctx, info) {
    // check if there is a user witht he given ID
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No such user found for email "${email}"`)
    }
    // check if the password is correct
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error(`Invalid password`)
    }
    // genarate the JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET)
    // set the cookie with the token
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    })

    // return the user
    return user
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token")
    return { message: "Goodbye!" }
  },

  async requestReset(parent, args, ctx, info) {
    // check if there is a user witht he given ID
    const user = await ctx.db.query.user({ where: { email: args.email } })
    if (!user) {
      throw new Error(`No such user found for email "${email}"`)
    }
    // set a reset token and expiry on that user
    const randomBytesOrimisified = promisify(randomBytes) // promisify converts and return a async promise version of the sync func
    const resetToken = (await randomBytesOrimisified(20)).toString("hex")
    const resetTokenExpiry = Date.now() + 3600000 // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    })
    // email them that reset token

    return { message: "Reset email sent!" }
  },

  async resetPassword(parent, args, ctx, info) {
    // check if the password matches
    if (args.password !== args.confirmPassword) {
      throw new Error(`Yo passwords don't match`)
    }
    // check if it's a legit reset token & check if it's expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    })
    if (!user) {
      throw new Error(`This token is either invalid or expired`)
    }
    // hash their new password
    const password = await bcrypt.hash(args.password, 10)
    // save the new password to the user and remove old reset password token
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    })
    // geanarate JWT & set JWT cookie
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET)
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    })

    // return the new user
    return updatedUser
  }
}

module.exports = Mutations
