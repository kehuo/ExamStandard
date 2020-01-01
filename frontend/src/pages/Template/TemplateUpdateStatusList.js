import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Card, message, Button, DatePicker } from 'antd';
import TemplateUpdateStatusPopup from './TemplateUpdateStatusPopup';

import styles from './Template.less';
let underscore = require('underscore');
import debounce from "lodash/debounce";
let moment = require('moment');

@connect(({ templateUpdateStatus }) => ({
	templateUpdateStatus
}))
export default class TemplateUpdateStatusList extends React.Component {
	constructor(props) {
		super(props);
		let now = moment();
		let lastMonth = moment().subtract(1, 'months');
		this.state = {
			page: 1,
			pageSize: 10,

			org: '',
			operator: '',
			disease: '',
			searchRange: [lastMonth, now],

			showPopup: false,
			hotOne: {},
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
		params.start = searchRange[0].format('YYYY-MM-DD');
		params.end = searchRange[1].format('YYYY-MM-DD');
		return params;
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'templateUpdateStatus/init',
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
			type: 'templateUpdateStatus/fetch',
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
			type: 'templateUpdateStatus/queryOperator',
			payload: params
		});
	}

	queryDisease(value) {
		const { dispatch } = this.props;
		const { orgOpts } = this.props.templateUpdateStatus;
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
			type: 'templateUpdateStatus/queryDisease',
			payload: params
		});
	}

	queryText(val) {
		const { dispatch } = this.props;
		let params = {};
		dispatch({
			type: 'templateUpdateStatus/queryOperator',
			payload: params,
			callback: this.updateHotItemText.bind(this)
		});
	}

	updateHotItemText(data) {
		let hotOne = this.state;
		// TODO ???
		this.setState({
			hotOne: hotOne
		});
	}

	editDataSource(record) {
		this.setState({
			showPopup: true,
			hotOne: record,
		});
	}

	closePopup() {
		this.setState({
			showPopup: false,
		});
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

	diffRender(text, record, index) {
		let xObj = {};
		if (text) {
			xObj = JSON.parse(text);
		}
		let isDiff = false;
		for (let k in xObj) {
			// {"allergy": [], "family": [], "past": [], "physical": [], "present": {"drop": ["呕吐$symptom#1"], "add":["咳嗽$symptom#1", "皮疹$symptom#0"]}}
			if (k != 'present') {
				continue;
			}
			let kObj = xObj[k];
			if (kObj['drop'] && kObj['drop'].length) {
				isDiff = true;
			} else if (kObj['add'] && kObj['add'].length) {
				isDiff = true;
			}
		}
		let rst = '无更新';
		if (isDiff) {
			rst = (<div className={styles.ListOpEdit}>有更新</div>)
		}
		return rst;
	}

	buildOpBar1stLine() {
		const { orgOpts, operatorOpts, diseaseOpts } = this.props.templateUpdateStatus;
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
		if (['disease','operator'].indexOf(tag) == 'disease' && !curState['org']) {
			message.error('请先选择机构,再做疾病查询!');
			return;
		}

		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (elementType == 'checkbox') {
			realVal = val.target.checked;
		}
		let callback = null;
		// if ([].indexOf(tag) != -1) {
		// 	callback = null;
		// }
		curState[tag] = realVal;
		this.setState(curState, callback);
	}

	render() {
		const { data, total } = this.props.templateUpdateStatus;
		const { page, pageSize, showPopup, hotOne } = this.state;
		const columns = [
			{dataIndex:'org_name', title:'机构'},
			{dataIndex:'operator_code', title:'医生'},
			{dataIndex:'diagnosis', title:'疾病'},
			{dataIndex:'difference', title:'更新', render: this.diffRender.bind(this)},
			{dataIndex:'updated_at', title:'更新时间'},
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
				<TemplateUpdateStatusPopup visible={showPopup}
				                            item={hotOne}
				                            queryText={this.queryText.bind(this)}
				                           onSubmit={this.closePopup.bind(this)}
				/>
			</div>
		);
	}
}
