const fs = require('fs')
const ExcelJs = require('exceljs')

/**
 * Writes an Excel file to the specified path from the given data.
 * @param {string} path - Path to the file to write.
 * @param {Object[]} data - Array of objects to write into the file.
 * @param {Object} [config={}] - Configuration object.
 * @returns {Promise<void>} - Promise that resolves when the file has been written.
 */
async function writeFile(path, data, { config = {} } = {}) {
	const workbook = new ExcelJs.Workbook()
	const worksheet = workbook.addWorksheet('Report')
	worksheet.addRow(Object.keys(data[0]))
	for (let dIndex = 0; dIndex < data.length; dIndex++) {
		const rowData = data[dIndex]
		worksheet.addRow(Object.values(rowData))
	}
	await workbook.xlsx.writeFile(path)
}

/**
 * Reads an Excel file and returns its content as an array of objects.
 * Each object represents a row in the file, with property names being
 * the column headers and property values being the values in the cells.
 * @param {string} path - Path to the Excel file to read.
 * @param {Object} [config] - Configuration options.
 * @returns {Promise<Object[]>} - Promise that resolves to the array of objects.
 */
async function readFile(path, { config = {} } = {}) {
	try {
		const workbook = new ExcelJs.Workbook()
		await workbook.xlsx.readFile(path)
		const worksheet = workbook.worksheets[0]
		const rows = worksheet.getRows(1, worksheet.lastRow.number)
		return rows
	} catch (error) {
		throw error
	}
}

/**
 * Recursively list all files in a folder and its subfolders
 * @param {String} folder - the folder to list
 * @param {Object} [options] - options
 * @param {String[]} [options.blacklist] - list of folders to exclude from the search
 * @returns {Object[]} - list of files with properties `filepath`, `filename`, and `lastModified`
 */
function listFiles(folder, { blacklist = [] } = {}) {
	const result = []
	const files = fs.readdirSync(folder)
	for (let fIndex = 0; fIndex < files.length; fIndex++) {
		const file = files[fIndex]
		if (blacklist.includes(file)) continue
		const path = `${folder}\\${file}`
		const stats = fs.statSync(path)
		if (stats.isDirectory()) {
			result.push(...listFiles(path, { blacklist }))
		} else {
			result.push({
				filepath: path,
				filename: file,
				lastModified: stats.mtime
			})
		}
	}
	return result
}

class Matchcode {
	static matcher = /([a-z]+\s*)(\d+\/*\d*)([a-z]*)/i
	constructor(raw) {
		const match = Matchcode.matcher.exec(raw)
		this.raw = raw
		this.base = match[1].trim()
		this.number = match[2]
		this.ext = match[3]
		if (this.number.length === 2) {
			this.year = new Date(`20${this.number}`).getFullYear()
		} else if (this.number.includes('/')) {
			const splitter = this.number.split('/')
			this.year = new Date(`20${splitter[0]}`).getFullYear()
		} else {
			this.year = new Date().getFullYear()
		}
		this.shortYear = Number(this.year.toString().slice(2))
	}
}

// standard for a query ?
// the matchcode - build from file
// the year - extracted from matchcode or given from options
// subfolders - array of query strings
// files - array of query strings
async function makeQueries(file, { matchcodeIndex = 1, subfolders = [], files = [] } = {}) {
	const rows = await readFile(file)
	const queries = rows.map(function (row) {
		const matchcode = new Matchcode(row.values[matchcodeIndex])
		let filesQuery = `'${matchcode.shortYear} '${matchcode.year}`
		for (let sCnt = 0; sCnt < subfolders.length; sCnt++) {
			const subfolder = subfolders[sCnt]
			filesQuery = filesQuery.concat(` '${subfolder}`)
		}
		for (let fCnt = 0; fCnt < files.length; fCnt++) {
			const file = files[fCnt]
			filesQuery = filesQuery.concat(` '${file}`)
		}
		return {
			matchcode,
			filesQuery
		}
	})
	return queries
}

module.exports = {
	listFiles,
	readFile,
	writeFile,
	makeQueries
}
