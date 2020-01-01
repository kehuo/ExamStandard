import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
import ElementComponent from '../Template/ElementComponent';

let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Common.less";

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

export default class DepartmentUIConfigPopup extends ElementComponent {
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

			tabList: ['辅助诊断'],
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.org_code = item.org_code;
			newState.department_code = item.department_code;
			if (item.content) {
				let xObj = JSON.parse(item.content);
				newState.tabList = xObj.tabList;
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
		const { id, org_code, department_code, tabList } = this.state;
		let msgs = [];
		if (!org_code ) {
			msgs.push('机构不能为空!');
		}
		if (!department_code ) {
			msgs.push('科室不能为空!');
		}
		if (tabList.length == 0) {
			msgs.push('功能标签不能为空!');
		}
		let rst = {
			ok: (msgs.length == 0),
			msg: msgs.join(',')
		};
		return rst;
	}

	onSubmit(isUpdate) {
		const { id, org_code, department_code, tabList } = this.state;
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
		let tags = ['tabList'];
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
		const TabNameOpts = [
			{k:'辅助诊断', v:'辅助诊断'},{k:'辅助用药', v:'辅助用药'},
			{k:'罕见病预测', v:'罕见病预测'},{k:'生长曲线', v:'生长曲线'},{k:'罕见病预测v2', v:'罕见病预测v2'}
		];
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
					layout: {title: 6, element: 16}, elementType: 'selectTags',
					title: '功能标签', tag: 'tabList', options: TabNameOpts
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
