import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
import ElementComponent from '../../Template/ElementComponent';

let underscore = require("underscore");
let Immutable = require('immutable');
let moment = require('moment');
let Base64 = require('js-base64').Base64;

import styles from "../MasterData.less";

export default class ExamPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.updateOne(props.item);
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let newState = this.updateOne(nextProps.item);
		this.setState(newState);
	}

	updateOne(item) {
		let newState = {
			id: 0,
			name: '',
			description: '',
			code: '',
			source: '',
			parent_id: 0,
			props: [],
			function_spec: '',
			args: '',
			value_type: '',
			reference: '',
			value_source: '',
			testParams: '',
			testResult: '',
		};
		if (item && Object.keys(item).length > 0) {
			let props = [];
			if (item.props) {
				props = (item.props).split(',');
			}
			let function_spec = '';
			if (item.function_spec) {
				function_spec = Base64.decode(item.function_spec);
			}
			newState = {
				id: item.id,
				name: item.name,
				code: item.code,
				source: item.source,
				description: item.description,
				parent_id: item.parent_id,
				props: props,
				function_spec: function_spec,
				args: item.args,
				value_type: item.value_type,
				reference: item.reference,
				value_source: item.value_source,
				test_params: item.test_params,
				testResult: '',
			};
		}
		return newState;
	}

	buildFormPart() {
		const { extensionOpts } = this.props;
		const lines = [
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '名称', tag: 'name'
				}],
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '编码', tag: 'code'
				}],
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '来源', tag: 'source'
				}],
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'textArea',
					title: '描述', tag: 'description'
				}],
			},
			,
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectMultiple',
					title: '扩展属性', tag: 'props',
					options: extensionOpts
				}],
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectSimple',
					title: '数值类型', tag: 'value_type',
					options: [{k:'enum', v:'enum'},{k:'number', v:'number'},{k:'explanation', v:'explanation'},
						{k:'trend', v:'trend'},{k:'value', v:'value'}]
				}],
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '函数参数', tag: 'args'
				}],
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'textArea',
					title: '函数代码', tag: 'function_spec'
				}],
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'textArea',
					title: '测试参数', tag: 'test_params'
				}],
			},
		];
		return (
			<Card title="检查">
				{lines.map(this.renderLine.bind(this))}
			</Card>
		)
	}

	isValidateContent() {
		const { id, name, code, source, description, parent_id } = this.state;
		let valid = true;
		let errMsg = [];
		if (!name) {
			errMsg.push('名称');
		}
		if (!code) {
			errMsg.push('编码');
		}
		if (!parent_id) {
			errMsg.push('父节点非法');
		}
		if (errMsg.length > 0) {
			valid = false;
		}
		return {
			valid: valid,
			errMsg: '请填写或选择' + errMsg.join(',')
		}
	}

	getContent() {
		const { id, name, code, source, description, parent_id, props, function_spec,
			args, value_type, value_source, reference, test_params } = this.state;
		let funcB64 = '';
		if (function_spec) {
			funcB64 = Base64.encode(function_spec);
		}
		let x = {
			id: id,
			name: name,
			code: code,
			source: source,
			description: description,
			parent_id: parent_id,
			props: props.join(','),
			function_spec: funcB64,
			args: args,
			value_type: value_type,
			reference: reference,
			value_source: value_source,
			test_params: test_params,
		};
		return x;
	}

	onSubmit(isUpdate) {
		if (!this.props.onSubmit) {
			return
		}

		if (!isUpdate) {
			this.props.onSubmit(false, {});
			return;
		}

		let rst = this.isValidateContent();
		if (!rst.valid) {
			message.error(rst.errMsg);
			return;
		}

		let x = this.getContent();
		this.props.onSubmit(true, x);
	}

	updateTestResult(testResult) {
		this.setState({
			testResult: testResult,
		});
	}

	onTest() {
		const { function_spec, test_params } = this.state;
		if (!function_spec || !test_params) {
			message.error('请检查函数代码和测试参数是否为空!');
			return;
		}
		if (this.props.onTestFunc) {
			let callback = this.updateTestResult.bind(this);
			this.props.onTestFunc(function_spec, test_params, callback);
		}
	}

	updateFunctionSpec(data) {
		this.setState({
			function_spec: data.functionSpec,
			args: data.parameterString,
			test_params: data.testString,
		});
	}

	onGenFunc() {
		if (this.props.onGenFunc) {
			let callback = this.updateFunctionSpec.bind(this);
			this.props.onGenFunc(callback);
		}
	}

	buildFunctionTest() {
		const { testResult } = this.state;
		return (
			<Card>
				<Row>
					<Col span={6}>
						<Button onClick={this.onTest.bind(this)}>测试</Button>
					</Col>
					<Col span={8} offset={1}>
						测试结果: {testResult}
					</Col>
					<Col span={6} offset={1}>
						<Button onClick={this.onGenFunc.bind(this)}>生成函数</Button>
					</Col>
				</Row>
			</Card>
		)
	}

	render() {
		let title = '新建检查';
		if (this.state.id) {
			title = '编辑检查';
		}
		return (
			<Modal closable={false} title={title} visible={this.props.visible}
			       width={800}
			       onCancel={this.onSubmit.bind(this, false)}
			       onOk={this.onSubmit.bind(this, true)}
			>
				{this.buildFormPart()}
				{this.buildFunctionTest()}
			</Modal>
		);
	}
}
