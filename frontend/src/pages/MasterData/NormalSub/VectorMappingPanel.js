import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, Popconfirm, Modal, TreeSelect, Spin } from 'antd';
import { buildTreeData } from '../../../utils/utils'
import debounce from 'lodash/debounce'

import styles from '../MasterData.less';
let underscore = require('underscore');

const VECTORTYPES = [
	{k:'症状',v:'symptom'},
	{k:'检查',v:'exam'},
	{k:'药物',v:'medicine'},
	{k:'疾病',v:'disease'},
	{k:'治疗',v:'treatment'},
];

const NEGATIVETYPE = [
	{k:'是',v:1},
	{k:'否',v:0},
];

class VectorMappingOnePanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
		this.handleSearch = debounce(this.handleSearch, 500);
	}

	initData(item) {
		let newState = {
			id: 0,
			vName: '',
			category: 'symptom',
			sourceId: '',
			srcCategory: 'symptom',
			structureId: '',
			negative: 0,
			vectors: [],
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.vName = item.vName;
			newState.category = item.category;
			newState.sourceId = item.sourceId;
			newState.srcCategory = item.srcCategory;
			newState.structureId = (item.structureId) ? item.structureId: '';
			newState.negative = (item.negative) ? item.negative : 0 ;
			if (item.sourceId !== '' && item.icdName && item.icdCode) {
				newState.vectors = [{
					id: item.sourceId,
					name: item.icdName,
					code: item.icdCode
				}]
			}
		}
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let newState = this.initData(nextProps.item);
		this.setState(newState);
	}

	onSubmit(isUpdate) {
		const { id, vName, category, sourceId, structureId, negative } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!vName || !category || !sourceId) {
			message.error('请正确填写映射矢量内容!');
			return;
		}
		let x = {
			id: id,
			vName: vName,
			category: category,
			sourceId: parseInt(sourceId),
			srcCategory: category,
			structureId: (structureId !== '') ? parseInt(structureId) : null,
			negative: negative
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['vName'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		if (tag === 'category') {
			curState['vectors'] = [];
			curState['sourceId'] = '';
			curState['srcCategory'] = val;
		}
		this.setState(curState);
	}

	updateState(data) {
		let items = data['items'];
		let curState = this.state;
		curState.vectors=items;
		this.setState(curState);
	}

	buildListQueryParams(value) {
		let { category } = this.state;
		let params = {
			dataType: 'mapping',
			type: category,
			page: 1,
			pageSize: 2000,
			keyword: value
		};
		return params;
	}

	handleSearch(value) {
		if (!value || value === '') {
			return
		}
		if (this.props.onQuery) {
			let params = {
				payload: this.buildListQueryParams(value),
				callback: this.updateState.bind(this),
			};
			this.props.onQuery('master_search', params);
		}
	};

	render() {
		const {id, vName, category, sourceId, srcCategory, structureId, negative, vectors } = this.state;

		let disabled = false;
		if (id !== 0) {
			disabled = true
		}
		const { visible, treeData } = this.props;
		let title = '新建矢量映射';
		if (id) {
			title = '编辑矢量映射';
		}
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>矢量名称:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       disabled={disabled}
						       value={vName}
						       onChange={this.onChange.bind(this, 'vName')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>矢量类型:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}} showArrow={true}
						        value={category}
						        disabled={disabled}
						        onSelect={this.onChange.bind(this, 'category')}
						>
							{VECTORTYPES.map( o=> <Select.Option key={''+o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>标准矢量:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}}
						        showSearch
						        placeholder={this.props.placeholder}
						        defaultActiveFirstOption={false}
						        showArrow={true}
						        filterOption={false}
						        onSearch={this.handleSearch.bind(this)}
						        notFoundContent={null}
						        value={'' + sourceId}
						        dropdownMatchSelectWidth={false}
						        onSelect={this.onChange.bind(this, 'sourceId')}
						>
							{vectors.map( o=> <Select.Option key={''+o.id}>{o.name + '[' + o.code + ']'}</Select.Option>)}
						</Select>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>矢量否定:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}} showArrow={true}
						        value={'' + negative}
						        onSelect={this.onChange.bind(this, 'negative')}
						>
							{NEGATIVETYPE.map( o=> <Select.Option key={''+o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>

				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>身体部位:</Col>
					<Col span={16} offset={1}>
						<TreeSelect
							showSearch
							optionFilterProp="children"
							style={{width:'100%'}}
							value={structureId}
							treeNodeFilterProp={'title'}
							dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
							treeData={treeData}
							placeholder="Please select"
							allowClear
							onChange={this.onChange.bind(this, 'structureId')}
						/>
					</Col>
				</Row>
			</Modal>
		);
	}
}


