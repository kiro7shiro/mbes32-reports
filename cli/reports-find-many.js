const path = require('path')
const { Command } = require('commander')
const program = new Command()
const { findManyFiles, writeReport } = require('../src/reports.js')
const { 'reports-find-many': savedOptions } = require('../options.json')

program.description('Search folder that matches a query from the list and search files that matches the file query')

program.argument('queries', 'A string pointing to a excel file containing the queries')

program.option('-d, --directory <directory>', 'The directory to search the folders in.')
program.option('-fq, --files-query <filesQuery>', 'The query to find files inside the folder.')
program.option('-b, --blacklist <blacklist>', 'List of folders to exclude from the search of files.')
program.option('-n, --not-found-threshold <threshold>', 'Threshold for searching, if an item scores above the threshold it is considered not found.')

program.parse(process.argv)
const queries = program.args[0]

const options = Object.assign({ directory: process.cwd(), filesQuery: '', blacklist: '', notFoundThreshold: 0.001 }, savedOptions, program.opts())
const { directory, filesQuery, notFoundThreshold } = options
const blacklist = options.blacklist.split(' ')

async function main() {
    try {
        console.log('findMany')
        const { results, errors } = await findManyFiles(directory, queries, { filesQuery, blacklist, notFoundThreshold })
        console.log(`files: ${results.length}`)
        console.log(`errors: ${errors.length}`)
        await writeReport(path.join(process.cwd(), '../data/report.xlsx'), results, errors)
        console.log('saved')
    } catch (error) {
        console.error(error)
    }
}

main()
