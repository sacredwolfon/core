const core = new function core() {
	this.setting = {'battery':{'use':true, 'charge':false, 'interval':60*1000, 'error':false}, 'tree':true};
	this.tree = {};
	this.battery = 100;
	this.battery_status = "full";
	function cookiebattery () {
		let cookie = document.cookie.split(";");
		for (let i = 0; i < cookie.length; i++) {
			cookie[i]=cookie[i].replace(" ", "");
			cookie[i]=cookie[i].split("=");
			if (cookie[i][0]=="battery") {
				return parseInt(cookie[i][1]);
			}
		}
		return false
	}
	function cookiestatus () {
		let cookie = document.cookie.split(";");
		for (let i = 0; i < cookie.length; i++) {
			cookie[i]=cookie[i].replace(" ", "");
			cookie[i]=cookie[i].split("=");
			if (cookie[i][0]=="battery_status") {
				return cookie[i][1];
			}
		}
	}
	if (document.cookie.indexOf('battery')!=-1&&localStorage.hasOwnProperty('battery')===true) {
		let batteryfromcookie = cookiebattery();
		let localbattery = parseInt(localStorage.getItem('battery'));
		if (batteryfromcookie == localbattery) {
			this.battery = localbattery;
		}
		else {
			console.warn('core: battery charge data changed');
			this.setting['battery']['error'] = true;
		}
	}
	if (document.cookie.indexOf('battery_status')!=-1&&localStorage.hasOwnProperty('battery_status')===true) {
		let statusfromcookie = cookiestatus();
		let localstatus = localStorage.getItem('battery_status');
		if (statusfromcookie == localstatus) {
			this.battery_status = localstatus;
		}
		else {
			console.warn('core: battery_status charge data changed');
			this.setting['battery']['error'] = true;
		}
	}
	function equality (_battery_charge, _battery_status) {
		if (_battery_charge > 70 && _battery_charge < 100) {
			return "many";
		}
		else if (_battery_charge > 50 && _battery_charge < 71) {
			return "enough";
		}
		else if (_battery_charge > 20 && _battery_charge < 51) {
			return "low";
		}
		else if (_battery_charge > 0 && _battery_charge < 21) {
			return "very_low";
		}
		else if (_battery_charge == 0) {
			return "dead";
		}
		else if (_battery_charge == 100) {
			return "full";
		}
	}
	function save (_battery_charge, _battery_status) {
		document.cookie = "battery="+String(_battery_charge);
		localStorage.setItem('battery', String(_battery_charge));
		document.cookie = "battery_status="+String(_battery_status);
		localStorage.setItem('battery_status', String(_battery_status));
	}
	save(this.battery, this.battery_status);
	function check (_battery_charge) {
		let battery1 = _battery_charge;
		let battery2 = cookiebattery();
		let battery3 = localStorage.getItem('battery');
		if (battery1 == battery2 && battery2 == battery3) {
			return true
		}
		return false
	}
	if (Number.isInteger(this.setting['battery']['interval'])===false) {
		this.setting['battery']['interval'] = 60*1000;
	}
	this.spend = setInterval(() => {
		if (this.setting['battery']['charge']===false) {
			if (this.battery>0 && check(this.battery)){
				this.battery--;
				this.battery_status = equality(this.battery, this.battery_status);
				save(this.battery, this.battery_status);
			}
			else if (!check(this.battery)) {
				console.warn('core: battery charge data changed');
				this.setting['battery']['error'] = true;
			}
		}
		else if (this.setting['battery']['charge']===true) {
			if (this.battery<100 && check(this.battery)) {
				this.battery++;
				this.battery_status = equality(this.battery, this.battery_status);
				save(this.battery, this.battery_status);
			}
			else if (!check(this.battery)) {
				console.warn('core: battery charge data changed');
				this.setting['battery']['error'] = true;
			}
		}
		else {
			console.warn('core: error with the battery, the battery is crashed');
			this.setting['battery']['error'] = true;
		}
	}, this.setting['battery']['interval']);
};