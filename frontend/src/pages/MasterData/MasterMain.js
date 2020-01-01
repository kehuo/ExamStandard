import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Tabs } from 'antd';
import BodySystemPanel from './MasterSub/BodySystemPanel';
import BodyStructruePanel from './MasterSub/BodyStructruePanel';
import MedicinePanel from './MasterSub/MedicinePanel';
import DiseasePanel from './MasterSub/DiseasePanel';
import SymptomPanel from './MasterSub/SymptomPanel';
import TreatmentPanel from './MasterSub/TreatmentPanel';
import ExamPanel from './MasterSub/ExamPanel';
import ExtensionPanel from './MasterSub/ExtensionPanel';
import SearchPanel from './MasterSub/SearchPanel';
import CustomerVectorPanel from './MasterSub/CustomerVectorPanel';
import VectorRelationPanel from './MasterSub/VectorRelationPanel';

import styles from './MasterData.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ masterData }) => ({
	masterData
}))
export default class MasterMain extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeKey: 'BodySystem',    // 'BodySystem',
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
			dispatch({
				type: 'masterData/fetch',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'get-one':
			dispatch({
				type: 'masterData/getOne',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'edit-one':
			dispatch({
				type: 'masterData/edit',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'create-smart-one':
			dispatch({
				type: 'masterData/createSmartOne',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'delete-one':
			dispatch({
				type: 'masterData/delete',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'test-func':
			dispatch({
				type: 'masterData/testFunc',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'gen-func':
			dispatch({
				type: 'masterData/genFunc',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'get-one-complicate':
			dispatch({
				type: 'masterData/getOneComplicate',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'get-one-extension':
			dispatch({
				type: 'masterData/getOneExtension',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		default:
			break;
		}
	}

	onQuerySearch(params) {
		const { dispatch } = this.props;
		dispatch({
			type: 'masterData/search',
			payload: params.payload,
			callback: params.callback,
		});
	}

	setTabParentTree(refKey, parentTree, name) {
		this.refs[refKey].directSetParentTree(parentTree, name);
	}

	changeTabWithAll(params, parentTree) {
		const TabKeyMap = {
			'disease': 'Disease', 'medicine': 'Medicine', 'symptom': 'Symptom',
			'treatment': 'Treatment', 'exam': 'Exam',
		};
		let refKey = TabKeyMap[params.type];
		let callback = this.setTabParentTree.bind(this, refKey, parentTree, params.name);
		this.setState({
			activeKey: refKey,
		}, callback);
	}

	onSwitchTab(params) {
		const { dispatch } = this.props;
		let callback = this.changeTabWithAll.bind(this, params);
		dispatch({
			type: 'masterData/parentTree',
			payload: params,
			callback: callback,
		});
	}

	render() {
		const { parentItem } = this.props.masterData;
		const { activeKey } = this.state;
		return (
			<div>
				<Tabs onChange={this.onChangeTab.bind(this)} type="card" activeKey={activeKey}>
					<Tabs.TabPane tab="人体系统" key="BodySystem">
						<BodySystemPanel ref="BodySystem"
							onQuery = {this.onQuery.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="人体器官" key="BodyStructure">
						<BodyStructruePanel ref="BodyStructure"
							parentNode = {parentItem}
							onQuery = {this.onQuery.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="药物" key="Medicine">
						<MedicinePanel ref="Medicine"
							parentNode = {parentItem}
							onQuery = {this.onQuery.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="疾病" key="Disease">
						<DiseasePanel ref="Disease"
							parentNode = {parentItem}
							onQuery = {this.onQuery.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="症状" key="Symptom">
						<SymptomPanel ref="Symptom"
							parentNode = {parentItem}
							onQuery = {this.onQuery.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="扩展属性" key="SymptomExtension">
						<ExtensionPanel ref="SymptomExtension"
							parentNode = {parentItem}
							onQuery = {this.onQuery.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="检查" key="Exam">
						<ExamPanel ref="Exam"
							parentNode = {parentItem}
							onQuery = {this.onQuery.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="治疗" key="Treatment">
						<TreatmentPanel ref="Treatment"
							parentNode = {parentItem}
							onQuery = {this.onQuery.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="自定义矢量" key="CustomerVector">
						<CustomerVectorPanel
							parentNode = {parentItem}
							onQuery = {this.onQuery.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="矢量关系" key="VectorRelation">
						<VectorRelationPanel
							parentNode = {parentItem}
							onQuery = {this.onQuery.bind(this)}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab="搜索" key="Search">
						<SearchPanel ref="Search"
							onQuery = {this.onQuerySearch.bind(this)}
						    onSwitchTab = {this.onSwitchTab.bind(this)}
						/>
					</Tabs.TabPane>
				</Tabs>
			</div>
		);
	}
}
