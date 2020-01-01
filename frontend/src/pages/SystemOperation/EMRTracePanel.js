import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, DatePicker, Card, Tag, Modal } from 'antd';
import EMRTracePopup from './EMRTracePopup';
import ElementComponent from '../Template/ElementComponent';

import styles from './VisitInfo.less';
let underscore = require('underscore');
let moment = require('moment');

@connect(({ trackAuthLog }) => ({
	trackAuthLog,
}))
export default class EMRTracePanel extends ElementComponent {
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
			searchRange: [lastMonth, now],
			selectedRowKeys: [],

			showPopup: false,
			hotId: '',

			showDiffPopup: false,
			diffContent: '',
		};
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'trackAuthLog/init',
			payload: this.buildListQueryParams()
		});
	}

	buildListQueryParams() {
		const { page, pageSize, org, operator, department,
			patientId, visitId, searchRange } = this.state;
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
		return params;
	}

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: 'trackAuthLog/fetch',
			payload: this.buildListQueryParams()
		});
	}

	onSearch() {
		this.setState({
			page: 1,
			selectedRowKeys: [],
		}, this.fetchListData.bind(this));
	}

	editItem(record) {
		const { dispatch } = this.props;
		let params = {
			id: record.id,
		};
		dispatch({
			type: 'trackAuthLog/getOne',
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
			showDiffPopup: false,
		});
	}

	opRender(text, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editItem.bind(this, record)}>
				<Icon type="bulb" theme="outlined"/>查看
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
			type: 'trackAuthLog/queryDepartment',
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
		const { orgOpts, deptOpts } = this.props.trackAuthLog;
		const { org, operator, department, patientId, visitId, searchRange } = this.state;
		const Lines = [
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'机构', tag:'org', options: orgOpts
				}, {
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'部门', tag:'department', options: deptOpts
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
			<Button type="primary" onClick={this.onSearch.bind(this)}>搜索</Button>
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

	showDiffPopup(data) {
		this.setState({
			showDiffPopup: true,
			diffContent: data,
		});
	}

	onCompare() {
		const { selectedRowKeys } = this.state;
		if (selectedRowKeys.length != 2) {
			message.error('请选择比较项!');
			return;
		}
		const { dispatch } = this.props;
		dispatch({
			type: 'trackAuthLog/compare',
			payload: {
				left: selectedRowKeys[0],
				right: selectedRowKeys[1]
			},
			callback: this.showDiffPopup.bind(this)
		});
	}

	buildCompareBar() {
		const { selectedRowKeys } = this.state;
		let left = selectedRowKeys.length > 0 ? '参考:'+selectedRowKeys[0]:'';
		let right = selectedRowKeys.length > 1 ? '对比:'+selectedRowKeys[1]:'';
		return (
			<Card title="比较条件" size="small">
				<Col span={14}>
					{left && <Tag color="magenta" >{left}</Tag>}
					{right && <Tag color="geekblue" >{right}</Tag>}
				</Col>
				<Col span={6}>
					<Button type="primary" onClick={this.onCompare.bind(this)}>对比</Button>
				</Col>
			</Card>
		);
	}

	render() {
		const { data, total, detailOne } = this.props.trackAuthLog;
		const { page, pageSize, showPopup, hotId, showDiffPopup, diffContent } = this.state;
		const columns = [
			{dataIndex:'id', title:'ID', fixed:'left'},
			{dataIndex:'visit_start_at', title:'问诊时间'},
			{dataIndex:'created_at', title:'保存时间'},
			{dataIndex:'org_name', title:'机构'},
			{dataIndex:'dept_code', title:'部门代码'},
			{dataIndex:'operator', title:'医生'},
			{dataIndex:'patient_id', title:'病人代码'},
			{dataIndex:'visit_id', title:'门诊号'},
			{dataIndex:'revisit', title:'操作', fixed:'right', render: this.opRender.bind(this)},
		];
		const rowSelection = {
			onChange: (selectedRowKeys, selectedRows) => {
				if (selectedRowKeys.length > 2) {
					message.error('只能选择两条记录比较!');
					return;
				}
				let selectedRowKeysA = [];
				for (let i=0; i<selectedRows.length; i++) {
					let curS = selectedRows[i];
					selectedRowKeysA.push(curS.id);
				}
				this.setState({
					selectedRowKeys: selectedRowKeysA
				});
			},
			getCheckboxProps: record => ({
				disabled: this.state.selectedRowKeys.length >= 2 && this.state.selectedRowKeys.indexOf(record.id) == -1, // Column configuration not to be
				// checked
				name: record.name,
			}),
		};
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
				{this.buildCompareBar()}
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				       scroll={{ x: 1300 }}
				       rowSelection={rowSelection}
				/>
				<EMRTracePopup visible={showPopup}
				               item={detailOne}
				               hotId={hotId}
				               onSubmit={this.hidePopup.bind(this)}
				/>
				<DiffPopup visible={showDiffPopup}
				           content={diffContent}
				           onSubmit={this.hidePopup.bind(this)}
				/>
			</div>
		);
	}
}

class DiffPopup extends React.Component {
	onSubmit() {
		if (this.props.onSubmit) {
			this.props.onSubmit();
		}
	}

	render() {
		const { content, visible } = this.props;
		return (
			<Modal  title="内容差异" visible={visible} closable={false}
			        width={800}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<div id="diff_content" style={{overflow:'auto'}}
					dangerouslySetInnerHTML={{__html:content}}
				/>
			</Modal>
		);
	}
}