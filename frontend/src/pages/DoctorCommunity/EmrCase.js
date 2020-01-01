import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Tabs } from 'antd';
import EmrCaseListPanel from './EMRCaseSub/EmrCaseListPanel';
import CaseOnePanel from './EMRCaseSub/CaseOnePanel';

import styles from './Community.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ emrCase }) => ({
	emrCase
}))
export default class EmrCase extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeKey: 'EmrCaseList',   // EmrCaseList
		};
	}

	onChangeTab(key) {
		this.setState({
			activeKey: key
		});
	}

	forceSwitchModel(id) {
		this.refs['EmrCaseDetail'].directSetId(true, id);
	}

	forceSwitch2List() {
		this.refs['EmrCaseList'].fetchListData();
	}

	onQuery(opCode, params) {
		const {dispatch} = this.props;
		switch (opCode) {
			case 'get-emrcase-list':
				dispatch({
					type: 'emrCase/fetchCaseList',
					payload: params.payload,
					callback: params.callback,
				});
				break;
			case 'get-emrcase-one':
				dispatch({
					type: 'emrCase/getCaseOne',
					payload: params.payload,
					callback: params.callback,
				});
				break;
			case 'edit-emrcase-one':
				dispatch({
					type: 'emrCase/editCaseOne',
					payload: params.payload,
					callback: params.callback,
				});
				break;
			case 'delete-emrcase-one':
				dispatch({
					type: 'emrCase/deleteCaseOne',
					payload: params.payload,
					callback: params.callback,
				});
				break;
			case 'get-master-list':
				dispatch({
					type: 'emrCase/fetchDiseaseList',
					payload: params.payload,
					callback: params.callback,
				});
				break;
			case 'get-guide-list':
				dispatch({
					type: 'emrCase/fetchGuideListAndFirst',
					payload: params.payload,
					callback: params.callback,
				});
				break;
			case 'get-guide-one':
				dispatch({
					type: 'emrCase/fetchGuideOne',
					payload: params.payload,
					callback: params.callback,
				});
				break;
			case 'get-disease-list':
				dispatch({
					type: 'emrCase/fetchDiseaseList',
					payload: params.payload,
					callback: params.callback,
				});
				break;
			default:
				break;
		}
	}

	onSwitchTab(params) {
		let callback = null;
		switch(params.tab) {
			case 'EmrCaseDetail':
				callback = this.forceSwitchModel.bind(this, params.id);
				break;
			case 'EmrCaseList':
				callback = this.forceSwitch2List.bind(this)
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
			<div style={{minWidth:1000, width:'100%'}}>
				<Tabs onChange={this.onChangeTab.bind(this)} type="card" activeKey={activeKey}>
					<Tabs.TabPane tab="病案列表" key="EmrCaseList">
						<EmrCaseListPanel ref="EmrCaseList"
                            onQuery = {this.onQuery.bind(this)}
                            onSwitchTab = {this.onSwitchTab.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="病案细节" key="EmrCaseDetail">
						<CaseOnePanel ref="EmrCaseDetail"
							onQuery = {this.onQuery.bind(this)}
							onSwitchTab = {this.onSwitchTab.bind(this)}
						/>
					</Tabs.TabPane>
				</Tabs>
			</div>
		);
	}
}