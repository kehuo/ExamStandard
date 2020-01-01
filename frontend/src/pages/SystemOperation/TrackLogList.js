import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, DatePicker, Card } from 'antd';
import TrackLogPopup from './TrackLogPopup';
import ElementComponent from '../Template/ElementComponent';

import styles from './VisitInfo.less';
let underscore = require('underscore');
let moment = require('moment');

@connect(({ trackLog }) => ({
	trackLog,
}))
export default class TrackLogList extends ElementComponent {
	constructor(props) {
		super(props);
		let now = moment();
		let lastMonth = moment().subtract(1, 'months');
		this.state = {
			page: 1,
			pageSize: 10,

			org: '',
			operator: '',
			department: '',
			patientId: '',
			visitId: '',
			logType: '',
			searchRange: [lastMonth, now],

			showPopup: false,
			hotId: '',
		};
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'trackLog/init',
			payload: this.buildListQueryParams()
		});
	}

	buildListQueryParams() {
		const { page, pageSize, org, operator, department,
			patientId, visitId, searchRange, logType } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
		};
		if (org) {
			params.orgCode = org;
		}
		if (operator) {
			params.operator = operator;
		}
		if (department) {
			params.deptCode = department;
		}
		if (patientId) {
			params.patientId = patientId;
		}
		if (visitId) {
			params.visitId = visitId;
		}
		if (searchRange.length>0) {
			params.start = searchRange[0].format('YYYY-MM-DD');
		}
		if (searchRange.length>1) {
			params.end = searchRange[1].format('YYYY-MM-DD');
		}
		if (logType) {
			params.type = logType;
		}
		return params;
	}

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: 'trackLog/fetch',
			payload: this.buildListQueryParams()
		});
	}

	editItem(record) {
		const { dispatch } = this.props;
		let params = {
			id: record.id,
		};
		dispatch({
			type: 'trackLog/getOne',
			payload: params,
			callback: this.showPopup.bind(this, record.id)
		});
	}

	showPopup(hotId) {
		this.setState({
			showPopup: true,
			hotId: hotId
		});
	}

	hidePopup() {
		this.setState({
			showPopup: false,
		});
	}

	opRender(text, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editItem.bind(this, record)}>
				<Icon type="edit" theme="outlined"/>查看
			</span>
		);
		return (
			<div>
				{editOp}
			</div>
		);
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	queryDepartments() {
		const { dispatch } = this.props;
		const { org } = this.state;
		let params = {
			page: 1,
			pageSize: 100,
			orgCode: org,
		};
		dispatch({
			type: 'trackLog/queryDepartment',
			payload: params
		});
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		}
		curState[tag] = realVal;
		let callback = null;
		if (tag == 'org') {
			callback = this.queryDepartments.bind(this);
		}
		this.setState(curState, callback);
	}

	buildOpBar() {
		const { orgOpts, deptOpts } = this.props.trackLog;
		const { org, operator, department, patientId, visitId, searchRange, logType } = this.state;
		const LogOpts = [
			{k:'预测', v:'DIAGNOSIS'},{k:'模板数据', v:'TEMPLATE_DATA'},{k:'模板', v:'TEMPLATE'}
		];
		const Lines = [
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'机构', tag:'org', options: orgOpts
				}, {
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'部门', tag:'department', options: deptOpts
				},{
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'类型', tag:'logType', options: LogOpts
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'input',
					title:'医生', tag:'operator'
				},{
					layout: {title:6, element:16}, elementType:'input',
					title:'病人', tag:'patientId'
				},{
					layout: {title:6, element:16}, elementType:'input',
					title:'门诊号', tag:'visitId'
				},]
			},
		];
		let extra = (
			<Button type="primary" onClick={this.fetchListData.bind(this)}>搜索</Button>
		);
		return (
			<Card title="搜索条件" extra={extra}>
				{Lines.map(this.renderLine.bind(this))}
				<Row>
					<Col span={10}>
						时间范围: <DatePicker.RangePicker style={{width:'70%'}}
						                              allowClear={true}
						                              value={searchRange}
						                              format="YYYY-MM-DD"
						                              onChange={this.onChangeElement.bind(this, 'rangePicker', 'searchRange')}
					/>
					</Col>
				</Row>
			</Card>
		);
	}

	render() {
		const { data, total, detailOne } = this.props.trackLog;
		const { page, pageSize, showPopup, hotId } = this.state;
		const columns = [
			{dataIndex:'created_at', title:'创建时间'},
			{dataIndex:'org_name', title:'机构'},
			{dataIndex:'dept_code', title:'部门代码'},
			{dataIndex:'operator', title:'医生'},
			{dataIndex:'patient_id', title:'病人代码'},
			{dataIndex:'visit_id', title:'门诊号'},
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
			<div style={{width:1000, backgroundColor:'white', padding:10}}>
				{this.buildOpBar()}
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
				<TrackLogPopup visible={showPopup}
				                item={detailOne}
				                hotId={hotId}
				                onSubmit={this.hidePopup.bind(this)}
				/>
			</div>
		);
	}
}
