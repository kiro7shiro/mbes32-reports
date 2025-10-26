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

module.exports = { Matchcode }
