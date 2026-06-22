import 'dotenv/config'
import app from './app'

const port = parseInt(process.env.PORT || '3001', 10)

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on port ${port}`)
})
