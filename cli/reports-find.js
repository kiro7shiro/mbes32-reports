const path = require('path')
const { Command } = require('commander')
const { serialize } = require('xlsx-fuzzyparser')
const { findFiles, Errors } = require('../src/reports.js')
const { 'reports-find': savedOptions } = require('../options.json')

const program = new Command()
program.description('Search a folder that matches the query in the specified path and return files inside the folder.')

program.argument('<query>', 'search query')

program.option('-d, --directory <directory>', 'The directory to search the folders in.')
program.option('-fq, --files-query <filesQuery>', 'The query to find files inside the folder.')
program.option('-r, --report <report>', 'The filepath of the output file report.')
program.option('-b, --blacklist <blacklist>', 'List of folders to exclude from the search of files.')
program.option('-n, --not-found-threshold <threshold>', 'Threshold for searching, if an item scores above the threshold it is considered not found.')

program.parse(process.argv)
const query = program.args[0]

const options = Object.assign({ directory: process.cwd(), filesQuery: '', blacklist: '', notFoundThreshold: 0.001 }, savedOptions, program.opts())
const { directory, filesQuery, notFoundThreshold } = options
const blacklist = options.blacklist.split(' ')

async function main() {
    try {
        console.log('findFiles')
        const { files } = findFiles(directory, query, { filesQuery, blacklist, notFoundThreshold })
        console.table(files)
        await serialize(files, path.join(process.cwd(), '../data/report.xlsx'))
        console.log('saved')
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