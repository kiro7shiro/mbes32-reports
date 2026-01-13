const path = require('path')
const { Command, Argument, Option } = require('commander')
const { parse, serialize } = require('xlsx-fuzzyparser')
const { 'reports-update': savedOptions } = require('../options.json')

const program = new Command()
program.description('Update events database.')

function parseFilePath(value) {
    return path.resolve(process.cwd(), value)
}

function parseConfigFile(value) {
    const filePath = path.resolve(process.cwd(), value)
    return require(filePath)
}

program.addArgument(new Argument('[source]', 'The source file.').argParser(parseFilePath).default(parseFilePath(savedOptions.source)))
program.addArgument(new Argument('[destination]', 'The destination file.').argParser(parseFilePath).default(parseFilePath(savedOptions.destination)))

program.addOption(
    new Option('-sc, --sourceConfig <sourceConfig>', 'The configuration for the source file.')
        .argParser(parseConfigFile)
        .default(parseConfigFile(savedOptions.sourceConfig))
)
program.addOption(
    new Option('-dc, --destinationConfig <destinationConfig>', 'The configuration for the destination file.')
        .argParser(parseConfigFile)
        .default(parseConfigFile(savedOptions.destinationConfig))
)
program.addOption(new Option('-p, --peak <peak>', 'Peak into the imported data.').argParser(Number).default(0))

program.parse()
const [source, destination] = program.processedArgs
const options = program.opts()

async function main() {
    console.log('[update]')
    //console.log({ source, destination })
    //console.log(options)
    console.log(`importing data from: ${source}`)
    const sourceData = await parse(source, options.sourceConfig)
    if (options.peak) {
        console.table(sourceData.slice(0, options.peak), ['name', 'matchcode', 'start'])
    }
    console.log(`data length: ${sourceData.length}`)
    await serialize(sourceData, destination, { config: options.destinationConfig })
    console.log(`exported data to: ${destination}`)
}

main()
