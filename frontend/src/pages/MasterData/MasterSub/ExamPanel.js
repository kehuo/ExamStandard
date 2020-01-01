import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, Popconfirm, Breadcrumb, Popover, Card } from 'antd';
import ExamPopup from './ExamPopup';
import NodeSelectPopup from './NodeSelectPopup';
import ExamRefPopup from './ExamRefPopup';
import ExamSmartPopup from './ExamSmartPopup';

import styles from '../MasterData.less';
let underscore = require('underscore');

export default class ExamPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',

			data: [],
			total: 0,

			parentTree: [],
			parentId: 1,
			extensionOpts: [],

			showPopup: false,
			hotOne: {},
			showRefPopup: false,
			showNodePopup: false,
			parentItems: [],

			showSmartPopup: false,
		};
	}

	componentDidMount() {
		this.getExtensions();
		this.fetchListData();
	}

	getExtensions() {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let paramsA = {
			type: 'extension',
			page: 1,
			pageSize: 2000,
			parentId: 1,
		};
		let params = {
			payload: paramsA,
			callback: this.updateExtensions.bind(this),
		};
		onQuery('get-list', params);
	}

	updateExtensions(data) {
		let extensionOpts = [];
		for (let i=0; i<data.extensions.length; i++) {
			let x = data.extensions[i];
			extensionOpts.push({k:x.name, v:x.code});
		}
		this.setState({
			extensionOpts: extensionOpts,
		});
	}

	buildListQueryParams() {
		const { page, pageSize, keyword, parentId } = this.state;
		let params = {
			type: 'exam',
			page: page,
			pageSize: pageSize,
			parentId: parentId,
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

	directSetParentTree(parentTree, name) {
		let parentId = 1;
		if (parentTree.length > 0) {
			parentId = parentTree[parentTree.length-1]['parent_id'];
		}
		this.setState({
			parentTree: parentTree,
			parentId: parentId,
			page: 1,
			keyword: name,
		}, this.fetchListData.bind(this));
	}

	pruneParentTree(curParentNode) {
		let parentTree = this.state.parentTree;
		let parentId = this.state.parentId;
		if (!curParentNode) {
			return parentTree;
		}

		let tgtIdx = -1;
		for (let i=0; i<parentTree.length; i++) {
			if (parentTree[i].id == parentId) {
				tgtIdx = i;
				break;
			}
		}
		if (tgtIdx == -1) {
			let x = JSON.parse(JSON.stringify(curParentNode));
			parentTree.push(x);
		} else if (tgtIdx < parentTree.length - 1) {
			parentTree = parentTree.slice(0, tgtIdx+1);
		}
		return parentTree;
	}

	updateList(data) {
		const { parentNode } = this.props;
		let parentTree = this.pruneParentTree(parentNode);
		this.setState({
			data: data.exams,
			total: data.total,
			parentTree: parentTree,
		});
	}

	onShowNewPopup() {
		const { parentId } = this.state;
		let x = {
			id: 0,
			name: '',
			description: '',
			code: '',
			source: '',
			parent_id: parentId,
			props: '',
			function_spec: '',
			args: '',
			value_type: '',
			reference: '',
			value_source: '',
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

	realShowRefPopup(record) {
		this.setState({
			showRefPopup: true,
			hotOne: record,
		});
	}

	editItem(record, op) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let callback = null;
		switch (op) {
			case 'edit':
				callback = this.realShowPopup.bind(this);
				break;
			case 'reference':
				callback = this.realShowRefPopup.bind(this);
				break;
			default:
				break;
		}
		record.type = 'exam';
		let params = {
			payload: record,
			callback: callback,
		};
		onQuery('get-one', params);
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

	onSubmitRef(isUpdate, reference) {
		let callback = null;
		if (isUpdate) {
			callback = this.realEditItem.bind(this);
		}
		let record = this.state.hotOne;
		record.reference = reference;
		this.setState({
			showRefPopup: false,
			hotOne: record,
		}, callback);
	}

	onSubmitParent(isUpdate, parents) {
		let hotOne = this.state.hotOne;
		let callback = null;
		if (isUpdate) {
			let parentId = parseInt(parents[0].key);
			if (parentId == hotOne.id) {
				message.error('不能选择自身!');
				return;
			}
			hotOne.parent_id = parentId;
			callback = this.realEditItem.bind(this, hotOne);
		}
		this.setState({
			showNodePopup: false,
			hotOne: hotOne,
		}, callback);
	}

	onSubmitSmart(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.realCreateSmartItem.bind(this, record);
		}
		this.setState({
			showSmartPopup: false,
		}, callback);
	}

	realCreateSmartItem(record) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				type: 'exam',
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList.bind(this),
		};
		onQuery('create-smart-one', params);
	}

	realEditItem(record) {
		const { onQuery } = this.props;
		const { hotOne } = this.state;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				type: 'exam',
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
				type: 'exam',
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList.bind(this),
		};
		onQuery('delete-one', params);
	}

	nameRender(text, record, index) {
		return (
			<span onClick={this.onClickTreeNode.bind(this, record)}
			      style={{cursor:'pointer', textDecoration:'underline'}}
			>
				{text}
			</span>
		);
	}

	showNodePopup(record) {
		const { parentTree } = this.state;
		let x = parentTree[parentTree.length - 1];
		this.setState({
			hotOne: record,
			showNodePopup: true,
			parentItems: [{title: x.name, key: ''+x.parent_id}]
		});
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
		let parentOp = (
			<span className={styles.ListOpEnable} onClick={this.showNodePopup.bind(this, record)}
			      style={{marginLeft: 4}}>
				<Icon type="edit" theme="outlined"/>修改父节点
			</span>
		);
		let refOp = (
			<span className={styles.ListOpRef} onClick={this.editItem.bind(this, record, 'reference')}
			      style={{marginLeft: 4}}>
				<Icon type="edit" theme="outlined"/>参考值
			</span>
		);
		return (
			<div>
				{editOp}
				{deleteOp}
				{parentOp}
				{refOp}
			</div>
		);
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	onClickTreeNode(record) {
		let callback = this.fetchListData.bind(this);
		this.setState({
			page: 1,
			parentId: record.id,
		}, callback);
	}

	buildTreeNode(record, index, treeAll) {
		let comp = (
			<span onClick={this.onClickTreeNode.bind(this, record)}>{record.name}</span>
		);
		if (record.name.length > 5) {
			let name = record.name.substr(0, 4) + '...';
			comp = (
				<Popover content={record.name} >
					<span onClick={this.onClickTreeNode.bind(this, record)}>{name}</span>
				</Popover>
			);
		}
		return (
			<Breadcrumb.Item>
				{comp}
			</Breadcrumb.Item>
		);
	}

	onShowSmartNewPopup() {
		this.setState({
			showSmartPopup: true,
		});
	}

	buildParentTree() {
		const { parentTree } = this.state;
		let extra = (
			<div>
				<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建检查</Button>
				<Button style={{marginLeft:6}} onClick={this.onShowSmartNewPopup.bind(this, null)}>新建扩展码</Button>
			</div>
		);
		return (
			<Card title="层级结构" size="small" extra={extra} >
				<Breadcrumb separator=">" >
					<Breadcrumb.Item>
						<Icon type="home" />
					</Breadcrumb.Item>
					{parentTree.map(this.buildTreeNode.bind(this))}
				</Breadcrumb>
			</Card>
		);
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
			</Row>
		);
	}

	pickOutData(callback, data) {
		callback(data.exams);
	}

	onMoreData(typeM, parentId, callback) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let queryParams = {
			type: typeM,
			page: 1,
			pageSize: 1000,
			parentId: parentId,
		};
		let realCallback = this.pickOutData.bind(this, callback);
		let params = {
			payload: queryParams,
			callback: realCallback,
		};
		onQuery('get-list', params);
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

	onGenFunc(callback) {
		const { onQuery } = this.props;
		const { hotOne } = this.state;
		if (!onQuery) {
			return;
		}
		let paramsK = {
			payload: hotOne,
			callback: callback,
		};
		onQuery('gen-func', paramsK);
	}

	render() {
		const { page, pageSize, showPopup, data, total, hotOne,
			showNodePopup, parentItems, extensionOpts, showRefPopup, showSmartPopup } = this.state;
		const columns = [
			{dataIndex:'name', title:'名称', render: this.nameRender.bind(this)},
			{dataIndex:'code', title:'编码'},
			{dataIndex:'source', title:'来源'},
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
			<div style={{width:1000, backgroundColor:'white', padding:10}}>
				{this.buildParentTree()}
				{this.buildOpBar()}
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
				<ExamPopup visible={showPopup}
				                    item={hotOne}
				                    onSubmit={this.onSubmit.bind(this)}
				           extensionOpts={extensionOpts}
				           onTestFunc={this.onTestFunc.bind(this)}
				           onGenFunc={this.onGenFunc.bind(this)}
				/>
				<NodeSelectPopup visible={showNodePopup} title="检查"
				                 value={parentItems}
				                 onSubmit={this.onSubmitParent.bind(this)}
				                 onMoreData={this.onMoreData.bind(this, 'exam')}
				/>
				<ExamRefPopup visible={showRefPopup}
				              item={hotOne}
				              onSubmit={this.onSubmitRef.bind(this)}
				/>
				<ExamSmartPopup visible={showSmartPopup}
				                onSubmit={this.onSubmitSmart.bind(this)}
				/>
			</div>
		);
	}
}
