class EventFile {
	static types = {
		planning: /KALK*/i,
		bill: /ABR/i,
		release: /FREI/i
	}
	static contractors = {
		ALBA: /ALBA/i,
		CWS: /CWS/i,
		NEWLINE: /NEWLINE|NL/i,
		SASSE: /SASSE/i,
		WISAG: /WISAG/i
	}
	constructor(file) {
		this.file = file
		this.type = null
		for (const [key, type] of Object.entries(EventFile.types)) {
			if (type.test(file.name)) {
				this.type = key
				break
			}
		}
		this.contractor = null
		for (const [key, contractor] of Object.entries(EventFile.contractors)) {
			if (contractor.test(file.name)) {
				this.contractor = key
				break
			}
		}
	}
}

module.exports = { EventFile }
