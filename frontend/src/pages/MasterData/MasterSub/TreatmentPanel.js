import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, Popconfirm, Breadcrumb, Popover, Card } from 'antd';
import TreatmentPopup from './TreatmentPopup';
import NodeSelectPopup from './NodeSelectPopup';

import styles from '../MasterData.less';
let underscore = require('underscore');

export default class TreatmentPanel extends React.Component {
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

			showPopup: false,
			hotOne: {},

			showNodePopup: false,
			parentItems: []
		};
	}

	componentDidMount() {
		this.fetchListData();
	}

	buildListQueryParams() {
		const { page, pageSize, keyword, parentId } = this.state;
		let params = {
			type: 'treatment',
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
			data: data.treatments,
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
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	editItem(record) {
		this.setState({
			showPopup: true,
			hotOne: record,
		});
	}

	onSubmit(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.realEditItem.bind(this, record);
		}
		this.setState({
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
				type: 'treatment',
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList.bind(this),
		};
		onQuery('edit-one', params);
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

	onDeleteItem(record) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				type: 'treatment',
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
			<span className={styles.ListOpEdit} onClick={this.editItem.bind(this, record)}>
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
		return (
			<div>
				{editOp}
				{deleteOp}
				{parentOp}
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

	buildParentTree() {
		const { parentTree } = this.state;
		let extra = (
			<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建治疗</Button>
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
		callback(data.treatments);
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

	render() {
		const { page, pageSize, showPopup, data, total, hotOne,
			showNodePopup, parentItems } = this.state;
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
				<TreatmentPopup visible={showPopup}
				                    item={hotOne}
				                    onSubmit={this.onSubmit.bind(this)}
				/>
				<NodeSelectPopup visible={showNodePopup} title="治疗"
				                 value={parentItems}
				                 onSubmit={this.onSubmitParent.bind(this)}
				                 onMoreData={this.onMoreData.bind(this, 'treatment')}
				/>
			</div>
		);
	}
}
