import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Checkbox, Icon, Table, Popconfirm, message, Button, Tabs, Empty,
	Tooltip, DatePicker, Card } from 'antd';
import ElementComponent from '../Template/ElementComponent';

import styles from './ExamStandard.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';
let moment = require('moment');
import debounce from 'lodash/debounce';

@connect(({ ramdisOne }) => ({
	ramdisOne
}))
export default class RamdisOnePanel extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {
			data: {}
		};
	}

	componentDidMount() {
		const { location, dispatch } = this.props;
		let caseId = location.query.id;

		if (!caseId) {
			message.error('无效id!');
			return;
		}

		dispatch({
			type: 'ramdisOne/fetch',
			payload: caseId,
			callback: this.updateAll.bind(this)
		});
	}

	updateCase() {
		const { dispatch } = this.props;
		let data = this.state.data;

		if (!data || !data.id) {
			message.error('非法ID!');
			return;
		}
		if (!this.state.confidence) {
			message.error('请选择可信度!');
			return;
		}

		let xObj = {};
		if (data.cn_context) {
			xObj = JSON.parse(data.cn_context);
		}
		xObj.history_cn = this.state.history_cn;

		dispatch({
			type: 'ramdisOne/update',
			payload: {
				id: data.id,
				cn_context: JSON.stringify(xObj),
				confidence: this.state.confidence,
				memo: this.state.memo,
			},
		});
	}

	buildAgeInfo(x) {
		let rst = '';
		if (!x) {
			return rst;
		}

		if (x.year < 8) {
			if (x.year < 1) {
				if (x.month < 1) {
					rst = x.day + '天';
					if (x.hour > 0) {
						rst = rst + x.hour + '小时';
					}
				} else {
					rst = x.month + '月';
					if (x.day > 0) {
						rst = rst + x.day + '天';
					}
				}
			} else {
				rst = x.year + '岁';
				if (x.month > 0) {
					rst = rst + x.month + '月';
				}
			}
		} else {
			rst = x.ageInYear + '岁';
		}
		return rst;
	}

	updateAll(data) {
		let xObj = {};
		if (data.cn_context && data.cn_context) {
			xObj = JSON.parse(data.cn_context);
		}
		let ethnic_origin = '';
		if (xObj.ethnic_origin) {
			if (xObj.ethnic_origin.mather) {
				ethnic_origin += '母:' + xObj.ethnic_origin.mather;
			}
			if (xObj.ethnic_origin.father) {
				ethnic_origin += '父:' + xObj.ethnic_origin.father;
			}
		}

		let confidence = '未确认';
		if (data.confidence) {
			confidence = data.confidence;
		}
		let memo = data.memo ? data.memo : '';

		let newState = {
			patient_id: data.patient_id,
			gender: xObj['gender'],
			age_of_diagnosis: this.buildAgeInfo(xObj['age_of_diagnosis']),
			age_of_symptoms_onset: this.buildAgeInfo(xObj['age_of_diagnosis']),
			ethnic_origin: ethnic_origin,
			diagnosis_confirmed: xObj['diagnosis_confirmed'] ? '是':'否',
			found_in_newborn: xObj['found_in_newborn'] ? '是':'否',
			country: xObj['country'],
			hospital: xObj['hospital'],
			diagnosis: xObj['diagosis'],
			omim: xObj['omim'],
			history: xObj['history'],
			history_cn: xObj['history_cn'],
			confidence: confidence,
			memo: memo,

			data: data
		};
		this.setState(newState);
	}

	onReturnList() {
		let webPath = `/exam-standard/ramdis-list`;
		this.props.dispatch(routerRedux.push(webPath));
	}

	render() {
		const ConfidenceOpts = [
			{k:'确认100%', v:'确认100%'}, {k:'高于70%', v:'高于70%'}, {k:'低于50%', v:'低于50%'},{k:'未确认', v:'未确认'},
		];
		const Lines = [
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'患者ID', tag:'patient_id'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'性别', tag:'gender'
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'确诊年龄', tag:'age_of_diagnosis'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'发病年龄', tag:'age_of_symptoms_onset'
				},{
					layout: {title:6, element:16}, elementType:'label',
					title:'出生时发现', tag:'found_in_newborn'
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'国家', tag:'country'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'医院', tag:'hospital'
				},{
					layout: {title:6, element:16}, elementType:'label',
					title:'民族', tag:'ethnic_origin'
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'诊断', tag:'diagnosis'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'OMIM', tag:'omim'
				},{
					layout: {title:6, element:16}, elementType:'label',
					title:'确诊', tag:'diagnosis_confirmed'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 2, element: 16}, elementType: 'textArea',
					title: '病历原文', tag: 'history', disabled: true,
					autoSize: { minRows: 8, maxRows: 8 }
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'可信度', tag:'confidence', options: ConfidenceOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 2, element: 16}, elementType: 'textArea',
					title: '病历译文', tag: 'history_cn',
					autoSize: { minRows: 8, maxRows: 8 }
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 2, element: 16}, elementType: 'textArea',
					title: '备注', tag: 'memo',
					autoSize: { minRows: 6, maxRows: 6 }
				}]
			},
		];
		let extra = (
			<Button type="primary" onClick={this.onReturnList.bind(this)}>返回列表</Button>
		);
		return (
			<Card title="Ramdis病案" extra={extra}>
				{Lines.map(this.renderLine.bind(this))}
				<Row style={{textAlign:'center'}}>
					<Button type="primary" onClick={this.updateCase.bind(this)}>更新</Button>
				</Row>
			</Card>
		);
	}
}