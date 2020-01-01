import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');
import ElementComponent from '../Template/ElementComponent';

import styles from "./RareDisease.less";

export default class WorldRareDiseasePopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			dbName: '',
			cnName: '',
			enName: '',
			cnIntro: '',
			enIntro: '',
			objectId: '',
			disabled: false,
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.dbName = item.dbName;
			newState.objectId = item.objectId;
			newState.cnName = item.cnName;
			newState.enName = item.enName;
			newState.cnIntro = item.cnIntro;
			newState.enIntro = item.enIntro;
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
		const { id, dbName, cnName, enName, objectId, cnIntro, enIntro, disabled } = this.state;
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
			dbName: dbName,
			objectId: objectId,
			cnName: cnName,
			enName: enName,
			cnIntro: cnIntro,
			enIntro: enIntro,
			disabled: disabled ? 1:0,
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
					title: '来源', tag: 'dbName'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'textArea',
					title: '源数据ID', tag: 'objectId'
				}]
			},
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
					title: '中文介绍', tag: 'cnIntro'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'textArea',
					title: '英文介绍', tag: 'enIntro'
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
