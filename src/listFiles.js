const fs = require('fs')
const path = require('path')
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

module.exports = { listFiles }
