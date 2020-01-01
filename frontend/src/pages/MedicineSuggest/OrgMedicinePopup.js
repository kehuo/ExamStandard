import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');
import ElementComponent from '../Template/ElementComponent';

import styles from "../Common/Common.less";

export default class OrgMedicinePopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			code: '',
			name: '',
			medicine_class: '',
			dosage_form: '',
			spec: '',
			std_code: '',
			common_name: '',
			source_id: '',
			valid_flag: true
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.name = item.name;
			newState.code = item.code;
			newState.medicine_class = item.medicine_class;
			newState.dosage_form = item.dosage_form;
			newState.spec = item.spec;
			newState.std_code = item.std_code;
			newState.common_name = item.common_name;
			newState.source_id = '' + item.source_id;
			newState.valid_flag = item.valid_flag;
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
		const { id, name, code, medicine_class, dosage_form, spec, common_name, std_code, source_id, valid_flag } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!name || !code || !dosage_form || !spec || !source_id || !medicine_class) {
			message.error('请检查名称、代码、类别、剂型、包装规格、数据源填写!');
			return;
		}
		let x = {
			id: id,
			name: name,
			code: code,
			medicine_class: medicine_class,
			dosage_form: dosage_form,
			spec: spec,
			common_name: common_name,
			std_code: std_code,
			source_id: parseInt(source_id),
			valid_flag: valid_flag
		};
		this.props.onSubmit(true, x);
	}

	render() {
		const { id } = this.state;
		const { visible, dataSourceOpts } = this.props;
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
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '代码', tag: 'code'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '类别', tag: 'medicine_class'
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
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '通用名', tag: 'common_name'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '医保编码', tag: 'std_code'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectSimple',
					title: '数据源', tag: 'source_id', options: dataSourceOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'checkboxSimple',
					title: '启用', tag: 'valid_flag'
				}]
			},
		];
		let title = '新建机构药品';
		if (id) {
			title = '编辑机构药品';
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
