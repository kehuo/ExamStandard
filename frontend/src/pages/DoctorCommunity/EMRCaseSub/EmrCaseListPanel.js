import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Checkbox, Icon, Table, Popconfirm, message, Button, Tabs,
	Tooltip, DatePicker, Card } from 'antd';

import styles from '../Community.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';
let moment = require('moment');
import debounce from 'lodash/debounce';

export default class EmrCaseListPanel extends React.Component {
	constructor(props) {
		super(props);
		// let now = moment();
		// let last2month = moment().subtract(3, 'months');
		this.state = {
			diagnosis: '',
			diseaseOpts: [],
			dateRange: [],
			exact: true,
			doctorChecked: false,
			revisit: '-1',

			page: 1,
			pageSize: 10,
			data: [],
			total: 0,
		};
		this.onSearchDisease = debounce(this.onSearchDisease, 500);
	}

	componentDidMount() {
		this.fetchListData();
	}

	buildListQueryParams() {
		const { page, pageSize, dateRange, diagnosis, exact, doctorChecked, revisit } = this.state;
		let params = {
			exact: exact ? 1:0,
			checked: doctorChecked ? 1:0,
			page: page,
			pageSize: pageSize,
		};
		if (diagnosis) {
			params.diagnosis = diagnosis;
		}
		if (revisit != '-1') {
			params.revisit = parseInt(revisit);
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

	updateList(data) {
		this.setState({
			data: data.emrs,
			total: data.total,
		});
	}

	fetchListData() {
		if (!this.props.onQuery) {
			return;
		}
		let params = {
			payload: this.buildListQueryParams(),
			callback: this.updateList.bind(this),
		};
		this.props.onQuery('get-emrcase-list', params);
	}

	updateDiseaseOpts(data) {
		let opts = [];
		let nameMap = {};
		for (let i=0; i<data.diseases.length; i++) {
			let name = data.diseases[i].name;
			if (nameMap[name]) {
				continue;
			}
			opts.push({k:name, v:name});
			nameMap[name] = 1;
		}
		this.setState({
			diseaseOpts: opts,
		});
	}

	onSearchDisease(keyword) {
		if (!this.props.onQuery) {
			return;
		}
		let params = {
			payload: {
				page: 1,
				pageSize: 200,
				keyword: keyword,
				type: 'disease',
			},
			callback: this.updateDiseaseOpts.bind(this),
		};
		this.props.onQuery('get-disease-list', params);
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	goCaseOnePanel(record) {
		if (!this.props.onSwitchTab) {
			return;
		}
		let params = {
			tab: 'EmrCaseDetail',
			id: record.id,
		};
		this.props.onSwitchTab(params);
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
		this.setState(curState);
	}

	buildOpBar() {
		const { dateRange, diagnosis, exact, diseaseOpts, doctorChecked, revisit } = this.state;
		let extra = (
			<Button type="primary" onClick={this.fetchListData.bind(this)}>搜索</Button>
		);
		const RevisitOpts = [
			{k:'全部', v:'-1'},{k:'复诊', v:'1'},{k:'初诊', v:'0'},
		];
		return (
			<Card title="查询条件" size="small" extra={extra}>
				<Row style={{marginTop:10, marginBottom:10}} gutter={8}>
					<Col span={9}>
						日期范围: <DatePicker.RangePicker style={{width:'80%'}}
	                              value={dateRange}
	                              onChange={this.onChangeElement.bind(this, 'datePickerRange', 'dateRange')}
					/>
					</Col>
					<Col span={8}>
						诊断: <Select style={{width:'80%'}}
						        showSearch
						        value={diagnosis}
						        defaultActiveFirstOption={false}
						        showArrow={true}
						        filterOption={false}
						        onSearch={this.onSearchDisease.bind(this)}
						        onChange={this.onChangeElement.bind(this, 'select', 'diagnosis')}
						        notFoundContent={null}
						>
							{diseaseOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
					<Col span={6}>
						复诊: <Select style={{width:'80%'}}
						            showSearch
						            value={revisit}
						            defaultActiveFirstOption={false}
						            showArrow={true}
						            filterOption={false}
						            onChange={this.onChangeElement.bind(this, 'select', 'revisit')}
						            notFoundContent={null}
					>
						{RevisitOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
					</Select>
					</Col>
				</Row>
				<Row>
					<Col span={3}>
						<Checkbox checked={exact}
						          onChange={this.onChangeElement.bind(this, 'checkbox', 'exact')}
						/> 精准匹配
					</Col>
					<Col span={3}>
						<Checkbox checked={doctorChecked}
						          onChange={this.onChangeElement.bind(this, 'checkbox', 'doctorChecked')}
						/> 已审核
					</Col>
				</Row>
			</Card>
		);
	}

	idRender(text, record, index) {
		let comp = (
			<span style={{textDecoration:'underline', cursor:'pointer'}}
			      onClick={this.goCaseOnePanel.bind(this, record)}>{text}</span>
		);
		return comp;
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

	// diagnosisRender(maxLength, text, record, index) {
	// 	let showText = text;
	// 	if (text.length > maxLength) {
	// 		showText = text.substring(0, maxLength-2) + '...';
	// 	}
	// 	// {"code": [1, 1], "confirmed": [1, 1], "target": ["急性上呼吸道感染", "中耳炎"]}
	// 	let ones = [];
	// 	let zeros = [];
	// 	let diagText = record.diagnosis_text;
	// 	if (diagText) {
	// 		let x = JSON.parse(record.diagnosis_text);
	// 		for (let i=0; i<x.target.length; i++) {
	// 			let confirmed = x.confirmed[i];
	// 			if (confirmed) {
	// 				ones.push(x.target[i]);
	// 			} else {
	// 				zeros.push(x.target[i]);
	// 			}
	// 		}
	// 	}
	// 	let titleComp = (
	// 		<div>
	// 			<Row>确诊:{ones.join(',')}</Row>
	// 			<Row>待定:{zeros.join(',')}</Row>
	// 		</div>
	// 	);
	// 	let component = (
	// 		<Tooltip title={titleComp}>
	// 			{showText}
	// 		</Tooltip>
	// 	);
	// 	return component;
	// }

	confirmRender(text, record, index) {
		let comp = (
			<span><Icon type="info" style={{color:'red'}}/>待定</span>
		);
		if (text == 1) {
			comp = (
				<span><Icon type="check" style={{color:'green'}}/>确诊</span>
			);
		}
		return comp;
	}

	revisitRender(text, record, index) {
		let comp = (
			<span style={{color:'green'}}>初诊</span>
		);
		if (text == 1) {
			comp = (
				<span style={{color:'blue'}}>复诊</span>
			);
		}
		return comp;
	}

	statusRender(text, record, index) {
		let comp = (
			<span><Icon type="info" style={{color:'red'}}/>未审核</span>
		);
		if (text == 1) {
			comp = (
				<span><Icon type="check" style={{color:'green'}}/>审核通过</span>
			);
		}
		return comp;
	}

	render() {
		const { page, pageSize, total, data } = this.state;
		const columns = [
			{dataIndex:'id', title:'序号', render: this.idRender.bind(this)},
			{dataIndex:'hospital', title:'机构', render: this.textRender.bind(this, 16)},
			{dataIndex:'department', title:'科室', render: this.textRender.bind(this, 16)},
			{dataIndex:'diagnosis', title:'主诊断', render: this.textRender.bind(this, 16)},
			{dataIndex:'confirmed', title:'确诊', render: this.confirmRender.bind(this)},
			{dataIndex:'revisit', title:'复诊', render: this.revisitRender.bind(this)},
			{dataIndex:'checked', title:'状态', render: this.statusRender.bind(this)},
			{dataIndex:'visitedAt', title:'问诊时间'},
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
				/>
			</div>
		);
	}
}