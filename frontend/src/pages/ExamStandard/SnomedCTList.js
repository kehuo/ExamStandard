import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Checkbox, Icon, Table, Breadcrumb, message, Button, Popover,
	Tooltip, Modal, Card } from 'antd';
import ElementComponent from '../Template/ElementComponent';

import styles from './ExamStandard.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

const SNOMED_CT_ROOT = '138875005';

@connect(({ snomedCTList }) => ({
	snomedCTList
}))
export default class SnomedCTList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			parentCode: SNOMED_CT_ROOT,

			parentTree: [],
			showPopup: false,
			hotItem: null,
		};
	}

	componentDidMount() {
		this.fetchListData();
	}

	buildListQueryParams() {
		const {page, pageSize, parentCode} = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			parent: parentCode
		};
		return params;
	}

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: 'snomedCTList/fetch',
			payload: this.buildListQueryParams(),
			callback: this.updateParentTree.bind(this)
		});
	}

	updateParentTree(data) {
		let parentTree = this.state.parentTree;
		if (data.code == SNOMED_CT_ROOT) {
			parentTree = [];
		} else {
			let tgt = -1;
			for (let i=0; i<parentTree.length; i++) {
				let curT = parentTree[i];
				if (curT.code == data.code) {
					tgt = i;
					break;
				}
			}
			if (tgt == -1) {
				// go down level, add the new node
				parentTree.push(data);
			} else {
				parentTree = parentTree.slice(0, tgt+1);
			}
		}
		this.setState({
			parentTree: parentTree,
		});
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	showPopup(record) {
		this.setState({
			showPopup: true,
			hotItem: record,
		});
	}

	onClosePopup(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.updateRecord.bind(this, record);
		}
		this.setState({
			showPopup: false,
		}, callback);
	}

	updateRecord(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'snomedCTList/edit',
			payload: {
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			},
		});
	}

	goDownLevel(record) {
		this.setState({
			parentCode: record.code,
		}, this.fetchListData.bind(this));
	}

	idRender(content, record, index) {
		let component = (
			<span style={{textDecoration:'underline', cursor:'pointer'}}
			      onClick={this.goDownLevel.bind(this, record)}>{content}</span>
		);
		return component;
	}

	textRender(maxLength, content, record, index) {
		let component = content;
		if (content.length > maxLength) {
			let showText = content.substring(0, maxLength-3) + '...';
			component = (
				<Tooltip title={content}>
					{showText}
				</Tooltip>
			);
		}
		return component;
	}

	opRender(content, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.showPopup.bind(this, record)}
			      style={{marginLeft: 16}}>
					<Icon type="edit" theme="outlined"/>编辑
				</span>
		);
		return (
			<div>
				{editOp}
			</div>
		);
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (['checkbox'].indexOf(elementType) != -1) {
			realVal = val.target.checked;
		}
		curState[tag] = realVal;

		let callback = null;
		this.setState(curState, callback);
	}

	onClickTreeNode(record) {
		let callback = this.fetchListData.bind(this);
		this.setState({
			parentCode: record.code,
			keyword: '',
			page: 1,
		}, callback);
	}

	buildTreeNode(record, index, treeAll) {
		if (record.code == SNOMED_CT_ROOT) {
			return null;
		}
		let name = record.cn_name ? record.cn_name : record.en_name;
		let comp = (
			<span onClick={this.onClickTreeNode.bind(this, record)}>{name}</span>
		);
		if (name.length > 20) {
			let nameX = name.substr(0, 4) + '...';
			comp = (
				<Popover content={name} >
					<span onClick={this.onClickTreeNode.bind(this, record)}>{nameX}</span>
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
		return (
			<Card title="层级结构" size="small" >
				<Breadcrumb separator=">" >
					<Breadcrumb.Item>
						<span onClick={this.onClickTreeNode.bind(this, {code: SNOMED_CT_ROOT})}>
							<Icon type="home" />
						</span>
					</Breadcrumb.Item>
					{parentTree.map(this.buildTreeNode.bind(this))}
				</Breadcrumb>
			</Card>
		);
	}

	render() {
		const { total, data } = this.props.snomedCTList;
		const { page, pageSize, showPopup, hotItem } = this.state;
		const columns = [
			{dataIndex:'code', title:'编码', render: this.idRender.bind(this)},
			{dataIndex:'en_name', title:'英文名称', render: this.textRender.bind(this, 40)},
			{dataIndex:'cn_name', title:'中文名称', render: this.textRender.bind(this, 20)},
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
			<div style={{minWidth:1000, backgroundColor:'white', padding:20}}>
				{this.buildParentTree()}
				<Table size="small"
				       columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
				<SnomedCTPopup visible={showPopup}
				          item={hotItem}
				          onSubmit={this.onClosePopup.bind(this)}
				/>
			</div>
		);
	}
}

class SnomedCTPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props);
	}

	initData(props) {
		let newState = {};
		if (props.item) {
			newState = JSON.parse(JSON.stringify(props.item));
		}
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let newState = this.initData(nextProps);
		this.setState(newState);
	}

	onSubmit(isUpdate) {
		const { en_name, cn_name } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!en_name || !cn_name ) {
			message.error('请检查信息是填写!');
			return;
		}

		let x = JSON.parse(JSON.stringify(this.state));
		this.props.onSubmit(true, x);
	}

	render() {
		const Lines = [
			{
				split: 24,
				items: [{
					layout: {title:2, element:21}, elementType:'label',
					title:'编码', tag:'code'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:21}, elementType:'input',
					title:'英文名称', tag:'en_name'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:21}, elementType:'input',
					title:'中文名称', tag:'cn_name'
				}]
			},
		];
		const { visible } = this.props;
		let title = '编辑SNOMED-CT';
		return (
			<Modal  title={title} visible={visible}
			        width={800} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				{Lines.map(this.renderLine.bind(this))}
			</Modal>
		);
	}
}