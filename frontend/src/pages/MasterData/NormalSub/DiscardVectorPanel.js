import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, Popconfirm, Modal, Spin } from 'antd';

import styles from '../MasterData.less';
let underscore = require('underscore');


class DiscardOnePanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			name: ''
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.name = item.name;
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
		const { id, name } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!name) {
			message.error('请填写丢弃矢量名称!');
			return;
		}
		let x = {
			id: id,
			name: name,
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		curState[tag] = val.target.value;
		this.setState(curState);
	}

	render() {
		const {id, name } = this.state;
		const { visible } = this.props;
		let title = '新建丢弃矢量';
		if (id) {
			title = '编辑丢弃矢量';
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
						       value={this.state.name} onChange={this.onChange.bind(this, 'name')}
						/>
					</Col>
				</Row>
			</Modal>
		);
	}
}


export default class DiscardVectorPanel extends React.Component {
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
		onQuery('discard_list', params);
	}

	searchDiscardList() {
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
			spinning: false,
			page: page,
			data: data.discardList,
			total: data.total,
		});
	}

	onShowNewPopup() {
		let x = {
			id: 0,
			name: '',
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
					                   onSearch={this.searchDiscardList.bind(this)}
				/>
				</Col>
				<Col span={4} offset={1}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建丢弃矢量</Button>
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
			onQuery('new_discard_one', params);
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
		onQuery('delete_discard_one', params);
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
			<span className={styles.ListOpDisable}>
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
			{dataIndex:'name', title:'错误矢量'},
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
				<DiscardOnePanel visible={showPopup}
						         item={hotOne}
				                 onSubmit={this.onSubmit.bind(this)}
				/>
			</div>
		);
	}
}
