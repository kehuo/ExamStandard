import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');
import ElementComponent from '../Template/ElementComponent';

import styles from "../Common/Common.less";

export default class StdMedicinePopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			name: '',
			dosage_form: '',
			spec: '',
			content: '',
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.name = item.name;
			newState.dosage_form = item.dosage_form;
			newState.spec = item.spec;
			newState.content = item.content ? item.content : '';
		}
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let newState = this.initData(nextProps.item);
		this.setState(newState);
	}

	onSubmit(isUpdate) {
		const { id, name, dosage_form, spec, content } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!name) {
			message.error('请检查名称填写!');
			return;
		}
		if (content) {
			try {
				let xObj = JSON.parse(content);
			} catch(err) {
				message.error('剂量解释不合法!');
				return;
			}
		}
		let x = {
			id: id,
			name: name,
			dosage_form: dosage_form,
			spec: spec,
			content: content
		};
		this.props.onSubmit(true, x);
	}

	render() {
		const { id } = this.state;
		const { visible } = this.props;
		const lines = [
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '名称', tag: 'name'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'textArea',
					title: '剂型', tag: 'dosage_form'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'textArea',
					title: '包装规格', tag: 'spec'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'textArea',
					title: '剂量解释', tag: 'content'
				}]
			},
		];
		let title = '新建标准药品';
		if (id) {
			title = '编辑标准药品';
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
