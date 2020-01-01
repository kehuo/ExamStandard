import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
import ElementComponent from './ElementComponent';

let underscore = require("underscore");
let Immutable = require('immutable');
let moment = require('moment');

import styles from "./Template.less";

export default class PersonForm extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {
			birthday: moment(),
			gender: 'M',

			height: '117',
			weight: '21',
			temperature: '37.0',
			pulse: '90',
			respiration: '30',
			SBP: '120',
			DBP: '80',

			complaint: '',
		};
	}

	buildPerson() {
		const lines = [
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'datePickerSimple',
					title:'出生日期', tag:'birthday'
				}, {
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'性别', tag:'gender',
					options:[{k:'女', v:'F'}, {k:'男', v:'M'}]
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '身高', tag: 'height', addonAfter: 'cm'
				}, {
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '体重', tag: 'weight', addonAfter: 'kg'
				}, {
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '体温', tag: 'temperature', addonAfter: '°C'
				}],
			},
			{
				split: 8,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '脉搏', tag: 'pulse', addonAfter: '次/分'
				}, {
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '呼吸', tag: 'respiration', addonAfter: '次/分'
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '收缩压', tag: 'SBP', addonAfter: 'mmHg'
				}, {
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '舒张压', tag: 'DBP', addonAfter: 'mmHg'
				}],
			},
			{
				split: 24,
				items: [{
					layout: {title: 2, element: 16}, elementType: 'textArea',
					title: '主述', tag: 'complaint'
				}],
			}
		];
		return (
			<Card title="问诊信息">
				{lines.map(this.renderLine.bind(this))}
			</Card>
		)
	}

	isValidateContent() {
		const { birthday, gender, height, weight, temperature, pulse, respiration,
			SBP, DBP, complaint } = this.state;
		let valid = true;
		let errMsg = [];
		if (!birthday) {
			errMsg.push('出生日期');
		}
		if (!gender) {
			errMsg.push('性别');
		}
		if (!complaint) {
			errMsg.push('主诉');
		}
		if (errMsg.length > 0) {
			valid = false;
		}
		return {
			valid: valid,
			errMsg: '请填写或选择' + errMsg.join(',')
		}
	}

	getContent() {
		const { birthday, gender, height, weight, temperature, pulse, respiration,
			SBP, DBP, complaint } = this.state;
		let x = {
			birthday: birthday.format('YYYY-MM-DD'),
			gender: gender,
			complaint: complaint,
		};
		if (height) {
			x.height = parseInt(height);
		}
		if (weight) {
			x.weight = parseInt(weight);
		}
		if (temperature) {
			x.temperature = parseFloat(temperature);
		}
		if (pulse) {
			x.pulse = parseInt(pulse);
		}
		if (respiration) {
			x.respiration = parseInt(respiration);
		}
		if (SBP) {
			x.SBP = parseInt(SBP);
		}
		if (DBP) {
			x.DBP = parseInt(DBP);
		}
		return x;
	}

	collect() {
		let rst = this.isValidateContent();
		if (!rst.valid) {
			message.error(rst.errMsg);
			return;
		}

		let x = this.getContent();
		return x;
	}

	render() {
		return (
			<div style={{marginTop:10}}>
				{this.buildPerson()}
			</div>
		);
	}
}
