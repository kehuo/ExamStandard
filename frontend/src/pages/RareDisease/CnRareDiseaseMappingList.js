import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Modal, Card, Tooltip, Popconfirm } from 'antd';
import {routerRedux} from 'dva/router';
import CnRareDiseaseMappingPopup from './CnRareDiseaseMappingPopup';

import styles from './RareDisease.less';
let underscore = require('underscore');
import debounce from 'lodash/debounce';

@connect(({ cnRareDiseaseMapping }) => ({
	cnRareDiseaseMapping
}))
export default class CnRareDiseaseMappingList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			keyword: '',
			page: 1,
			pageSize: 10,

			showMappingPopup: false,
			hotItem: {},
		};
	}

	buildListQueryParams() {
		const { page, pageSize, keyword } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
		};
		if (keyword) {
			params.keyword = keyword;
		}
		return params;
	}

	componentDidMount() {
		this.fetchListData();
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	fetchListData() {
		const { dispatch } = this.props;
		let params = this.buildListQueryParams();
		dispatch({
			type: 'cnRareDiseaseMapping/fetch',
			payload: params
		});
	}

	buildOpBar() {
		const { keyword } = this.state;
		return (
			<Card title="查询条件">
				<Row gutter={16} style={{marginTop:10}}>
					<Col span={16}>
						关键词: <Input.Search style={{width: '80%'}}
						                   value={keyword}
						                   onChange={this.onChangeElement.bind(this, 'input', 'keyword')}
						                   onSearch={this.fetchListData.bind(this)}
					/>
					</Col>
					<Col span={8} style={{textAlign:'right'}}>
						<Button type="primary"
						        onClick={this.onEditMapping.bind(this, null)}>创建映射</Button>
					</Col>
				</Row>
			</Card>
		);
	}

	onQueryDisease(mode, keyword, callback) {
		const { dispatch } = this.props;
		let funcName = 'queryCnRareDisease';
		if (mode == 'worldRare') {
			funcName = 'queryWorldRareDisease';
		}
		dispatch({
			type: 'cnRareDiseaseMapping/' + funcName,
			payload: {
				page: 1,
				pageSize: 200,
				keyword: keyword,
			},
			callback: callback,
		});
	}

	realEditMapping(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'cnRareDiseaseMapping/edit',
			payload: {
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	onSubmit(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.realEditMapping.bind(this, record);
		}
		this.setState({
			showMappingPopup: false,
			hotItem: {},
		}, callback);
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (elementType == 'checkbox') {
			realVal = val.target.checked;
		}
		curState[tag] = realVal;
		this.setState(curState);
	}

	onEditMapping(record) {
		this.setState({
			showMappingPopup: true,
			hotItem: record,
		});
	}

	onDeleteMapping(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'cnRareDiseaseMapping/delete',
			payload: {
				updateParams: {
					id: record.id,
				},
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	opRender(text, record, index) {
		let deleteOp = (
			<span className={styles.ListOpDisable}>
				<Popconfirm title="确定删除"
				            onConfirm={this.onDeleteMapping.bind(this, record)}
				            onCancel={null}
				>
					<Icon type="close-circle" theme="outlined" />删除
				</Popconfirm>
			</span>
		);
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.onEditMapping.bind(this, record)}
			      style={{marginLeft: 16}}>
				<Icon type="edit" theme="outlined"/>编辑
			</span>
		);
		return (
			<div>
				{deleteOp}
				{editOp}
			</div>
		);
	}

	longTextRender(maxLen, enTag, text, record, index) {
		let raw = text;
		if (!text) {
			raw = record[enTag];
		}
		if (raw.length < maxLen) {
			return raw;
		}
		let showText = raw.substring(0, maxLen-2) + '...';
		let component = (
			<Tooltip title={raw}>
				{showText}
			</Tooltip>
		);
		return component;
	}

	statusRender(text, record, index) {
		let iconA = (<Icon type="check-circle" />);
		let color = 'green';
		if (text == 1) {
			iconA = (<Icon type="close-circle" />);
			color = 'red';
		}
		let comp = (
			<span style={{color:color, fontSize:14}}>{iconA}</span>
		);
		return comp;
	}

	render() {
		const { data, total } = this.props.cnRareDiseaseMapping;
		const { page, pageSize, showMappingPopup, hotItem } = this.state;
		const columns = [
			{dataIndex:'cnRareCnName', title:'中国罕见病', render: this.longTextRender.bind(this, 20, 'cnRareEnName')},
			{dataIndex:'cnRareDisabled', title:'状态', render: this.statusRender.bind(this)},
			{dataIndex:'rareCnName', title:'世界罕见病', render: this.longTextRender.bind(this, 20, 'rareEnName')},
			{dataIndex:'rareDisabled', title:'状态', render: this.statusRender.bind(this)},
			{dataIndex:'mappingId', title:'操作', render: this.opRender.bind(this)},
		];
		let pageOpts = {
			current: page,
			pageSize: pageSize,
			size: 'small',
			total: total,
			onChange: this.onListPageChange.bind(this),
			onShowSizeChange: this.onListPageChange.bind(this)
		};
		return (
			<div style={{width:1000, margin:'auto', backgroundColor:'white', padding:20}}>
				{this.buildOpBar()}
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
				<CnRareDiseaseMappingPopup visible={showMappingPopup}
				                       item={hotItem}
				                       onSubmit={this.onSubmit.bind(this)}
				                       onQuery={this.onQueryDisease.bind(this)}
				/>
			</div>
		);
	}
}
