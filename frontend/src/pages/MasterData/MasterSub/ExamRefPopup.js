import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Table } from "antd";
import ElementComponent from '../../Template/ElementComponent';

let underscore = require("underscore");
let Immutable = require('immutable');
let moment = require('moment');
let Base64 = require('js-base64').Base64;

import styles from "../MasterData.less";

const GenderOpts = [
	{k:'忽略',v: 'none'},
	{k:'男',v: 'M'},
	{k:'女',v: 'F'},
];
const RangeOpts = [
	{k:'不包含',v: 'none'},
	{k:'包含边界',v: 'all'},
	{k:'包含下边界',v: 'low'},
	{k:'包含上边界',v: 'high'},
];
const ResultOpts = [
	{k:'正常', v: '0'},
	{k:'异常', v: '1'},
	{k:'未知', v: '-1'},
	{k:'偏高', v: '2'},
	{k:'偏低', v: '-2'},
];

export default class ExamRefPopup extends ElementComponent {
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

	buildReferArr(rowRefer, type) {
		let keys = underscore.keys(rowRefer);
		let refer = [];
		for (let i=0; i<keys.length; i++) {
			let items = rowRefer[keys[i]];
			for (let j=0; j<items.length; j++) {
				let item ;
				if (type === 'textRefer') {
					item = {
						text: items[j],
						result: keys[i],
					}
				} else {
					item = items[j];
					item['result'] = keys[i];
				}
				refer.push(item);
			}
		}
		return refer;
	}

	updateOne(item) {
		// {
		// "defaultUnit":"umol/l","rangeSource":"","negWords":"无,非,没有,不",
		// "numberRefer":{
		//      "0":[{"unit":"umol/l","gender":"none","ageRangeCondition":"all","lowAgeValue":"0","highAgeValue":"999","valueRangeCondition":"all","lowValue":"0","highValue":"15"},{"unit":"umol／l","gender":"none","ageRangeCondition":"all","lowAgeValue":"0","highAgeValue":"999","valueRangeCondition":"all","lowValue":"0","highValue":"15"}]},
		// "textRefer":{}
		// }
		let reference = {
			rangeSource: '',
			defaultUnit: '',
			negWords: '',
			textRefer: [],
			numberRefer: []
		};
		if (item.reference && item.reference != '') {
			reference = JSON.parse(item.reference);
			reference['textRefer'] = this.buildReferArr(reference['textRefer'], 'textRefer');
			reference['numberRefer'] = this.buildReferArr(reference['numberRefer'], 'numberRefer');
		}
		let editItem = {
			id: item.id ? item.id : 0,
			name: item.name ? item.name : '',
			code: item.code ? item.code : '',
			rangeSource: reference.rangeSource,    // move up for render component!!!
			defaultUnit: reference.defaultUnit,    // move up for render component!!!
			negWords: reference.negWords,    // move up for render component!!!
			reference: reference
		};
		return editItem;
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
		this.setState(curState);
	}

