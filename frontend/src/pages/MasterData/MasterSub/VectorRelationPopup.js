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
	{k:'symptom', v:'symptom'},{k:'disease', v:'disease'}
	// ,{k:'medicine', v:'medicine'}, {k:'treatment', v:'treatment'},{k:'exam', v:'exam'}
];
const PROCSTATUS = [
	{k:'所有状态', v: '100'},
	{k:'1', v: '1'},
	{k:'0', v: '0'},
];
const RELATIONOPS = [
	{k:'与', v: 'and'},
	{k:'或', v: 'or'},
];
const STATUSRLATION = [
	{k:'0', v: '0'},
	{k:'1', v: '1'},
];
export default class VectorRelationPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.updateOne(props.item);
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
			primary: [{
				id: 0, type: 'symptom', vector_id: '', vectorOpts: [], value: '100',
				property_id: '', propTree: [], operation: ''
			}],
			relations: [],
		};

		if (item && item.id > 0) {
			let primary = newState.primary[0];
			primary.id = item.id;
			primary.type = item.type;
			primary.vector_id = item.vector_id ? '' + item.vector_id : '';
			primary.vectorOpts = [{k:item.vector_name, v:''+item.vector_id}];
			primary.value = '' + item.value;
			if (item.property_id) {
				primary.property_id = item.property_id;
				primary.propTree = CVUtils.buildPropTree(item.extensions);
			}
			if (item.operation) {
				primary.operation = item.operation;
			}

			if (item.relations) {
				let rels = [];
				for (let i=0; i<item.relations.length; i++) {
					let curR = item.relations[i];
					let vectorInfo = {
						id: curR.id,
						type: curR.type,
						vector_id: curR.vector_id ? '' + curR.vector_id : '',
						vectorOpts: [{k:curR.vector_name, v:''+curR.vector_id}],
						value: '' + curR.value,
					};
					if (curR.property_id) {
						vectorInfo.property_id = curR.property_id;
						vectorInfo.propTree = CVUtils.buildPropTree(curR.extensions);
					} else {
						vectorInfo.property_id = '';
						vectorInfo.propTree = [];
					}
					rels.push(vectorInfo);
				}
				newState.relations = rels;
			}
		}
		return newState;
	}

	updatePropsTree(tag, index, data) {
		let curState = this.state;
		let propsTree = CVUtils.buildPropTree(data);
		let x = curState[tag];
		if (index >= 0) {
			let condA = x[index];
			condA.property_id = '';
			condA.propTree = propsTree;
		}
		this.setState(curState);
	}

	getVectorAddition(tag, index, category, vector_id) {
		if (this.props.onQueryExtensionFunc) {
			let callback = this.updatePropsTree.bind(this, tag, index);
			this.props.onQueryExtensionFunc(category, vector_id, callback);
		}
	}

	onChangeElementArray(elementType, refTag, tag, index, val) {
		let curState = this.state;
		let x = [];
		if ( refTag == 'primary') {
			x = curState.primary;
		} else if (refTag == 'relations') {
			x = curState.relations;
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
			x[index]['property_id'] = '';
			x[index]['propTree'] = [];
		} else if (tag == 'vector_id') {
			callback = this.getVectorAddition.bind(this, refTag, index, x[index]['type'], realVal);
		}
		this.setState(curState, callback);
	}

	updateVectorOptsCondition(category, refTag, index, data) {
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
		let curState = this.state;
		curState[refTag][index].vectorOpts = opts;
		this.setState(curState);
	}

	onQueryVectorCondition(refTag, index, keyword) {
		let category = this.state[refTag][index].type;
		if (!keyword) {
			// clear options
			let data = {'exams':[]};
			this.updateVectorOptsCondition('exam', refTag, index, data);
			return;
		}

		if (this.props.onQueryFunc) {
			let callback = this.updateVectorOptsCondition.bind(this, category, refTag, index);
			this.props.onQueryFunc(category, keyword, null, callback);
		}
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
			        onSearch={this.onQueryVectorCondition.bind(this, refTag, index)}
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
		let propTreeData = record.propTree;
		return (
			<TreeSelect style={{width:'100%'}}
			            value={text}
			            treeData={propTreeData}
			            onChange={this.onChangeElementArray.bind(this, 'select', refTag, tag, index)}
			/>
		);
	}

	onClickItem(idx, type, op) {
		let { relations } = this.state;
		switch (op) {
			case 'add':
				let item = {
					id: '', type: 'symptom', vector_id: '', vectorOpts: [], value: '0',
					property_id: '', propTree: []
				};
				relations.push(item);
				break;
			case 'delete':
				relations.splice(idx, 1);
				break;
			default:
				break;
		}
		this.setState({
			relations: relations
		});
	}

	buildBasic() {
		const { primary } = this.state;
		// type, vector_id, vectorOpts, value, property_id, propTree, operation
		const columns = [
			{dataIndex:'type', title:'类型', width: 100,
				render: this.selectRender.bind(this, TypeOpts, 'primary', 'type')},
			{dataIndex:'vector_id', title:'矢量', width: 180,
				render: this.selectSearchRender.bind(this, 'primary', 'vector_id')},
			{dataIndex:'property_id', title:'扩展属性取值', width: 180,
				render: this.extPropRender.bind(this, 'primary', 'property_id')},
			{dataIndex:'value', title:'处理状态', width: 60,
				render: this.selectRender.bind(this, PROCSTATUS, 'primary', 'value')},
		];
		let operation = primary[0].operation;
		return (
			<Card title="条件矢量" size="small">
				<Table size="small"
				       columns={columns}
				       dataSource={primary}
				       pagination={false}
				/>
				<Row style={{marginTop:6}}>
					<Col span={3} style={{textAlign:'right'}}>条件关系:</Col>
					<Col span={8} style={{marginLeft:6}}>
						<Select style={{width:'100%'}}
						        value={operation}
						        defaultActiveFirstOption={false}
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChangeElementArray.bind(this, 'select', 'primary', 'operation', 0)}
						>
							{RELATIONOPS.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Card>
		);
	}

	buildOther() {
		const { relations } = this.state;
		const columns = [
			{dataIndex:'type', title:'类型', width: 100,
				render: this.selectRender.bind(this, TypeOpts, 'relations', 'type')},
			{dataIndex:'vector_id', title:'矢量', width: 180,
				render: this.selectSearchRender.bind(this, 'relations', 'vector_id')},
			{dataIndex:'property_id', title:'扩展属性取值', width: 180,
				render: this.extPropRender.bind(this, 'relations', 'property_id')},
			{dataIndex:'value', title:'取值', width: 60,
				render: this.selectRender.bind(this, STATUSRLATION, 'relations', 'value')},
			{dataIndex:'type', title:'操作', width: 60,
				render: this.opRender.bind(this, 'delete', 'relations')},
		];
		let extra = (
			<Icon type="plus-circle-o"
			      style={{fontSize: 16, marginTop: 16, marginLeft: 5, cursor:'pointer'}}
			      onClick={this.onClickItem.bind(this, -1, 'relations', 'add')}
			/>
		);
		return (
			<Card title="等价矢量" extra={extra} size="small"
			      headStyle={{margin:0}} bodyStyle={{margin:0, paddingBottom:0}}>
				<Table size="small"
				       columns={columns}
				       dataSource={relations}
				       pagination={false}
				/>
			</Card>
		);
	}

	checkItemOne(refTag, index, errMsg) {
		let x = this.state[refTag][index];
		let tag = '条件矢量-';
		if (refTag == 'relations') {
			tag = '等价矢量' + index + '-';
		}
		// id: 0, type: '', vector_id: '', vectorOpts: [], value: '100',
		//	property_id: '', propTree: [], operation: ''
		if (!x.vector_id) {
			errMsg.push(tag + '矢量类型');
		}
		if (!x.value) {
			let k = '处理状态';
			if (refTag == 'relations') {
				k = '取值';
			}
			errMsg.push(tag + k);
		}
		// if (!x.property_id) {
		// 	errMsg.push(tag + '扩展属性');
		// }
		if (!x.operation && refTag == 'primary') {
			errMsg.push('条件关系');
		}
	}

	isValidateContent() {
		const { primary, relations } = this.state;
		let valid = true;
		let errMsg = [];
		this.checkItemOne('primary', 0, errMsg);
		for (let i=0; i<relations.length; i++) {
			this.checkItemOne('relations', i, errMsg);
		}
		if (errMsg.length > 0) {
			valid = false;
		}
		return {
			valid: valid,
			errMsg: '请填写或选择' + errMsg.join(',')
		}
	}

	reBuildPrimary(xA, parentId) {
		let property_id = 0;
		if (xA.property_id) {
			property_id = parseInt(xA.property_id);
		}
		let m = {
			id: xA.id,
			type: xA.type,
			vector_id: parseInt(xA.vector_id),
			property_id: property_id,
			parent_id: parentId,
			value: parseInt(xA.value),
			operation: xA.operation,
		};
		return m;
	}

	getContent() {
		const { primary, relations } = this.state;
		let x = this.reBuildPrimary(primary[0], 0);
		let relationsA = [];
		for (let i=0; i<relations.length; i++) {
			let y = this.reBuildPrimary(relations[i], x.id);
			relationsA.push(y);
		}
		x.relations = relationsA;
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

	render() {
		let title = '新增矢量关系';
		if (this.state.id) {
			title = '编辑矢量关系';
		}
		return (
			<Modal closable={false} title={title} visible={this.props.visible}
			       width={1000}
			       onCancel={this.onSubmit.bind(this, false)}
			       onOk={this.onSubmit.bind(this, true)}
			>
				{this.buildBasic()}
				{this.buildOther()}
			</Modal>
		);
	}
}
