const path = require('path')
const { Command } = require('commander')
const program = new Command()
const { findFiles, ERRORS } = require('../src/reports.js')
const { writeFile } = require('../src/files.js')
const { 'reports-find': savedOptions } = require('../options.json')

program.description('Search a folder that matches the query in the specified path and return files inside the folder.')

program.argument('<query>', 'search query')

// TODO : rename path into directory
program.option('-d, --directory <directory>', 'The directory to search the folders in.')
program.option('-fq, --files-query <filesQuery>', 'The query to find files inside the folder.')
program.option('-b, --blacklist <blacklist>', 'List of folders to exclude from the search of files.')
program.option('-n, --not-found-threshold <threshold>', 'Threshold for searching, if an item scores above the threshold it is considered not found.')

program.parse(process.argv)
const query = program.args[0]

const options = Object.assign({ directory: process.cwd(), filesQuery: '', blacklist: '', notFoundThreshold: 0.001 }, savedOptions, program.opts())
const { directory, filesQuery, notFoundThreshold } = options
const blacklist = options.blacklist.split(' ')

try {
	console.log('findFiles')
	const { files } = findFiles(directory, query, { filesQuery, blacklist, notFoundThreshold })
	console.table(files)
	writeFile(path.join(process.cwd(), '../report.xlsx'), files)
		.then((_) => console.log('saved'))
		.catch((err) => console.error(err))
} catch (error) {
	if (
		error instanceof ERRORS.FolderEmpty ||
		error instanceof ERRORS.NoFilesFound ||
		error instanceof ERRORS.NoFolderFound ||
		error instanceof ERRORS.PathEmpty
	) {
		console.log(error.message)
	} else {
		console.error(error)
	}
}
