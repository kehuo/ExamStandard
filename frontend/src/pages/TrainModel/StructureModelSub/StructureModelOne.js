import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Tooltip, message, Button, Tabs, Popconfirm, Card } from 'antd';
import * as TaskUtils from '../common/TaskTrainUtils';
import LogPanel from '../common/LogPanel';

import styles from '../TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

function mockData() {
	let rst = [
		{id:1, name:'dept1', description: '2016-07 呼吸科'},
		{id:2, name:'dept2', description: '2017-07 呼吸科'},
		{id:3, name:'dept3', description: '2018-07 呼吸科'},
	];
	return rst;
}

export default class StructureModelOne extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			id: null,
			lastLogTs: '',
			taskLogs: [],
		};

	}

	directSetId(id) {
		this.setState({
			id: id,
		});
	}

	onOpClick(opCode) {
		const { dispatch } = this.props;
		const { taskId } = this.state;
		if (['run','stop'].indexOf(opCode) != -1) {
			// dispatch({
			// 	type: 'trainTaskOne/run',
			// 	payload: {
			// 		taskId: taskId,
			// 		op: opCode,
			// 	},
			// });
			return;
		}

		if (opCode == 'delete') {
			// dispatch({
			// 	type: 'trainTaskOne/delete',
			// 	payload: {
			// 		taskId: taskId,
			// 	},
			// 	callback: this.backToTaskList.bind(this)
			// });
			return;
		}

		message.error('不支持的操作!');
		return;
	}

	buildOpButton(item, idx, dataList) {
		let TaskBtnOpName = TaskUtils.TaskBtnOpName;
		if (idx>0) {
			return (
				<Button onClick={this.onOpClick.bind(this, item)} style={{marginLeft:6}}>
					{TaskBtnOpName[item]}
				</Button>
			);
		}
		return (
			<Button onClick={this.onOpClick.bind(this, item)} type="primary">
				{TaskBtnOpName[item]}
			</Button>
		);
	}
	
	buildBasic() {
		const { id } = this.state;
		let opBtns = TaskUtils.getOpsFollowStatus('FINISHED');
		return (
			<div>
				<Card size="small" title="基本信息">
					<Row>名称: name 状态: status</Row>
					<Row>描述: description</Row>
					<Row style={{textAlign:'center'}}>
						{opBtns.map(this.buildOpButton.bind(this))}
					</Row>
				</Card>
			</div>
		);
	}

	fetchTaskStatus() {
		const { dispatch } = this.props;
		const { taskId, lastLogTs } = this.state;
		// dispatch({
		// 	type: 'trainTaskOne/fetch',
		// 	payload: {
		// 		taskId: taskId,
		// 		ts: lastLogTs,
		// 	},
		// 	callback: this.updateTaskLogs.bind(this)
		// });
	}

	updateTaskLogs(newList) {
		if (newList) {
			let taskLogs = this.state.taskLogs;
			let newTs = this.state.lastLogTs;
			newTs = TaskUtils.updateLogs(newList, taskLogs,newTs);
			this.setState({
				taskLogs: taskLogs,
				lastLogTs: newTs
			});
		}
		setTimeout(this.fetchTaskStatus.bind(this), 20*1000);
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
			<div>
				{this.buildBasic()}
				{this.buildLogPanel()}
			</div>
		)
	}
}
