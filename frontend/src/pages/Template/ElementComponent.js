import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox, DatePicker, InputNumber, Slider } from "antd";

let underscore = require("underscore");
let Immutable = require('immutable');
let moment = require('moment');

import styles from "./Template.less";

const AgePhase = ['新生儿','婴儿','其他'];
const UnitNameMap = {
	'新生儿': '天', '婴儿': '月', '其他': '岁'
};
const NumberConfigMap = {
	'天': {minVal:0, maxVal:31, step:0.5, defaultVal:14},
	'月': {minVal:1, maxVal:12, step:0.5, defaultVal:6},
	'岁': {minVal:1, maxVal:150, step:0.5, defaultVal:6},
};
export default class ElementComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (elementType == 'checkbox') {
			realVal = val.target.checked;
		} else if (elementType.startsWith('ageRange')) {
			if (!curState[tag]) {
				curState[tag] = {
					ageRange_start_val: '', ageRange_start_unit: '',
					ageRange_end_val: '', ageRange_end_unit: '',
				};
			}
			realVal = curState[tag];
			realVal[elementType] = val;
		} else if (elementType.startsWith('ageSelector')) {
			realVal = curState[tag];
			if (elementType == 'ageSelectorPhase') {
				realVal.phase = val;
				let unitChar = UnitNameMap[val];
				let unitConfig = NumberConfigMap[unitChar];
				realVal.number = unitConfig.defaultVal;
			} else if (elementType == 'ageSelectorNumber') {
				realVal.number = val;
			}
		}

		curState[tag] = realVal;
		this.setState(curState);
	}

	renderLabel(item, colWidth) {
		let val = this.state[item.tag];
		let layout = item.layout;
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.element} style={{marginLeft:6}}>
						<span>{val}</span>
					</Col>
				</Row>
			</Col>
		);
	}

	renderInputNumber(item, colWidth) {
		let val = this.state[item.tag];
		let layout = item.layout;
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.element} style={{marginLeft:6}}>
						<InputNumber style={{width:'100%'}} disabled={item.disabled}
						        min={item.min} max={item.max} step={item.step}
						        value={val}
						       onChange={this.onChangeElement.bind(this, 'inputNumber', item.tag)}
						/>
					</Col>
				</Row>
			</Col>
		);
	}

	renderInput(item, colWidth) {
		let val = this.state[item.tag];
		let layout = item.layout;
		if (item.addonAfter) {
			return (
				<Col span={colWidth}>
					<Row style={{marginBottom:6}}>
						<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
						<Col span={layout.element} style={{marginLeft:6}}>
							<Input style={{width:'100%'}} addonAfter={item.addonAfter}
							       value={val} disabled={item.disabled}
							       onChange={this.onChangeElement.bind(this, 'input', item.tag)}
							/>
						</Col>
					</Row>
				</Col>
			);
		}
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.element} style={{marginLeft:6}}>
						<Input style={{width:'100%'}} disabled={item.disabled}
						       value={val}
						       onChange={this.onChangeElement.bind(this, 'input', item.tag)}
						/>
					</Col>
				</Row>
			</Col>
		);
	}

	renderInputTextArea(item, colWidth) {
		let val = this.state[item.tag];
		if(val=='' && item.none) {
			val = item.none;
		}
		let layout = item.layout;
		let autoSize = { minRows: 6, maxRows: 6 };
		if (item.autoSize) {
			autoSize = item.autoSize;
		}
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.element} style={{marginLeft:6}}>
						<Input.TextArea style={{width:'100%'}} disabled={item.disabled}
						                autosize={autoSize}
						                value={val}
						                onChange={this.onChangeElement.bind(this, 'textArea', item.tag)}
						/>
					</Col>
				</Row>
			</Col>
		);
	}

	renderSimpleSelect(item, colWidth) {
		let val = this.state[item.tag];
		let layout = item.layout;
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.element} style={{marginLeft:6}}>
						<Select style={{width:'100%'}} disabled={item.disabled}
						        value={val}
						        defaultActiveFirstOption={false}
						        showArrow={true} allowClear
						        filterOption={false}
						        onChange={this.onChangeElement.bind(this, 'select', item.tag)}
						>
							{item.options.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Col>
		);
	}

	renderMultipleSelect(item, colWidth) {
		let val = this.state[item.tag];
		let layout = item.layout;
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.element} style={{marginLeft:6}}>
						<Select style={{width:'100%'}} mode="multiple" disabled={item.disabled}
						        value={val}
						        defaultActiveFirstOption={false}
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChangeElement.bind(this, 'select', item.tag)}
						>
							{item.options.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Col>
		);
	}

	renderRemoteSelect(item, colWidth) {
		let val = this.state[item.tag];
		let layout = item.layout;
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.element} style={{marginLeft:6}}>
						<Select style={{width:'100%'}}
						        showSearch disabled={item.disabled}
						        value={val} allowClear
						        defaultActiveFirstOption={false}
						        showArrow={false}
						        filterOption={false}
						        onSearch={item.searchFunc}
						        onChange={this.onChangeElement.bind(this, 'select', item.tag)}
						        notFoundContent={null}
						>
							{item.options.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Col>
		);
	}

	renderRemoteMultipleSelect(item, colWidth) {
		let val = this.state[item.tag];
		let layout = item.layout;
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.element} style={{marginLeft:6}}>
						<Select style={{width:'100%'}} mode="multiple"
						        showSearch disabled={item.disabled}
						        value={val} allowClear
						        defaultActiveFirstOption={false}
						        showArrow={false}
						        filterOption={false}
						        onSearch={item.searchFunc}
						        onChange={this.onChangeElement.bind(this, 'select', item.tag)}
						        notFoundContent={null}
						>
							{item.options.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Col>
		);
	}

	renderTagsSelect(item, colWidth) {
		let val = this.state[item.tag];
		let layout = item.layout;
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.element} style={{marginLeft:6}}>
						<Select style={{width:'100%'}} disabled={item.disabled}
						        value={val} mode="tags"
						        defaultActiveFirstOption={false}
						        filterOption={false}
						        onChange={this.onChangeElement.bind(this, 'select', item.tag)}
						>
							{item.options.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Col>
		);
	}

	renderDatePickerSimple(item, colWidth) {
		let val = this.state[item.tag];
		let layout = item.layout;
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.element} style={{marginLeft:6}}>
						<DatePicker style={{width:'100%'}} disabled={item.disabled}
						            value={val}
						            onChange={this.onChangeElement.bind(this, 'datePickerSimple', item.tag)}
						/>
					</Col>
				</Row>
			</Col>
		);
	}

	renderDatePickerRange(item, colWidth) {
		let val = this.state[item.tag];
		let layout = item.layout;
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.element} style={{marginLeft:6}}>
						<DatePicker.RangePicker style={{width:'100%'}} disabled={item.disabled}
						            value={val}
						            onChange={this.onChangeElement.bind(this, 'datePickerRange', item.tag)}
						/>
					</Col>
				</Row>
			</Col>
		);
	}

	renderAgeRange(item, colWidth) {
		let val = this.state[item.tag];
		let layout = item.layout;
		const units = [{k:'年',v:'year'},{k:'月',v:'month'},{k:'日',v:'day'}];
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.element} style={{marginLeft:6}}>
						<Row>
							<Col span={3}>起始</Col>
							<Col span={4}>
								<InputNumber style={{width:'100%'}} disabled={item.disabled}
								       value={val.ageRange_start_val}
								       onChange={this.onChangeElement.bind(this, 'ageRange_start_val', item.tag)}
								/>
							</Col>
							<Col span={4}>
								<Select style={{width:'100%'}}
								        showSearch disabled={item.disabled}
								        value={val.ageRange_start_unit}
								        defaultActiveFirstOption={false}
								        showArrow={true}
								        filterOption={false}
								        onSearch={item.searchFunc}
								        onChange={this.onChangeElement.bind(this, 'ageRange_start_unit', item.tag)}
								        notFoundContent={null}
								>
									{units.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
								</Select>
							</Col>
							<Col span={1}> ~ </Col>
							<Col span={3}>结束</Col>
							<Col span={4}>
								<InputNumber style={{width:'100%'}} disabled={item.disabled}
								       value={val.ageRange_end_val}
								       onChange={this.onChangeElement.bind(this, 'ageRange_end_val', item.tag)}
								/>
							</Col>
							<Col span={4}>
								<Select style={{width:'100%'}}
								        showSearch disabled={item.disabled}
								        value={val.ageRange_end_unit}
								        defaultActiveFirstOption={false}
								        showArrow={true}
								        filterOption={false}
								        onSearch={item.searchFunc}
								        onChange={this.onChangeElement.bind(this, 'ageRange_end_unit', item.tag)}
								        notFoundContent={null}
								>
									{units.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
								</Select>
							</Col>
						</Row>
					</Col>
				</Row>
			</Col>
		);
	}

	renderSlider(item, colWidth) {
		let val = this.state[item.tag];
		let layout = item.layout;
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.element} style={{marginLeft:6}}>
						<Slider min={item.min} max={item.max} step={item.step}
						        value={val}
						        onChange={this.onChangeElement.bind(this, 'slider', item.tag)}
						/>
					</Col>
					<Col span={layout.inputNumber} style={{marginLeft:6}}>
						<InputNumber min={item.min} max={item.max} step={item.step}
						             value={val}
						             onChange={this.onChangeElement.bind(this, 'slider', item.tag)}
						/>
					</Col>
				</Row>
			</Col>
		);
	}

	renderCheckboxSimple(item, colWidth) {
		let val = this.state[item.tag];
		let layout = item.layout;
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.inputNumber} style={{marginLeft:6}}>
						<Checkbox style={{marginLeft:6}}
							checked={val}
							onChange={this.onChangeElement.bind(this, 'checkbox', item.tag)}>
						</Checkbox>
					</Col>
				</Row>
			</Col>
		);
	}

	renderAgeSelector(item, colWidth) {
		let val = this.state[item.tag];
		let unitChar = UnitNameMap[val.phase] ? UnitNameMap[val.phase] : '岁';
		let unitConfig = NumberConfigMap[unitChar];
		let layout = item.layout;
		return (
			<Col span={colWidth}>
				<Row style={{marginBottom:6}}>
					<Col span={layout.title} style={{textAlign:'right'}}>{item.title}:</Col>
					<Col span={layout.element} style={{marginLeft:6}}>
						<Row>
							<Col span={11}>
								<Select style={{width:'100%'}}
								        showArrow={true} disabled={item.disabled}
								        value={val.phase}
								        onChange={this.onChangeElement.bind(this, 'ageSelectorPhase', item.tag)}
								>
									{AgePhase.map( o=> <Select.Option key={o}>{o}</Select.Option> )}
								</Select>
							</Col>
							<Col span={12}>
								<InputNumber style={{marginLeft: 6, width:'70%'}}
									min={unitConfig.minVal} max={unitConfig.maxVal}
								    step={unitConfig.step}
								    val={val.number}
									onChange={this.onChangeElement.bind(this, 'ageSelectorNumber', item.tag)}
								/>{unitChar}
							</Col>
						</Row>
					</Col>
				</Row>
			</Col>
		);
	}

	renderElement(colWidth, item, idx, itemArray) {
		let element = null;
		switch (item.elementType) {
			case 'input':
				element = this.renderInput(item, colWidth);
				break;
			case 'inputNumber':
				element = this.renderInputNumber(item, colWidth);
				break;
			case 'textArea':
				element = this.renderInputTextArea(item, colWidth);
				break;
			case 'selectSimple':
				element = this.renderSimpleSelect(item, colWidth);
				break;
			case 'selectTags':
				element = this.renderTagsSelect(item, colWidth);
				break;
			case 'selectMultiple':
				element = this.renderMultipleSelect(item, colWidth);
				break;
			case 'selectRemote':
				element = this.renderRemoteSelect(item, colWidth);
				break;
			case 'selectRemoteMultiple':
				element = this.renderRemoteMultipleSelect(item, colWidth);
				break;
			case 'datePickerSimple':
				element = this.renderDatePickerSimple(item, colWidth);
				break;
			case 'datePickerRange':
				element = this.renderDatePickerRange(item, colWidth);
				break;
			case 'ageRange':
				element = this.renderAgeRange(item, colWidth);
				break;
			case 'label':
				element = this.renderLabel(item, colWidth);
				break;
			case 'slider':
				element = this.renderSlider(item, colWidth);
				break;
			case 'checkboxSimple':
				element = this.renderCheckboxSimple(item, colWidth);
				break;
			case 'ageSelector':
				element = this.renderAgeSelector(item, colWidth);
				break;
			default:
				break;
		}
		return element;
	}

	renderLine(lineOne, idx, lines) {
		return (
			<div>
				<Row>
					{lineOne.items.map(this.renderElement.bind(this, lineOne.split))}
				</Row>
			</div>
		)
	}

	render() {
		const lines = [
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'datePickerSimple',
					title:'出生日期', tag:'birthday'
				}, {
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'性别', tag:'gender',
					options:[{k:'女', v:'F'}, {k:'男', v:'M'}]
				}]
			},
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'input',
					title:'身高', tag:'height', addonAfter:'cm'
				}, {
					layout: {title:6, element:16}, elementType:'input',
					title:'体重', tag:'weight', addonAfter:'kg'
				}, {
					layout: {title:6, element:16}, elementType:'input',
					title:'体温', tag:'temperature', addonAfter:'°C'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 2, element: 16}, elementType: 'textArea',
					title: '主述', tag: 'complaint'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 2, element: 16}, elementType: 'ageRange',
					title: '年龄范围', tag: 'age'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 2, element: 16}, elementType: 'label',
					title: '主述1', tag: 'complaint'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 2, element: 10, inputNumber:8}, elementType: 'slider',
					title: '数值', tag: 'numberX'
				}]
			},
		];
		return (
			<Card title="问诊信息">
				{lines.map(this.renderLine.bind(this))}
			</Card>
		)
	}

	computeBirthday(ageVal, baseTs=null) {
		const UnitOpMap = {
			'天': 'days',
			'月': 'months',
			'岁': 'years',
		};
		let x = moment();
		if (baseTs) {
			x = moment(baseTs, 'YYYY-MM-DD');
		}
		let unitChar = UnitNameMap[ageVal.phase];
		let unit = UnitOpMap[unitChar];
		let y = parseFloat(ageVal.number);
		x.subtract(y, unit);
		let z = x.format('YYYY-MM-DD');
		return z;
	}
}
