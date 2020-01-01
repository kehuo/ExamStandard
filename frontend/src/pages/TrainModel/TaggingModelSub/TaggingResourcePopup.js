import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
import ElementComponent from '../../Template/ElementComponent';

let underscore = require("underscore");
let Immutable = require('immutable');
let moment = require('moment');

import styles from "../TrainModel.less";

export default class TaggingResourcePopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.updateOne(props.item);
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let newState = this.updateOne(nextProps.item);
		this.setState(newState);
	}

	updateOne(item) {
		let newState = {
			id: 0,
			tag: '',
			type: 'tagging',
			description: '',
		};
		if (item && Object.keys(item).length > 0) {
			newState = {
				id: item.id,
				tag: item.tag,
				type: item.type,
				description: item.description,
			};
		}
		return newState;
	}

	buildFormPart() {
		const lines = [
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '标记', tag: 'tag', disabled:true
				}],
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'textArea',
					title: '描述', tag: 'description'
				}],
			}
		];
		return (
			<Card title="标注数据">
				{lines.map(this.renderLine.bind(this))}
			</Card>
		)
	}

	isValidateContent() {
		const { id, description } = this.state;
		let valid = true;
		let errMsg = [];
		if (!description) {
			errMsg.push('描述');
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
		const { id, type, tag, description } = this.state;
		let x = {
			id: id,
			type: type,
			tag: tag,
			description: description,
		};
		return x;
	}

	onSubmit(isUpdate) {
		if (!this.props.onSubmit) {
			return
		}

		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		let rst = this.isValidateContent();
		if (!rst.valid) {
			message.error(rst.errMsg);
			return;
		}

		let x = this.getContent();
		this.props.onSubmit(true, x);
	}

	render() {
		let title = '新建标注数据';
		if (this.state.id) {
			title = '编辑标注数据';
		}
		return (
			<Modal closable={false} title={title}
			       visible={this.props.visible}
			       onCancel={this.onSubmit.bind(this, false)}
			       onOk={this.onSubmit.bind(this, true)}
			>
				{this.buildFormPart()}
			</Modal>
		);
	}
}
