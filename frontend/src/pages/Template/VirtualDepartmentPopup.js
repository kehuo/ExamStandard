import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Template.less";

export default class VirtualDepartmentPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			id: 0,
			name: '',
			description: '',
			departments: [],
			users: []
		};
	}

	componentDidMount() {
		if (this.props.item == 0) {
			return;
		}
		this.updateOne(this.props.item);
	}

	updateOne(id) {
		if (!id) {
			return;
		}
		if (this.props.loadItem) {
			this.props.loadItem(id, this.updateAll.bind(this))
		}
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		this.updateOne(nextProps.item);
	}

	updateAll(res) {
		this.setState({
			id: res.id,
			name: res.name,
			description: res.description,
			disabled: res.disabled,
			departments: makeOnlyIdArray(res.departments, 'department_id'),
			users: makeOnlyIdArray(res.users, 'user_id'),
		});
	}

	onSubmit(isUpdate) {
		const {id, name, description, disabled, departments, users } = this.state;
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
			id: id,
			name: name,
			description: description,
			disabled: disabled,
			departments: invertArray2DictIds(departments),
			users: invertArray2DictIds(users)
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
		const {id, name, description, disabled, departments, users } = this.state;
		const { visible, departmentOptions, userOptions } = this.props;
		let title = '新建虚拟组';
		if (id) {
			title = '编辑虚拟组';
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

				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>科室:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}} mode="multiple"
						        value={departments}
						        placeholder="请选择科室"
						        defaultActiveFirstOption={false}
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'departments')}
						>
							{departmentOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>

				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>用户:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}} mode="multiple"
						        value={users}
						        placeholder="请选择用户"
						        defaultActiveFirstOption={false}
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'users')}
						>
							{userOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Modal>
		);
	}
}

function makeOnlyIdArray(datum, tag) {
	let rst = [];
	for (let i=0; i<datum.length; i++) {
		rst.push(''+datum[i][tag]);
	}
	return rst;
}

function invertArray2DictIds(datum) {
	let rst = [];
	for (let i=0; i<datum.length; i++) {
		let x = parseInt(datum[i]);
		rst.push({id:x});
	}
	return rst;
}
