const path = require('path')
const { Command, Option } = require('commander')
const { serialize } = require('xlsx-fuzzyparser')
const { findFiles, Errors, Defaults } = require('../src/reports.js')
const { 'reports-find': savedOptions } = require('../options.json')

const program = new Command()
program.description('Search a folder that matches the query in the specified path and return files inside the folder.')

program.argument('<query>', 'search query')

const directoriesEngine = { ...Defaults.directoriesEngine }
const filesEngine = { ...Defaults.filesEngine }

program.addOption(
    new Option('-sp, --search-path <searchPath>', 'The path to search the folders in.')
        .argParser(function (value) {
            return path.resolve(process.cwd(), value)
        })
        .default(path.resolve(process.cwd(), savedOptions.searchPath))
)
program.option('-fq, --files-query <filesQuery>', 'The query to find files inside the folder.')
program.addOption(
    new Option('-r, --report <report>', 'The filepath of the output file report.')
        .argParser(function (value) {
            return path.resolve(process.cwd(), value)
        })
        .default(path.resolve(process.cwd(), savedOptions.report))
)
program.addOption(
    new Option('-b, --blacklist <blacklist>', 'List of folders to exclude from the search of files.')
        .argParser(function (value) {
            return value.split(' ')
        })
        .default(savedOptions.blacklist)
)
program.addOption(
    new Option('-td, --threshold-directories <thresholdDirectories>', 'Threshold for directories search engine.')
        .argParser(function (value) {
            const number = Number(value)
            directoriesEngine.threshold = number
            return number
        })
        .default(Defaults.directoriesEngine.threshold)
)
program.addOption(
    new Option('-tf, --threshold-files <thresholdFiles>', 'Threshold for files search engine.')
        .argParser(function (value) {
            const number = Number(value)
            filesEngine.threshold = number
            return number
        })
        .default(Defaults.filesEngine.threshold)
)

program.parse()
const query = program.processedArgs[0]
const options = program.opts()

console.log(directoriesEngine)
console.log(filesEngine)
console.log(options)

const { searchPath, filesQuery, blacklist, report } = options

async function main() {
    try {
        console.log('[findFiles]')
        const { files } = findFiles(searchPath, query, { filesQuery, blacklist, directoriesEngine, filesEngine })
        console.table(files, ['filename'])
        await serialize(files, report)
        console.log(`saved as: ${report}`)
    } catch (error) {
        if (
            error instanceof Errors.SearchDirectoryEmpty ||
            error instanceof Errors.NoDirectoryFound ||
            error instanceof Errors.DirectoryEmpty ||
            error instanceof Errors.NoFilesFound
        ) {
            console.log(error.message)
        } else {
            console.error(error)
        }
    }
}

main()
