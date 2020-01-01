import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Template.less";

export default class ModelVDMappingPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			id: 0,
			virtual_department_id: '',
			model_id: '',
		};
	}

	componentDidMount() {
		if (!this.props.item || !this.props.item.id) {
			return;
		}
		this.initData(this.props.item);
	}

	initData(item) {
		this.setState({
			id: item.id,
			virtual_department_id: '' + item.virtual_department_id,
			model_id: '' + item.model_id,
		});
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		this.initData(nextProps.item);
	}

	onSubmit(isUpdate) {
		const { id, virtual_department_id, model_id } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!model_id || !virtual_department_id) {
			message.error('请检查模型、虚拟组等信息是否选择或填写!');
			return;
		}
		let x = {
			id: id,
			virtual_department_id: parseInt(virtual_department_id),
			model_id: parseInt(model_id),
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['name'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	render() {
		const {id, virtual_department_id, model_id } = this.state;
		const { visible, virtualDepartments, models } = this.props;
		let title = '新建模型配置';
		if (id) {
			title = '编辑模型配置';
		}
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>虚拟组:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}} value={virtual_department_id} showArrow={true}
						        onSelect={this.onChange.bind(this, 'virtual_department_id')}>
							{virtualDepartments.map( o => <Select.Option value={''+o.id}>{o.name}</Select.Option>)}
						</Select>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>模型:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}} showArrow={true}
						        value={model_id}
						        onSelect={this.onChange.bind(this, 'model_id')}
						>
							{models.map( o=> <Select.Option key={''+o.id}>{o.name}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Modal>
		);
	}
}
