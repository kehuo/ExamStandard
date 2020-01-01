import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');
import ElementComponent from '../Template/ElementComponent';

import styles from "./RareDisease.less";

export default class RareDiseaseHpoPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			code: '',
			enName: '',
			cnName: '',
			parents: '',
			disabled: false,
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.code = item.code;
			newState.enName = item.enName;
			newState.cnName = item.cnName;
			newState.parents = item.parents;
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
		const { id, cnName, enName, parents, code, disabled } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!enName || !code ) {
			if (code != 'HP:0000001' && !parents) {
				message.error('请检查父类等信息是否选择或填写!');
				return;
			}
			message.error('请检查英文名称、代码等信息是否选择或填写!');
			return;
		}
		let x = {
			id: id,
			code: code,
			enName: enName,
			cnName: cnName,
			parents: parents,
			disabled: disabled ? 1:0,
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['enName','cnName','parents'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else if (['disabled'].indexOf(tag) != -1) {
			curState[tag] = val.target.checked;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	render() {
		const {id, code, cnName, enName, parents, disabled } = this.state;
		const { visible } = this.props;
		let title = '新建HPO项';
		if (id) {
			title = '编辑HPO项';
		}
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>代码:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={code} onChange={this.onChange.bind(this, 'code')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>英文名称:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={enName} onChange={this.onChange.bind(this, 'enName')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>中文名称:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={cnName} onChange={this.onChange.bind(this, 'cnName')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>父类:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={parents} onChange={this.onChange.bind(this, 'parents')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>禁用:</Col>
					<Col span={16} offset={1}>
						<Checkbox style={{marginLeft:6}}
						          checked={disabled}
						          onChange={this.onChange.bind(this, 'disabled')}>
						</Checkbox>
					</Col>
				</Row>
			</Modal>
		);
	}
}
