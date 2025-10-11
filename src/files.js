const fs = require('fs')
const ExcelJs = require('exceljs')
const { Matchcode } = require('./Matchcode.js')

/**
 * Writes an Excel file to the specified path from the given data.
 * @param {string} path - Path to the file to write.
 * @param {Object[]} data - Array of objects to write into the file.
 * @param {Object} [config={}] - Configuration object.
 * @returns {Promise<void>} - Promise that resolves when the file has been written.
 */
async function writeFile(path, data, { config = {} } = {}) {
    // TODO : set worksheet columns for writing lists
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
 * @param {string} path - Path to the Excel file to read.
 * @param {Object} [fileConfig] - Configuration options.
 * @returns {Promise<Object[]>} - Promise that resolves to the array of objects.
 */
async function readFile(path, fileConfig = null) {
    try {
        // open file
        const workbook = new ExcelJs.Workbook()
        await workbook.xlsx.readFile(path)
        // get the worksheet
        let worksheet = workbook.worksheets[0]
        if (fileConfig !== null && workbook.worksheets.length >= 2) {
            for (let sCnt = 0; sCnt < workbook.worksheets.length; sCnt++) {
                const sheet = workbook.worksheets[sCnt]
                if (sheet.name === fileConfig.worksheet) {
                    worksheet = sheet
                    break
                }
            }
        }
        // read data
        const startRow = fileConfig === null ? 1 : fileConfig.row
        // TODO : select endRow
        const rows = worksheet.getRows(startRow, worksheet.lastRow.number)
        if (fileConfig === null) return rows
        // parse objects
        let objs = null
        if (fileConfig.type === 'object') {
            const obj = {}
            for (let fCnt = 0; fCnt < fileConfig.fields.length; fCnt++) {
                const field = fileConfig.fields[fCnt]
                obj[field.key] = rows[field.row].values[field.column]
            }
            objs = [obj]
        } else {
            objs = rows.map(function (row) {
                const values = row.values
                const obj = {}
                for (let cCnt = 0; cCnt < fileConfig.columns.length; cCnt++) {
                    const column = fileConfig.columns[cCnt]
                    obj[column.key] = values[column.index]
                }
                return obj
            })
        }
        return objs
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

async function makeQueries(
    file,
    {
        filesQuery = '',
        queriesFileConfig = {
            worksheet: 'queries',
            type: 'list',
            row: 1,
            columns: [
                { index: 1, key: 'matchcode' },
                { index: 2, key: 'filesQuery' }
            ]
        }
    } = {}
) {
    const rows = await readFile(file, queriesFileConfig)
    const queries = rows.map(function (row) {
        return {
            matchcode: new Matchcode(row.matchcode),
            filesQuery: row.filesQuery || filesQuery
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
