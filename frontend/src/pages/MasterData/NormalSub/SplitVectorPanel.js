import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, Popconfirm, Modal, Spin } from 'antd';

import styles from '../MasterData.less';
let underscore = require('underscore');

const SPLITTYPES = [
	{k:'症状',v:'symptom'},
	{k:'临床表现',v:'symptom_desc'},
	{k:'解刨/生理',v:'symptom_obj'},
	{k:'检查项',v:'exam'},
	{k:'检查指标',v:'exam_item'},
	{k:'病史类型',v:'desc_type'},
];

class SplitOnePanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			name: '',
			text: '',
			type: 'symptom'
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.name = item.name;
			newState.text = item.text;
			newState.type = item.type;
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
		const { id, name, text, type } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!name || !text || !type) {
			message.error('请正确填写分拆矢量名称、分拆方式及类型!');
			return;
		}
		let x = {
			id: id,
			name: name,
			text: text,
			type: type
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['name','text'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	render() {
		const {id, name, text, type } = this.state;
		let disabled = false;
		if (id !== 0) {
			disabled = true
		}
		const { visible } = this.props;
		let title = '新建分拆矢量';
		if (id) {
			title = '编辑分拆矢量';
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
						       value={name}
						       onChange={this.onChange.bind(this, 'name')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>分拆方式:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={text} onChange={this.onChange.bind(this, 'text')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>类型:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}} showArrow={true}
						        value={type}
						        onSelect={this.onChange.bind(this, 'type')}
						>
							{SPLITTYPES.map( o=> <Select.Option key={''+o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Modal>
		);
	}
}


export default class SplitVectorPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',
			data: [],
			total: 0,
			spinning: false,
			showPopup: false,
			hotOne: {},
		};
	}

	componentDidMount() {
		let curState = this.state;
		curState['spinning'] = true;
		this.setState(curState, this.fetchListData());
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
		onQuery('split_list', params);
	}

	searchSplitList() {
		this.setState({
			page: 1,
			spinning: true,
		}, this.fetchListData.bind(this));
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

	updateList(data) {
		let { page, pageSize } = this.state;
		let totalPage = Math.ceil(data.total/pageSize);

		if (totalPage > 0 && page > totalPage) {
			page = totalPage
		}
		this.setState({
			page: page,
			spinning: false,
			data: data.splitList,
			total: data.total,
		});
	}

	onShowNewPopup() {
		let x = {
			id: 0,
			name: '',
			text: '',
			type: 'symptom',
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
					                   onSearch={this.searchSplitList.bind(this)}
				/>
				</Col>
				<Col span={4} offset={1}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建分拆矢量</Button>
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
			callback: this.updateList.bind(this),
		};
		if (record.id === 0) {
			onQuery('new_split_one', params);
		} else {
			onQuery('edit_split_one', params);
		}
	}

	doDeleteItem(record) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				id: record.id,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList.bind(this),
		};
		onQuery('delete_split_one', params);
	}

	onDeleteItem(record) {
		this.setState({
			spinning: true,
		}, this.doDeleteItem.bind(this, record))
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
		const { page, pageSize, showPopup, data, total, hotOne, spinning } = this.state;
		const columns = [
			{dataIndex:'id', title:'ID'},
			{dataIndex:'name', title:'矢量名称'},
			{dataIndex:'text', title:'分拆方式'},
			{dataIndex:'type', title:'类型'},
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
			<div style={{width:1000, backgroundColor:'white', padding:10}}>
				{this.buildOpBar()}
				<Spin spinning={spinning}>
					<Table columns={columns}
					       dataSource={data}
					       pagination={pageOpts}
					/>
				</Spin>
				<SplitOnePanel visible={showPopup}
				                 item={hotOne}
				                 onSubmit={this.onSubmit.bind(this)}
				/>
			</div>
		);
	}
}
