module.exports = {
    directories: {
        sheetName: 'directories',
        type: 'list',
        row: 1,
        columns: [
            { index: 1, key: 'directory' }
        ]
    },
    files: {
        sheetName: 'files',
        type: 'list',
        row: 1,
        columns: [
            { index: 1, key: 'filepath' },
            { index: 2, key: 'filename' },
            { index: 3, key: 'lastModified' },
            { index: 4, key: 'type' },
            { index: 5, key: 'contractor' }
        ]
    }
}