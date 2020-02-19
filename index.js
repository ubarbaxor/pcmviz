const express = require('express')

const app = express()

const port = process.env.node_port || 8080
const logRequest = require('./src/logRequest')

app.use(logRequest)
app.get('/', express.static('./public'))

app.listen(port, _ => console.log(`Listening on ${port}`))