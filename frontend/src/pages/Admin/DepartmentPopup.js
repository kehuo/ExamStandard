import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Org.less";

export default class DepartmentPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			code: '',
			name: '',
			org_code: '',
			disabled: false,
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.code = item.code;
			newState.name = item.name;
			newState.org_code = item.org_code;
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
		const { id, name, code, org_code, disabled } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!org_code || !code) {
			message.error('请检查机构、代码等信息是否选择或填写!');
			return;
		}
		let x = {
			id: id,
			name: name,
			code: code,
			org_code: org_code,
			disabled: (disabled ? 1: 0),
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['code','name'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	render() {
		const {id, name, code, org_code, disabled } = this.state;
		const { visible, orgOptions } = this.props;
		let title = '新建科室';
		if (id) {
			title = '编辑科室';
		}
		let footer = (
			<Row style={{textAlign:'center'}}>
				<Button type="primary" onClick={this.onSubmit.bind(this, true)}>确定</Button>
				<Button type="default" onClick={this.onSubmit.bind(this, false)}>取消</Button>
			</Row>
		);

		if (disabled) {
			title = '查看科室';
			footer = (
				<Row style={{textAlign:'center'}}>
					<Button type="primary" onClick={this.onSubmit.bind(this, false)}>关闭</Button>
				</Row>
			);
		}

		// okText="确定" onOk={this.onSubmit.bind(this, true)}
		// cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
		return (
			<Modal  title={title} visible={visible} closable={false}
			        footer={footer}
			>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>名称:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}} disabled={disabled}
						       value={name} onChange={this.onChange.bind(this, 'name')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>代码:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}  disabled={disabled}
						       value={code} onChange={this.onChange.bind(this, 'code')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>机构:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}}  disabled={disabled}
						        value={''+org_code}
						        placeholder="请选择数据源"
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'org_code')}
						>
							{orgOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Modal>
		);
	}
}
