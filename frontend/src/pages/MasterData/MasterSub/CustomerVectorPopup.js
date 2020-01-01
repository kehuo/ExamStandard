import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox, Table, TreeSelect } from "antd";
import ElementComponent from '../../Template/ElementComponent';
import * as CVUtils from './CVUtils';
import debounce from 'lodash/debounce';

let underscore = require("underscore");
let Immutable = require('immutable');
let moment = require('moment');
let Base64 = require('js-base64').Base64;

import styles from "../MasterData.less";

const TypeOpts = [
	{k:'symptom', v:'symptom'},{k:'disease', v:'disease'},{k:'medicine', v:'medicine'},
	{k:'treatment', v:'treatment'},{k:'exam', v:'exam'}
];
export default class CustomerVectorPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.updateOne(props.item);
		this.onQueryVector = debounce(this.onQueryVector, 500);
		this.onQueryVectorCondition = debounce(this.onQueryVectorCondition, 500);
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
			vector_id: '',
			category: '',
			vectorOpts: [],

			addition: '',
			additionPropTree: [],

			info: [],
			conditions: [],

			value_type: '',
			function_spec: '',
			test_params: '',
			testResult: '',
		};

		if (item && Object.keys(item).length > 0) {
			newState.id = item.id;
			newState.category = item.category;
			if (item.vector_id) {
				newState.vector_id = item.vector_id ? '' + item.vector_id : '';
				newState.vectorOpts = [{k:item.vector_name, v:''+item.vector_id}];
			}

			if (item.addition) {
				let additionObj = JSON.parse(item.addition);
				let addition_id = CVUtils.findPropKeyId(additionObj.propTag, additionObj.prop, item.extensions);
				newState.addition = ''+addition_id;
				newState.additionPropTree = CVUtils.buildPropTree(item.extensions);
			}

			let function_spec = '';
			if (item.function_spec) {
				function_spec = Base64.decode(item.function_spec);
			}
			if (item.args) {
				newState.info = CVUtils.buildInfo(item.args);
				newState.conditions = CVUtils.buildConditions(item.args, item.args_extensions);
			}
			newState.function_spec = function_spec;
			newState.value_type = item.value_type;
			newState.test_params = item.test_params;
		}
		return newState;
	}

	updateVectorOpts(category, data) {
		const TypeMap = {
			'medicine': 'medicines',
			'disease': 'diseases',
			'symptom': 'symptoms',
			'treatment': 'treatments',
			'exam': 'exams',
		};
		let opts = [];
		let dataA = data[TypeMap[category]];
		for (let i=0; i<dataA.length; i++) {
			opts.push({k:dataA[i].name, v:''+dataA[i].id});
		}
		this.setState({
			vectorOpts: opts,
		});
	}

	onQueryVector(keyword) {
		const { category } = this.state;
		if (!keyword) {
			// clear options
			let data = {'exams':[]};
			this.updateVectorOpts('exam', data);
			return;
		}

		if (this.props.onQueryFunc) {
			let callback = this.updateVectorOpts.bind(this, category);
			this.props.onQueryFunc(category, keyword, null, callback);
		}
	}

	buildBasic() {
		const { category, vector_id, vectorOpts, addition, additionPropTree } = this.state;
		return (
			<div style={{marginBottom:6}}>
				<Row>
					<Col span={12}>
						<Row style={{marginBottom:6}}>
							<Col span={6} style={{textAlign:'right'}}>矢量类型:</Col>
							<Col span={16} style={{marginLeft:6}}>
								<Select style={{width:'100%'}}
								        value={category}
								        defaultActiveFirstOption={false}
								        showArrow={true}
								        filterOption={false}
								        onChange={this.onChangeElement.bind(this, 'select', 'category')}
								>
									{TypeOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
								</Select>
							</Col>
						</Row>
					</Col>
					<Col span={12}>
						<Row style={{marginBottom:6}}>
							<Col span={6} style={{textAlign:'right'}}>矢量名称:</Col>
							<Col span={16} style={{marginLeft:6}}>
								<Select style={{width:'100%'}}
								        showSearch
								        value={vector_id}
								        defaultActiveFirstOption={false}
								        showArrow={false}
								        filterOption={false}
								        onSearch={this.onQueryVector.bind(this)}
								        onChange={this.onChangeElement.bind(this, 'select', 'vector_id')}
								        notFoundContent={null}
								>
									{vectorOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
								</Select>
							</Col>
						</Row>
					</Col>
				</Row>
				<Row>
					<Col span={12}>
						<Row style={{marginBottom:6}}>
							<Col span={6} style={{textAlign:'right'}}>扩展属性:</Col>
							<Col span={16} style={{marginLeft:6}}>
								<TreeSelect style={{width:'100%'}}
								        value={addition}
								        treeData={additionPropTree}
								        onChange={this.onChangeElement.bind(this, 'select', 'addition')}
								/>
							</Col>
						</Row>
					</Col>
				</Row>
			</div>
		);
	}

	updatePropsTree(tag, index, data) {
		let curState = this.state;
		let propsTree = CVUtils.buildPropTree(data);
		if (tag == 'addition') {
			curState.additionPropTree = propsTree;
			curState.addition = '';
		} else if (tag == 'conditions' && index >= 0) {
			let condA = curState.conditions[index];
			condA.prop_id = '';
			condA.propTreeData = propsTree;
		}
		this.setState(curState);
	}

	getVectorAddition(tag, index, category, vector_id) {
		if (this.props.onQueryExtensionFunc) {
			let callback = this.updatePropsTree.bind(this, tag, index);
			this.props.onQueryExtensionFunc(category, vector_id, callback);
		}
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		}
		curState[tag] = realVal;
		if (tag == 'defaultUnit') {
			let numberRefer = curState.reference.numberRefer;
			for (let i=0; i<numberRefer.length; i++) {
				let x = numberRefer[i];
				x.unit = realVal;
			}
		}

		let callback = null;
		switch (tag) {
		case 'category':
			curState.vectorOpts = [];
			curState.vector_id = '';
			curState.addition = '';
			curState.additionPropTree = [];
			break;
		case 'vector_id':
			callback = this.getVectorAddition.bind(this, 'addition', -1, curState.category, realVal);
			break;
		default:
			break;
		}
		this.setState(curState, callback);
	}

	onChangeElementArray(elementType, refTag, tag, index, val) {
		let curState = this.state;
		let x = [];
		if ( refTag == 'conditions') {
			x = curState.conditions;
		}
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		}
		x[index][tag] = realVal;

		let callback = null;
		if (tag == 'type') {
			x[index]['vector_id'] = '';
			x[index]['vectorOpts'] = [];
			x[index]['prop_id'] = '';
			x[index]['propTreeData'] = [];
		} else if (tag == 'vector_id') {
			callback = this.getVectorAddition.bind(this, 'conditions', index, x[index]['type'], realVal);
		}
		this.setState(curState, callback);
	}

	updateVectorOptsCondition(category, index, data) {
		const TypeMap = {
			'medicine': 'medicines',
			'disease': 'diseases',
			'symptom': 'symptoms',
			'treatment': 'treatments',
			'exam': 'exams',
		};
		let opts = [];
		let dataA = data[TypeMap[category]];
		for (let i=0; i<dataA.length; i++) {
			opts.push({k:dataA[i].name, v:''+dataA[i].id});
		}
		let conditions = this.state.conditions;
		conditions[index].vectorOpts = opts;
		this.setState({
			conditions: conditions,
		});
	}

	onQueryVectorCondition(index, keyword) {
		let category = this.state.conditions[index].type;
		if (!keyword) {
			// clear options
			let data = {'exams':[]};
			this.updateVectorOptsCondition('exam', index, data);
			return;
		}

		if (this.props.onQueryFunc) {
			let callback = this.updateVectorOptsCondition.bind(this, category, index);
			this.props.onQueryFunc(category, keyword, null, callback);
		}
	}

	textRender(refTag, tag, text, record, index) {
		return (
			<Input style={{width:'100%'}}
			       value={text}
			       onChange={this.onChangeElementArray.bind(this, 'input', refTag, tag, index)}
			/>
		);
	}

	selectSearchRender(refTag, tag, text, record, index) {
		let vectorOpts = record.vectorOpts;
		return (
			<Select style={{width:'100%'}}
				showSearch
				value={text}
				defaultActiveFirstOption={false}
				showArrow={false}
				filterOption={false}
				onSearch={this.onQueryVectorCondition.bind(this, index)}
				onChange={this.onChangeElementArray.bind(this, 'select', refTag, tag, index)}
				notFoundContent={null}
			>
				{vectorOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
			</Select>
		);
	}

	selectRender(opts, refTag, tag, text, record, index) {
		return (
			<Select style={{width:'100%'}}
			        value={text}
			        defaultActiveFirstOption={false}
			        showArrow={true}
			        filterOption={false}
			        onChange={this.onChangeElementArray.bind(this, 'select', refTag, tag, index)}
			>
				{opts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
			</Select>
		);
	}

	opRender(op, refTag, text, record, index) {
		if (op != 'delete') {
			return;
		}
		return (
			<Icon type="minus-circle-o"
			      style={{fontSize: 16, marginTop: 10, marginLeft: 5, cursor:'pointer'}}
			      onClick={this.onClickItem.bind(this, index, refTag, 'delete')}
			/>
		);
	}

	extPropRender(refTag, tag, text, record, index) {
		let propTreeData = record.propTreeData;
		return (
			<TreeSelect style={{width:'100%'}}
			            value={text}
			            treeData={propTreeData}
			            onChange={this.onChangeElementArray.bind(this, 'select', refTag, tag, index)}
			/>
		);
	}

	onClickItem(idx, type, op) {
		let { conditions } = this.state;
		switch (op) {
			case 'add':
				let item = {
					key: '',
					type: 'symptom', vector_id: '', vectorOpts: [],
					require: '1',
					prop_id: '', propTreeData: []
				};
				conditions.push(item);
				break;
			case 'delete':
				conditions.splice(idx, 1);
				break;
			default:
				break;
		}
		this.setState({
			conditions: conditions
		});
	}

	buildOther() {
		const { info, conditions } = this.state;
		const RequireOpts = [
			{k:'是', v:'1'}, {k:'否', v:'0'}
		];
		const columns = [
			{dataIndex:'key0', title:'标签', width: 180,
				render: this.textRender.bind(this, 'conditions', 'key0')},
			{dataIndex:'type', title:'类型', width: 100,
				render: this.selectRender.bind(this, TypeOpts, 'conditions', 'type')},
			{dataIndex:'vector_id', title:'矢量', width: 180,
				render: this.selectSearchRender.bind(this, 'conditions', 'vector_id')},
			{dataIndex:'prop_id', title:'扩展属性取值', width: 180,
				render: this.extPropRender.bind(this, 'conditions', 'prop_id')},
			{dataIndex:'require', title:'必须', width: 60,
				render: this.selectRender.bind(this, RequireOpts, 'conditions', 'require')},
			{dataIndex:'type', title:'操作', width: 60,
				render: this.opRender.bind(this, 'delete', 'conditions')},
		];
		// { key0: v.key,
		//  type: x.type, vector_id: ''+x.vector_id, vectorOpts: [{k:x.vector_name, v:''+x.vector_id}],
		//	prop_id: ''+propId,
		//	propTreeData: buildPropTree(x.extensions),
		//	require: '1',
		// }
		let extra = (
			<Icon type="plus-circle-o"
			      style={{fontSize: 16, marginTop: 16, marginLeft: 5, cursor:'pointer'}}
			      onClick={this.onClickItem.bind(this, -1, 'conditions', 'add')}
			/>
		);
		let infoOpts = ['年龄','性别'];
		return (
			<Card title="条件矢量" extra={extra} size="small"
			      headStyle={{margin:0}} bodyStyle={{margin:0, paddingBottom:0}}>
				<Row>
					<Col span={12}>
						 <Row style={{marginBottom:6}}>
							 <Col span={6} style={{textAlign:'right'}}>病历信息:</Col>
							 <Col span={16} style={{marginLeft:6}}>
								 <Checkbox.Group
									    options={infoOpts}
									    value={info}
								        onChange={this.onChangeElement.bind(this, 'checkbox', 'info')}
								 />
							 </Col>
						 </Row>
					 </Col>
				</Row>
				<Table size="small"
					columns={columns}
					dataSource={conditions}
					pagination={false}
				/>
			</Card>
		);
	}

	buildFuncPart() {
		const lines = [
			{
				split: 24,
				items: [{
					layout: {title: 4, element: 18}, elementType: 'selectSimple',
					title: '数值类型', tag: 'value_type',
					options: [{k:'enum', v:'enum'},{k:'number', v:'number'},{k:'explanation', v:'explanation'},
						{k:'trend', v:'trend'},{k:'value', v:'value'}]
				}],
			},
			{
				split: 24,
				items: [{
					layout: {title: 4, element: 18}, elementType: 'textArea',
					title: '函数代码', tag: 'function_spec'
				}],
			},
			{
				split: 24,
				items: [{
					layout: {title: 4, element: 18}, elementType: 'textArea',
					title: '测试参数', tag: 'test_params'
				}],
			},
		];
		return (
			<Row style={{marginTop:10}}>
				{lines.map(this.renderLine.bind(this))}
			</Row>
		);
	}

	isValidateContent() {
		const { id, vector_id, category, value_type, function_spec, info, conditions } = this.state;
		let valid = true;
		let errMsg = [];
		if (!category) {
			errMsg.push('矢量类型');
		}
		if (!vector_id) {
			errMsg.push('矢量');
		}
		if (!value_type) {
			errMsg.push('数值类型');
		}
		if (!function_spec) {
			errMsg.push('函数代码');
		}
		if (info.length == 0 && conditions.length == 0) {
			errMsg.push('函数参数');
		}
		if (conditions.length>0) {
			for (let i=0; i<conditions.length; i++) {
				let curC = conditions[i];
				if (!curC.key0) {
					errMsg.push('函数参数' + (i+1) + '-标签');
				}
				if (!curC.type) {
					errMsg.push('函数参数' + (i+1) + '-矢量类型');
				}
				if (!curC.vector_id) {
					errMsg.push('函数参数' + (i+1) + '-矢量');
				}
			}
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
		const { id, vector_id, category, vectorOpts, addition, additionPropTree,
			info, conditions, value_type, function_spec } = this.state;
		let funcB64 = '';
		if (function_spec) {
			funcB64 = Base64.encode(function_spec);
		}
		let args = CVUtils.buildArgs(info, conditions);
		let additionA = CVUtils.buildAddition(addition, additionPropTree);
		let x = {
			id: id,
			category: category,
			vector_id: vector_id,
			addition: additionA,
			function_spec: funcB64,
			args: args,
			value_type: value_type,
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

	buildFunctionTest() {
		const { testResult } = this.state;
		return (
			<Row style={{marginTop:6}}>
				<Col span={6} style={{textAlign:'right'}}>
					<Button onClick={this.onTest.bind(this)} type="primary">测试</Button>
				</Col>
				<Col span={8} offset={1}>
					测试结果: {testResult}
				</Col>
			</Row>
		);
	}

	render() {
		let title = '新建自定义矢量';
		if (this.state.id) {
			title = '编辑自定义矢量';
		}
		return (
			<Modal closable={false} title={title} visible={this.props.visible}
			       width={1000}
			       onCancel={this.onSubmit.bind(this, false)}
			       onOk={this.onSubmit.bind(this, true)}
			>
				{this.buildBasic()}
				{this.buildOther()}
				{this.buildFuncPart()}
				{this.buildFunctionTest()}
			</Modal>
		);
	}
}
