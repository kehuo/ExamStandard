import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Tabs } from 'antd';
import VectorMappingPanel from './NormalSub/VectorMappingPanel';
import PropExtMappingPanel from './NormalSub/PropExtMappingPanel';
import SplitVectorPanel from './NormalSub/SplitVectorPanel';
import DiscardVectorPanel from './NormalSub/DiscardVectorPanel';
import NormalTaskPanel from './NormalSub/NormalTaskPanel';
import NormalTaskListPanel from './NormalSub/NormalTaskListPanel'
import ModelHighlightPanel from './NormalSub/ModelHighlightPanel';

import styles from './MasterData.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ masterData }) => ({
	masterData
}))
export default class Normal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeKey: 'NormalTask',
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
		case 'vector_mapping_list':
			dispatch({
				type: 'normal/vectorMappingFetch',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'prop_mapping_list':
			dispatch({
				type: 'normal/propMappingFetch',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'split_list':
			dispatch({
				type: 'normal/splitListFetch',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'discard_list':
			dispatch({
				type: 'normal/discardListFetch',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'delete_discard_one':
			dispatch({
				type: 'normal/deleteDiscard',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'new_discard_one':
			dispatch({
				type: 'normal/newDiscard',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'edit_split_one':
			dispatch({
				type: 'normal/editSplit',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'new_split_one':
			dispatch({
				type: 'normal/newSplit',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'delete_split_one':
			dispatch({
				type: 'normal/deleteSplit',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'new_prop_mapping_one':
			dispatch({
				type: 'normal/newPropMapping',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'edit_prop_mapping_one':
			dispatch({
				type: 'normal/editPropMapping',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'delete_prop_mapping_one':
			dispatch({
				type: 'normal/deletePropMapping',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'master_search':
			dispatch({
				type: 'masterData/search',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'new_vector_mapping_one':
			dispatch({
				type: 'normal/newVectorMapping',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'edit_vector_mapping_one':
			dispatch({
				type: 'normal/editVectorMapping',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'delete_vector_mapping_one':
			dispatch({
				type: 'normal/deleteVectorMapping',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'normal_task_list':
			dispatch({
				type: 'normal/normTaskFetch',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'do_norm_task_one':
			dispatch({
				type: 'normal/doNormTask',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'update_norm_task_one':
			dispatch({
				type: 'normal/updateNormTask',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'emr_refer':
			dispatch({
				type: 'normal/emrRefer',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'get_vector_ref':
			dispatch({
				type: 'normal/getVectorRef',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		default:
			break;
		}
	}

	changeTabWithAll(params) {
		let refKey = params.tabRef;
		if (refKey === 'ModelHighlight') {
			this.refs[refKey].directSetEmr(params);
		}
	}

	onSwitchTab(params) {
		let refKey = params.tabRef;
		let callback = this.changeTabWithAll.bind(this, params);
		this.setState({
			activeKey: refKey,
		}, callback);
	}

	render() {
		const { activeKey } = this.state;
		return(
			<div>
				<Tabs onChange={this.onChangeTab.bind(this)} type="card" activeKey={activeKey}>
					<Tabs.TabPane tab="归一任务" key="NormalTask">
						<NormalTaskListPanel ref="NormalTask"
						                 onSwitchTab={this.onSwitchTab.bind(this)}
						                 onQuery = {this.onQuery.bind(this)} />
					</Tabs.TabPane>
					<Tabs.TabPane tab="矢量映射" key="VectorMapping">
						<VectorMappingPanel ref="VectorMapping" onQuery = {this.onQuery.bind(this)} />
					</Tabs.TabPane>
					<Tabs.TabPane tab="属性映射" key="ExtensionMapping">
						<PropExtMappingPanel ref="PropMapping" onQuery = {this.onQuery.bind(this)} />
					</Tabs.TabPane>
					<Tabs.TabPane tab="矢量分拆" key="VectorSplit">
						<SplitVectorPanel ref="SplitMapping" onQuery = {this.onQuery.bind(this)} />
					</Tabs.TabPane>
					<Tabs.TabPane tab="矢量丢弃" key="VectorDispose">
						<DiscardVectorPanel ref="DiscardMapping" onQuery = {this.onQuery.bind(this)} />
					</Tabs.TabPane>
					<Tabs.TabPane tab="参考病历" key="ModelHighlight">
						<ModelHighlightPanel ref="ModelHighlight"
						                     onQuery = {this.onQuery.bind(this)}
						/>
					</Tabs.TabPane>
				</Tabs>
			</div>
		);
	}
}
