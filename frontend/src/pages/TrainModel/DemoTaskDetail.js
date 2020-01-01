import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Popconfirm, Card } from 'antd';
import LogPanel from './common/LogPanel';

import styles from './TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ trainTaskOne }) => ({
	trainTaskOne
}))
export default class DemoTaskDetail extends React.Component {
	constructor(props) {
		super(props);
		let query = this.props.location.query;
		this.state = {
			taskId: query.id,
			taskLogs: [],
			lastLogTs: '',
		};
	}

	componentDidMount() {
		this.fetchTaskStatus();
	}

	fetchTaskStatus() {
		const { dispatch } = this.props;
		const { taskId, lastLogTs } = this.state;
		dispatch({
			type: 'trainTaskOne/fetch',
			payload: {
				taskId: taskId,
				ts: lastLogTs,
			},
			callback: this.updateTaskLogs.bind(this)
		});
	}

	updateTaskLogs(newList) {
		if (newList) {
			let taskLogs = this.state.taskLogs;
			let newLogs = newList.split('\n');
			let newTs = this.state.lastLogTs;
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
			this.setState({
				taskLogs: taskLogs,
				lastLogTs: newTs
			});
		}
		setTimeout(this.fetchTaskStatus.bind(this), 20*1000);
	}

	backToTaskList() {
		let webPath = `/train-model/task-list`;
		this.props.dispatch(routerRedux.push(webPath));
	}

	onOpClick(opCode) {
		const { dispatch } = this.props;
		const { taskId } = this.state;
		if (['run','stop'].indexOf(opCode) != -1) {
			dispatch({
				type: 'trainTaskOne/run',
				payload: {
					taskId: taskId,
					op: opCode,
				},
			});
			return;
		}

		if (opCode == 'delete') {
			dispatch({
				type: 'trainTaskOne/delete',
				payload: {
					taskId: taskId,
				},
				callback: this.backToTaskList.bind(this)
			});
			return;
		}

		message.error('不支持的操作!');
		return;
	}

	buildOpButton(item, idx, dataList) {
		const TaskBtnOpName = {
			'run': '运行', 'stop': '停止', 'delete': '删除'
		};
		if (idx>0) {
			return (
				<Button onClick={this.onOpClick.bind(this, item)} style={{marginLeft:6}}>
					{TaskBtnOpName[item]}
				</Button>
			);
		}
		return (
			<Button onClick={this.onOpClick.bind(this, item)}>
				{TaskBtnOpName[item]}
			</Button>
		);
	}

	buildBasicInfo() {
		const { task } = this.props.trainTaskOne;
		const StatusMap = {
			'PENDING': '准备中',
			'STOP': '中断',
			'FINISHED': '结束',
			'RUNNING': '运行中',
			'NONE': '无任务'
		};
		let status = '未知';
		if (StatusMap[task.status]) {
			status = StatusMap[task.status];
		}

		let opBtns = [];
		switch(task.status) {
		case 'RUNNING':
			opBtns = ['stop'];
			break;
		case 'FINISHED':
		case 'STOP':
			opBtns = ['run', 'delete'];
			break;
		case 'PENDING':
		default:
			break;
		}

		return (
			<Card size="small" title="基本信息">
				<Row>名称: {task.name} 状态: {status}</Row>
				<Row>描述: {task.description}</Row>
				<Row style={{textAlign:'center'}}>
					{opBtns.map(this.buildOpButton.bind(this))}
				</Row>
			</Card>
		);
	}

	buildLogPanel() {
		const { taskLogs } = this.state;
		return (
			<LogPanel taskLogs={taskLogs}
			/>
		);
	}

	render() {
		return (
			<div style={{width:1000, margin:'auto', backgroundColor:'white', padding:20}}>
				{this.buildBasicInfo()}
				{this.buildLogPanel()}
			</div>
		);
	}
}