export default class VectorMappingPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',
			type: 'symptom',

			data: [],
			total: 0,

			showPopup: false,
			hotOne: {},
			spinning: false
		};
	}

	componentDidMount() {
		let curState = this.state;
		curState['spinning'] = true;
		this.setState(curState, this.fetchListData());
	}

	searchMappingData() {
		this.setState({
			page: 1,
			spinning: true,
		}, this.fetchListData.bind(this));
	}

	fetchListData() {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: this.buildListQueryParams(),
			callback: this.updateList.bind(this),
		};
		onQuery('vector_mapping_list', params);
	}

	buildListQueryParams() {
		const { page, pageSize, keyword, type } = this.state;
		let params = {
			type: type,
			page: page,
			pageSize: pageSize,
		};
		if (keyword) {
			params.keyword = keyword;
		}
		return params;
	}

	updateList(data) {
		let { page, pageSize } = this.state;
		let totalPage = Math.ceil(data.total/pageSize);
		if (page > totalPage) {
			page = totalPage
		}


		this.setState({
			data: data.vectorMapping,
			page: page,
			total: data.total,
			bodyStructures: data.bodyStructures,
			treeData: buildTreeData(data.bodyStructures, 'name', 'id', 'id'),
			spinning: false
		});
	}

	updateList1(data) {
		let { page, pageSize } = this.state;
		let totalPage = Math.ceil(data.total/pageSize);
		if (page > totalPage) {
			page = totalPage
		}


		this.setState({
			spinning: false,
			page: page,
			data: data.vectorMapping,
			total: data.total,
		});
	}

	onShowNewPopup() {
		let x = {
			id: 0,
			vName: '',
			category: 'symptom',
			sourceId: '',
			srcCategory: '',
			structureId: '',
			negative: 0
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		}
		curState[tag] = realVal;
		this.setState(curState);
	}

	buildOpBar() {
		const { keyword } = this.state;
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					关键词: <Input.Search style={{width: '80%'}}
					                   value={keyword}
					                   onChange={this.onChangeElement.bind(this, 'input', 'keyword')}
					                   onSearch={this.searchMappingData.bind(this)}
				/>
				</Col>
				<Col span={4} offset={1}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建矢量映射</Button>
				</Col>
			</Row>
		);
	}

	editItem(record) {
		this.setState({
			showPopup: true,
			hotOne: record,
		});
	}

	onSubmit(isUpdate, record) {
		if (!isUpdate) {
			this.setState({
				spinning: false,
				showPopup: false,
			});
			return;
		}

		let callback = this.realEditItem.bind(this, record);
		this.setState({
			spinning: true,
			showPopup: false,
			hotOne: record,
		}, callback);
	}

	realEditItem(record) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList1.bind(this),
		};
		if (record.id === 0) {
			onQuery('new_vector_mapping_one', params);
		} else {
			onQuery('edit_vector_mapping_one', params);
		}
	}

	onDeleteItem(record) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				type: 'vector_mapping',
				id: record.id,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList1.bind(this),
		};
		onQuery('delete_vector_mapping_one', params);
	}

	opRender(text, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editItem.bind(this, record)}>
					<Icon type="edit" theme="outlined"/>编辑
				</span>
		);
		let deleteOp = (
			<span className={styles.ListOpDisable} style={{marginLeft:8}}>
				<Popconfirm title="确定删除"
				            onConfirm={this.onDeleteItem.bind(this, record)}
				            onCancel={null}
				>
					<Icon type="close-circle" theme="outlined" />删除
				</Popconfirm>
			</span>
		);
		return (
			<div>
				{editOp}
				{deleteOp}
			</div>
		);
	}

	onListPageChange(page, pageSize) {
		this.setState({
			spinning: true,
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	render() {
		const { page, pageSize, showPopup, data, total, hotOne, treeData, spinning } = this.state;
		const { onQuery } = this.props;
		const columns = [
			{dataIndex:'id', title:'ID'},
			{dataIndex:'vName', title:'矢量名称'},
			{dataIndex:'category', title:'矢量类别'},
			{dataIndex:'icdName', title:'标准矢量名称'},
			{dataIndex:'srcCategory', title:'标准矢量类别'},
			{dataIndex:'structureName', title:'身体部位'},
			{dataIndex:'icdCode', title:'代码'},
			{dataIndex:'negative', title:'矢量否定'},
			{dataIndex:'id', title:'操作', render: this.opRender.bind(this)}
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
			<div style={{width:1200, backgroundColor:'white', padding:10}}>
				{this.buildOpBar()}
				<Spin spinning={spinning}>
					<Table columns={columns}
					       dataSource={data}
					       pagination={pageOpts}
					/>
				</Spin>
				<VectorMappingOnePanel visible={showPopup}
				                       item={hotOne}
				                       treeData={treeData}
				                       onQuery={onQuery}
				                       onSubmit={this.onSubmit.bind(this)}
				/>
			</div>
		);
	}
}
