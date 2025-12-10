const { Command } = require('commander')
const { 'reports-start': savedOptions } = require('../options.json')

const app = require('../app/app.js')
const program = new Command()
program.description('Start the application server.')

program.option('-p, --port <port>', 'The port to start the server on.')

program.parse(process.argv)

const options = Object.assign(savedOptions, program.opts())
const { port } = options

async function main() {
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
}

main()
