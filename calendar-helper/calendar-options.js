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

	getMaxDate() {
		return this.getPropOrDefault("maxDate", null);
	}

	getPropOrDefault(propName, defaultValue) {
		if (this.options && this.options.hasOwnProperty(propName)) {
			return this.options[propName];
		}
		return defaultValue;
	}
}

module.exports = CalendarOptions;