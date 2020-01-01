import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Checkbox, Icon, Table, Popconfirm, message, Button, Tabs,
	Tooltip, DatePicker, Card } from 'antd';

import styles from './Community.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';
let moment = require('moment');
import debounce from 'lodash/debounce';

@connect(({ exportNlp }) => ({
	exportNlp
}))
export default class ExportAuthLogList extends React.Component {
	constructor(props) {
		super(props);
		let now = moment();
		let last2month = moment().subtract(3, 'months');
		this.state = {
			orgCode: '',
			dateRange: [last2month, now],
			deptCode: '',
			patientId: '',
			visitId: '',

			page: 1,
			pageSize: 10,
		};
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'exportNlp/init',
			payload: this.buildListQueryParams(),
		});
	}

	buildListQueryParams() {
		const { page, pageSize, dateRange, orgCode, deptCode, patientId, visitId, sortCol, sortOrder } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			mode: 'download_list',
		};
		if (orgCode) {
			params.orgCode = orgCode;
		}
		if (deptCode) {
			params.deptCode = deptCode;
		}
		if (patientId) {
			params.patientId = patientId;
		}
		if (visitId) {
			params.visitId = visitId;
		}

		if (sortCol) {
			params.sortCol = sortCol;
		}
		if (sortOrder) {
			params.sortOrder = sortOrder;
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

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: 'exportNlp/fetch',
			payload: this.buildListQueryParams(),
		});
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	goCaseOnePanel(record) {
		let webPath = `/doctor-community/show-nlp?visit_id=${record.visit_id}`;
		this.props.dispatch(routerRedux.push(webPath));
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
		if (tag == 'orgCode') {
			curState['deptCode'] = '';
			if (realVal) {
				callback = this.queryDepartments.bind(this);
			}
		}
		this.setState(curState, callback);
	}

	queryDepartments() {
		const { dispatch } = this.props;
		const { orgCode } = this.state;
		dispatch({
			type: 'exportNlp/queryDepartments',
			payload: {
				page: 1,
				pageSize: 200,
				orgCode: orgCode,
			},
		});
	}

	buildOpBar() {
		const { orgOpts, departmentOpts } = this.props.exportNlp;
		const { dateRange, orgCode, deptCode, patientId, visitId } = this.state;
		let extra = (
			<Button type="primary" onClick={this.fetchListData.bind(this)}>搜索</Button>
		);
		return (
			<Card title="查询条件" size="small" extra={extra}>
				<Row style={{marginTop:10, marginBottom:10}} gutter={8}>
					<Col span={8}>
						机构: <Select style={{width:'80%'}}
						            allowClear
						            value={orgCode}
						            defaultActiveFirstOption={false}
						            showArrow={true}
						            filterOption={false}
						            onChange={this.onChangeElement.bind(this, 'select', 'orgCode')}
						>
							{orgOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
					<Col span={8}>
						科室: <Select style={{width:'80%'}}
						            allowClear
						            value={deptCode}
						            defaultActiveFirstOption={false}
						            showArrow={true}
						            filterOption={false}
						            onChange={this.onChangeElement.bind(this, 'select', 'deptCode')}
						            notFoundContent={null}
						>
							{departmentOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
					<Col span={8}>
						问诊号: <Input style={{width:'80%'}}
						            value={visitId}
						            onChange={this.onChangeElement.bind(this, 'input', 'visitId')}
						/>
					</Col>
				</Row>
				<Row>
					<Col span={8}>
						患者ID: <Input style={{width:'80%'}}
						            value={patientId}
						            onChange={this.onChangeElement.bind(this, 'input', 'patientId')}
						/>
					</Col>
					<Col span={12}>
						日期范围: <DatePicker.RangePicker style={{width:'80%'}}
	                              value={dateRange}
	                              onChange={this.onChangeElement.bind(this, 'datePickerRange', 'dateRange')}
						/>
					</Col>
				</Row>
			</Card>
		);
	}

	idRender(maxLength, text, record, index) {
		let component = (
			<span style={{textDecoration:'underline', cursor:'pointer'}}
			      onClick={this.goCaseOnePanel.bind(this, record)}>{text}</span>
		);
		if (text.length > maxLength) {
			let showText = text.substring(0, maxLength-2) + '...';
			component = (
				<Tooltip title={text}>
					<span style={{textDecoration:'underline', cursor:'pointer'}}
					      onClick={this.goCaseOnePanel.bind(this, record)}>{showText}</span>
				</Tooltip>
			);
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

	handleTableChange(pagination, filters, sorter) {
		this.setState({
			sortCol: sorter.columnKey,
			sortOrder: sorter.order
		}, this.fetchListData.bind(this));
	}

	render() {
		const { total, data } = this.props.exportNlp;
		const { page, pageSize } = this.state;
		const columns = [
			{dataIndex:'visit_id', title:'问诊号', render: this.idRender.bind(this, 32)},
			{dataIndex:'org_name', title:'机构', render: this.textRender.bind(this, 16)},
			{dataIndex:'department_name', title:'科室', render: this.textRender.bind(this, 16)},
			{dataIndex:'patient_id', title:'患者ID', render: this.textRender.bind(this, 32)},
			{dataIndex:'visit_start_at', title:'患者就诊时间', render: this.textRender.bind(this, 32), sorter: true},
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
				{this.buildOpBar()}
				<Table size="small"
				       columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				       onChange={::this.handleTableChange}
				/>
			</div>
		);
	}
}