	buildFormPart() {
		const { extensionOpts } = this.props;
		const lines = [
			{
				split: 12,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '名称', tag: 'name', disabled: true,
				},{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '编码', tag: 'code', disabled: true,
				}],
			},
			{
				split: 12,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '数据来源', tag: 'rangeSource'
				}]
			},
		];
		return (
			<Card title="基本信息">
				{lines.map(this.renderLine.bind(this))}
			</Card>
		)
	}

	onClickItem(idx, type, op) {
		let { reference, defaultUnit } = this.state;
		switch (op) {
			case 'add':
				if (type === 'numberRefer') {
					let condition = {
						unit: defaultUnit,
						gender: 'none',
						ageRangeCondition: 'none',
						lowAgeValue: '',
						highAgeValue: '',
						valueRangeCondition: 'none',
						lowValue: '',
						highValue: '',
						result: '0',
					};
					let length = reference[type].length;
					if (length > 0) {
						condition['unit'] = reference[type][length-1]['unit'];
						condition['gender'] = reference[type][length-1]['gender'];
						condition['ageRangeCondition'] = reference[type][length-1]['ageRangeCondition'];
						condition['valueRangeCondition'] = reference[type][length-1]['valueRangeCondition'];
						condition['result'] = reference[type][length-1]['result'];
					}
					reference[type].push(condition);
				} else if (type === 'textRefer') {
					let condition = {
						text: '',
						result: '0',
					};
					let length = reference[type].length;
					if (length > 0) {
						condition['result'] = reference[type][length-1]['result'];
					}
					reference[type].push(condition);
				}
				break;
			case 'delete':
				reference[type].splice(idx, 1);
				break;
			default:
				break;
		}
		this.setState({
			reference: reference
		})
	}

	onChangeElementArray(elementType, refTag,  tag, index, val) {
		let curState = this.state.reference;
		let x = curState.textRefer;
		if ( refTag == 'numberRefer') {
			x = curState.numberRefer;
		}
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		}
		x[index][tag] = realVal;
		this.setState({
			reference: curState,
		});
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

	textRender(refTag, tag, text, record, index) {
		return (
			<Input style={{width:'100%'}}
			       value={text}
			       onChange={this.onChangeElementArray.bind(this, 'input', refTag, tag, index)}
			/>
		);
	}

	refOpRender(op, refTag, text, record, index) {
		if (op != 'delete') {
			return;
		}
		return (
			<Icon type="minus-circle-o"
			      style={{fontSize: 16, marginTop: 10, marginLeft: 5}}
			      onClick={this.onClickItem.bind(this, index, 'numberRefer', 'delete')}
			/>
		);
	}

	buildNumberRefs() {
		const columns = [
			// {dataIndex:'unit', title:'单位'},
			{dataIndex:'gender', title:'性别', render: this.selectRender.bind(this, GenderOpts, 'numberRefer', 'gender')},
			{title: '年龄', children: [
				{dataIndex:'ageRangeCondition', title:'边界',
					render: this.selectRender.bind(this, RangeOpts, 'numberRefer', 'ageRangeCondition')},
				{dataIndex:'lowAgeValue', title:'下限', render: this.textRender.bind(this, 'numberRefer', 'lowAgeValue')},
				{dataIndex:'highAgeValue', title:'上限', render: this.textRender.bind(this, 'numberRefer', 'highAgeValue')},
			]},
			{title: '检查值', children: [
				{dataIndex:'valueRangeCondition', title:'边界',
					render: this.selectRender.bind(this, RangeOpts, 'numberRefer', 'valueRangeCondition')},
				{dataIndex:'lowValue', title:'下限', render: this.textRender.bind(this, 'numberRefer', 'lowValue')},
				{dataIndex:'highValue', title:'上限', render: this.textRender.bind(this, 'numberRefer', 'highValue')},
			]},
			{dataIndex:'result', title:'结果', render: this.selectRender.bind(this, ResultOpts, 'numberRefer', 'result')},
			{dataIndex:'result', title:'操作', render: this.refOpRender.bind(this, 'delete', 'numberRefer')},
		];
		let extra = (
			<Icon type="plus-circle-o"
			      style={{fontSize: 16, marginTop: 16, marginLeft: 5}}
			      onClick={this.onClickItem.bind(this, -1, 'numberRefer', 'add')}
			/>
		);
		const lines = [
			{
				split: 12,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '默认单位', tag: 'defaultUnit'
				}],
			},
		];
		let data = this.state.reference['numberRefer'];
		return (
			<Card title="数值条件" extra={extra}>
				{lines.map(this.renderLine.bind(this))}
				<Table size="small"
				       columns={columns}
				       dataSource={data}
				/>
			</Card>
		);
	}

	buildTextRefs() {
		const columns = [
			{dataIndex:'text', title:'文本', render: this.textRender.bind(this, 'textRefer', 'text')},
			{dataIndex:'result', title:'结果', render: this.selectRender.bind(this, ResultOpts, 'textRefer', 'result')},
			{dataIndex:'result', title:'操作', render: this.refOpRender.bind(this, 'delete', 'textRefer')},
		];
		let extra = (
			<Icon type="plus-circle-o"
			      style={{fontSize: 16, marginTop: 16, marginLeft: 5}}
			      onClick={this.onClickItem.bind(this, -1, 'textRefer', 'add')}
			/>
		);
		const lines = [
			{
				split: 12,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '否定词语', tag: 'negWords'
				}],
			},
		];
		let data = this.state.reference['textRefer'];
		return (
			<Card title="数值条件" extra={extra}>
				{lines.map(this.renderLine.bind(this))}
				<Table size="small"
				       columns={columns}
				       dataSource={data}
				/>
			</Card>
		);
	}

	isValidateContent() {
		const { id, name, code, reference } = this.state;
		let valid = true;
		let errMsg = [];
		if (reference['textRefer'].length === 0 && reference['numberRefer'].length === 0) {
			errMsg.push('至少添加一条数值或文本条件');
		}

		for (let i=0; i<reference['textRefer'].length; i++) {
			let { text, result } = reference['textRefer'][i];
			if (underscore.where(reference['textRefer'], {text: text}).length > 1) {
				errMsg.push('请删除重复的文本条件');
				continue;
			}
			if (text === 0) {
				errMsg.push('请输入文本条件字符串');
			}
		}

		for (let i=0; i<reference['numberRefer'].length; i++) {
			let refer = JSON.parse(JSON.stringify(reference['numberRefer'][i]));
			if (refer['lowValue'] === '' && refer['highValue'] === '') {
				errMsg.push('请输入数值条件上限值或下限值');
				continue
			}
			let result = refer['result'];
			delete(refer['result']);
			if (underscore.where(reference['numberRefer'], refer).length > 1) {
				errMsg.push('请删除重复的数值条件');
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
		const { id, name, code, reference, rangeSource, defaultUnit, negWords } = this.state;
		let textRefer = {};
		for (let i=0; i<reference['textRefer'].length; i++) {
			let { text, result } = reference['textRefer'][i];
			if (textRefer.hasOwnProperty(result)) {
				textRefer[result].push(text);
			} else {
				textRefer[result] = [text];
			}
		}

		let numberRefer = {};
		for (let i=0; i<reference['numberRefer'].length; i++) {
			let refer = JSON.parse(JSON.stringify(reference['numberRefer'][i]));
			let result = refer['result'];
			delete(refer['result']);
			if (numberRefer.hasOwnProperty(result)) {
				numberRefer[result].push(refer);
			} else {
				numberRefer[result] = [refer];
			}
		}

		let x = {
			defaultUnit: defaultUnit,
			rangeSource: rangeSource,
			negWords: negWords,
			numberRefer: numberRefer,
			textRefer: textRefer,
		};
		let rst = JSON.stringify(x);
		return rst;
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
		let title = '参考值设置';
		return (
			<Modal closable={false} title={title} visible={this.props.visible}
			       width={1000}
			       onCancel={this.onSubmit.bind(this, false)}
			       onOk={this.onSubmit.bind(this, true)}
			>
				{this.buildFormPart()}
				{this.buildNumberRefs()}
				{this.buildTextRefs()}
			</Modal>
		);
	}
}
