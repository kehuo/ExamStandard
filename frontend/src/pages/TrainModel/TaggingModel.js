import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Tabs } from 'antd';
import TaggingResourceListPanel from './TaggingModelSub/TaggingResourceListPanel';
import TaggingModelListPanel from './TaggingModelSub/TaggingModelListPanel';
import TaggingModelOnePanel from './TaggingModelSub/TaggingModelOnePanel';
import TaggingModelPerformancePanel from './TaggingModelSub/TaggingModelPerformancePanel';

import styles from './TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ trainTask }) => ({
	trainTask
}))
export default class TaggingModel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeKey: 'Performance',   // ModelList, TaggingResourceList
		};
	}

	onChangeTab(key) {
		this.setState({
			activeKey: key
		});
	}

	onQuery(opCode, params) {
		const { dispatch } = this.props;
		switch(opCode) {
		case 'get-data-list':
			dispatch({
				type: 'trainTask/fetchDataList',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'edit-data-one':
			dispatch({
				type: 'trainTask/editDataOne',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'delete-data-one':
			dispatch({
				type: 'trainTask/deleteDataOne',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'get-task-list':
			dispatch({
				type: 'trainTask/fetchTaskList',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'get-task-one':
			dispatch({
				type: 'trainTask/getTaskOne',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'edit-task-one':
			dispatch({
				type: 'trainTask/editTaskOne',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'delete-task-one':
			dispatch({
				type: 'trainTask/deleteTaskOne',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'op-task-one':
			dispatch({
				type: 'trainTask/doTaskOneOp',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'log-task-one':
			dispatch({
				type: 'trainTask/getTaskOneLog',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'get-task-performance':
			dispatch({
				type: 'trainTask/getTrainingTaskPerformance',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		default:
			break;
		}
	}

	forceSwitchModel(id) {
		this.refs['Model'].directSetId(true, id);
	}

	forceSwitchModelList() {
		this.refs['ModelList'].directFresh();
	}

	onSwitchTab(params) {
		let callback = null;
		switch(params.tab) {
		case 'Model':
			callback = this.forceSwitchModel.bind(this, params.id);
			break;
		case 'ModelList':
			callback = this.forceSwitchModelList.bind(this);
			break;
		default:
			break;
		}
		this.setState({
			activeKey: params.tab,
		}, callback);
	}

	render() {
		const { activeKey } = this.state;
		return (
			<div>
				<Tabs onChange={this.onChangeTab.bind(this)} type="card" activeKey={activeKey}>
					<Tabs.TabPane tab="标注数据" key="TaggingResourceList">
						<TaggingResourceListPanel ref="TaggingResourceList"
							onQuery = {this.onQuery.bind(this)}
							onSwitchTab = {this.onSwitchTab.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="模型列表" key="ModelList">
						<TaggingModelListPanel ref="ModelList"
							onQuery = {this.onQuery.bind(this)}
							onSwitchTab = {this.onSwitchTab.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="模型训练" key="Model">
						<TaggingModelOnePanel ref="Model"
							onQuery = {this.onQuery.bind(this)}
							onSwitchTab = {this.onSwitchTab.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="效果评估" key="Performance">
						<TaggingModelPerformancePanel ref="Performance"
						    onQuery = {this.onQuery.bind(this)}
                            onSwitchTab = {this.onSwitchTab.bind(this)}
						/>
					</Tabs.TabPane>
				</Tabs>
			</div>
		);
	}
}
