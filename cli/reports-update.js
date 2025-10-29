const path = require('path')
const { Command, Argument, Option } = require('commander')
const { parse, serialize } = require('xlsx-fuzzyparser')
const { 'reports-update': savedOptions } = require('../options.json')

const program = new Command()
program.description('Update data.')

program.addArgument(new Argument('[source]', 'The source file.').default(savedOptions.source, ''))
program.addArgument(new Argument('[destination]', 'The destination file.').default(savedOptions.destination, ''))

program.addOption(new Option('-sc, --sourceConfig <sourceConfig>', 'The configuration for the source file.').default(savedOptions.sourceConfig, ''))
program.addOption(
    new Option('-dc, --destinationConfig <destinationConfig>', 'The configuration for the destination file.').default(savedOptions.destinationConfig, '')
)
program.addOption(new Option('-p, --peak <peak>', 'Peak into the imported data.').default(false, ''))

program.action(async function (source, destination, options) {
    const cwd = process.cwd()
    source = path.join(cwd, source)
    destination = path.join(cwd, destination)
    const sourceConfig = path.join(cwd, options.sourceConfig)
    const destinationConfig = path.join(cwd, options.destinationConfig)
    console.log(`importing data from: ${source}`)
    const sourceData = await parse(source, sourceConfig)
    if (options.peak) {
        console.table(sourceData.slice(0, options.peak))
    }
    console.log(`data length: ${sourceData.length}`)
    await serialize(sourceData, destination, { config: destinationConfig })
    console.log(`exported data to: ${destination}`)
})

async function main() {
    await program.parseAsync(process.argv)
}

main()
