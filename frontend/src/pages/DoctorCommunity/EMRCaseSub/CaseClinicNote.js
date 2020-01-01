import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Popconfirm, message, Button, Tabs, Card,
	Tooltip, Collapse } from 'antd';
import ElementComponent from '../../Template/ElementComponent';
import * as EmrCaseUtils from './EmrCaseUtils';

import styles from '../Community.less';
let underscore = require('underscore');
let immutable = require('immutable');
import {routerRedux} from 'dva/router';

export default class CaseClinicNote extends ElementComponent {
	constructor(props) {
		super(props);
		// {"complaint": "胃肠型感冒复诊。",
		// "family": "",
		// "past": "",
		// "physical": "神清，精神可，口唇红，咽充血，双肺呼吸音粗，腹部稍胀，触诊软。",
		// "present": "同上，呕吐2天，伴咳嗽，较剧烈，有痰不易咳出，已口服磷酸铝凝胶+维生素B6+可威。"}
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
			complaint: '',
			family: '',
			past: '',
			physical: '',
			present: '',
		};
		if (item) {
			// let itemObj = JSON.parse(item);
			let itemObj = item;
			newState = {
				complaint: itemObj.complaint ? itemObj.complaint:'',
				family: itemObj.family ? itemObj.family:'',
				past: itemObj.past ? itemObj.past:'',
				physical: itemObj.physical ? itemObj.physical:'',
				present: itemObj.present ? itemObj.present:'',
			};
		}
		return newState;
	}

	isValidContent() {
		const { complaint, family, past, physical, present } = this.state;
		let valid = true;
		let errMsg = [];
		if (!complaint) {
			errMsg.push('主诉');
		}
		if (!physical) {
			errMsg.push('体格检查');
		}
		if (!present) {
			errMsg.push('现病史');
		}
		if (errMsg.length > 0) {
			valid = false;
		}
		return {
			valid: valid,
			errMsg: '请填写或选择' + errMsg.join(',')
		}
	}

	collect() {
		const { complaint, family, past, physical, present } = this.state;
		let rst = this.isValidContent();
		if (!rst.valid) {
			message.error(rst.errMsg);
			return null;
		}

		let x = {
			complaint: complaint,
			family: family,
			past: past,
			physical: physical,
			present: present,
		};
		return x;
	}

	render() {
		const lines = [
			{
				split: 24,
				items: [{
					layout: {title: 3, element: 20}, elementType: 'textArea',
					title: '主诉', tag: 'complaint',
					autoSize: { minRows: 1, maxRows: 1 }
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 3, element: 20}, elementType: 'textArea',
					title: '现病史', tag: 'present',
					autoSize: { minRows: 3, maxRows: 3 }
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 3, element: 20}, elementType: 'textArea',
					title: '体格检查', tag: 'physical',
					autoSize: { minRows: 4, maxRows: 4 }
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 3, element: 20}, elementType: 'textArea',
					title: '家族史', tag: 'family',
					autoSize: { minRows: 2, maxRows: 2 }
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 3, element: 20}, elementType: 'textArea',
					title: '既往史', tag: 'past',
					autoSize: { minRows: 2, maxRows: 2 }
				}]
			},
		];
		return (
			<Card style={{marginTop:6}}>
				{lines.map(this.renderLine.bind(this))}
			</Card>
		);
	}
}
