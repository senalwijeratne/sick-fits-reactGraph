const Query = {
  dogs(parent, args, ctx, info) {
    return [{ name: "Snikers" }, { name: "Rex" }]
  }
}

module.exports = Query
