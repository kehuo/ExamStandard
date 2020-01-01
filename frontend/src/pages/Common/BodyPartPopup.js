import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Common.less";

export default class BodyPartPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			name: '',
			description: '',
			priority: '1',
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.description = item.description;
			newState.name = item.name;
			newState.priority = item.priority;
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
		const { id, name, description, priority } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!name || !priority ) {
			message.error('请检查名称等信息是否选择或填写!');
			return;
		}
		let x = {
			id: id,
			name: name,
			description: description,
			priority: parseInt(priority),
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['description','name','priority'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	render() {
		const {id, name, description, priority } = this.state;
		const { visible } = this.props;
		let title = '新建身体部位';
		if (id) {
			title = '编辑身体部位';
		}
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>名称:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={name} onChange={this.onChange.bind(this, 'name')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>优先级:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={priority} onChange={this.onChange.bind(this, 'priority')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>描述:</Col>
					<Col span={16} offset={1}>
						<Input.TextArea style={{width:'100%'}}
						                autosize={{ minRows: 3, maxRows: 3 }}
						                value={description} onChange={this.onChange.bind(this, 'description')}
						/>
					</Col>
				</Row>
			</Modal>
		);
	}
}
