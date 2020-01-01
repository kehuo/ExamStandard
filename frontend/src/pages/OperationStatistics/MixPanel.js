import React from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Tabs, DatePicker, Button, Icon, Table, Tooltip } from 'antd';
import ElementComponent from '../Template/ElementComponent';
import DetailPopup from './DetailPopup';
import { PieChart, LineChart } from './SomeFigures';

let underscore = require('underscore');
import numeral from 'numeral';
import moment from "moment";
import debounce from 'lodash/debounce';

import styles from "./Operation.less";

@connect(({ mixPanel }) => ({
	mixPanel
}))
export default class MixPanel extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {
			rangePickerValue: [moment().subtract(1, 'months'), moment()],
			operators: [],
			departments: [],
			orgs: [],
			diseases: [],

			page: 1,
			pageSize: 10,
			showPopup: false,
			hotItem: {},

			diseasePie: [],
			doctorPie: [],
			usageLines: [],
		};
		this.searchDisease = debounce(this.searchDisease, 500);
	}

	buildQueryParams() {
		const { page, pageSize, operators, departments, orgs, diseases, rangePickerValue } = this.state;

		let params = {
			page: page,
			pageSize: pageSize,

			operators: operators,
			departments: departments,
			orgs: orgs,
			diseases: diseases,
			start: rangePickerValue[0].format('YYYY-MM-DD'),
			end: rangePickerValue[1].format('YYYY-MM-DD'),
		};
		return params;
	}

	componentDidMount() {
		const {dispatch} = this.props;
		dispatch({
			type: 'mixPanel/fetchDepartment',
			payload: {}
		});

		dispatch({
			type: 'mixPanel/fetchOperator',
			payload: {}
		});

		dispatch({
			type: 'mixPanel/fetchAll',
			payload: this.buildQueryParams(),
			callback: this.updateFigures.bind(this)
		});
	}

	updateFigures(data) {
		let doctor = [];
		for (let i=0; i<data.doctor_distribution.length; i++) {
			let curD = data.doctor_distribution[i];
			doctor.push({
				name: curD.operator_id + '@' + curD.operator_name,
				cnt: curD.cnt,
				ratio: curD.ratio,
			});
		}
		this.setState({
			diseasePie: data.disease_distribution,
			doctorPie: doctor,
			usageLines: data.usage_distribution,
		});
	}

	fetchAll() {
		const {dispatch} = this.props;
		dispatch({
			type: 'mixPanel/fetchAll',
			payload: this.buildQueryParams(),
			callback: this.updateFigures.bind(this)
		});

		this.fetchListData();
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (elementType == 'checkbox') {
			realVal = val.target.checked;
		}
		curState[tag] = realVal;
		let callback = null;
		if (['rangePickerValue', 'departments', 'diseases', 'operators'].indexOf(tag) != -1) {
			callback = this.fetchAll.bind(this)
		}
		this.setState(curState, callback);
	}

	searchDisease(keyword) {
		const {dispatch} = this.props;
		if (!keyword) {
			return;
		}
		dispatch({
			type: 'mixPanel/fetchDisease',
			payload: {
				page: 1,
				pageSize: 1000,
				keyword: keyword
			}
		});
	}

	buildSearchBar() {
		const { departmentOpts, operatorOpts, diseaseOpts } = this.props.mixPanel;
		const Lines = [
			{
				split: 24,
				items: [{
					layout: {title: 2, element: 16}, elementType: 'datePickerRange',
					title: '时间范围', tag: 'rangePickerValue'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 2, element: 16}, elementType: 'selectMultiple',
					title: '科室', tag: 'departments', options: departmentOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 2, element: 16}, elementType: 'selectRemoteMultiple',
					title: '诊断', tag: 'diseases', options: diseaseOpts,
					searchFunc: this.searchDisease.bind(this)
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 2, element: 16}, elementType: 'selectMultiple',
					title: '医生', tag: 'operators', options: operatorOpts
				}]
			},
		];
		return (
			<Card title="数据筛选" size="small">
				{Lines.map(this.renderLine.bind(this))}
			</Card>
		)
	}

	buildPieDisease() {
		const { diseasePie } = this.state;
		return (
			<Card title="诊断分布" size="small" bordered={false}>
				<PieChart height={360} width={340}
				          data={diseasePie}
				          centerTitle="病历总量"
				/>
			</Card>
		);
	}

	buildPieDoctor() {
		const { doctorPie } = this.state;
		return (
			<Card title="医生分布" size="small" bordered={false}>
				<PieChart height={360} width={340}
				          data={doctorPie}
				          centerTitle="病历总量"
				/>
			</Card>
		);
	}

	buildLineUsage() {
		const { usageLines } = this.state;
		return (
			<Card title="使用概览" size="small" bordered={false}>
				<LineChart height={360} width={340}
				           xtag="work_date"
				           ctags={['visit_total','visit_count','record_count']}
				           ctagNames={['病历总量','助手使用','病历生成']}
				           data={usageLines}
				/>
			</Card>
		);
	}

	build3Figures() {
		return (
			<Card size="small">
				<Row gutter={16}>
					<Col span={8}>{this.buildPieDisease()}</Col>
					<Col span={8}>{this.buildPieDoctor()}</Col>
					<Col span={8}>{this.buildLineUsage()}</Col>
				</Row>
			</Card>
		)
	}

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: 'mixPanel/fetchList',
			payload: this.buildQueryParams()
		});
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	fields2Render(tagAlt, text, record, index) {
		let name = text;
		if (!name) {
			name = record[tagAlt];
		}
		if (!name) {
			name = '暂无';
		}
		return name;
	}

	longTextRender(maxLen, text, record, index) {
		if (!text) {
			return '未知';
		}
		if (text.length < maxLen) {
			return text;
		}
		let showText = text.substring(0, maxLen-2) + '...';
		let component = (
			<Tooltip title={text}>
				{showText}
			</Tooltip>
		);
		return component;
	}

	opRender(text, record, index) {
		return (
			<span className={styles.ListOpEdit} onClick={this.onShowDetail.bind(this, record)}>
				<Icon type="eye" theme="outlined"/>
			</span>
		);
	}

	onShowDetail(record) {
		this.setState({
			showPopup: true,
			hotItem: record,
		});
	}

	closeDetail() {
		this.setState({
			showPopup: false,
			hotItem: {},
		});
	}

	onExportData() {
		const { dispatch } = this.props;
		dispatch({
			type: 'mixPanel/exportList',
			payload: this.buildQueryParams()
		});
	}

	buildDetailTable() {
		const { data, total } = this.props.mixPanel;
		const { page, pageSize } = this.state;
		const columns = [
			{dataIndex:'visit_date', title:'名称'},
			{dataIndex:'dept_name', title:'科室', render: this.fields2Render.bind(this, 'dept_code')},
			{dataIndex:'disease_name', title:'疾病', render: this.longTextRender.bind(this, 12)},
			{dataIndex:'operator_name', title:'医生', render: this.fields2Render.bind(this, 'operator_id')},
			{dataIndex:'visit_total', title:'书写病历'},
			{dataIndex:'record_count', title:'AI生成病历'},
			{dataIndex:'visit_count', title:'助手使用'},
			{dataIndex:'id', title:'细节', render: this.opRender.bind(this)},
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
			<div>
				<Row style={{marginTop:10, marginBottom:6}}>
					<Button type="primary" onClick={this.onExportData.bind(this)}>导出数据</Button>
				</Row>
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
			</div>
		);
	}

	render() {
		const { showPopup, hotItem } = this.state;
		return (
			<div style={{width:1200, margin:'auto', backgroundColor:'transparent', padding:20}}>
				{this.buildSearchBar()}
				{this.build3Figures()}
				{this.buildDetailTable()}
				<DetailPopup
					visible={showPopup}
				    item={hotItem}
				    onClose={this.closeDetail.bind(this)}
				/>
			</div>
		);
	}
}
