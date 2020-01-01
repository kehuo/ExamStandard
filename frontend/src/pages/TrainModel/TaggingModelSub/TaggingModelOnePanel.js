import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Popconfirm, message, Button, Tabs, Card,
	Tooltip, Collapse } from 'antd';
import TaggingModelConfig from './TaggingModelConfig';
import ElementComponent from '../../Template/ElementComponent';
import LogPanel from '../common/LogPanel';
import * as TaskUtils from '../common/TaskTrainUtils';

import styles from '../TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

export default class TaggingModelOnePanel extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {
			id: 0,
			type: 'tagging',
			tag: '',
			status: 'NONE',
			statusCN: TaskUtils.StatusMap['NONE'],
			description: '',
			created_at: '',
			updated_at: '',

			lastLogTs: '',
			taskLogs: [],
		};
	}

	directSetId(forceLogs, id) {
		let curState = this.state;
		curState.id = id;
		if (forceLogs) {
			curState.lastLogTs = '';
			curState.taskLogs = [];
		}
		this.setState(curState, this.fetchTaskOne.bind(this, forceLogs));
	}

	fetchTaskOne(forceLogs) {
		const { id } = this.state;
		if (!id) {
			return;
		}
		if (!this.props.onQuery) {
			return;
		}
		let params = {
			payload: id,
			callback: this.updateTaskAll.bind(this, forceLogs)
		};
		this.props.onQuery('get-task-one', params);
	}

	updateTaskAll(forceLogs, data) {
		let splitCfg = {};
		if (data.config) {
			splitCfg = JSON.parse(data.config);
		}
		let callback = null;
		if (forceLogs) {
			callback = this.getTaskLogs.bind(this);
		}

		this.setState({
			type: 'tagging',
			tag: data.tag,
			status: data.status,
			release: data.release,
			statusCN: TaskUtils.StatusMap[data.status],
			description: data.description,
			created_at: data.created_at,
			updated_at: data.updated_at,
			config: splitCfg,
		}, callback);
	}

	updateTaskLogs(data) {
		let curState = this.state;
		let taskLogs = curState.taskLogs;
		let newTs = curState.lastLogTs;
		if (data.logs) {
			newTs = TaskUtils.updateLogs(data.logs, taskLogs, newTs);
			curState.taskLogs = taskLogs;
			curState.lastLogTs = newTs;
		}
		curState.status = data.status;
		curState.statusCN = TaskUtils.StatusMap[data.status];
		curState.updated_at = data.updated_at;
		if (['NONE','STOP','FAILED','FINISHED'].indexOf(curState.status)) {
			// seems no more log can be get, then clear ts
			curState.lastLogTs = '';
		}
		this.setState(curState);

		if (['RUNNING','PREPARE'].indexOf(data.status) != -1) {
			setTimeout(this.getTaskLogs.bind(this), 20 * 1000);
		}
	}

	getTaskLogs() {
		const { id, lastLogTs } = this.state;
		if (!this.props.onQuery) {
			return;
		}
		let pxs = {
			type: 'tagging',
		};
		if (lastLogTs) {
			pxs.start = lastLogTs;
		}
		let params = {
			payload: {
				id: id,
				params: pxs,
			},
			callback: this.updateTaskLogs.bind(this),
		};
		this.props.onQuery('log-task-one', params);
	}

	onQueryConfig(opCode, params) {
		if (!this.props.onQuery) {
			return;
		}
		this.props.onQuery(opCode, params);
	}

	buildConfig() {
		const { config, release } = this.state;
		return (
			<TaggingModelConfig ref="config"
				item={config}
				onQuery={this.onQueryConfig.bind(this)}
				disabled={release==1}
			/>
		);
	}

	collect() {
		const  { id, tag, description, status, release } = this.state;
		let cfg = this.refs['config'].collect();
		if (!cfg) {
			return null;
		}

		let x = {
			id: id,
			type: 'tagging',
			tag: tag,
			status: status,
			description: description,
			config: JSON.stringify(cfg),
			release: release,
		};
		return x;
	}

	onOp(opCode) {
		const { id } = this.state;
		if (!this.props.onQuery) {
			return;
		}

		switch(opCode) {
		case 'save':
			{
				let callback = null;
				if (!id) {
					callback = this.directSetId.bind(this, false);
				}
				let params = {
					payload: this.collect(),
					callback: callback,
				};
				this.props.onQuery('edit-task-one', params);
			}
			break;
		case 'delete':
			{
				let params = {
					payload: this.collect(),
					callback: this.switchBack2List.bind(this)
				};
				this.props.onQuery('delete-task-one', params);
			}
			break;
		case 'release':
			{
				let callback = this.directSetId.bind(this, false);
				let x = this.collect();
				if (!x || x.status != 'FINISHED') {
					message.error('项目处于非法状态,不能发布');
					return;
				}
				x.release = 1;
				let params = {
					payload: x,
					callback: callback,
				};
				this.props.onQuery('edit-task-one', params);
			}
			break;
		default:
			break;
		}
	}

	switchBack2List() {
		if (!this.props.onSwitchTab) {
			return;
		}
		let params = {
			tab: 'ModelList',
		};
		this.props.onSwitchTab(params);
	}

	buildBasic() {
		const { id, status, release } = this.state;
		let lines = [
			{
				split: 12,
				items: [{
					layout: {title: 8, element: 14}, elementType: 'label',
					title: '标记', tag: 'tag', disabled: true
				}, {
					layout: {title: 8, element: 14}, elementType: 'label',
					title: '状态', tag: 'statusCN', disabled: true
				},],
			}, {
				split: 12,
				items: [ {
					layout: {title:8, element:14}, elementType:'label',
					title:'创建时间', tag:'created_at', disabled: true
				},{
					layout: {title:8, element:14}, elementType:'label',
					title:'更新时间', tag:'updated_at', disabled: true
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 4, element: 18}, elementType: 'textArea',
					title: '描述', tag: 'description', disabled: (release == 1)
				}]
			},
		];
		let editOp = (
			<Button onClick={this.onOp.bind(this, 'save')} type="primary">保存</Button>
		);
		let deleteOp = (
			<Popconfirm onConfirm={this.onOp.bind(this, 'delete')} onCancel={null}>
				<Button type="primary" style={{marginLeft:6}}>删除</Button>
			</Popconfirm>
		);
		let releaseOp = null;
		if (!id) {
			editOp = (
				<Button onClick={this.onOp.bind(this, 'save')} type="primary">新建</Button>
			);
			deleteOp = null;
		} else {
			if (release) {
				editOp = null;
			} else if (['FINISHED'].indexOf(status) != -1) {
				releaseOp = (
					<Button onClick={this.onOp.bind(this, 'release')} type="primary"
					        style={{marginLeft:6}}>发布</Button>
				);
			}
		}
		return (
			<Card size="small" title="基本信息">
				{lines.map(this.renderLine.bind(this))}
				{this.buildConfig()}
				<Row style={{textAlign:'center', marginTop:6}}>
					{editOp}
					{deleteOp}
					{releaseOp}
				</Row>
			</Card>
		);
	}

	onOpTaskClick(opCode) {
		const { id } = this.state;
		if (!this.props.onQuery) {
			return;
		}
		let callback = null;
		switch(opCode) {
			case 'run':
				callback = this.fetchTaskOne.bind(this, true);
				break;
			case 'stop':
				callback = this.fetchTaskOne.bind(this, true);
				break;
			default:
				break;
		}
		let params = {
			payload: {
				id: id,
				op: opCode,
			},
			callback: callback,
		};
		this.props.onQuery('op-task-one', params);
	}

	buildTaskOpButton(item, idx, dataList) {
		if (idx>0) {
			return (
				<Button onClick={this.onOpTaskClick.bind(this, item)}
				        type="primary" style={{marginLeft:6}}>
					{TaskUtils.TaskBtnOpName[item]}
				</Button>
			);
		}
		return (
			<Button onClick={this.onOpTaskClick.bind(this, item)} type="primary" >
				{TaskUtils.TaskBtnOpName[item]}
			</Button>
		);
	}

	buildLogPanel() {
		const { id, status, taskLogs, release } = this.state;
		if (!id) {
			return (
				<div style={{textAlign:'center', marginTop: 6}}>模型尚未建立</div>
			);
		}
		if (release == 1) {
			return null;
		}

		let opBtns = TaskUtils.getOpsFollowStatus(status);
		return (
			<div>
				<Row style={{textAlign:'center', marginTop: 6}}>
					{opBtns.map(this.buildTaskOpButton.bind(this))}
				</Row>
				<LogPanel taskLogs={taskLogs} />
			</div>
		);
	}

	render() {
		return (
			<div>
				{this.buildBasic()}
				{this.buildLogPanel()}
			</div>
		);
	}
}