import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');
import ElementComponent from '../Template/ElementComponent';
import debounce from 'lodash/debounce';

import styles from "./RareDisease.less";

const onsetOpts = [
	{k:'未知', v:'UNKNOWN'},{k:'先天', v:'CONGENITAL'},{k:'成年人', v:'ADULT'},{k:'婴幼儿', v:'INFANTILE'},
	{k:'未成年', v:'JUVENILE'},{k:'先天', v:'NEONATAL'},{k:'新生儿', v:'CHILDHOOD'},{k:'产前', v:'ANTENATAL'},
	{k:'晚年', v:'LATE'},{k:'中年', v:'MIDDLE_AGE'},{k:'胎儿', v:'FETAL'},{k:'年轻人', v:'YOUNG_ADULT'},
];
const sexOpts = [
	{k:'未知', v:'UNKNOWN'},{k:'女', v:'F'},{k:'男', v:'M'}
];
const frequncyOpts = [
	{k:'未知', v:'UNKNOWN'},{k:'无', v:'NOT'},{k:'偶尔', v:'OCCASIONAL'},{k:'频繁', v:'FREQUENT'},
	{k:'非常频繁', v:'VERY_FREQUENT'},{k:'专性的', v:'OBLIGATE'},{k:'非常罕见', v:'VERY_RARE'},
];

export default class RareDiseaseHpoMappingPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
		this.queryRareDisease = debounce(this.queryRareDisease, 500);
	}

	initData(item) {
		let newState = {
			id: 0,
			hpoId: '',
			hpoOpts: [],

			rareId: '',
			rareOpts: [],

			attrFrequency: "UNKNOWN",
			attrOnset: "UNKNOWN",
			attrSex: "UNKNOWN",
		};
		if (item && item.mappingId) {
			newState.id = item.mappingId;
			newState.hpoId = '' + item.hpoId;
			let cnHPOName = item.hpoCnName ? item.hpoCnName : item.hpoEnName;
			newState.hpoOpts = [{k:cnHPOName, v:'' + item.hpoId}];

			newState.rareId = '' + item.rareId;
			let rareName = item.rareCnName ? item.rareCnName : item.rareEnName;
			newState.rareOpts = [{k:rareName, v:'' + item.rareId}];

			newState.attrFrequency = item.attrFrequency;
			newState.attrOnset = item.attrOnset;
			newState.attrSex = item.attrSex;
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
		const { id, hpoId, rareId, attrFrequency, attrOnset, attrSex } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!rareId || !hpoId) {
			message.error('请检查名称填写!');
			return;
		}
		let x = {
			id: id,
			hpoId: parseInt(hpoId),
			rareId: parseInt(rareId),
			sex: attrSex,
			onset: attrOnset,
			frequency: attrFrequency
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
		if (mode == 'hpo') {
			curState.hpoOpts = data;
		} else if (mode == 'worldRare') {
			curState.rareOpts = data;
		}
		this.setState(curState);
	}

	render() {
		const { id, hpoOpts, rareOpts } = this.state;
		const { visible } = this.props;
		const lines = [
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectRemote',
					title: 'HPO', tag: 'hpoId',
					searchFunc: this.queryRareDisease.bind(this, 'hpo'),
					options: hpoOpts
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
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectSimple',
					title: '频次', tag: 'attrFrequency',
					options: frequncyOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectSimple',
					title: '时间', tag: 'attrOnset',
					options: onsetOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectSimple',
					title: '性别', tag: 'attrSex',
					options: sexOpts
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
