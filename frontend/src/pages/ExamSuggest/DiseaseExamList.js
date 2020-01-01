import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Modal, Card, Tooltip, Popconfirm } from 'antd';
import {routerRedux} from 'dva/router';
import { stringify } from 'qs';
import DiseaseExamPopup from './DiseaseExamPopup';

import styles from './Exam.less';
let underscore = require('underscore');
import debounce from 'lodash/debounce';

@connect(({ diseaseExamMappingList }) => ({
	diseaseExamMappingList
}))
export default class DiseaseExamList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			queryState: {},

			page: 1,
			pageSize: 10,
			diseaseId: '',
			diseaseName: '',
			ownerType: 'source',

			virtualDeptId: '',
			ownerId: '',

			showMappingPopup: false,
			hotItem: {},
		};
		this.onDiseaseSearch = debounce(this.onDiseaseSearch, 500);
	}

	buildListQueryParams() {
		const { page, pageSize, diseaseName, ownerType, ownerId } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			keyword: diseaseName,
			ownerType: ownerType,
			ownerId: ownerId,
			exact: 1,
		};
		if (!diseaseName) {
			delete params.keyword;
		}
		return params;
	}

	componentDidMount() {
		let query = this.props.location.query;
		let queryState = {};
		for (let k in query) {
			let val = query[k];
			if (k == 'page' || k == 'pageSize') {
				val = parseInt(val);
			}
			queryState[k] = val;
		}
		this.setState({
			queryState: queryState
		}, this.doInit.bind(this));
	}

	doInit() {
		const { dispatch } = this.props;
		dispatch({
			type: 'diseaseExamMappingList/init',
			payload: {},
			callback: this.initEnvFirst.bind(this)
		});
	}

	initEnvFirst() {
		const { virtualDeptOptions, ownerIdOptions } = this.props.diseaseExamMappingList;
		let newState = {};
		if (virtualDeptOptions.length>0) {
			newState.virtualDeptId =  '' + virtualDeptOptions[0].id;
		}
		if (ownerIdOptions.length>0) {
			newState.ownerId = '' + ownerIdOptions[0].id;
		}
		if (Object.keys(newState).length == 0) {
			return;
		}
		this.setState(newState);
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	isValidParams(params) {
		if (!params.keyword || !params.ownerId) {
			message.error('请确认已经选择疾病、虚拟组!');
			return false;
		}
		return true;
	}

	fetchListData() {
		const { dispatch } = this.props;
		let params = this.buildListQueryParams();
		if (!this.isValidParams(params)) {
			return;
		}
		dispatch({
			type: 'diseaseExamMappingList/fetch',
			payload: params
		});
	}

	clearAllDiseaseInfo() {
		const { dispatch } = this.props;
		dispatch({
			type: 'diseaseExamMappingList/clearDisease',
			payload: '',
		});
	}

	fetchDataSourceList() {
		const { virtualDeptId } = this.state;
		const { dispatch } = this.props;
		dispatch({
			type: 'diseaseExamMappingList/fetchDataSource',
			payload: {
				virtualdept: virtualDeptId
			},
		});
	}

	onSelectChange(tag, val, option) {
		let curState = this.state;
		curState[tag] = val;
		if (tag == 'diseaseId') {
			curState['diseaseName'] = option.props.children;
		}
		let callback = null;
		if (tag == 'virtualDeptId') {
			callback = this.fetchDataSourceList.bind(this);
			curState['diseaseId'] = '';
			curState['diseaseName'] = '';
			curState['ownerId'] = '';
		}
		if (tag == 'ownerId') {
			callback = this.clearAllDiseaseInfo.bind(this);
			curState['diseaseId'] = '';
			curState['diseaseName'] = '';
		}
		curState['page'] = 1;
		this.setState(curState, callback);
	}

	buildOpBar() {
		const { ownerType, virtualDeptId, ownerId, diseaseId } = this.state;
		const { virtualDeptOptions, ownerIdOptions, diseases } = this.props.diseaseExamMappingList;
		return (
			<Card title="查询条件">
				<Row gutter={16} style={{marginTop:10}}>
					<Col span={6}>
						疾病: <Select style={{width:'80%'}}
						            showSearch
						            value={diseaseId}
						            placeholder="请选择疾病"
						            defaultActiveFirstOption={false}
						            showArrow={false}
						            filterOption={false}
						            onSearch={this.onDiseaseSearch.bind(this)}
						            onChange={this.onSelectChange.bind(this, 'diseaseId')}
						            notFoundContent={null}
						>
							{diseases.map( o=> <Select.Option key={o.id}>{o.name}</Select.Option>)}
						</Select>
					</Col>
					<Col span={6}>
						虚拟组: <Select style={{width:'70%'}} value={''+virtualDeptId}
						             showArrow={true}
						             onChange={this.onSelectChange.bind(this, 'virtualDeptId')}
						>
							{virtualDeptOptions.map( o=> <Select.Option key={''+o.id}>{o.name}</Select.Option>)}
						</Select>
					</Col>
					<Col span={6}>
						数据源: <Select style={{width:'70%'}} value={''+ownerId}
						             showArrow={true}
						             onChange={this.onSelectChange.bind(this, 'ownerId')}
					>
						{ownerIdOptions.map( o=> <Select.Option key={''+o.id}>{o.source}</Select.Option>)}
					</Select>
					</Col>
					<Col span={3}>
						<Button type="primary" onClick={this.fetchListData.bind(this)}>检索</Button>
					</Col>
					<Col span={3}>
						<Button type="primary" onClick={this.onCreateNewMapping.bind(this)}>新建关联</Button>
					</Col>
				</Row>
			</Card>
		);
	}

	onDiseaseSearch(keyword) {
		const { dispatch } = this.props;
		const { virtualDeptId, ownerType } = this.state;
		if (!virtualDeptId) {
			message.error('请先选择虚拟组!');
			return;
		}
		dispatch({
			type: 'diseaseExamMappingList/queryDisease',
			payload: {
				keyword: keyword,
				page: 1,
				pageSize: 200,
				virtualDepartmentId: virtualDeptId,
			}
		});
	}

	onExamSearch(keyword, callback) {
		const { dispatch } = this.props;
		const { ownerId, ownerType } = this.state;
		if (!ownerId) {
			message.error('请选择虚拟组!');
			return
		}
		dispatch({
			type: 'diseaseExamMappingList/queryExam',
			payload: {
				keyword: keyword,
				page: 1,
				pageSize: 200,
				ownerId: ownerId,
				ownerType: ownerType,
			},
			callback: callback
		});
	}

	// queryOperator(ownerKeyword) {
	// 	const { dispatch } = this.props;
	// 	let params = {
	// 		keyword: ownerKeyword,
	// 		orgCode: orgCode,
	// 		type: ownerType,
	// 	};
	// 	dispatch({
	// 		type: 'diseaseExamMappingList/queryOperator',
	// 		payload: params,
	// 	});
	// }

	realEditMapping(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'diseaseExamMappingList/editMapping',
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

	onChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState);
	}

	onCreateNewMapping() {
		const { diseaseId, ownerId, ownerType } = this.state;
		if (!diseaseId || !ownerId) {
			message.error('请确认已经选择疾病、数据源!');
			return;
		}
		let record = {
			id: 0,
			disease_id: parseInt(diseaseId),
			owner_type: ownerType,
			owner_id: parseInt(ownerId)
		};
		this.onEditMapping(record);
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
			type: 'diseaseExamMappingList/deleteMapping',
			payload: {
				updateParams: {
					id: record.id,
				},
				queryParams: this.buildListQueryParams(),
			}
		});
	}
	
	opRender(text, record, index) {
		// let deleteOp = (
		// 	<span className={styles.ListOpDisable} onClick={this.onDeleteMapping.bind(this, record)}>
		// 		<Icon type="close-circle" theme="outlined"/>删除
		// 	</span>
		// );
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

	longTextRender(text, record, index) {
		if (!text) {
			return '未知';
		}
		if (text.length < 10) {
			return text;
		}
		let showText = text.substring(0, 8) + '...';
		let component = (
			<Tooltip title={text}>
				{showText}
			</Tooltip>
		);
		return component;
	}

	emergencyRender(text, record, index) {
		const EmergencyMap = {
			'0': '否', '1':'是'
		};
		let display = EmergencyMap[''+text];
		if(!display) {
			display = '未知';
		}
		return display;
	}

	render() {
		const { data, total } = this.props.diseaseExamMappingList;
		const { page, pageSize, showMappingPopup, hotItem } = this.state;
		const columns = [
			{dataIndex:'disease_name', title:'疾病名称', render: this.longTextRender.bind(this)},
			{dataIndex:'data_source', title:'数据源', render: this.longTextRender.bind(this)},
			// {dataIndex:'owner_name', title:'虚拟组', render: this.longTextRender.bind(this)},
			{dataIndex:'exam_name', title:'检查项目名称', render: this.longTextRender.bind(this)},
			{dataIndex:'emergency', title:'急诊', render: this.emergencyRender.bind(this)},
			{dataIndex:'hit', title:'占比'},
			{dataIndex:'id', title:'操作', render: this.opRender.bind(this)},
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
				<DiseaseExamPopup visible={showMappingPopup}
				                  item={hotItem}
				                  onExamSearch={this.onExamSearch.bind(this)}
				                  onSubmit={this.onSubmit.bind(this)}
				/>
			</div>
		);
	}
}
