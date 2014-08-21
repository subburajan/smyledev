
DateFormatter = {

	WEEK: [
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	
	MONTH: [
		"January", "February", "March", "April", "May", "June", 
		"July", "August", "September", "October", "November", "December"
	],
	
	utcStrToDate: function(utc) {
		return new Date(Date.parse(utc));		
	},
	
	getDisplayText: function(str, type) {
		return this.toStr(this.utcStrToDate(str), type);
	},
	
	strToDate: function(str) {
		str = str.replace(/T/, ' ').replace(/\..\+/, '');
		str = str.split(" ");
		var date = str[0].split("-");
		var time = str[1].split(":");
		
		return new Date(date[0], date[1] - 1, date[2], time[0], time[1], time[2]);
	},
	
	toUTCStr: function(date) {
		return date.toUTCString();
	},
	
	toStr: function(d, type) {
		if(type == "time") {
			return this.dateToTimeStr(d);
		} else if(type == "date") {
			return this.dateToDateStr(d);
		}
		return this.dateToStr(d);
	},
	
	dateToStr: function(d, dateSep, timeSep) {
		return d && (this.dateToDateStr(d, dateSep) + " " + this.dateToTimeStr(d, timeSep)) || "";		
	},

	dateToDateStrD2: function(d, sep) {
		if(sep != "") {
			sep = sep || "/";	
		}
		return d && (d2((d.getMonth() + 1)) + sep + d2(d.getDate()) + sep + d2y(d.getFullYear())) || "";
	},	
	
	dateToDateStr: function(d, sep) {
		if(sep != "") {
			sep = sep || "/";	
		}
		return d && (d2((d.getMonth() + 1)) + sep + d2(d.getDate()) + sep + d.getFullYear()) || "";
	},

	dateToTimeStr: function(d, sep) {
		if(sep != "") {
			sep = sep || ":";	
		}
		return d && (d2(d.getHours()) + sep + d2(d.getMinutes()) + sep + d2(d.getSeconds())) || "";		
	},
	
	isSame: function(d1, d2) {
		return this.dateToStr(d1) == this.dateToStr(d2);
	},
		
	isSameDate: function(d1, d2) {
		if(!d1 || !d2) {
			return false;
		}
		//return this.dateToDateStr(d1) == this.dateToDateStr(d2);
		return (d1.getFullYear() == d2.getFullYear() &&
			d1.getMonth() == d2.getMonth() && 
			d1.getDate() == d2.getDate());
	},
	
	isSameTime: function(d1, d2) {
		return this.dateToTimeStr(d1) == this.dateToTimeStr(d2);
	},
	
	dateToDigits2: function(d, sep) {
		
	},

	floorWeekDates: function(d) {
		var date = d.getDate();
		var y = d.getFullYear(), m = d.getMonth();
		if(date < 8) {
			return new Date(y, m, 1);
		}
		if(date < 15) {
			return new Date(y, m, 8);
		}
		if(date < 22) {
			return new Date(y, m, 15);
		}
		if(date < 29) {
			return new Date(y, m, 22);
		}
		return new Date(y, m, 29);
	},
	
	differs: function(d1, d2) {
		var t = d2.getTime() - d1.getTime();
		function chk(d, unit) {
			var t1 = Math.round(t / d);
			if(t1 == 0) {
				if(d < 1000) {
					return t + " " + unit + (t > 1? "s": "");
				}
				return def;
			}
			t = t1;
		}
		return chk(1000, "now") || chk(60, "sec") || 
			chk(60, "min") || chk(60, "hr") || chk(24, "day") ||
			chk(7, "week") || chk(4, "mon") || chk(12, "year");		
	}	
};

if(typeof(module) != "undefined") {
	module.exports = DateFormatter;
}

function d2(num) {
	num += "";
	if(num.length == 2) {
		return num;
	}
	return "0" + num;
}

function d2y(num) {
	return (num + "").substring(2);
}


function weekEnd(date, f) {
	var day = date.getDay();
	if(day > 0) {
		var d = new Date(date.getTime());
		if(f) {
			day = f - day;
		}
		d.setDate(date.getDate() - day);
		date = d;
	}
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}
