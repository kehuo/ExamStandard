import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Tooltip, message, Button, Tag, Card, Collapse } from 'antd';
import TagPopup from './TagPopup';
import * as Const from './TrainDataConfigConstants';
import ElementComponent from '../../Template/ElementComponent';

import styles from '../TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ trainDataConfigOne }) => ({
	trainDataConfigOne
}))
export default class FeatureDesignPanel extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(null);
	}

	initData(data) {
		let newState = {
			id: 0,
			name: '',
			description: '',

			// src options

			// dst options
			use_confirmed_diagnosis: '1',
			use_only_primary_diagnosis: '0',
			remove_icd_pattern: ["R","V","W","X","Y","Z"],
			
		};
		if (!data) {
			return newState;
		}

		return newState;
	}

	updateAll(data) {
		let newState = this.initData(data);
		this.setState(newState);
	}
	
	componentDidMount() {
		const { dispatch } = this.props;
		let query = this.props.location.query;
		if (query.id) {
			let callback = this.updateAll.bind(this);
			dispatch({
				type: 'trainDataConfigOne/fetch',
				payload: {
					id: query.id
				},
				callback: callback,
			});
		}
	}

	onGotSubmitResult(isSuccess) {
		const { dispatch } = this.props;
		if (!isSuccess) {
			message.error('提交训练数据配置方案失败!');
			return;
		}
		message.success('提交训练数据配置成功');
		let webPath = `/train-model/surreal-model?active=TrainDataConfig`;
		dispatch(routerRedux.push(webPath));
	}

	isValidContent() {
		const { id, name, description } = this.state;
		let rst = {
			ok: true, msg:''
		};
		if (!name || !description) {
			rst.ok = false;
			rst.msg = '请填写名称和说明!';
		}
		return rst;
	}

	buildContent() {
		const { id, name, description, binEnum, binValue, number, time, oneHot } = this.state;
		let rst = {
			id: id,
			name: name,
			description: description,
		};

		let content = {
			bin: {},
			number: number,
			time: time,
			one_hot: oneHot
		};
		content.bin.enum = parseInt(binEnum);
		content.bin.value = parseInt(binValue);
		rst.content = JSON.stringify(content);
		return rst;
	}

	onSubmit(isUpdate) {
		const { dispatch } = this.props;
		if (!isUpdate) {
			let webPath = `/train-model/surreal-model?active=TrainDataConfig`;
			dispatch(routerRedux.push(webPath));
			return;
		}

		let rst = this.isValidContent();
		if (!rst.ok) {
			message.error(rst.msg);
			return;
		}

		let params = this.buildContent();
		let callback = this.onGotSubmitResult.bind(this);
		dispatch({
			type: 'trainDataConfigOne/edit',
			payload: params,
			callback: callback,
		});
	}

	buildBasic() {
		const BasicLines = [
			{
				split: 24,
				items: [{
					layout: {title: 4, element: 16}, elementType: 'input',
					title: '名称', tag: 'name'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 4, element: 16}, elementType: 'textArea',
					title: '描述', tag: 'description'
				}]
			},
		];
		let extra = (
			<div>
				<Button type="primary" onClick={this.onSubmit.bind(this, true)}>提交修改</Button>
				<Button style={{marginLeft:6}} onClick={this.onSubmit.bind(this, false)}>返回</Button>
			</div>
		);
		return (
			<Card title="基本信息" type="small" extra={extra}>
				{BasicLines.map(this.renderLine.bind(this))}
			</Card>
		);
	}

	buildItemDescription(item, index, arrayX) {
		return (
			<Row gutter={8}>
				<Col span={6} style={{textAlign:'right', fontWeight:'bold', fontSize:16}}>
					{item.name}
				</Col>
				<Col span={17}>
					{item.description}
				</Col>
			</Row>
		);
	}

	buildDescription(items) {
		return (
			<Collapse bordered={false} defaultActiveKey={[]} style={{marginTop:-16}}>
				<Collapse.Panel header="说明" key="1">
					{items.map(this.buildItemDescription.bind(this))}
				</Collapse.Panel>
			</Collapse>
		);
	}

	buildSrcOption() {
		return (
			<Card title="源信息配置">
				{this.buildDescription(Const.SrcDescription)}
			</Card>
		);
	}

	buildDstOption() {
		const DstLines = [
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'checkboxSimple',
					title:'仅使用确诊', tag:'use_confirmed_diagnosis',
					options: Const.YesNoOpts
				}, {
					layout: {title:6, element:16}, elementType:'checkboxSimple',
					title:'仅使用主诊断', tag:'use_only_primary_diagnosis',
					options: Const.YesNoOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 2, element: 10, inputNumber:8}, elementType: 'selectTags',
					title: '排除ICD前缀', tag: 'remove_icd_pattern',
					options: []
				}]
			},
		];
		return (
			<Card title="目标信息配置">
				{this.buildDescription(Const.DstDescription)}
				<Row style={{height:10}}></Row>
				{DstLines.map(this.renderLine.bind(this))}
			</Card>
		);
	}

	buildOtherOption() {
		return (
			<Card title="其他配置">

			</Card>
		);
	}

	render() {
		return (
			<div style={{minWidth:1000}}>
				{this.buildBasic()}
				{this.buildSrcOption()}
				{this.buildDstOption()}
				{this.buildOtherOption()}
			</div>
		)
	}
}
