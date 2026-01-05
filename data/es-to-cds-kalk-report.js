module.exports = {
    Hallen: {
        sheetName: 'Hallen',
        type: 'list',
        row: 1,
        columns: [
            {
                index: 1,
                key: 'Halle'
            },
            {
                index: 2,
                key: 'VR Aufbau',
                formatter: function (data) {
                    if (data['LE VR Aufbau'].type !== 'standard') return 0
                    const area = Number(data['Fläche'])
                    return Number(data['VR Aufbau']) * area
                }
            },
            {
                index: 3,
                key: 'VR Aufbau Kongress',
                formatter: function (data) {
                    if (data['LE VR Aufbau'].type !== 'kongress') return 0
                    const area = Number(data['Fläche'])
                    return Number(data['VR Aufbau']) * area
                }
            },
            {
                index: 4,
                key: 'finale Vor-reinig.',
                formatter: function (data) {
                    if (data['LE Vorrein.'].type !== 'standard') return 0
                    const area = Number(data['Fläche'])
                    return Number(data['finale Vor-reinig.']) * area
                }
            },
            {
                index: 5,
                key: 'finale Vor-reinig. Kongress',
                formatter: function (data) {
                    if (data['LE Vorrein.'].type !== 'kongress') return 0
                    const area = Number(data['Fläche'])
                    return Number(data['finale Vor-reinig.']) * area
                }
            },
            {
                index: 5,
                key: '40% lfd. VR Nacht',
                formatter: function (data) {
                    if (data['LE lfd. Nacht'].type !== 'standard') return 0
                    const area = Number(data['Fläche'])
                    return Number(data['40% lfd. VR Nacht']) * area
                }
            },
            {
                index: 6,
                key: '40% lfd. VR Nacht Kongress',
                formatter: function (data) {
                    if (data['LE lfd. Nacht'].type !== 'kongress') return 0
                    const area = Number(data['Fläche'])
                    return Number(data['40% lfd. VR Nacht']) * area
                }
            },
            {
                index: 7,
                key: '100% lfd. VR Nacht',
                formatter: function (data) {
                    if (data['LE lfd. Nacht'].type !== 'standard') return 0
                    const area = Number(data['Fläche'])
                    return Number(data['100% lfd. VR Nacht']) * area
                }
            },
            {
                index: 8,
                key: '100% lfd. VR Nacht Kongress',
                formatter: function (data) {
                    if (data['LE lfd. Nacht'].type !== 'kongress') return 0
                    const area = Number(data['Fläche'])
                    return Number(data['100% lfd. VR Nacht']) * area
                }
            },
            {
                index: 9,
                key: '40% lfd. Tag',
                formatter: function (data) {
                    if (data['LE lfd. Tag'].type !== 'standard') return 0
                    const area = Number(data['Fläche'])
                    return Number(data['40% lfd. Tag']) * area
                }
            },
            {
                index: 10,
                key: '40% lfd. Tag Kongress',
                formatter: function (data) {
                    if (data['LE lfd. Tag'].type !== 'kongress') return 0
                    const area = Number(data['Fläche'])
                    return Number(data['40% lfd. Tag']) * area
                }
            },
            {
                index: 11,
                key: '100% lfd. Tag',
                formatter: function (data) {
                    if (data['LE lfd. Tag'].type !== 'standard') return 0
                    const area = Number(data['Fläche'])
                    return Number(data['100% lfd. Tag']) * area
                }
            },
            {
                index: 12,
                key: '100% lfd. Tag Kongress',
                formatter: function (data) {
                    if (data['LE lfd. Tag'].type !== 'kongress') return 0
                    const area = Number(data['Fläche'])
                    return Number(data['100% lfd. Tag']) * area
                }
            },
            {
                index: 13,
                key: 'Nachreinigung',
                formatter: function (data) {
                    if (data['LE Nachreinigung'].type !== 'standard') return 0
                    const area = Number(data['Fläche'])
                    return Number(data['Nachreinigung']) * area
                }
            },
            {
                index: 14,
                key: 'Nachreinigung Kongress',
                formatter: function (data) {
                    if (data['LE Nachreinigung'].type !== 'kongress') return 0
                    const area = Number(data['Fläche'])
                    return Number(data['Nachreinigung']) * area
                }
            }
        ]
    },
    Verkehr: {
        sheetName: 'Verkehr',
        type: 'list',
        row: 1,
        columns: [
            {
                index: 1,
                key: 'Halle'
            },
            {
                index: 2,
                key: 'Details/Ortsangabe'
            },
            {
                index: 3,
                key: 'Ebene'
            },
            {
                index: 4,
                key: 'VR Aufbau',
                formatter: function (data) {
                    const area = Number(data['Fläche'])
                    return Number(data['VR Aufbau']) * area
                }
            },
            {
                index: 5,
                key: 'finale Vor-reinig.',
                formatter: function (data) {
                    const area = Number(data['Fläche'])
                    return Number(data['finale Vor-reinig.']) * area
                }
            },
            {
                index: 6,
                key: 'lfd. VR Nacht',
                formatter: function (data) {
                    const area = Number(data['Fläche'])
                    return Number(data['lfd. VR Nacht']) * area
                }
            },
            {
                index: 7,
                key: 'lfd. Tag',
                formatter: function (data) {
                    const area = Number(data['Fläche'])
                    return Number(data['lfd. Tag']) * area
                }
            },
            {
                index: 8,
                key: 'Nachreinigung',
                formatter: function (data) {
                    const area = Number(data['Fläche'])
                    return Number(data['Nachreinigung']) * area
                }
            }
        ]
    },
    DiverseZusatzarbeiten: {
        sheetName: 'diverse Zusatzarbeiten',
        type: 'list',
        row: 1,
        columns: [
            { index: 1, key: 'Datum' },
            { index: 2, key: 'Leistung' },
            { index: 3, key: 'Anzahl MA' },
            { index: 3, key: 'Zeitraum' },
            { index: 3, key: 'Stunden' },
            { index: 3, key: 'Std.-Satz' },
            { index: 3, key: 'Entgelt' }
        ]
    }
}