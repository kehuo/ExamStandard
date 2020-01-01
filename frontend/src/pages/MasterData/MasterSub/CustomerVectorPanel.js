import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, Popconfirm, Breadcrumb, Popover, Card } from 'antd';
import CustomerVectorPopup from './CustomerVectorPopup';

import styles from '../MasterData.less';
let underscore = require('underscore');

export default class CustomerVectorPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',

			data: [],
			total: 0,

			showPopup: false,
			hotOne: {},
		};
	}

	componentDidMount() {
		this.fetchListData();
	}

	buildListQueryParams() {
		const { page, pageSize, keyword } = this.state;
		let params = {
			type: 'customer_vector',
			page: page,
			pageSize: pageSize,
		};
		if (keyword) {
			params.keyword = keyword;
		}
		return params;
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
		onQuery('get-list', params);
	}

	updateList(data) {
		this.setState({
			data: data.items,
			total: data.total,
		});
	}

	onQueryFunc(type, keyword, parentId, callback) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let paramsK = {
			keyword: keyword,
			page: 1,
			pageSize: 2000,
			type: type,
			dataType: 'mapping',
		};
		if (parentId) {
			paramsK.parentId = parentId;
		}
		let params = {
			payload: paramsK,
			callback: callback,
		};
		onQuery('get-list', params);
	}

	onQueryExtensionFunc(type, vectorId, callback) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let paramsK = {
			type: type,
			id: vectorId,
		};
		let params = {
			payload: paramsK,
			callback: callback,
		};
		onQuery('get-one-extension', params);
	}

	onShowNewPopup() {
		let x = {
			id: 0,
			category: '',
			vector_id: '',
			vector_name: '',
			vector_code: '',
			vector_props: '',

			function_spec: '',
			args: '',
			value_type: '',
			addition: '',

			extensions: [],
			args_extensions: [],
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	realShowPopup(record) {
		this.setState({
			showPopup: true,
			hotOne: record,
		});
	}

	editItem(record, op) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let callback = this.realShowPopup.bind(this);
		record.type = 'customer_vector';
		let params = {
			payload: record,
			callback: callback,
		};
		onQuery('get-one-complicate', params);
	}

	onSubmit(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.realEditItem.bind(this);
		}
		this.setState({
			showPopup: false,
			hotOne: record,
		}, callback);
	}

	realEditItem() {
		const { onQuery } = this.props;
		const { hotOne } = this.state;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				type: 'customer_vector',
				updateParams: hotOne,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList.bind(this),
		};
		onQuery('edit-one', params);
	}

	onDeleteItem(record) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				type: 'customer_vector',
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList.bind(this),
		};
		onQuery('delete-one', params);
	}

	opRender(text, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editItem.bind(this, record, 'edit')}>
				<Icon type="edit" theme="outlined"/>编辑
			</span>
		);
		let deleteOp = (
			<span className={styles.ListOpDisable} style={{marginLeft:4}}>
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
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
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
	
	onSearch() {
		this.setState({
			page: 1
		}, this.fetchListData.bind(this));
	}
	
	buildOpBar() {
		const { keyword } = this.state;
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					关键词: <Input.Search style={{width: '80%'}}
					                   value={keyword}
					                   onChange={this.onChangeElement.bind(this, 'input', 'keyword')}
					                   onSearch={this.onSearch.bind(this)}
					/>
				</Col>
				<Col span={8}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建自定义矢量</Button>
				</Col>
			</Row>
		);
	}

	additionRender(text, record, index) {
		let x = '';
		if (text) {
			x = JSON.parse(text);
			x = x.prop;
		}
		return x;
	}

	onTestFunc(function_spec, params, callback) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let queryParams = {
			function: function_spec,
			params: params
		};
		let paramsK = {
			payload: queryParams,
			callback: callback,
		};
		onQuery('test-func', paramsK);
	}

	render() {
		const { page, pageSize, showPopup, data, total, hotOne } = this.state;
		const columns = [
			{dataIndex:'id', title:'序号'},
			{dataIndex:'category', title:'类型'},
			{dataIndex:'vector_name', title:'名称', width: '30%'},
			{dataIndex:'addition', title:'扩展属性', width: '30%', render: this.additionRender.bind(this)},
			{dataIndex:'vector_code', title:'编码'},
			{dataIndex:'vector_id', title:'操作', render: this.opRender.bind(this)},
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
			<div style={{width:1000, backgroundColor:'white', padding:10}}>
				{this.buildOpBar()}
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
				<CustomerVectorPopup visible={showPopup}
				           item={hotOne}
				           onSubmit={this.onSubmit.bind(this)}
				           onQueryFunc={this.onQueryFunc.bind(this)}
				           onQueryExtensionFunc={this.onQueryExtensionFunc.bind(this)}
				           onTestFunc={this.onTestFunc.bind(this)}
				/>
			</div>
		);
	}
}
