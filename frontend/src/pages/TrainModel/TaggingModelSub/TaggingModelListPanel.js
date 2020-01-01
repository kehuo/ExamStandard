import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Popconfirm, message, Button, Tabs,
	Tooltip, DatePicker } from 'antd';
import * as TaskUtils from '../common/TaskTrainUtils';

import styles from '../TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';
let moment = require('moment');

export default class TaggingModelListPanel extends React.Component {
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
		this.props.onQuery('get-task-list', params);
	}

	directFresh() {
		this.fetchListData();
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
		let doNextUpdate = TaskUtils.shouldUpdateListNext(data.tasks);
		this.setState({
			data: data.tasks,
			total: data.total,
		});
		if (doNextUpdate) {
			setTimeout(this.fetchListData.bind(this), 1000*60*2);
		}
	}

	editItem(record) {
		if (!this.props.onSwitchTab) {
			return;
		}
		let params = {
			tab: 'Model',
			id: record.id,
		};
		this.props.onSwitchTab(params);
	}

	nameRender(maxLength, text, record, index) {
		let callback = this.editItem.bind(this, record);
		let component = null;
		let styleTask = { textDecoration:'underline', cursor:'pointer', color:'black' };
		if (['PREPARE','RUNNING'].indexOf(record.status) != -1) {
			styleTask.color = 'green';
			component = (
				<Tooltip title={'处理中... '}>
					<span style={styleTask} onClick={callback}>{text}</span>
				</Tooltip>
			);
		} else if (['PENDING'].indexOf(record.status) != -1) {
			styleTask.color = 'blue';
			component = (
				<Tooltip title={'等待处理 --- '}>
					<span style={styleTask} onClick={callback}>{text}</span>
				</Tooltip>
			);
		} else if (['FAILED','STOP'].indexOf(record.status) != -1) {
			styleTask.color = 'red';
			component = (
				<Tooltip title={'运行失败! ' + record.remark}>
					<span style={styleTask} onClick={callback}>{text}</span>
				</Tooltip>
			);
		} else {
			// 'FINISHED', 'NONE'
			// simple as black
			let iconComp = null;
			if (record.release == 1) {
				iconComp = (<Icon type="bulb" style={{color:'orange'}}/>);
			}
			component = (
				<span style={styleTask} onClick={callback}>{iconComp}{text}</span>
			);;
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
		if (record.release == 1) {
			name = name + ':' + '已发布';
		}
		return name;
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
					<Button type="primary" onClick={this.editItem.bind(this, {id:0})}>新建标注模型</Button>
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
			</div>
		);
	}
}
