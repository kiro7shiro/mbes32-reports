const fs = require('fs')
const path = require('path')
const { Command, Argument, Option } = require('commander')
const { analyze, parse, serialize } = require('xlsx-fuzzyparser')

function parseConfigFile(value) {
    const filePath = path.resolve(process.cwd(), value)
    return require(filePath)
}

const program = new Command()
program.description('Extract date from a list of mbes files.')
program.addArgument(
    new Argument('<list>', 'The file containing a list of mbes files.')
        .argParser(function (value) {
            return path.resolve(process.cwd(), value)
        })
)
program.addArgument(
    new Argument('[report]', 'The file to write the extracted data to.')
        .argParser(function (value) {
            return path.resolve(process.cwd(), value)
        })
        .default(path.resolve(__dirname, '../data/extract.xlsx'))
)
program.addOption(
    new Option('-lc, --list-config <listConfig>', 'The config of the list file.')
        .argParser(parseConfigFile)
        .default(parseConfigFile(path.resolve(__dirname, '../data/list-config.js')))
)
program.addOption(
    new Option('-fc, --files-config <filesConfig>', 'The config of the files in the list.')
        .argParser(parseConfigFile)
        .default(parseConfigFile(path.resolve(__dirname, '../data/mbes-meta-config.js')))
)
program.addOption(
    new Option('-rc, --report-config <reportConfig>', 'The config of the report file.')
        .argParser(parseConfigFile)
        .default(parseConfigFile(path.resolve(__dirname, '../data/extract-report.js')))
)
program.addOption(
    new Option('-cb, --con-blacklist <conBlacklist>', 'List of contractors to exclude.')
        .argParser(function (value) {
            return value.split(' ')
        })
        .default(['ALBA', 'CWS'])
)

program.parse()
let [list, report] = program.processedArgs
const options = program.opts()

console.log('[extract]')
console.log({ list, options })
//process.exit(0)

async function main() {
    // parse the list file
    const directories = await parse(list, options.listConfig.directories)
    //console.table(directories)
    const temp = []
    for (let dCnt = 0; dCnt < 4 /* directories.length */; dCnt++) {
        const { directory } = directories[dCnt];
        const basename = path.basename(directory)
        console.log(basename)
        const config = Object.assign({}, options.listConfig.files, { sheetName: basename })
        const files = await parse(list, config)
        //console.table(files)
        // try to get the last modified bill or planning file for each contractor
        const contractors = files.reduce(function (accu, file) {
            if (file.contractor === '') return accu
            if (options.conBlacklist.includes(file.contractor)) return accu
            if (!Object.hasOwn(accu, file.contractor)) accu[file.contractor] = {}
            if (!Object.hasOwn(accu[file.contractor], file.type)) accu[file.contractor][file.type] = []
            accu[file.contractor][file.type].push(file)
            return accu
        }, {})
        //console.log(contractors)
        const lastModified = Object.entries(contractors).reduce(function (accu, curr) {
            const [_, files] = curr
            if (!Object.hasOwn(files, 'bill') && !Object.hasOwn(files, 'planning')) return accu
            let lastMod = null
            if (files?.bill?.length > 0) {
                lastMod = files.bill.reduce(function (accu, curr) {
                    if (accu === 0) return curr
                    if (curr.lastModified < accu.lastModified) return curr
                    return accu
                }, 0)
            }
            if (lastMod === null && files?.planning?.length > 0) {
                lastMod = files.planning.reduce(function (accu, curr) {
                    if (accu === 0) return curr
                    if (curr.lastModified < accu.lastModified) return curr
                    return accu
                }, 0)
            }
            accu.push(lastMod)
            return accu
        }, [])
        //console.table(lastModified, ['contractor', 'filename'])
        //continue
        // extract data from last modified files
        const fileData = []
        for (let fCnt = 0; fCnt < lastModified.length; fCnt++) {
            const file = lastModified[fCnt];
            const [data] = await parse(file.filepath + file.filename, options.filesConfig)
            // TODO : find event data in mbes-events.xlsx
            // TODO : validate matchcode of files
            //fileData.push(data)
            Object.assign(file, data)
            //file.data = data
        }
        //console.log(fileData)
        console.log(lastModified)
        continue
        // TODO : write data into report file
        await serialize(lastModified, report, { config })
        const dataConfig = Object.assign({}, options.reportConfig.fileData, { sheetName: basename })
        await serialize(fileData, report, { config: dataConfig })
    }



}

main()