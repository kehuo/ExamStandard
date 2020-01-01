import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Tabs } from 'antd';
import EmrResource from './SurrealModelSub/EmrResource';
import FeatureDesignList from './SurrealModelSub/FeatureDesignList';
import TrainDataConfigList from './SurrealModelSub/TrainDataConfigList';

import styles from './TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ taggingTask }) => ({
	taggingTask
}))
export default class SurrealModel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeKey: 'EmrResource',    // 'BodySystem',
		};
	}

	componentDidMount() {
		let query = this.props.location.query;
		if (query.active) {
			this.onChangeTab(query.active);
		}
	}

	onChangeTab(key) {
		this.setState({
			activeKey: key
		});
	}

	onQuery(opCode, params) {
		const { dispatch } = this.props;
		switch(opCode) {
			case 'get-list':
				// dispatch({
				// 	type: 'masterData/fetch',
				// 	payload: params.payload,
				// 	callback: params.callback,
				// });
				break;
			default:
				break;
		}
	}

	onSwitchTab(params) {
		const { dispatch } = this.props;
		// let callback = this.changeTabWithAll.bind(this, params);
		// dispatch({
		// 	type: 'masterData/parentTree',
		// 	payload: params,
		// 	callback: callback,
		// });
	}

	render() {
		const { activeKey } = this.state;
		return (
			<div>
				<Tabs onChange={this.onChangeTab.bind(this)} type="card" activeKey={activeKey}>
					<Tabs.TabPane tab="病历数据" key="EmrResource">
						<EmrResource
							onQuery = {this.onQuery.bind(this)}
							onSwitchTab = {this.onSwitchTab.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="特征设计" key="FeatureDesign">
						<FeatureDesignList
							onQuery = {this.onQuery.bind(this)}
							onSwitchTab = {this.onSwitchTab.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="训练数据配置" key="TrainDataConfig">
						<TrainDataConfigList
							onQuery = {this.onQuery.bind(this)}
						    onSwitchTab = {this.onSwitchTab.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="训练数据管理" key="TrainData">

					</Tabs.TabPane>
					<Tabs.TabPane tab="模型训练" key="Model">

					</Tabs.TabPane>
					<Tabs.TabPane tab="效果评估" key="Performance">

					</Tabs.TabPane>
				</Tabs>
			</div>
		);
	}
}
