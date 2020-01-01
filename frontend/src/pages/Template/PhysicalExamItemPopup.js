import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Template.less";

export default class PhysicalExamItemPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		if (!item) {
			return {
				description: '',
				label: '',
				options: [],
				value: [],
				type: 'CHECKBOX'
			};
		}
		// {"label": "呼吸音", "type": "CHECKBOX", "options": [{"display": "呼吸音正常", "props": {"color": "FF00B050"}, "key": "正常", "label": "正常", "value": "0", "addition": null}, {"display": "干罗音", "props": {"color": "FFFF0000"}, "key": "干罗音", "label": "干罗音", "value": "1", "addition": null}, {"display": "湿罗音", "props": {"color": "FFFF0000"}, "key": "湿罗音", "label": "湿罗音", "value": "2", "addition": null}, {"display": "胸膜摩擦音", "props": {"color": "FFFF0000"}, "key": "胸膜摩擦音", "label": "胸膜摩擦音", "value": "3", "addition": null}, {"display": "胸膜摩擦音", "props": {"color": "FFFF0000"}, "key": "语音传导增强", "label": "语音传导增强", "value": "4", "addition": null}, {"display": "胸膜摩擦音", "props": {"color": "FFFF0000"}, "key": "语音传导减弱", "label": "语音传导减弱", "value": "5", "addition": null}, {"display": "胸膜摩擦音", "props": {"color": "FFFF0000"}, "key": "语音传导消失", "label": "语音传导消失", "value": "6", "addition": null}], "description": " "}
		let value = ['0'];
		if (item.value && item.value.length>0) {
			value = item.value;
		}
		let newState = {
			description: item.description,
			label: item.label,
			options: item.options,
			value: value,
			type: item.type
		};
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
		const { label, options, value, description, type } = this.state;
		if (!this.props.onSubmit) {
			return;
		}

		if (!isUpdate) {
			this.props.onSubmit(isUpdate, null);
			return;
		}

		if (!label) {
			message.error('空句段!强制取消');
			this.props.onSubmit(false, null);
			return;
		}

		if (value.length < 2 || value.indexOf('0')==-1) {
			message.error('请选择展示项! 至少包含正常值 且 至少为2项');
			return;
		}

		let optionsAct = [];
		for (let i=0; i<options.length; i++) {
			let optOne = options[i];
			if (value.indexOf(optOne.value) != -1) {
				optionsAct.push(optOne);
			}
		}
		let curData = ['0'];

		// if (optionsAct.length === 2) {
		// 	curType = 'RADIO';
		// 	curData = '0';
		// }

		let x = {
			description: description,
			label: label,
			type: type,
			options: optionsAct,
			value: curData
		};
		this.props.onSubmit(isUpdate, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState);
	}

	render() {
		const { label, options, value } = this.state;
		const { visible } = this.props;
		return (
			<Modal title={'体格检查: ' + label} visible={visible} closable={true}
			       okText="确定" onOk={this.onSubmit.bind(this, true)}
			       cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row style={{textAlign:'center'}}>
					请选择备选展示项
				</Row>
				<Row style={{marginTop: 8}}>
					<Checkbox.Group
						options={options}
						value={value}
						onChange={this.onChange.bind(this, 'value')}
					/>
				</Row>
			</Modal>
		);
	}
}
