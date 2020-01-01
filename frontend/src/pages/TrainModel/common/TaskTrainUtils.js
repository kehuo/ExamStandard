export const StatusMap = {
	'PENDING': '等待中',
	'STOP': '中断',
	'FINISHED': '结束',
	'PREPARE': '运行准备中',
	'RUNNING': '运行中',
	'FAILED': '运行失败',
	'NONE': '未运行',
};
// export const StatusInvMap = {
// 	'等待中': 'PENDING',
// 	'运行准备中': 'PREPARE',
// 	'中断': 'STOP',
// 	'结束': 'FINISHED',
// 	'运行中': 'RUNNING',
// 	'运行失败': 'FAILED',
// 	'未运行': 'NONE',
// };

export const TaskBtnOpName = {
	'run': '运行', 'stop': '停止', 'reset':'重置环境'
};

export function getOpsFollowStatus(status) {
	let opBtns = ['reset'];
	switch(status) {
		case 'RUNNING':
		case 'PREPARE':
		case 'PENDING':
			opBtns.push('stop');
			break;
		case 'FAILED':
		case 'FINISHED':
		case 'STOP':
		case 'NONE':
			opBtns.push('run');
			break;
		default:
			break;
	}
	return opBtns;
}

export function updateLogs(newList, taskLogs, lastLogTs) {
	let newLogs = newList.split('\n');
	let newTs = lastLogTs;
	let reg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])T(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d/;
	let regExp = new RegExp(reg);

	for (let i=0; i<newLogs.length; i++) {
		let x = newLogs[i];
		// 2019-02-26T04:41:08.639547501Z
		if(!regExp.test(x)) {
			// not valid log line
			continue;
		}
		let lineIns = x.split(' ');
		if (newTs >= lineIns[0]) {
			// assuming no line share same ts
			continue;
		}
		newTs = lineIns[0];
		let z = lineIns.slice(1);
		let y = {
			ts: lineIns[0],
			content: z.join(' ')
		};
		taskLogs.push(y);
	}
	return newTs;
}

export function shouldUpdateListNext(items) {
	let doNextUpdate = false;
	for (let i=0; i<items.length; i++) {
		let curI = items[i];
		if (['PENDING','PREPARE','RUNNING'].indexOf(curI.status) != -1) {
			doNextUpdate = true;
			break;
		}
	}
	return doNextUpdate;
}
