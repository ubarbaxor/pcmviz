// External imports
const express = require('express')

// Local imports
const logRequest = require('./src/logRequest')

// Let's begin
const app = express()

const port = process.env.node_port || 8080

app.use(logRequest)

app.use('/', express.static('public'))

app.listen(port, _ => console.log(`Listening on ${port}`))
