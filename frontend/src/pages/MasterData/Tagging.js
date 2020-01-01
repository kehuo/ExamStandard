import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Tabs } from 'antd';
import TaggingTaskListPanel from './TaggingSub/TaggingTaskListPanel';
import TaggingEditorPanel from './TaggingSub/TaggingEditorPanel';

import styles from './MasterData.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ taggingTask }) => ({
	taggingTask
}))
export default class Tagging extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeKey: 'TaskList',    // 'BodySystem',
		};
	}

	onChangeTab(key) {
		this.setState({
			activeKey: key
		});
	}

	onQuery(opCode, params) {
		const {dispatch} = this.props;
		switch (opCode) {
		case 'get-list':
			dispatch({
				type: 'taggingTask/fetch',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'get-one':
			dispatch({
				type: 'taggingTask/getOne',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'delete-one':
			dispatch({
				type: 'taggingTask/delete',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'edit-one':
			dispatch({
				type: 'taggingTask/edit',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		default:
			break;
		}
	}

	doTaggingTask(taskId) {
		this.refs['TaggingEditor'].directSetTaskId(taskId);
	}

	onSwitchTab(params) {
		let callback = null;
		if (params.tabKey == 'TaggingEditor') {
			callback = this.doTaggingTask.bind(this, params.id);
		}
		this.setState({
			activeKey: params.tabKey
		}, callback);
	}

	render() {
		const { activeKey } = this.state;
		return (
			<div>
				<Tabs onChange={this.onChangeTab.bind(this)} type="card" activeKey={activeKey}>
					<Tabs.TabPane tab="任务列表" key="TaskList">
						<TaggingTaskListPanel ref="TaskList"
						    onQuery = {this.onQuery.bind(this)}
						    onSwitchTab={this.onSwitchTab.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="标注任务" key="TaggingEditor">
						<TaggingEditorPanel ref="TaggingEditor"
		                    onQuery = {this.onQuery.bind(this)}
		                    onSwitchTab={this.onSwitchTab.bind(this)}
						/>
					</Tabs.TabPane>
				</Tabs>
			</div>
		);
	}
}
