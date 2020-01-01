import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Template.less";

export default class ModelPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			id: 0,
			name: '',
			config_description: '',
		};
	}

	componentDidMount() {
		if (!this.props.item || !this.props.item.id) {
			return;
		}
		this.initData(this.props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			name: '',
			config_description: '',
		};
		if (item && item.id) {
			newState = {
				id: item.id,
				name: item.name,
				config_description: item.config_description,
			};
		}
		this.setState(newState);
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		this.initData(nextProps.item);
	}

	onSubmit(isUpdate) {
		const { id, name, config_description } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!name ) {
			message.error('请检查名称等信息是否选择或填写!');
			return;
		}

		let x = {
			id: id,
			name: name,
			config_description: config_description,
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['name', 'config_description'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	render() {
		const {id, name, config_description } = this.state;
		const { visible } = this.props;
		let title = '新建模型描述';
		if (id) {
			title = '编辑模型描述';
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
					<Col span={6} style={{textAlign:'right'}}>配置信息:</Col>
					<Col span={16} offset={1}>
						<Input.TextArea style={{width:'100%'}}
						                autosize={{ minRows: 5, maxRows: 5 }}
						                value={config_description} onChange={this.onChange.bind(this, 'config_description')}
						/>
					</Col>
				</Row>
			</Modal>
		);
	}
}
