import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, Popconfirm, Breadcrumb, Popover, Card } from 'antd';
import ExtensionPopup from './ExtensionPopup';

import styles from '../MasterData.less';
let underscore = require('underscore');

export default class SearchPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',
			selectType: 'all',

			data: [],
			total: 0,
		};
	}

	buildListQueryParams() {
		const { page, pageSize, keyword, selectType } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			type: selectType,
			keyword: keyword,
		};
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
		onQuery(params);
	}

	updateList(data) {
		this.setState({
			data: data.items,
			total: data.total,
		});
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	onSearchClick() {
		const { keyword } = this.state;
		if (!keyword) {
			message.error('请输入关键词!');
			return;
		}
		this.setState({
			page: 1,
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

	buildOps() {
		const  { keyword, selectType } = this.state;
		const options = [
			{k:'all',v:'all'}, {k:'symptom',v:'symptom'}, {k:'disease',v:'disease'},
			{k:'medicine',v:'medicine'}, {k:'treatment',v:'treatment'}, {k:'exam',v:'exam'},
		];
		return (
			<Row>
				<Col span={6}>
					类型: <Select style={{width:'70%'}}
					            value={selectType}
					            defaultActiveFirstOption={false}
					            showArrow={true}
					            filterOption={false}
					            onChange={this.onChangeElement.bind(this, 'select', 'selectType')}
					>
						{options.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
					</Select>
				</Col>
				<Col span={6} offset={1}>
					关键词: <Input style={{width:'70%'}}
					            value={keyword}
					            onChange={this.onChangeElement.bind(this, 'input', 'keyword')}
					/>
				</Col>
				<Col span={3} offset={1}>
					<Button onClick={this.onSearchClick.bind(this)}>搜索</Button>
				</Col>
			</Row>
		);
	}

	onItemClick(record) {
		if (this.props.onSwitchTab) {
			this.props.onSwitchTab(record);
		}
	}

	nameRender(text, record, index) {
		return (
			<span onClick={this.onItemClick.bind(this, record)}
			      style={{cursor:'pointer', textDecoration:'underline'}}
			>
				{text}
			</span>
		);
	}

	render() {
		const { page, pageSize, data, total } = this.state;
		const columns = [
			{dataIndex:'name', title:'名称', width:'40%', render: this.nameRender.bind(this)},
			{dataIndex:'type', title:'类型'},
			{dataIndex:'code', title:'编码'},
			{dataIndex:'source', title:'来源'},
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
				{this.buildOps()}
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
			</div>
		);
	}
}
