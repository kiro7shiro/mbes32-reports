const path = require('path')
const { Command } = require('commander')
const { parse, serialize } = require('xlsx-fuzzyparser')
const { 'reports-start': savedOptions } = require('../options.json')

const app = require('../app/app.js')
const program = new Command()
program.description('Start the application server.')

program.option('-p, --port <port>', 'The port to start the server on.')

program.parse(process.argv)

const options = Object.assign({ port: 5500 }, savedOptions, program.opts())
const { port } = options

async function main() {
    // what do you wanna show on screen ?
    // event progress bar
    // event infos
    // event todos/ checklist
    // save new todos
    // edit existing todos

    /* const sourceFile = path.join(process.cwd(), '../data/TPK-Liste mit ESPK.xlsx')
    const sourceConfig = path.join(process.cwd(), '../data/eventsDataConfig.json')
    const eventsFile = path.join(process.cwd(), '../data/events.xlsx')
    const eventsConfig = path.join(process.cwd(), '../data/eventsConfig.json')
    const sourceData = await parse(sourceFile, sourceConfig)
    await serialize(sourceData, eventsFile, {config:eventsConfig})
    console.log('saved') */

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
