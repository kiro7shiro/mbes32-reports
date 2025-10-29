module.exports = {
    worksheet: 'TPK-Liste mit ESPK',
    type: 'list',
    row: 2,
    columns: [
        { index: 12, key: 'matchcode', header: 'MATCHCODE' },
        { index: 4, key: 'name', header: 'Name' },
        { index: 6, key: 'start', header: 'Beginn Mantelzeit', parser: (data) => new Date(data) },
        { index: 7, key: 'setup', header: 'Beginn externer Aufbau', parser: (data) => new Date(data) },
        { index: 8, key: 'eventStart', header: 'Veranstaltungsbeginn', parser: (data) => new Date(data) },
        { index: 9, key: 'eventEnd', header: 'Veranstaltungsende', parser: (data) => new Date(data) },
        { index: 10, key: 'dismantle', header: 'Ende externer Abbau', parser: (data) => new Date(data) },
        { index: 11, key: 'end', header: 'Ende Mantelzeit', parser: (data) => new Date(data) },
        {
            index: 5,
            key: 'halls',
            header: 'Hallen',
            parser: (data) => {
                if (typeof data !== 'string') data = ''
                return data.split(',').map((h) => h.trim())
            }
        },
        { index: 15, key: 'type', header: 'Veranstaltungstyp' },
        { index: 16, key: 'kind', header: 'Veranstaltungsart' }
    ]
}
