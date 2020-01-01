import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Popconfirm, message, Button, Tabs, Card,
	Tooltip, Collapse } from 'antd';
import ElementComponent from '../../Template/ElementComponent';
import * as EmrCaseUtils from './EmrCaseUtils';
import CaseClinicNote from './CaseClinicNote';
import CaseDiagnosis from './CaseDiagnosis';
import CaseExam from './CaseExam';
import GuideDocument from './GuideDocument';

import styles from '../Community.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

export default class CaseOnePanel extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {
			id: 0,  // 0

			visited_at: '',
			hospital: '',
			department: '',
			patientAge: '0岁',
			patientGender: '男',
			revisit: '复诊',

			doctorChecked: 0,
			confirmed: 0,
			diagnosis: '',
			emr: '',
			exam: '',

			rawData: null,
		};
	}

	componentDidMount() {
		this.fetchData();
	}

	directSetId(forceUpdate, id) {
		this.setState({
			id: id
		}, this.fetchData.bind(this));
	}

	fetchData() {
		const { id } = this.state;
		if (!this.props.onQuery) {
			return;
		}
		if (!id) {
			return;
		}
		let params = {
			payload: {
				id: id,
			},
			callback: this.updateAll.bind(this),
		};
		this.props.onQuery('get-emrcase-one', params);
	}

	updateAll(data) {
		// let patient = EmrCaseUtils.makePatient(data.patient_basic);
		this.setState({
			visited_at: data.visitedAt,
			hospital: data.hospital,
			department: data.department,
			revisit: data.revisit ? '复诊':'初诊',

			patientAge: data.age,
			patientGender: data.gender,

			confirmed: data.confirmed,
			doctorChecked: data.checked,

			emr: data.content,
			diagnosis: data.content.diagnosis,
			exam: data.exam,

			rawData: JSON.parse(JSON.stringify(data)),
		});
	}

	getAllContent() {
		const { rawData } = this.state;
		let diagnosis = this.refs['case_diagnosis'].collect();
		let emr = this.refs['case_clinic'].collect();
		if (!emr || !diagnosis) {
			return;
		}

		emr.diagnosis = diagnosis;
		rawData.content = JSON.stringify(emr);
		return rawData;
	}

	saveCase(doctorChecked) {
		if (!this.props.onQuery) {
			return;
		}

		let x = this.getAllContent();
		if (doctorChecked) {
			x.checked = 1;
		}
		let params = {
			payload: x,
			callback: this.fetchData.bind(this),
		};
		this.props.onQuery('edit-emrcase-one', params);
	}

	switchBack2CaseList() {
		if (!this.props.onSwitchTab) {
			return;
		}
		let params = {
			tab: 'EmrCaseList',
		};
		this.props.onSwitchTab(params);
	}

	deleteCase() {
		const { id } = this.state;
		if (!this.props.onQuery) {
			return;
		}
		let params = {
			payload: {
				id: id,
				discard: 1,
			},
			callback: this.switchBack2CaseList.bind(this),
		};
		// this.props.onQuery('delete-emrcase-one', params);
		this.props.onQuery('edit-emrcase-one', params);
	}

	queryDisease(keyword, callback) {
		if (!this.props.onQuery) {
			return;
		}
		let params = {
			payload: {
				page: 1,
				pageSize: 200,
				keyword: keyword,
				type: 'disease',
				isLeaf: 1,
			},
			callback: callback,
		};
		this.props.onQuery('get-master-list', params);
	}

	buildBasic() {
		const { id, visited_at, hospital, department, revisit, patientAge, patientGender,
			doctorChecked } = this.state;
		const basicLines = [
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'序号', tag:'id'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'复诊', tag:'revisit'
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'就诊时间', tag:'visited_at'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'机构', tag:'hospital'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'科室', tag:'department'
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'年龄', tag:'patientAge'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'性别', tag:'patientGender'
				}]
			},
		];
		return (
			<Card title="基本信息">
				{basicLines.map(this.renderLine.bind(this))}
				<Row style={{marginTop:6, textAlign:'center'}}>
					<Button type="primary" onClick={this.saveCase.bind(this, false)}>保存</Button>
					{(doctorChecked == 0) && <Button type="primary" style={{marginLeft:6}}
					        onClick={this.saveCase.bind(this, true)}>审核通过</Button>}
					<Button type="primary" style={{marginLeft:6}}
					        onClick={this.deleteCase.bind(this)}>删除</Button>
				</Row>
			</Card>
		);
	}

	buildDiagnosis() {
		const { diagnosis } = this.state;
		return (
			<CaseDiagnosis ref="case_diagnosis"
				item={diagnosis}
			    onQuery={this.queryDisease.bind(this)}
			/>
		);
	}

	buildClinicNote() {
		const { emr } = this.state;
		return (
			<CaseClinicNote ref="case_clinic"
				item={emr} />
		);
	}

	buildExams() {
		const { exam } = this.state;
		return (
			<CaseExam ref="case_exam"
			          item={exam} />
		);
	}

	onQueryDocument(mode, data, callback) {
		if (!this.props.onQuery) {
			return;
		}
		if (mode == 'list') {
			let params = {
				payload: {
					diagnosis: data,
					page: 1,
					pageSize: 200,
				},
				callback: callback,
			};
			this.props.onQuery('get-guide-list', params);
		} else if (mode == 'one') {
			let params = {
				payload: {
					id: data,
				},
				callback: callback,
			};
			this.props.onQuery('get-guide-one', params);
		}
	}
	
	buildGuideDocument() {
		const { primaryDiagnosis } = this.state;
		return (
			<GuideDocument item={primaryDiagnosis}
			               onQueryDocument={this.onQueryDocument.bind(this)}
			               onQueryDisease={this.queryDisease.bind(this)}
			/>
		);
	}

	render() {
		return (
			<div style={{minWidth:1000, backgroundColor:'white', padding:20}}>
				<Row gutter={8}>
					<Col span={16}>
						{this.buildBasic()}
						{this.buildDiagnosis()}
						{this.buildClinicNote()}
						{this.buildExams()}
					</Col>
					<Col span={8}>
						{this.buildGuideDocument()}
					</Col>
				</Row>
			</div>
		);
	}
}
