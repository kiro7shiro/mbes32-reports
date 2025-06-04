const fs = require('fs')
const path = require('path')
const xlsx = require('xlsx')

function readFile(path, { config } = {}) {
	const workbook = xlsx.readFile(path)
	const sheetName = workbook.SheetNames[0]
	const sheet = workbook.Sheets[sheetName]
	const data = xlsx.utils.sheet_to_json(sheet)
	return data
}

function writeFile(path, data, { config } = {}) {
	const sheet = xlsx.utils.json_to_sheet(data)
	//const sheet2 = xlsx.utils.aoa_to_sheet(data)
	const workbook = xlsx.utils.book_new()
	xlsx.utils.book_append_sheet(workbook, sheet, 'report')
	xlsx.writeFile(workbook, path, { header: 1, compression: true, bookType: 'xlsx' })
}

function test() {
	const filepath = path.resolve('../data/Alle Veranstaltungen.xlsx')
	console.log(filepath)
	const data = readFile(filepath)
	console.table(data.slice(0, 3), ['MATCHCODE'])
}

//test()

function test2() {
	const filepath = path.resolve('../data/Test.xlsx')
	const data = [
		{ propA: 'val1', propB: 'val2' },
		{ propA: 'val3', propB: 'val4' }
	]
	const data2 = [
		['val1', 'val2'],
		['val3', 'val4']
	]
	console.log(filepath, data)
	writeFile(path, data)
}

test2()

module.exports = { readFile }
