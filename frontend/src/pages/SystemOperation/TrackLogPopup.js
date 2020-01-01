import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox, Table } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');
import ElementComponent from '../Template/ElementComponent';

import styles from "../Template/Template.less";

export default class TrackLogPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {
			logList: []
		};
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
		let newState = JSON.parse(JSON.stringify(nextProps.item));
		if (newState.log) {
			newState.logList = JSON.parse(newState.log);
		} else {
			newState.logList = [];
		}

		this.setState(newState);
	}

	onSubmit(isUpdate) {
		this.props.onSubmit();
	}

	limitSizeRender(text, record, index) {
		return (
			<div style={{width:400, wordWrap:'breakWord'}}>
				{text}
			</div>
		)
	}

	render() {
		const { visible } = this.props;
		const { logList } = this.state;
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
					title:'患者Id', tag:'patient_id',
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'门诊号', tag:'visit_id'
				}, {
					layout: {title:6, element:16}, elementType:'label',
					title:'log类型', tag:'type'
				}]
			},
		];
		const columns = [
			{dataIndex:'code', title:'操作编码', fixed: 'left'},
			{dataIndex:'operation', title:'操作类型'},
			{dataIndex:'timestamp', title:'时戳'},
			{dataIndex:'data', title:'日志', render: this.limitSizeRender.bind(this)},
		];
		let title = '详细信息';
		return (
			<Modal  title={title} visible={visible} closable={false}
			        width={800}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row>
					{Lines.map(this.renderLine.bind(this))}
				</Row>
				<Table scroll={{ x: 1000, y:300 }}
						columns={columns}
				       dataSource={logList}
				/>
			</Modal>
		);
	}
}

