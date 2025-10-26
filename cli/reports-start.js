const express = require('express')
const { Command } = require('commander')
const gantt = require('mbes32-gantt/app.js')
const { 'reports-start': savedOptions } = require('../options.json')

const app = express()
const program = new Command()
program.description('Start the application server.')

program.option('-p, --port <port>', 'The port to start the server on.')

program.parse(process.argv)

const options = Object.assign({ port: 5500 }, savedOptions, program.opts())
const { port } = options

app.use(express.json())
app.use(gantt)

const server = app.listen(port, function () {
    console.log(`server started on port: ${port}`)
})

// process manager
function terminate() {
    server.close()
    console.log(`server stopped`)
    process.exit(0)
}
process.on('SIGINT', terminate)
process.on('SIGTERM', terminate)
process.on('SIGUSR2', terminate)