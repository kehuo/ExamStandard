function parseAge(age) {
	let ageFloat = parseFloat(age);
	if (isNaN(ageFloat)) {
		return age;
	}

	let ageStr = '';
	if(ageFloat>0) {
		let intAge = Math.floor(ageFloat);
		if (intAge > 0) {
			ageStr = ageStr + intAge + '岁';
		}
		let floatMonthAge = ageFloat - intAge;
		if (floatMonthAge > 0) {
			let intMonthAge = Math.floor(floatMonthAge * 12);
			if (intMonthAge > 0) {
				ageStr = ageStr + intAge + '月';
			}

			let floatDayAge = floatMonthAge - intMonthAge;
			if (floatDayAge > 0) {
				let intDayAge = max(1, Math.floor(floatDayAge * 30));
				if (intDayAge) {
					ageStr = ageStr + intDayAge + '天';
				}
			}
		}
	} else {
		ageStr = '0岁';
	}
	return ageStr;
}

function parseGender(gender) {
	let genderStr = '男';
	if (['F','女'].indexOf(gender) != -1) {
		genderStr = '女';
	}
	return genderStr;
}

export function makePatient(patientBasic) {
	let patientObj = JSON.parse(patientBasic);
	let patient = {
		age: '0岁',
		gender: '男',
	};
	if (patientObj) {
		patient.age = parseAge(patientObj.age);
		patient.gender = parseGender(patientObj.gender);
	}
	return patient;
}

export function makeGender() {

}

