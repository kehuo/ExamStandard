import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
import ElementComponent from '../Template/ElementComponent';

let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Common.less";

export default class SuggestFormatPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {
			id: 0,
			examOrder: '',
			diagnosis: '',
			prescription: '',
			referral: '',
			org_code: '',
		};
	}

	componentDidMount() {
		if (!this.props.item || !this.props.item.id) {
			return;
		}
		this.initData(this.props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			org_code: '',
			examOrder: '',
			diagnosis: '',
			prescription: '',
			referral: '',
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.org_code = item.org_code;
			if (item.content) {
				let xObj = JSON.parse(item.content);
				newState.examOrder = xObj.examOrder ? xObj.examOrder : '';
				newState.diagnosis = xObj.diagnosis ? xObj.diagnosis : '';
				newState.prescription = xObj.prescription ? xObj.prescription : '';
				newState.referral = xObj.referral ? xObj.referral : '';
			}
		}
		this.setState(newState);
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		this.initData(nextProps.item);
	}

	isValidContent() {
		const { id, org_code, examOrder, diagnosis, prescription } = this.state;
		let msgs = [];
		if (!org_code ) {
			msgs.push('机构不能为空!');
		}
		let rst = {
			ok: (msgs.length == 0),
			msg: msgs.join(',')
		};
		return rst;
	}

	onSubmit(isUpdate) {
		const { id, org_code } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		let rst = this.isValidContent();
		if (!rst.ok ) {
			message.error(rst.msg);
			return;
		}

		let content = {};
		let tags = ['examOrder', 'diagnosis', 'prescription', 'referral'];
		for (let i=0; i<tags.length; i++) {
			let k = tags[i];
			let v = this.state[k];
			if (!v) {
				continue;
			}
			content[k] = v;
		}
		let x = {
			id: id,
			org_code: org_code,
			content: JSON.stringify(content),
		};
		this.props.onSubmit(true, x);
	}

	render() {
		const { id } = this.state;
		const { visible, orgOpts, contentOptions } = this.props;
		let examOrderOpts = contentOptions['examOrder'] ? contentOptions['examOrder'] : [];
		let diagnosisOpts = contentOptions['diagnosis'] ? contentOptions['diagnosis'] : [];
		let prescriptionOpts = contentOptions['prescription'] ? contentOptions['prescription'] : [];
		let referralOpts = contentOptions['referral'] ? contentOptions['referral'] : [];
		const lines = [
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectSimple',
					title: '机构', tag: 'org_code', options: orgOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectSimple',
					title: '检查数据格式', tag: 'examOrder', options: examOrderOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectSimple',
					title: '诊断数据格式', tag: 'diagnosis', options: diagnosisOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectSimple',
					title: '处方数据格式', tag: 'prescription', options: prescriptionOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectSimple',
					title: '转诊数据格式', tag: 'referral', options: referralOpts
				}]
			},
		];
		let title = '新建机构配置';
		if (id) {
			title = '编辑机构配置';
		}
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				{lines.map(this.renderLine.bind(this))}
			</Modal>
		);
	}
}
