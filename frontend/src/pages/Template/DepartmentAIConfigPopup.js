import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
import ElementComponent from './ElementComponent';

let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Template.less";

function isPosInteger(x) {
	let intRe =  new RegExp("^\\d+$");
	if (!intRe.test(x)) {
		return false;
	}
	let xInt = parseInt(x);
	if (xInt <= 0) {
		return false;
	}
	return true;
}

export default class DepartmentAIConfigPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	componentDidMount() {
		if (!this.props.item || !this.props.item.id) {
			return;
		}
		let newState = this.initData(this.props.item);
		this.setState(newState);
	}

	initData(item) {
		let newState = {
			id: 0,
			org_code: '',
			department_code: '',

			enableAutoLearn: true,
			mergeDepartment: true,
			frequency: 7,
			addNewThreshold: 10,
			forgetDays: 30,
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.org_code = item.org_code;
			newState.department_code = item.department_code;
			if (item.content) {
				let xObj = JSON.parse(item.content);
				newState.enableAutoLearn = !!xObj.enableAutoLearn;
				newState.mergeDepartment = !!xObj.mergeDepartment;
				newState.frequency = xObj.frequency ? xObj.frequency : 7;
				newState.addNewThreshold = xObj.addNewThreshold ? xObj.addNewThreshold : 10;
				newState.forgetDays = xObj.forgetDays ? xObj.forgetDays : 30;
			}
		}
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let callback = null;
		let newState = this.initData(nextProps.item);
		if (newState.org_code) {
			callback = this.getDepartmentList.bind(this);
		}
		this.setState(newState, callback);
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (elementType == 'checkbox') {
			realVal = val.target.checked;
		}
		let callback = null;
		if (['org_code'].indexOf(tag) != -1) {
			callback = this.getDepartmentList.bind(this);
			curState['department'] = '';
		}
		curState[tag] = realVal;
		this.setState(curState, callback);
	}

	getDepartmentList() {
		if (!this.props.queryFunc) {
			return;
		}
		this.props.queryFunc('department', {orgCode: this.state.org_code});
	}

	isValidContent() {
		const { id, org_code, department_code,
			enableAutoLearn, frequency, addNewThreshold, forgetDays } = this.state;
		let msgs = [];
		if (!org_code ) {
			msgs.push('机构不能为空!');
		}
		if (!department_code ) {
			msgs.push('科室不能为空!');
		}
		if (enableAutoLearn) {
			if (!isPosInteger(frequency) ) {
				msgs.push('频次非法!');
			}
			if (!isPosInteger(addNewThreshold) ) {
				msgs.push('新增计数门限非法!');
			}
			if (!isPosInteger(forgetDays) ) {
				msgs.push('遗忘门限非法!');
			}
		}
		let rst = {
			ok: (msgs.length == 0),
			msg: msgs.join(',')
		};
		return rst;
	}

	onSubmit(isUpdate) {
		const { id, org_code, department_code,
			enableAutoLearn, frequency, addNewThreshold, forgetDays } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		let rst = this.isValidContent();
		if (!rst.ok ) {
			message.error(rst.msg);
			return;
		}

		let content = {};
		let tags = ['enableAutoLearn', 'mergeDepartment', 'frequency','addNewThreshold','minCountThreshold'];
		for (let i=0; i<tags.length; i++) {
			let k = tags[i];
			let v = this.state[k];
			if (!v) {
				continue;
			}
			content[k] = v;
		}
		let x = {
			id: id,
			org_code: org_code,
			department_code: department_code,
			content: JSON.stringify(content),
		};
		this.props.onSubmit(true, x);
	}

	render() {
		const { id } = this.state;
		const { visible, orgOpts, departmentOpts } = this.props;

		const lines = [
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectSimple',
					title: '机构', tag: 'org_code', options: orgOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectSimple',
					title: '科室', tag: 'department_code', options: departmentOpts
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'checkboxSimple',
					title: '自动学习', tag: 'enableAutoLearn'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'checkboxSimple',
					title: '合并科室模板内容', tag: 'mergeDepartment'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'input',
					title:'频次', tag:'frequency', addonAfter:'天'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'input',
					title:'新增计数门限', tag:'addNewThreshold', addonAfter:'次'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'input',
					title:'新增矢量门限', tag:'minCountThreshold', addonAfter:'天'
				}]
			},
		];
		let title = '新建科室配置';
		if (id) {
			title = '编辑科室配置';
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
