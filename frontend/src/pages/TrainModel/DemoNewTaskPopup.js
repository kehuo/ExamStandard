import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./TrainModel.less";

export default class DemoNewTaskPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			taskId: 0,
			name: '',
			description: '',
		};
	}

	componentDidMount() {
		if (!this.props.item) {
			return;
		}
		this.updateOne(this.props.item);
	}

	updateOne(item) {
		let newState = {
			taskId: 0,
			name: '',
			description: '',
		};
		if (item.taskId) {
			newState = {
				taskId: item.taskId,
				name: item.name,
				description: item.description,
			};
		}
		this.setState(newState);
		return;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		this.updateOne(nextProps.item);
	}

	onSubmit(isUpdate) {
		const { taskId, name, description } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!name) {
			message.error('请检查名称等信息是否选择或填写!');
			return;
		}
		let x = {
			taskId: taskId,
			name: name,
			description: description,
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['name','description'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	render() {
		const { taskId, name, description } = this.state;
		const { visible } = this.props;
		let title = '新建任务';
		if (taskId) {
			title = '编辑任务';
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
					<Col span={6} style={{textAlign:'right'}}>描述:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={description} onChange={this.onChange.bind(this, 'description')}
						/>
					</Col>
				</Row>
			</Modal>
		);
	}
}
