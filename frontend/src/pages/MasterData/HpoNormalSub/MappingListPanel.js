import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, Popconfirm, Divider } from 'antd';

import styles from '../MasterData.less';
let underscore = require('underscore');

export default class MappingListPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',
			data: [],
			total: 0,
		};
	}

	componentDidMount() {
		this.fetchListData();
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
		onQuery('get_mapping_list', params);
	}

	switchTabProcess(params) {
		this.setState({
			page: 1,
			keyword: '',
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

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}


	updateList(data) {
		let { page, pageSize } = this.state;
		let totalPage = Math.ceil(data.total/pageSize);

		if (totalPage > 0 && page > totalPage) {
			page = totalPage
		}
		this.setState({
			data: data.items,
			page: page,
			total: data.total,
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

	searchMappingData() {
		this.setState({
			page: 1,
		}, this.fetchListData.bind(this));
	}

	buildOpBar() {
		const { keyword } = this.state;
		return (
			<Row gutter={8} style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					关键词: <Input.Search style={{width: '80%'}}
					                   value={keyword}
					                   onChange={this.onChangeElement.bind(this, 'input', 'keyword')}
					                   onSearch={this.searchMappingData.bind(this)}
					/>
				</Col>
				<Col span={6}>
					<Button type="primary" onClick={this.editItem.bind(this, null)}>新建映射</Button>
				</Col>
			</Row>
		);
	}

	deleteItem(record) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				deleteParams: record.id,
				queryParams: this.buildListQueryParams()
			},
			callback: this.updateList.bind(this),
		};
		onQuery('delete_mapping_item', params);
	}

	editItem(record) {
		const { onSwitchTab } = this.props;
		if (!onSwitchTab) {
			return;
		}
		onSwitchTab('MappingItem', record);
	}

	opRender(text, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit}
			      onClick={this.editItem.bind(this, record)}>
				<Icon type="edit" theme="outlined"/>编辑
			 </span>
		);
		let discardOp = (
			<span className={styles.ListOpDisable} style={{marginLeft:8}}>
				<Popconfirm title="确定删除"
				            onConfirm={this.deleteItem.bind(this, record)}
				            onCancel={null}>
					<Icon type="delete" theme="outlined" />删除
				</Popconfirm>
			</span>
		);
		return (
			<div>
				{editOp}
				{discardOp}
			</div>
		);
	}

	render() {
		const { page, pageSize, data, total } = this.state;
		const columns = [
			{dataIndex:'id', title:'ID'},
			{dataIndex:'source_text', title:'目标文本'},
			{dataIndex:'hpo_code', title:'HPO代码'},
			{dataIndex:'hpo_name', title:'HPO名称'},
			{dataIndex:'similarity', title:'相似度'},
			{dataIndex:'op', title:'操作', render: this.opRender.bind(this)}
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
			</div>
		);
	}
}