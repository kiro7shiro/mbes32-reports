const ExcelJs = require('exceljs')

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

async function readFile(path, { config = {} } = {}) {
    const workbook = new ExcelJs.Workbook()
    await workbook.xlsx.readFile(path)
    const worksheet = workbook.worksheets[0]
    const rows = worksheet.getRows(1, worksheet.lastRow.number)
    return rows
}

module.exports = {
    readFile,
	writeFile
}
