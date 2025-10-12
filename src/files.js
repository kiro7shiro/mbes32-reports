const fs = require('fs')
const path = require('path')
const ExcelJS = require('exceljs')

// TODO : make a proper npm install for configs
const { validateConfig, validateMultiConfig } = require('../../xlsx-fuzzyparser/src/config.js')

class FileNotExists extends Error {
    constructor(filepath) {
        super(`File: ${filepath} doesn't exists.`)
        this.filepath = filepath
    }
}

// TODO : implement a GLOBAL cache that can hold multiple workbooks
const cache = {
    workbook: null,
    workbookName: null
}

/**
 * Returns an ExcelJS.Workbook object for the given filepath.
 * @param {string} filepath - Path to the Excel file to load.
 * @returns {Promise<ExcelJS.Workbook>} - Promise that resolves to the workbook.
 */
async function getFile(filepath, { create = true } = {}) {
    if (cache.workbook === null || cache.workbookName !== filepath) {
        const fileExists = fs.existsSync(filepath)
        if (fileExists === false && create === false) throw new FileNotExists(filepath)
        if (cache.workbook === null) cache.workbook = new ExcelJS.Workbook()
        if (fileExists === true) {
            await cache.workbook.xlsx.readFile(filepath)
        }
        cache.workbookName = filepath
    }
    return cache.workbook
}

/**
 * Writes an Excel file to the specified path with the given data.
 * @param {string} filepath - Path to the file to write.
 * @param {Object[]} data - Array of objects to write into the file.
 * @param {Object} fileConfig - Configuration object.
 * @param {Object} [options] - Options
 * @returns {Promise<void>} - Promise that resolves when the file has been written.
 */
async function writeFile(
    filepath,
    data,
    fileConfig = {
        type: 'list',
        worksheet: 'report',
        row: 1,
        columns: [
            { index: 1, key: 'filepath' },
            { index: 2, key: 'filename' },
            { index: 3, key: 'lastModified' }
        ]
    },
    { mode = 'overwrite' } = {}
) {
    // read the file
    const workbook = await getFile(filepath)
    // validate config and use results as flags
    const isConfig = validateConfig(fileConfig)
    const isMultiConfig = validateMultiConfig(fileConfig)
    if (!isConfig && !isMultiConfig) {
        // TODO : throw error
    }
    if (isMultiConfig) {
        // write a multi config into a file
        for (const key of fileConfig) {
            const subConfig = fileConfig[key]
            await writeFile(filepath, data, subConfig)
        }
    } else {
        // add or select sheet
        let worksheet = null
        if (workbook.worksheets.length >= 2) {
            for (let sCnt = 0; sCnt < workbook.worksheets.length; sCnt++) {
                const sheet = workbook.worksheets[sCnt]
                if (sheet.name === fileConfig.worksheet) {
                    worksheet = sheet
                    break
                }
            }
        }
        if (worksheet === null) {
            worksheet = workbook.addWorksheet(fileConfig.worksheet)
        }
        // write object or list
        if (fileConfig.type === 'object') {
            // TODO : write object data
        } else {
            if (mode === 'overwrite') {
                // write list header
                // TODO : check config for descriptor headers
                const headerRow = worksheet.getRow(fileConfig.row)
                headerRow.values = Object.keys(data[0])
                for (let dIndex = 0; dIndex < data.length; dIndex++) {
                    const row = worksheet.getRow(fileConfig.row + dIndex + 1)
                    row.values = Object.values(data[dIndex])
                }
            } else {
                // append list data
                // TODO : check endRow
                for (let dIndex = 0; dIndex < data.length; dIndex++) {
                    worksheet.addRow(Object.values(data[dIndex]))
                }
            }
        }
        // TODO : save file
        await workbook.xlsx.writeFile(filepath)
    }
}

/**
 * Reads an Excel file and returns its content as an array of objects.
 * @param {string} filepath - Path to the Excel file to read.
 * @param {Object} [fileConfig] - Configuration options.
 * @returns {Promise<Object[]>} - Promise that resolves to the array of objects.
 */
async function readFile(filepath, fileConfig = null) {
    try {
        // open file
        const workbook = await getFile(filepath)
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
 * @returns {Object[]} - list of files with properties `path`, `name`, and `lastModified`
 */
function listFiles(folder, { blacklist = [] } = {}) {
    const result = []
    const files = fs.readdirSync(folder)
    for (let fIndex = 0; fIndex < files.length; fIndex++) {
        const file = files[fIndex]
        if (blacklist.includes(file)) continue
        const filepath = path.join(folder, file)
        const stats = fs.statSync(filepath)
        if (stats.isDirectory()) {
            result.push(...listFiles(filepath, { blacklist }))
        } else {
            result.push({
                filepath: filepath.replace(file, ''),
                filename: file,
                lastModified: stats.mtime
            })
        }
    }
    return result
}

module.exports = {
    getFile,
    listFiles,
    readFile,
    writeFile
}
