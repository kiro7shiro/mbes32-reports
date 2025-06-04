const { Command } = require('commander')
const program = new Command()
const { findFiles } = require('../src/reports.js')
const { writeFile } = require('../src/files.js')
const { 'reports-find': savedOptions } = require('../options.json')

program.description('Search a folder that matches the query in the specified path and return files inside the folder.')

program.argument('<query>', 'search query')

program.option('-p, --path <path>', 'The path to search the folder in.')
program.option('-fq, --files-query <filesQuery>', 'The query to find files inside the folder.')
program.option('-b, --blacklist <blacklist>', 'List of folders to exclude from the search of files.')
program.option('-n, --not-found-threshold <threshold>', 'Threshold for searching, if an item scores above the threshold it is considered not found.')

program.parse(process.argv)
const query = program.args[0]

const options = Object.assign({ path: process.cwd(), filesQuery: '', blacklist: '', notFoundThreshold: 0.001 }, savedOptions, program.opts())
const { path, filesQuery, notFoundThreshold } = options
const blacklist = options.blacklist.split(' ')
console.log({ query, path, filesQuery, blacklist, notFoundThreshold })

const result = findFiles(path, query, { filesQuery, blacklist, notFoundThreshold })
if (result.length > 0) {
	console.table(result, ['name', 'lastModified'])
	writeFile(process.cwd() + '\\report.xlsx', result).then(_ => console.log('saved')).catch(err => console.error(err))
}
