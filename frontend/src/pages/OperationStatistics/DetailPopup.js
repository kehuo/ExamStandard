import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tag, Button, Card, Modal, message,
	Divider, Radio, Checkbox, Tooltip } from "antd";
import ElementComponent from '../Template/ElementComponent';

let underscore = require("underscore");
let Immutable = require('immutable');
import debounce from "lodash/debounce";

import styles from "./Operation.less";

export default class DetailPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	initData(item) {
		let newState = JSON.parse(JSON.stringify(item));
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

	buildGeneral() {
		const LinesGeneral = [
			{
				split: 8,
				items: [{
					layout: {title:10, element:13}, elementType:'label',
					title:'使用次数', tag:'visit_count'
				},{
					layout: {title:10, element:13}, elementType:'label',
					title:'智能服务调用', tag:'api_call_count'
				}, {
					layout: {title:10, element:13}, elementType:'label',
					title:'平均停留时间', tag:'time_avg'
				}]
			},
		];
		return (
			<Card size="small" bordered={false} title="助手使用概览">
				{LinesGeneral.map(this.renderLine.bind(this))}
			</Card>
		);
	}

	buildTemplateDetail() {
		const LinesTemplate = [
			{
				split: 8,
				items: [{
					layout: {title:10, element:13}, elementType:'label',
					title:'病历生成', tag:'record_count'
				}, {
					layout: {title:10, element:13}, elementType:'label',
					title:'平均停留时间', tag:'generate_time_avg'
				}, {
					layout: {title:10, element:13}, elementType:'label',
					title:'平均页面操作', tag:'generate_click_avg'
				}]
			},
		];
		return (
			<Card size="small" bordered={false} title="病历书写">
				{LinesTemplate.map(this.renderLine.bind(this))}
			</Card>
		);
	}

	buildGrowthInfoDetail() {
		const LinesGrowthInfo = [
			{
				split: 8,
				items: [{
					layout: {title:10, element:13}, elementType:'label',
					title:'查看曲线', tag:'growth_info_count'
				}, {
					layout: {title:10, element:13}, elementType:'label',
					title:'平均停留时间', tag:'growth_info_time_avg'
				}, {
					layout: {title:10, element:13}, elementType:'label',
					title:'平均页面操作', tag:'growth_info_edit_count'
				}]
			},
		];
		return (
			<Card size="small" bordered={false} title="生长曲线">
				{LinesGrowthInfo.map(this.renderLine.bind(this))}
			</Card>
		);
	}

	buildPrescriptionDetail() {
		const LinesPrescription = [
			{
				split: 8,
				items: [{
					layout: {title:10, element:13}, elementType:'label',
					title:'查看处方', tag:'prescription_count'
				}, {
					layout: {title:10, element:13}, elementType:'label',
					title:'平均停留时间', tag:'prescription_time_avg'
				}]
			},
		];
		return (
			<Card size="small" bordered={false} title="处方推荐">
				{LinesPrescription.map(this.renderLine.bind(this))}
			</Card>
		);
	}

	buildRareDetail() {
		const LinesRare = [
			{
				split: 8,
				items: [{
					layout: {title:10, element:13}, elementType:'label',
					title:'查看罕见病', tag:'rare_disease_count'
				}, {
					layout: {title:10, element:13}, elementType:'label',
					title:'平均停留时间', tag:'rare_disease_time_avg'
				}, {
					layout: {title:10, element:13}, elementType:'label',
					title:'平均页面操作', tag:'rare_disease_edit_count'
				}]
			},
		];
		return (
			<Card size="small" bordered={false} title="罕见病">
				{LinesRare.map(this.renderLine.bind(this))}
			</Card>
		);
	}

	render() {
		const { visible, onClose } = this.props;
		let title = '助手使用详情';
		let footer = (
			<Button type="primary" onClick={onClose}>确定</Button>
		);
		return (
			<Modal  title={title} visible={visible} closable={false}
			        footer={footer} width={800}
			>
				<Row style={{fontSize:20, fontWeight:'bold'}}>
					{'诊断: ' + this.state.disease_name}
				</Row>
				{this.buildGeneral()}
				{this.buildTemplateDetail()}
				{this.buildGrowthInfoDetail()}
				{this.buildPrescriptionDetail()}
				{this.buildRareDetail()}
			</Modal>
		);
	}
}
