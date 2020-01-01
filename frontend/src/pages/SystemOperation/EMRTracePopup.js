import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox, Table } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');
import ElementComponent from '../Template/ElementComponent';

import styles from "../Template/Template.less";

export default class EMRTracePopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(null);
	}

	initData(item) {
		let newState = {
			org_name: '',
			depart_name: '',
			operator: '',
			visit_id: '',
			patient_id: '',
			revisit: '初诊',
			visit_start_at: '',
			created_at: '',

			patient_birthday: '',
			patient_gender: '男',

			emr_complaint: '',
			emr_present: '',
			emr_physical: '',
			emr_past: '',
			emr_allergy: '',
			emr_family: '',
			emr_diagnosis: '',
		};
		if (item) {
			newState.org_name = item.org_code + ' : ' + item.org_name;
			newState.depart_name = item.dept_code + ' : ' + item.department_name;
			newState.operator = item.operator + ' : ' + item.operator_name;
			newState.visit_id = item.visit_id;
			newState.patient_id = item.patient_id;
			newState.revisit = item.revisit ? '复诊':'初诊';
			newState.visit_start_at = item.visit_start_at;
			newState.created_at = item.created_at;

			if (item.patient_info) {
				let patientObj = JSON.parse(item.patient_info);
				newState.patient_birthday = patientObj.birthday;
				newState.patient_gender = patientObj.gender == 'M' ? '男':'女';
			}

			if (item.emr_content) {
				let emrObj = JSON.parse(item.emr_content);
				newState.emr_complaint = emrObj.complaint;
				newState.emr_present = emrObj.present;
				newState.emr_physical = emrObj.physical;
				newState.emr_past = emrObj.past;
				newState.emr_allergy = emrObj.allergy;
				newState.emr_family = emrObj.family;

				let diagnosis = [];
				for (let i=0; i<emrObj.diagnosis.length; i++) {
					let curD = emrObj.diagnosis[i];
					diagnosis.push(curD.name);
				}
				newState.emr_diagnosis = diagnosis.join(',');
			}
		}
		return newState;
	}

	componentDidMount() {
		//TODO ???
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let sameItem = (this.props.hotId == nextProps.hotId);
		if (sameItem) {
			return;
		}
		let newState = this.initData(nextProps.item);
		this.setState(newState);
	}

	onSubmit(isUpdate) {
		this.props.onSubmit();
	}
	
	render() {
		const { visible } = this.props;
		const { logList } = this.state;
		const Lines = [
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'机构', tag:'org_name',
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'科室', tag:'depart_name'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'医生', tag:'operator'
				}]
			},
			{
				split: 6,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'类型', tag:'revisit',
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'门诊号', tag:'visit_id'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'问诊时间', tag:'visit_start_at'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'保存时间', tag:'created_at'
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'患者Id', tag:'patient_id',
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'出生日期', tag:'patient_birthday'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'性别', tag:'patient_gender'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:20}, elementType:'label',
					title:'主诉', tag:'emr_complaint',
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:20}, elementType:'textArea',
					title:'现病史', tag:'emr_present',
					disabled: false
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:20}, elementType:'textArea',
					title:'体格检查', tag:'emr_physical',
					disabled: false
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:20}, elementType:'textArea',
					title:'既往史', tag:'emr_past',
					disabled: false
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:20}, elementType:'textArea',
					title:'过敏史', tag:'emr_allergy',
					disabled: false
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:20}, elementType:'label',
					title:'家族史', tag:'emr_family',
					disabled: false
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:20}, elementType:'label',
					title:'诊断', tag:'emr_diagnosis',
				}]
			},
		];
		let title = '详细信息';
		return (
			<Modal  title={title} visible={visible} closable={false}
			        width={800}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row>
					{Lines.map(this.renderLine.bind(this))}
				</Row>
			</Modal>
		);
	}
}
