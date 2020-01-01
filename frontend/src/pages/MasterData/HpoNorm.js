import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Tabs } from 'antd';

import MappingListPanel from './HpoNormalSub/MappingListPanel';
import MappingItemPanel from './HpoNormalSub/MappingItemPanel';

import styles from './MasterData.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ hpoMapping }) => ({
	hpoMapping
}))
export default class Normal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeKey: 'MappingList',
		};
	}

	onChangeTab(key) {
		this.setState({
			activeKey: key
		});
	}

	changeTabWithAll(refKey, params) {
		this.refs[refKey].switchTabProcess(params);
	}

	onSwitchTab(refKey, params) {
		let callback = this.changeTabWithAll.bind(this, refKey, params);
		this.setState({
			activeKey: refKey,
		}, callback);
	}

	onQuery(opCode, params) {
		const {dispatch} = this.props;
		switch (opCode) {
		case 'get_mapping_list':
			dispatch({
				type: 'hpoMapping/fetchMappingList',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'delete_mapping_item':
			dispatch({
				type: 'hpoMapping/deleteMappingOne',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'create_mapping':
			dispatch({
				type: 'hpoMapping/createMappingOne',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'update_mapping':
			dispatch({
				type: 'hpoMapping/updateMappingOne',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'hpo_children':
			dispatch({
				type: 'hpoMapping/hpoChildren',
				payload: params.payload,
				callback: params.callback,
			});
			break;
		case 'suggest':
			dispatch({
				type: 'hpoMapping/suggest',
				payload: params.payload,
				callback: params.callback,
			});
            break;
        case 'hpo_search':
            dispatch({
                type: 'hpoMapping/searchHpoItems',
                payload: params.payload,
                callback: params.callback,
            });
            break;
		default:
			break;
		}
	}

	render() {
		const { activeKey } = this.state;
		return (
			<div>
				<Tabs onChange={this.onChangeTab.bind(this)} type="card" activeKey={activeKey}>
					<Tabs.TabPane tab="映射条目" key="MappingList">
						<MappingListPanel ref="MappingList"
						                     onSwitchTab={this.onSwitchTab.bind(this)}
						                     onQuery = {this.onQuery.bind(this)} />
					</Tabs.TabPane>
					<Tabs.TabPane tab="映射编辑" key="MappingItem">
						<MappingItemPanel ref="MappingItem"
						                     onSwitchTab={this.onSwitchTab.bind(this)}
						                     onQuery = {this.onQuery.bind(this)} />
					</Tabs.TabPane>
				</Tabs>
			</div>
		);
	}
}
