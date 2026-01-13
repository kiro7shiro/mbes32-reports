const path = require('path')
const { Command, Argument, Option } = require('commander')
const { analyze, parse, serialize } = require('xlsx-fuzzyparser')

const program = new Command()
program.description('Analyze a file against a config.')

function parseFilePath(value) {
    return path.resolve(process.cwd(), value)
}

function parseConfigFile(value) {
    const filePath = path.resolve(process.cwd(), value)
    return require(filePath)
}

program.addArgument(new Argument('<file>', 'The file to analyze.').argParser(parseFilePath))
program.addArgument(new Argument('<config>', 'The file to analyze.').argParser(parseConfigFile))

program.parse()
const [file, config] = program.processedArgs
const options = program.opts()

async function main() {
    console.log('[analyze]')
    console.log({ file, config })
    console.log(options)
    const errors = await analyze(file, config)
    console.log(errors)
    const data = await parse(file, config)
    console.log(data)
}

main()
