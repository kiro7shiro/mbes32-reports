const { Command } = require('commander')
const program = new Command()
const { findManyFiles } = require('../src/reports.js')
const { writeFile } = require('../src/files.js')
const { 'reports-find-many': savedOptions } = require('../options.json')

program.description('Search folder that matches a query from the list and search files that matches the file query')
program.argument('queries', 'A string pointing to a excel file containing the queries')
program.option('-p, --path <path>', 'The path to search the folders in.')
program.option('-b, --blacklist <blacklist>', 'List of folders to exclude from the search of files.')
program.option('-n, --not-found-threshold <threshold>', 'Threshold for searching, if an item scores above the threshold it is considered not found.')

program.parse(process.argv)
const queries = program.args[0]

const options = Object.assign({ path: process.cwd(), blacklist: '', notFoundThreshold: 0.001 }, savedOptions, program.opts())
const { path, notFoundThreshold } = options
const blacklist = options.blacklist.split(' ')

async function main() {
	try {
		console.log('findMany')
		const { files, errors } = await findManyFiles(path, queries, { blacklist, notFoundThreshold })
		console.log(`files: ${files.length}`)
		//console.log(files[0])
		console.log(`errors: ${errors.length}`)
		//console.log(errors[0])
		await writeFile(process.cwd() + '\\report.xlsx', files)
		console.log('saved')
	} catch (error) {
		console.error(error)
	}
}

main()
