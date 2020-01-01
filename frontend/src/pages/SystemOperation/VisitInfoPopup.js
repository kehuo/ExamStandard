import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');
import ElementComponent from '../Template/ElementComponent';

import styles from "../Template/Template.less";

export default class VisitInfoPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		//TODO ???
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let sameItem = (this.props.hotId == nextProps.hotId);
		if (sameItem) {
			return;
		}
		this.setState(nextProps.item);
	}

	onSubmit(isUpdate) {
		this.props.onSubmit();
	}

	render() {
		const { visible } = this.props;
		const Lines = [
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'机构', tag:'org_code',
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'科室', tag:'dept_code'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'创建时间', tag:'created_at'
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'患者ID', tag:'patient_id',
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'门诊号', tag:'visit_id'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'更新时间', tag:'updated_at'
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'性别', tag:'gender',
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'出生时间', tag:'birthday'
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'复诊标志', tag:'revisit',
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'就诊时间', tag:'visit_start_at'
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'label',
					title:'诊断', tag:'diagnosis',
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'诊断代码', tag:'diagnosis_code'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'textArea',
					title:'推送信息', tag:'emr_content', disabled:true
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'textArea',
					title:'主诉', tag:'complaint', disabled:true
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'textArea',
					title:'现病史', tag:'present', disabled:true
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'textArea',
					title:'体格检查', tag:'physical', disabled:true
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'textArea',
					title:'体征', tag:'physical_sign', disabled:true
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'textArea',
					title:'推荐信息', tag:'suggest', disabled:true
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'textArea',
					title:'模板信息', tag:'template', disabled:true
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'textArea',
					title:'医生诊断', tag:'doctor_diagnosis', disabled:true
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'textArea',
					title:'主诉矢量', tag:'complaint_entities', disabled:true
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'textArea',
					title:'现病史矢量', tag:'present_entities', disabled:true
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'textArea',
					title:'体格检查矢量', tag:'physical_exam', disabled:true
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'textArea',
					title:'模板信息', tag:'tpl_infos', disabled:true
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'textArea',
					title:'推荐用药', tag:'rec_medicines', disabled:true
				}]
			},
		];

		let title = '详细信息';
		return (
			<Modal  title={title} visible={visible} closable={false}
			        width={800}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<div style={{height:800, overflowY:'auto'}}>
					{Lines.map(this.renderLine.bind(this))}
				</div>
			</Modal>
		);
	}
}

