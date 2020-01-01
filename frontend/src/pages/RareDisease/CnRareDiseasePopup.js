import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');
import ElementComponent from '../Template/ElementComponent';
import { Base64 } from 'js-base64';
import ReactQuill, { Toolbar } from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import styles from "./RareDisease.less";

export default class CnRareDiseasePopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			cnName: '',
			enName: '',
			intro: '',
			detail: '',
			disabled: false,
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.cnName = item.cnName;
			newState.enName = item.enName;
			newState.intro = item.intro;
			newState.detail = item.detail ? Base64.decode(item.detail):'';
			newState.disabled = (item.disabled == 1);
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
		const { id, cnName, enName, intro, detail, disabled } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!cnName && !enName) {
			message.error('请检查名称填写!');
			return;
		}
		let x = {
			id: id,
			cnName: cnName,
			enName: enName,
			intro: intro,
			detail: detail ? Base64.encode(detail):'',
			disabled: disabled ? 1:0,
		};
		this.props.onSubmit(true, x);
	}

	render() {
		const { id, detail } = this.state;
		const { visible } = this.props;
		const lines = [
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'textArea',
					title: '中文名称', tag: 'cnName'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'textArea',
					title: '英文名称', tag: 'enName'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'textArea',
					title: '简介', tag: 'intro'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'checkboxSimple',
					title: '禁用', tag: 'disabled'
				}]
			},
		];
		let title = '新建罕见病';
		if (id) {
			title = '编辑罕见病';
		}

		const modules = {
			toolbar: [
				[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
				[{ 'font': [] }],
				[{ 'size': ['small', false, 'large', 'huge'] }],
				[{ 'color': [] }, { 'background': [] }],
				[{ 'align': [] }],
				[{ 'direction': 'rtl' }],
				['bold', 'italic', 'underline','strike', 'blockquote'],
				[{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
				[{ 'script': 'sub'}, { 'script': 'super' }],
				['link', 'image'],
				['clean']
			],
		};

		// const formats = [
		// 	'header',
		// 	'font', 'size',
		// 	'bold', 'italic', 'underline', 'strike', 'blockquote',
		// 	'list', 'bullet', 'indent',
		// 	'link', 'image'
		// ];

		return (
			<Modal  title={title} visible={visible}
			        maskClosable={false} closable={false} width={600}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				{lines.map(this.renderLine.bind(this))}
				<Row style={{width:'100%', minHeight:400, overflowY:'auto'}}>
					<Divider dashed orientation="left">详细内容</Divider>
					<ReactQuill theme="snow" modules={modules}
					            value={detail}
				            onChange={this.onChangeElement.bind(this, 'richEdit', 'detail')} />
				</Row>
			</Modal>
		);
	}
}
