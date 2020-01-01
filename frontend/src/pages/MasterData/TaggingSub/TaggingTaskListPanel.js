import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, Popconfirm, Breadcrumb, Popover, Card,
	DatePicker, Tooltip } from 'antd';
import * as TUtils from './TaggingUtils';

import styles from '../MasterData.less';
let underscore = require('underscore');
let moment = require('moment');

export default class TaggingTaskListPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',
			category: 'all',
			status: 'all',
			dateRange: [],

			data: [],
			total: 0,
		};
	}

	componentDidMount() {
		this.fetchListData();
	}

	buildListQueryParams() {
		const { page, pageSize, keyword, category, dateRange, status } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
		};
		if (category != 'all') {
			params.type = category;
		}
		if (status != 'all') {
			params.status = status;
		}
		if (keyword) {
			params.keyword = keyword;
		}
		if (dateRange && dateRange.length>0) {
			const DateFormat = "YYYY-MM-DD";
			let start = dateRange[0].format(DateFormat);
			params.start = start;

			let end = null;
			if (dateRange.length == 2) {
				end = dateRange[1].format(DateFormat);
				params.end = end;
			}
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
		this.setState({
			data: data.tasks,
			total: data.total,
		});
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

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		}
		curState[tag] = realVal;
		let callback = null;
		this.setState(curState, callback);
	}

	buildOpBar() {
		const { keyword, category, dateRange, status } = this.state;
		let extra = (
			<Button type='primary' onClick={this.fetchListData.bind(this)}>搜索</Button>
		);
		return (
			<Card title="搜索条件" extra={extra}>
				<Row style={{margin:6}} gutter={8}>
					<Col span={5}>
						关键词: <Input style={{width:'70%'}}
						       value={keyword}
						       onChange={this.onChangeElement.bind(this, 'input', 'keyword')}
						/>
					</Col>
					<Col span={5} >
						文本类型: <Select style={{width:'60%'}}
						        value={category}
						        defaultActiveFirstOption={false}
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChangeElement.bind(this, 'select', 'category')}
						>
							{TUtils.ContentTypeOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
					<Col span={9} >
						时间范围: <DatePicker.RangePicker style={{width:'80%'}}
						            value={dateRange}
						            onChange={this.onChangeElement.bind(this, 'datePickerSimple', 'dateRange')}
						/>
					</Col>
					<Col span={5} >
						状态: <Select style={{width:'60%'}}
						              value={status}
						              defaultActiveFirstOption={false}
						              showArrow={true}
						              filterOption={false}
						              onChange={this.onChangeElement.bind(this, 'select', 'status')}
						>
							{TUtils.StatusOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Card>
		);
	}

	dictRender(dictMap, text, record, index) {
		let x = dictMap[text];
		if (!x) {
			x = '未知';
		}
		return x;
	}

	textRender(text, record, index) {
		let component = text;
		if (text.length > 8) {
			let showText = text.substring(0, 5) + '...';
			component = (
				<Tooltip title={text}>
					{showText}
				</Tooltip>
			);
		}
		return component;
	}

	editItem(record) {
		if (this.props.onSwitchTab) {
			let params = {
				tabKey: 'TaggingEditor',
				id: record.id
			};
			this.props.onSwitchTab(params);
		};
	}

	onDeleteItem(record) {
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
		onQuery('delete-one', params);
	}

	opRender(text, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editItem.bind(this, record)}>
				<Icon type="edit" theme="outlined"/>做任务
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

	render() {
		const { page, pageSize, keyword, category, data, total,
			dateRange } = this.state;
		const columns = [
			{dataIndex:'id', title:'序号'},
			{dataIndex:'status', title:'状态', render: this.dictRender.bind(this, TUtils.StatusDict)},
			{dataIndex:'updated_at', title:'处理时间'},
			{dataIndex:'emr_category', title:'内容类型', render: this.dictRender.bind(this, TUtils.ContentTypeDict)},
			{dataIndex:'remark', title:'备注', render: this.textRender.bind(this)},
			{dataIndex:'emr_id', title:'操作', render: this.opRender.bind(this)},
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
		)
	}
}