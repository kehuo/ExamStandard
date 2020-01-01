import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');
import ElementComponent from '../Template/ElementComponent';
import debounce from 'lodash/debounce';

import styles from "./RareDisease.less";

export default class CnRareDiseaseMappingPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
		this.queryRareDisease = debounce(this.queryRareDisease, 500);
	}

	initData(item) {
		let newState = {
			id: 0,
			cnRareId: '',
			cnRareOpts: [],

			rareId: '',
			rareOpts: [],
		};
		if (item && item.mappingId) {
			newState.id = item.mappingId;
			newState.cnRareId = '' + item.cnRareId;
			let cnRareName = item.cnRareCnName ? item.cnRareCnName : item.cnRareEnName;
			newState.cnRareOpts = [{k:cnRareName, v:'' + item.cnRareId}];

			newState.rareId = '' + item.rareId;
			let rareName = item.rareCnName ? item.rareCnName : item.rareEnName;
			newState.rareOpts = [{k:rareName, v:'' + item.rareId}];
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
		const { id, cnRareId, rareId } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!rareId || !cnRareId) {
			message.error('请检查名称填写!');
			return;
		}
		let x = {
			id: id,
			cnRareId: parseInt(cnRareId),
			rareId: parseInt(rareId),
		};
		this.props.onSubmit(true, x);
	}

	queryRareDisease(mode, keyword) {
		if (!this.props.onQuery) {
			return;
		}
		let callback = this.updateOpts.bind(this, mode);
		this.props.onQuery(mode, keyword, callback);
	}

	updateOpts(mode, data) {
		let curState = this.state;
		if (mode == 'cnRare') {
			curState.cnRareOpts = data;
		} else if (mode == 'worldRare') {
			curState.rareOpts = data;
		}
		this.setState(curState);
	}

	render() {
		const { id, cnRareOpts, rareOpts } = this.state;
		const { visible } = this.props;
		const lines = [
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectRemote',
					title: '中国罕见病', tag: 'cnRareId',
					searchFunc: this.queryRareDisease.bind(this, 'cnRare'),
					options: cnRareOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectRemote',
					title: '世界罕见病', tag: 'rareId',
					searchFunc: this.queryRareDisease.bind(this, 'worldRare'),
					options: rareOpts
				}]
			},
		];
		let title = '新建映射';
		if (id) {
			title = '编辑映射';
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
