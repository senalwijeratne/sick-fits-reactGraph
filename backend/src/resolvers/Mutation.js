const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

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
  }
}

module.exports = Mutations
