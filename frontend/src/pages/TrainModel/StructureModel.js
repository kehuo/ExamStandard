import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Tabs } from 'antd';
import StructureModelList from './StructureModelSub/StructureModelList';
import StructureModelOne from './StructureModelSub/StructureModelOne';

import styles from './TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ taggingTask }) => ({
	taggingTask
}))
export default class StructureModel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeKey: 'ModelList',    // 'BodySystem',
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

	setModelOneId(id) {
		this.refs['ModelOne'].directSetId(id);
	}

	onSwitchTab(params) {
		const { dispatch } = this.props;
		if (params.tab) {
			let callback = null;
			if (params.tab == 'ModelOne') {
				callback = this.setModelOneId.bind(this, params.id);
			}
			this.setState({
				activeKey: params.tab,
			}, callback);
		}
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
					<Tabs.TabPane tab="模型列表" key="ModelList">
						<StructureModelList ref="ModelList"
							onQuery = {this.onQuery.bind(this)}
							onSwitchTab = {this.onSwitchTab.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="模型训练" key="ModelOne">
						<StructureModelOne ref="ModelOne"
							onQuery = {this.onQuery.bind(this)}
							onSwitchTab = {this.onSwitchTab.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="效果评估" key="Performance">

					</Tabs.TabPane>
				</Tabs>
			</div>
		);
	}
}
