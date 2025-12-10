const path = require('path')
const { Command, Option } = require('commander')
const { serialize } = require('xlsx-fuzzyparser')
const { findFiles, Errors } = require('../src/reports.js')
const { 'reports-find': presetOptions } = require('../options.json')

const program = new Command()
program.description('Search a folder that matches the query in the specified path and return files inside the folder.')

program.argument('<query>', 'search query')

program.option('-sp, --search-path <searchPath>', 'The path to search the folders in.')
program.option('-fq, --files-query <filesQuery>', 'The query to find files inside the folder.')
program.option('-r, --report <report>', 'The filepath of the output file report.')
program.addOption(
	new Option('-b, --blacklist <blacklist>', 'List of folders to exclude from the search of files.').argParser(function (value) {
		return value.split(' ')
	})
)
program.addOption(
	new Option('-td, --threshold-directories <thresholdDirectories>', 'Threshold for directories search engine.').argParser(function (value) {
		const number = Number(value)
		presetOptions.directoriesEngine.threshold = number
		return number
	})
)
program.addOption(
	new Option('-tf, --threshold-files <thresholdFiles>', 'Threshold for files search engine.').argParser(function (value) {
		const number = Number(value)
		presetOptions.filesEngine.threshold = number
		return number
	})
)

program.parse()
const query = program.args[0]
const options = program.opts()

// TODO : remove in production
if(options['report'] === undefined) {
    options.report = path.join(process.cwd(), '../data/report.xlsx')
}

for (const optionKey in presetOptions) {
	if (!Object.hasOwn(presetOptions, optionKey)) continue
    if (options[optionKey] !== undefined) continue
	const optionValue = presetOptions[optionKey]
	program.setOptionValue(optionKey, optionValue)
}

console.log(options)
const { searchPath, filesQuery, blacklist, directoriesEngine, filesEngine } = options

async function main() {
	try {
		console.log('[findFiles]')
		const { files } = findFiles(searchPath, query, { filesQuery, blacklist, directoriesEngine, filesEngine })
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
