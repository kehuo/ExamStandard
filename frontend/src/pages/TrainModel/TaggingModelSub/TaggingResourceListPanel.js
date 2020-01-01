import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Popconfirm, message, Button, Tabs,
	Tooltip, DatePicker } from 'antd';
import TaggingResourcePopup from './TaggingResourcePopup';
import * as TaskUtils from '../common/TaskTrainUtils';

import styles from '../TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';
let moment = require('moment');

export default class TaggingResourceListPanel extends React.Component {
	constructor(props) {
		super(props);
		let now = moment();
		let last2month = moment().subtract(3, 'months');
		this.state = {
			keyword: '',
			dateRange: [last2month, now],

			page: 1,
			pageSize: 10,
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
		const { page, pageSize, dateRange } = this.state;
		let params = {
			type: 'tagging',
			page: page,
			pageSize: pageSize,
		};
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

	fetchListData() {
		if (!this.props.onQuery) {
			return;
		}
		let params = {
			payload: this.buildListQueryParams(),
			callback: this.updateList.bind(this),
		};
		this.props.onQuery('get-data-list', params);
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

	updateList(data) {
		let doNextUpdate = TaskUtils.shouldUpdateListNext(data.items);
		this.setState({
			data: data.items,
			total: data.total,
		});
		if (doNextUpdate) {
			setTimeout(this.fetchListData.bind(this), 1000*60*2);
		}
	}

	editItem(record) {
		this.setState({
			showPopup: true,
			hotOne: record,
		});
	}

	deleteItem(record) {
		if (!this.props.onQuery) {
			return;
		}
		let params = {
			payload: {
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList.bind(this),
		};
		this.props.onQuery('delete-data-one', params);
	}

	realEditItem() {
		const { hotOne  } = this.state;
		if (!this.props.onQuery) {
			return;
		}
		let params = {
			payload: {
				updateParams: hotOne,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList.bind(this),
		};
		this.props.onQuery('edit-data-one', params);
	}

	onSubmitItem(isUpdate, x) {
		let callback = null;
		if (isUpdate) {
			callback = this.realEditItem.bind(this);
		}
		this.setState({
			showPopup: false,
			hotOne: x,
		}, callback);
	}

	onShowNewPopup() {
		let x = {
			id: 0,
			type: 'tagging',
			tag: '',
			description: '',
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	nameRender(maxLength, text, record, index) {
		let component = null;
		if (['PREPARE','RUNNING'].indexOf(record.status) != -1) {
			component = (
				<Tooltip title={'处理中... '}>
					<span style={{color:'green'}}>{text}</span>
				</Tooltip>
			);
		} else if (['PENDING'].indexOf(record.status) != -1) {
			component = (
				<Tooltip title={'等待处理 --- '}>
					<span style={{color:'blue'}}>{text}</span>
				</Tooltip>
			);
		} else if (['FAILED','STOP','NONE'].indexOf(record.status) != -1) {
			component = (
				<Tooltip title={'创建失败! ' + record.remark}>
					<span style={{color:'red'}}>{text}</span>
				</Tooltip>
			);
		} else {
			// 'FINISHED'
			// simple as black
			component = text;
		}
		return component;
	}

	textRender(maxLength, text, record, index) {
		let component = text;
		if (text.length > maxLength) {
			let showText = text.substring(0, maxLength-2) + '...';
			component = (
				<Tooltip title={text}>
					{showText}
				</Tooltip>
			);
		}
		return component;
	}

	statusRender(text, record, index) {
		let name = TaskUtils.StatusMap[text];
		return name;
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
				            onConfirm={this.deleteItem.bind(this, record)}
				            onCancel={null}
				>
					<Icon type="close-circle" theme="outlined" />删除
				</Popconfirm>
			</span>
		);
		if (record.status == 'FAILED') {
			editOp = null;
		}
		return (
			<div>
				{editOp}
				{deleteOp}
			</div>
		);
	}

	buildOpBar() {
		const { dateRange } = this.state;
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					日期范围: <DatePicker.RangePicker style={{width:'80%'}}
					                  value={dateRange}
					                  onChange={this.onChangeElement.bind(this, 'datePickerRange', 'dateRange')}
					/>
				</Col>
				<Col span={4} offset={1}>
					<Button type="primary" onClick={this.fetchListData.bind(this)}>搜索</Button>
				</Col>
				<Col span={4} offset={1}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建标注数据</Button>
				</Col>
			</Row>
		);
	}

	render() {
		const { page, pageSize, total, showPopup, hotOne, data } = this.state;
		const columns = [
			{dataIndex:'tag', title:'标记', render: this.nameRender.bind(this, 32)},
			{dataIndex:'description', title:'描述', render: this.textRender.bind(this, 16)},
			{dataIndex:'status', title:'状态', render: this.statusRender.bind(this)},
			{dataIndex:'created_at', title:'创建时间'},
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
			<div style={{width:1000, backgroundColor:'white', padding:20}}>
				{this.buildOpBar()}
				<Table size="small"
				       columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
				<TaggingResourcePopup visible={showPopup}
				                  item={hotOne}
				                  onSubmit={this.onSubmitItem.bind(this)}
				/>
			</div>
		);
	}
}

