const cookieParser = require("cookie-parser")

require("dotenv").config({ path: "variables.env" })
const createServer = require("./createServer")
const db = require("./db")

const server = createServer()

server.express.use(cookieParser())
// todo: express midddleware to populate current user

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
