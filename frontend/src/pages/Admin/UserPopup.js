import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Org.less";

export default class UserPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			name: '',
			fullname: '',
			email: '',
			org_code: '',
			real_dept_id: '',
			role_id: '',
			disabled: false,
			password: '',
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.name = item.name;
			newState.email = item.email;
			newState.fullname = item.fullname;
			newState.org_code = item.org_code;
			newState.real_dept_id = ''+item.real_dept_id;
			newState.role_id = ''+item.role_id;
			newState.disabled = item.disabled;
		}
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let newState = this.initData(nextProps.item);
		this.setState(newState, this.updateDepartments.bind(this));
	}

	onSubmit(isUpdate) {
		const { id, name, email, fullname, org_code, real_dept_id, role_id,
			password, disabled } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!name || !org_code) {
			message.error('请检查名称、机构等信息是否选择或填写!');
			return;
		}
		let x = {
			id: id,
			name: name,
			email: email,
			fullname: fullname,
			real_dept_id: real_dept_id? parseInt(real_dept_id):null,
			role_id: parseInt(role_id),
			org_code: org_code,
			password: password,
			disabled: disabled,
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['fullname','name','email','password'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		let callback = null;
		if (tag == 'org_code' ) {
			callback = this.updateDepartments.bind(this);
		}
		this.setState(curState, callback);
	}

	updateDepartments() {
		if (this.props.onSearchDepartment) {
			this.props.onSearchDepartment(this.state.org_code);
		}
	}

	render() {
		const { id, name, email, fullname, org_code, real_dept_id, role_id,
			password } = this.state;
		const { visible, roleOptions, orgOptions, departmentOptions } = this.props;
		let title = '新建用户';
		if (id) {
			title = '编辑用户';
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
					<Col span={6} style={{textAlign:'right'}}>姓名:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={fullname} onChange={this.onChange.bind(this, 'fullname')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>电子邮件:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={email} onChange={this.onChange.bind(this, 'email')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>密码:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}} type="password"
						       value={password} onChange={this.onChange.bind(this, 'password')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>角色:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}}
						        value={''+role_id}
						        placeholder="请选择角色"
						        showArrow={false}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'role_id')}
						>
							{roleOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>机构:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}}
						        value={''+org_code}
						        placeholder="请选择机构"
						        showArrow={false}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'org_code')}
						>
							{orgOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>科室:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}}
						        value={''+real_dept_id}
						        placeholder="请选择科室"
						        showArrow={false}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'real_dept_id')}
						>
							{departmentOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Modal>
		);
	}
}
