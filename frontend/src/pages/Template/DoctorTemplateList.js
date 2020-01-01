import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Card, message, Button, DatePicker, Popover } from 'antd';

import { buildConditionDisplay } from '../Common/Utils';
import styles from './Template.less';
let underscore = require('underscore');
import debounce from "lodash/debounce";
import {routerRedux} from 'dva/router';
let moment = require('moment');

@connect(({ doctorTemplate }) => ({
	doctorTemplate
}))
export default class DoctorTemplateList extends React.Component {
	constructor(props) {
		super(props);
		let now = moment();
		let tenYears = moment().subtract(10, 'years');
		this.state = {
			page: 1,
			pageSize: 10,

			org: '',
			operator: '',
			disease: '',
			searchRange: [tenYears, now],
		};
		this.queryOperator = debounce(this.queryOperator, 500);
		this.queryDisease = debounce(this.queryDisease, 500);
	}

	buildListQueryParams() {
		const { page, pageSize, org, operator, disease, searchRange } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
		};
		if (org) {
			params.org = org;
		}
		if (operator) {
			params.operator = operator;
		}
		if (disease) {
			params.disease = disease;
		}
		if (searchRange.length > 0) {
			params.start = searchRange[0].format('YYYY-MM-DD');
		}
		if (searchRange.length > 1) {
			params.end = searchRange[1].format('YYYY-MM-DD');
		}
		return params;
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'doctorTemplate/init',
			payload: this.buildListQueryParams()
		});
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: 'doctorTemplate/fetch',
			payload: this.buildListQueryParams()
		});
	}

	queryOperator(value) {
		const { dispatch } = this.props;
		const { org } = this.state;
		if (!org) {
			message.error('请先选择机构!');
			return;
		}

		let params = {
			page: 1,
			pageSize: 100,
			operatorId: value,
			orgCode: org
		};
		dispatch({
			type: 'doctorTemplate/queryOperator',
			payload: params
		});
	}

	queryDisease(value) {
		const { dispatch } = this.props;
		const { orgOpts } = this.props.doctorTemplate;
		const { org } = this.state;
		if (!org) {
			message.error('请先选择机构!');
			return;
		}

		let params = {
			page: 1,
			pageSize: 100,
			keyword: value,
		};
		let sourceId = -1;
		for (let i=0; i<orgOpts.length; i++) {
			let curO = orgOpts[i];
			if (curO.code == org) {
				sourceId = curO.source_id;
				break;
			}
		}
		if (!sourceId || sourceId<0) {
			message.error('请更换选择机构,该机构无有效疾病数据源!');
			return;
		}
		params.sourceId = sourceId;
		dispatch({
			type: 'doctorTemplate/queryDisease',
			payload: params
		});
	}

	editDataSource(record) {
		let webPath = `/template/doctor-template-one?id=${record.id}`;
		this.props.dispatch(routerRedux.push(webPath));
	}

	opRender(text, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editDataSource.bind(this, record)}
			      style={{marginLeft: 16}}>
					<Icon type="edit" theme="outlined"/>细节
				</span>
		);
		return (
			<div>
				{editOp}
			</div>
		);
	}

	diagnosisRender(text, record, index) {
		if (!record.conditions) {
			return text;
		}
		let cObj = JSON.parse(record.conditions);
		let content = buildConditionDisplay(cObj);
		return (
			<Popover content={content} title="附加条件">
				<span><sup style={{color:'red'}}>*</sup>{text}</span>
			</Popover>
		);
	}

	buildOpBar1stLine() {
		const { orgOpts, operatorOpts, diseaseOpts } = this.props.doctorTemplate;
		const { org, operator, disease } = this.state;
		return (
			<Row gutter={8} style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					机构: <Select style={{width:'70%'}}
					            value={org}
					            defaultActiveFirstOption={false}
					            showArrow={true} allowClear={true}
					            filterOption={false}
					            onChange={this.onChangeElement.bind(this, 'select', 'org')}
				>
					{orgOpts.map( o=> <Select.Option key={o.code}>{o.name}</Select.Option>)}
				</Select>
				</Col>

				<Col span={8}>
					医生: <Select style={{width:'70%'}}
					            value={operator}
					            defaultActiveFirstOption={false}
					            showArrow={true} allowClear={true} showSearch
					            filterOption={false} notFoundContent={null}
					            onSearch={this.queryOperator.bind(this)}
					            onChange={this.onChangeElement.bind(this, 'select', 'operator')}
				>
					{operatorOpts.map( o=> <Select.Option key={o.operator_id}>
						{o.operator_id}</Select.Option>)}
				</Select>
				</Col>
				<Col span={8}>
					疾病: <Select style={{width:'70%'}}
					            value={disease}
					            defaultActiveFirstOption={false}
					            showArrow={true} allowClear={true} showSearch
					            filterOption={false} notFoundContent={null}
					            onSearch={this.queryDisease.bind(this)}
					            onChange={this.onChangeElement.bind(this, 'select', 'disease')}
				>
					{diseaseOpts.map( o=> <Select.Option key={o.code}>{o.name}</Select.Option>)}
				</Select>
				</Col>
			</Row>
		);
	}

	buildOpBar2ndLine() {
		const { searchRange } = this.state;
		return (
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
		);
	}

	buildOpBar() {
		let extra = (
			<Button type="primary" onClick={this.fetchListData.bind(this)}>查询</Button>
		);
		return (
			<Card title="查询条件" extra={extra}>
				{this.buildOpBar1stLine()}
				{this.buildOpBar2ndLine()}
			</Card>
		);
	}

	onChangeElement(elementType, tag, val, specX) {
		let curState = this.state;
		let realVal = val;
		if (['disease','operator'].indexOf(tag) != -1 && !curState['org']) {
			message.error('请先选择机构,再做疾病查询!');
			return;
		}

		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (elementType == 'checkbox') {
			realVal = val.target.checked;
		}
		let callback = null;
		curState[tag] = realVal;
		this.setState(curState, callback);
	}

	render() {
		const { data, total } = this.props.doctorTemplate;
		const { page, pageSize } = this.state;
		const columns = [
			{dataIndex:'org_name', title:'机构'},
			{dataIndex:'operator_code', title:'医生'},
			{dataIndex:'diagnosis', title:'疾病', render: this.diagnosisRender.bind(this)},
			{dataIndex:'updated_at', title:'最近更新'},
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
			<div style={{width:1000, margin:'auto', backgroundColor:'white', padding:20}}>
				{this.buildOpBar()}
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
			</div>
		);
	}
}
