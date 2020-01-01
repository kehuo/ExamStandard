import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
import ElementComponent from './ElementComponent';

let underscore = require("underscore");
let Immutable = require('immutable');
let moment = require('moment');
import debounce from 'lodash/debounce';

import styles from "./Template.less";

export default class TemplateQueryCard extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {
			orgCode: '',
			ownerId: '',
			ownerType: '',
			diseaseId: '',
		};
		this.onSearchOperator = debounce(this.onSearchOperator, 500);
		this.onSearchDisease = debounce(this.onSearchDisease, 500);
	}

	isValidateContent() {
		const { orgCode, ownerId, ownerType, diseaseId } = this.state;
		let valid = true;
		let errMsg = [];
		if (!orgCode) {
			errMsg.push('机构');
		}
		if (!ownerId) {
			errMsg.push('所有者');
		}
		if (!ownerType) {
			errMsg.push('类型');
		}
		if (!diseaseId) {
			errMsg.push('疾病');
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
		const { orgCode, ownerId, ownerType, diseaseId } = this.state;
		let rst = this.isValidateContent();
		if (!rst.valid) {
			message.error(rst.errMsg);
			return;
		}
		let x = {
			orgCode: orgCode,
			ownerId: parseInt(ownerId),
			ownerType: ownerType,
			diseaseId: parseInt(diseaseId),
		};
		return x;
	}

	onSearchOperator(keyword) {
		if (this.props.onSearchOperator) {
			const { orgCode, ownerType } = this.state;
			this.props.onSearchOperator(orgCode, ownerType);
		}
	}

	onSearchDisease(keyword) {
		if (this.props.onSearchDisease) {
			this.props.onSearchDisease(keyword);
		}
	}

	render() {
		const { orgOptions, operatorOptions, diseaseOptions } = this.props;
		const lines = [
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'机构', tag:'orgCode',
					options: orgOptions
				}, {
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'类型', tag:'ownerType',
					options: [
						{k:'虚拟组',v:'department'},
						{k:'医生',v:'operator'}
					]
				}, {
					layout: {title:6, element:16}, elementType:'selectRemote',
					title:'所有者', tag:'ownerId',
					searchFunc: this.onSearchOperator.bind(this),
					options: operatorOptions
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:16}, elementType:'selectRemote',
					title:'疾病', tag:'diseaseId',
					searchFunc: this.onSearchDisease.bind(this),
					options: diseaseOptions
				}]
			}
		];
		return (
			<div style={{marginTop:10}}>
				<Card title="模板选择">
					{lines.map(this.renderLine.bind(this))}
				</Card>
			</div>
		)
	}
}
