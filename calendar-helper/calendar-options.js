class CalendarOptions {
	constructor(options) {
		this.options = options;
	}

	getStartWeekDay() {
		return this.getPropOrDefault("startWeekDay", 0);
	}

	getWeekDayNames() {
		return this.getPropOrDefault("weekDayNames", ["S", "M", "T", "W", "T", "F", "S"]);
	}

	getMonthNames() {
		return this.getPropOrDefault("monthNames", [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun",
			"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
		]);
	}

	getMinDate() {
		return this.getPropOrDefault("minDate", null);
	}

	setMinDate(date) {
		let options = this.getOptions();
		options.minDate = date;
	}

	getMaxDate() {
		return this.getPropOrDefault("maxDate", null);
	}

	setMaxDate(date) {
		let options = this.getOptions();
		options.maxDate = date;
	}

	getOptions() {
		if (!this.options) this.options = {};
		return this.options;
	}

	getPropOrDefault(propName, defaultValue) {
		let options = this.getOptions();
		return options.hasOwnProperty(propName) ? options[propName] : defaultValue;
	}
}

module.exports = CalendarOptions;