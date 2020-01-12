const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")

require("dotenv").config({ path: "variables.env" })
const createServer = require("./createServer")
const db = require("./db")

const server = createServer()

server.express.use(cookieParser())
// todo: express midddleware to populate current user

// decode the jwt so we can get the user ID on each server request

server.express.use((req, res, next) => {
  const { token } = req.cookies
  if (token) {
    // decode the userId and add it to the request
    const { userId } = jwt.verify(token, process.env.APP_SECRET)
    req.userId = userId
  }

  next()
})

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  serverDetails => {
    console.log(
      `Server is now running on port http:/localhost${serverDetails.port}`
    )
  }
)
