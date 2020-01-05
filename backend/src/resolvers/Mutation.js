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
  }
}

module.exports = Mutations
