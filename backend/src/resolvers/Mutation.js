const Mutations = {
  createDog(parent, args, ctx, info) {
    const tempDog = { name: args.name }

    return tempDog
  }
}

module.exports = Mutations
