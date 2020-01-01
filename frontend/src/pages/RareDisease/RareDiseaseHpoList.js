import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Popover, message, Button,
	Modal, Card, Tooltip, Popconfirm, Breadcrumb } from 'antd';
import {routerRedux} from 'dva/router';
import RareDiseaseHpoPopup from './RareDiseaseHpoPopup';

import styles from './RareDisease.less';
let underscore = require('underscore');
import debounce from 'lodash/debounce';

@connect(({ rareDiseaseHpo }) => ({
	rareDiseaseHpo
}))
export default class RareDiseaseHpoList extends React.Component {
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

			parentTree: [],
			parentId: 1,
			parentCode: 'HP:0000001',
			allParents: [],
			me: {}
		};
	}

	buildListQueryParams(hasParentCode=true) {
		const { page, pageSize, keyword, parentCode, parentId } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			keyword: keyword,
		};
		if (hasParentCode) {
			params.parentCode = parentCode;
			params.parentId = parentId;
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

	fetchListData(hasParentCode=true) {
		const { dispatch } = this.props;
		dispatch({
			type: 'rareDiseaseHpo/fetch',
			payload: this.buildListQueryParams(hasParentCode),
			callback: this.updateList.bind(this)
		});
	}

	updateList(data) {
		let newState = {
			data: data.hpos,
			total: data.total,
		};
		if (data.me) {
			newState.me = data.me;
		};
		if (data.allParents) {
			newState.allParents = data.allParents;
		};
		if (data.parentTree) {
			newState.parentTree = data.parentTree;
			if(data.me.code != 'HP:0000001') {
				newState.parentTree.push(data.me);
			}
		};
		this.setState(newState);
	}

	editDataSource(record) {
		this.setState({
			showPopup: true,
			hotOne: record,
		});
	}

	deleteDataSource(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'rareDiseaseHpo/delete',
			payload: {
				updateParams: {
					id: record.id,
				},
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList.bind(this)
		});
	}

	opRender(text, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editDataSource.bind(this, record)}
			      style={{marginLeft: 16}}>
					<Icon type="edit" theme="outlined"/>编辑
				</span>
		);
		let deleteOp = (
			<span className={styles.ListOpDelete} style={{marginLeft: 16}}>
				<Popconfirm title="确定删除"
				            onConfirm={this.deleteDataSource.bind(this, record)}
				            onCancel={null}
				>
					<Icon type="delete" theme="outlined"/>删除
				</Popconfirm>
			</span>
		);
		return (
			<div>
				{deleteOp}
				{editOp}
			</div>
		);
	}

	codeRender(text, record, index) {
		return (
			<span onClick={this.onClickTreeNode.bind(this, record)}
			      style={{cursor:'pointer', textDecoration:'underline'}}
			>
				{text}
			</span>
		);
	}

	longTextRender(text, record, index) {
		if (!text) {
			return '未知';
		}
		if (text.length < 16) {
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

	onKeywordChange(e) {
		this.setState({
			keyword: e.target.value
		});
	}

	onKeywordSearch(value) {
		this.setState({
			keyword: value,
			page: 1,
		}, this.fetchListData.bind(this, false));
	}

	buildOpBar() {
		const { keyword } = this.state;
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					关键词: <Input.Search style={{ width:'70%'}} placeholder="input search text"
					                   onChange={this.onKeywordChange.bind(this)}
					                   onSearch={this.onKeywordSearch.bind(this)}
					                   value={keyword}
				/>
				</Col>
				<Col span={4} offset={1}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建HPO项</Button>
				</Col>
			</Row>
		);
	}

	onChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState);
	}

	onShowNewPopup() {
		this.setState({
			showPopup: true,
			hotOne: null
		});
	}

	realEditDataSource(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'rareDiseaseHpo/edit',
			payload: {
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList.bind(this)
		});
	}

	onSubmit(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.realEditDataSource.bind(this, record)
		}
		this.setState({
			showPopup: false,
			hotOne: record,
		}, callback);
	}

	onClickTreeNode(record) {
		let callback = this.fetchListData.bind(this, true);
		this.setState({
			page: 1,
			keyword: '',
			parentId: record.id,
			parentCode: record.code,
		}, callback);
	}

	buildTreeNode(record, index, treeAll) {
		let nameA = record.cnName ? record.cnName : record.enName;
		let comp = (
			<span onClick={this.onClickTreeNode.bind(this, record)}>{nameA}</span>
		);
		if (nameA.length > 5) {
			let name = nameA.substr(0, 4) + '...';
			comp = (
				<Popover content={nameA} >
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

	buildParentTagOne(parentOne, index, parentAll) {
		let nameA = parentOne.cnName ? parentOne.cnName : parentOne.en_name;
		let comp = (
			<span onClick={this.onClickTreeNode.bind(this, parentOne)}>{nameA}</span>
		);
		if (nameA.length > 10) {
			let name = nameA.substr(0, 12) + '...';
			comp = (
				<Popover content={nameA} >
					<span onClick={this.onClickTreeNode.bind(this, parentOne)}>{name}</span>
				</Popover>
			);
		}
		return (
			<Tag color="geekblue">{comp}</Tag>
		);
	}

	buildParentTree() {
		const { parentTree, allParents, me } = this.state;
		let show = true;
		if (!allParents || allParents.length < 2) {
			show = false;
		}
		let meName = me.cnName ? me.cnName : me.enName;
		return (
			<Card title="层级结构" size="small" >
				<Breadcrumb separator=">" >
					<Breadcrumb.Item>
						<Icon type="home" />
					</Breadcrumb.Item>
					{parentTree.map(this.buildTreeNode.bind(this))}
				</Breadcrumb>
				{show && <Row style={{marginTop:10}}>{meName}</Row>}
				{show && <Row>
					<Col span={4}>包含多个父节点:</Col>
					<Col span={18} offset={1}>
						{allParents.map(this.buildParentTagOne.bind(this))}
					</Col>
				</Row>}
			</Card>
		);
	}

	render() {
		const { page, pageSize, showPopup, hotOne, data, total } = this.state;
		const columns = [
			{dataIndex:'code', title:'代码', render: this.codeRender.bind(this)},
			{dataIndex:'enName', title:'英文名称', render: this.longTextRender.bind(this)},
			{dataIndex:'cnName', title:'中文名称', render: this.longTextRender.bind(this)},
			{dataIndex:'disabled', title:'状态', render: this.statusRender.bind(this)},
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
				{this.buildParentTree()}
				{this.buildOpBar()}
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
				<RareDiseaseHpoPopup visible={showPopup}
				          item={hotOne}
				          onSubmit={this.onSubmit.bind(this)}
				/>
			</div>
		);
	}
}
