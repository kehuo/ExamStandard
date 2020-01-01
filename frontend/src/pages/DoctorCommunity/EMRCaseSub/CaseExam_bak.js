import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Popconfirm, message, Button, Tabs, Card,
	Tooltip, Collapse, Checkbox } from 'antd';
import ElementComponent from '../../Template/ElementComponent';
import * as EmrCaseUtils from './EmrCaseUtils';

import styles from '../Community.less';
let underscore = require('underscore');
let immutable = require('immutable');
import {routerRedux} from 'dva/router';

export default class CaseExam extends React.Component {
	constructor(props) {
		super(props);
		// {"code": [1], "confirmed": [1], "target": ["急性上呼吸道感染"]}
		this.state = this.updateOne(props.item);
	}

	componentWillReceiveProps(nextProps) {
		let isSame = immutable.is(this.props.item, nextProps.item);
		if (isSame) {
			return;
		}
		let newState = this.updateOne(nextProps.item);
		this.setState(newState);
	}

	updateOne(item) {
		let newState = {
			exams: [],
		};
		if (item) {
			let itemObj = JSON.parse(item);
			let x = [];
			for (let i=0; i<itemObj.length; i++) {
				let curP = itemObj[i];
				// [
				// {"bill_no": "235250C93066444CA249E063B71FC979", "diagnose": "肺炎", "instrument_name": "门急诊血液",
				//  "items": [{"bill_sub_no": "1", "item_name": "平均血红蛋白浓度", "reference": "316-354", "reference_high": "354", "reference_low": "316", "result": "325.00", "unit": "g/L", "value": ""}, {"bill_sub_no": "2", "item_name": "红细胞体积分布", "reference": "11.5-14.5", "reference_high": "14.5", "reference_low": "11.5", "result": "12.20", "unit": "%", "value": ""},],
				// "patient_id": "3004701890", "project_name": "急诊血常规+网织", "report_time": "2017/3/14 11:05:09", "specimen_name": "全血", "status": "7", "visit_id": "8583614011"},

				// {"bill_no": "F3D635FB704C4348876BA7C76D3F1CCC", "diagnose": "肺炎", "instrument_name": "免疫录",
				// "items": [{"bill_sub_no": "1", "item_name": "抗肺炎衣原体抗体IgM", "reference": "阴性-", "reference_high": "", "reference_low": "阴性", "result": "阴性", "unit": "", "value": ""}, {"bill_sub_no": "2", "item_name": "抗肺炎支原体抗体", "reference": "阴性-", "reference_high": "", "reference_low": "阴性", "result": "1：40", "unit": "", "value": ""}],
				// "patient_id": "3004701890", "project_name": "CP;MP", "report_time": "2017/3/15 12:35:03", "specimen_name": "血清", "status": "7", "visit_id": "8583614011"},

				// {"bill_no": "7B44C22914FD407C8D0A15C70B02F153", "diagnose": "肺炎", "instrument_name": "急诊生化",
				// "items": [{"bill_sub_no": "1", "item_name": "C反应蛋白", "reference": "0-10", "reference_high": "10", "reference_low": "0", "result": "11", "unit": "mg/L", "value": "H"}], "patient_id": "3004701890", "project_name": "快CRP", "report_time": "2017/3/14 11:36:32", "specimen_name": "血浆", "status": "7", "visit_id": "8583614011"},

				// {"bill_no": "7B44C22914FD407C8D0A15C70B02F153", "diagnose": "肺炎", "instrument_name": "腹内肿物彩超",
				// "code": "C1077",
				// "items": {"conclusion": "所显示腹腔内未见明显异常肿块声像", "imageDescr": "急诊检查\n    腹腔扫查：腹腔气体多，所显示腹腔内未见明显异常肿块回声。", "diagName": "所显示腹腔内未见明显异常肿块声像", "isAbnormal": "N", "reportTitle": "腹内肿物彩超"}
				// }
				// ]
				let curPNormal = true;
				let curT = null;
				let isLabTest = Array.isArray(curP.items);
				if (isLabTest) {
					for (let i=0; i<curP.items.length; i++) {
						let curI = curP.items[i];
						curI.color = 'black';
						if(curI.result == '阳性') {
							curI.color = 'red';
						} else {
							let result = parseFloat(curI.result);
							let refH = parseFloat(curI.reference_high);
							let refL = parseFloat(curI.reference_low);
							if (!isNaN(result) && !isNaN(refH) && !isNaN(refL)) {
								if (result > refH) {
									curI.color = 'red';
									curI.trend = 'arrow-up';
									curPNormal = false;
								} else if (result < refL) {
									curI.color = 'green';
									curI.trend = 'arrow-down';
									curPNormal = false;
								}
							}
						}
					}
					curT = {
						type: 'LAB_TEST',
						project: curP.project_name,
						items: curP.items,
						normal: curPNormal
					};
				} else {
					let items = curP.items;
					if (items.isAbnormal == 'N') {
						curPNormal = false;
					}
					curT = {
						type: 'EXAM',
						project: items.reportTitle,
						items: items,
						normal: curPNormal
					};
				}
				if (curT) {
					x.push(curT);
				}
			}
			newState = {
				exams: x,
			};
		}
		return newState;
	}

	buildItemOne(itemOne, index, itemAll) {
		let trendComp = null;
		if (itemOne.trend) {
			trendComp = (
				<Icon type={itemOne.trend} style={{color:itemOne.color}}/>
			);
		}
		return (
			<Row>
				<Col span={8}>{itemOne.item_name}</Col>
				<Col span={4} style={{color:itemOne.color}}>{itemOne.result}</Col>
				<Col span={2}>{trendComp}</Col>
				<Col span={4}>{itemOne.unit}</Col>
			</Row>
		);
	}

	buildExamOne(examOne, index, examAll) {
		let color = examOne.normal? 'green':'red';
		let tabComp = (
			<span style={{color:color}}>{examOne.project}</span>
		);
		let comp = null;
		if (examOne.type == 'LAB_TEST') {
			comp =  (
				<Tabs.TabPane tab={tabComp} key={'exam$' + index}>
					{examOne.items.map(this.buildItemOne.bind(this))}
				</Tabs.TabPane>
			);
		} else if (examOne.type == 'EXAM') {
			comp =  (
				<Tabs.TabPane tab={tabComp} key={'exam$' + index}>
					<Row>描述: {examOne.items.imageDescr}</Row>
					<Row>结论: {examOne.items.conclusion}</Row>
				</Tabs.TabPane>
			);
		}
		return comp;
	}

	render() {
		const { exams } = this.state;
		return (
			<Card title="化验和检查">
				<Tabs>
					{exams.map(this.buildExamOne.bind(this))}
				</Tabs>
			</Card>
		);
	}
}
