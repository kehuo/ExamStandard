import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');
import ElementComponent from '../Template/ElementComponent';
import debounce from "lodash/debounce";

import styles from "./Medicine.less";

export default class MedicineMappingPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
		this.queryMedicine = debounce(this.queryMedicine, 500);
	}

	initData(item) {
		let newState = {
			id: 0,
			dataSource: '',

			bb_medicine_id: '',
			stdOpts: [],

			medicine_id: '',
			orgOpts: [],

			content: '',
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.dataSource = '' + item.source_id,
			newState.bb_medicine_id = '' + item.bb_medicine_id;
			newState.stdOpts = [{k:item.bb_medicine_name, v:'' + item.bb_medicine_id}];
			newState.medicine_id = '' + item.medicine_id;
			newState.orgOpts = [{k:item.medicine_name, v:'' + item.medicine_id}];
			newState.content = item.content ? item.content : '';
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
		const { id, bb_medicine_id, medicine_id, content } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!bb_medicine_id || !medicine_id) {
			message.error('请检查标准药品和机构药品填写!');
			return;
		}
		if (content) {
			try {
				let xObj = JSON.parse(content);
			} catch(err) {
				message.error('剂量解释不合法!');
				return;
			}
		}
		let x = {
			id: id,
			bb_medicine_id: parseInt(bb_medicine_id),
			medicine_id: parseInt(medicine_id),
		};
		this.props.onSubmit(true, x);
	}

	queryMedicine(mode, keyword) {
		const { dataSource } = this.state;
		let params = {
			mode: mode,
			keyword: keyword,
			page: 1,
			pageSize: 1000,
		};
		if (mode == 'organization') {
			if (!dataSource) {
				message.error('请选择数据源!');
				return;
			}
			params.dataSource = dataSource;
		}
		this.props.queryMedicine(params, this.updateOpts.bind(this, mode));
	}

	updateOpts(mode, items) {
		if (mode == 'organization') {
			this.setState({
				orgOpts: items,
			});
		} else {
			this.setState({
				stdOpts: items,
			});
		}
	}

	render() {
		const { id, stdOpts, orgOpts } = this.state;
		const { visible, dataSourceOpts } = this.props;
		const lines = [
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectRemote',
					title: '标准药品名', tag: 'bb_medicine_id', options: stdOpts,
					searchFunc: this.queryMedicine.bind(this, 'standard')
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectSimple',
					title: '数据源', tag: 'dataSource', options: dataSourceOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectRemote',
					title: '机构药品名', tag: 'medicine_id', options: orgOpts,
					searchFunc: this.queryMedicine.bind(this, 'organization')
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'textArea',
					title: '剂量解释', tag: 'content'
				}]
			},
		];
		let title = '新建标准药品';
		if (id) {
			title = '编辑标准药品';
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
