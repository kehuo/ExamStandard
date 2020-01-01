import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Divider, Button, Card, InputNumber, Switch, message, Modal } from "antd";
import PackageRefPopup from './PackageRefPopup';
let underscore = require("underscore");
let Immutable = require('immutable');
import debounce from 'lodash/debounce';
import styles from "./Template.less";

const emptyItem = {
	rt: {value:0, unit:'day'},
	features: [],
};

const TimeUnitOptions = [
	{k:'年', v:'year'}, {k:'月', v:'month'}, {k:'周', v:'week'}, {k:'天', v:'day'},
	{k:'小时', v:'hour'}
];

const HourMap = {
	'year': 24*365,
	'month': 24*30,
	'week': 24*7,
	'day': 24*1,
	'hour': 1,
};

function convert2hour(val, unit) {
	let value = parseFloat(val);
	if (HourMap[unit]) {
		value = value * HourMap[unit];
	}
	return value;
}

function compareByRelativeTime(a, b) {
	let aHour = convert2hour(a.rt.value, a.rt.unit);
	let bHour = convert2hour(b.rt.value, b.rt.unit);
	if (aHour < bHour) {
		return 1;
	}
	if (aHour > bHour) {
		return -1;
	}
	return 0;
}

export default class CurrentHistoryEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.template);
		// this.state = this.initData(PresentTemplate);
		this.onSearchSymptoms = debounce(this.onSearchSymptoms, 500);
	}

	componentDidMount() {
		// this.initData(this.props);
	}

	initData(template) {
		let newState = {
			id: 0,
			itemOptions:[],

			showRefPackagePopup: false,

			showCustomerText: false,
			hotIdx: -1,
			udfText: '',

			isSmartTemplate: true,
			rawText: '',
			items: [],
			lastItem: JSON.parse(JSON.stringify(emptyItem)),
			demoText: ''
		};
		if (!template) {
			return newState;
		}

		if (template.id) {
			newState.id = template.id;
		}
		if (template.category != 'PRESENT') {
			message.warn('错误模板!使用空模板');
			return newState;
		}
		if (template.type === 'SEG_FORMAT_V1' || template.type === 'SEG_FORMAT_V2') {
			newState.items = template.content;
		} else {
			newState.isSmartTemplate = false;
			newState.rawText = template.content;
		}
		return newState;
	}

	updateContent(packageOne) {
		let newState = this.initData(packageOne.present);
		this.setState(newState);
	}

	componentWillReceiveProps(nextProps) {
		let isSame = Immutable.is(this.props.template, nextProps.template);
		if (isSame || this.props.init) {
			return;
		}
		let newState = this.initData(nextProps.template);
		this.setState(newState);
	}

	onChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState);
	}

	onShowRefPackage() {
		this.setState({
			showRefPackagePopup: true,
		});
	}

	collect() {
		const { items, id, isSmartTemplate, rawText } = this.state;
		let x = {
			id: id,
			category: 'PRESENT',
		}
		if (isSmartTemplate) {
			x.type = 'SEG_FORMAT_V1';
			x.content = items;
		} else {
			x.type = 'TEXT';
			x.content = rawText;
		}
		return x;
	}

	onPreview() {
		const { items } = this.state;
		if (this.props.onPreview) {
			this.props.onPreview(items, function(data) {
				this.setState({demoText: data});
			}.bind(this))
		}
	}

	onChangeItemOne(index, tag, val) {
		let items = this.state.items;
		let curItem = this.state.lastItem;
		if (index != -1) {
			curItem = items[index];
		}
		switch (tag) {
			case 'unit':
				curItem.rt.unit = val;
				break;
			case 'value':
				curItem.rt.value = val;
				break;
			case 'features':
				curItem.features = val;
				break;
			default:
				break;
		}
		if (index != -1) {
			if (['unit','value'].indexOf(tag) != -1) {
				items = items.sort(compareByRelativeTime);
			}
			this.setState({
				items: items,
			});
		} else {
			this.setState({
				lastItem: curItem
			});
		}
	}

	onSearchSymptoms(keyword) {
		if (!keyword) {
			return;
		}
		if (this.props.onSearchSymptoms) {
			this.props.onSearchSymptoms(keyword, function(data) {
				this.setState({itemOptions: data});
			}.bind(this))
		}
	}

	onDeleteItem(index) {
		let items = this.state.items;
		items.splice(index, 1);
		this.setState({
			items: items,
		});
	}

	onAddItem() {
		let items = this.state.items;
		let lastItem = this.state.lastItem;

		let sameRt = false;
		let refRt = lastItem.rt;
		for (let i=0; i<items.length; i++) {
			let ci = items[i].rt;
			if (underscore.isEqual(refRt, ci)) {
				sameRt = true;
				break;
			}
		}
		if (sameRt) {
			message.error('已经有相同的时段!');
			return;
		}
		items.push(lastItem);
		let newItems = items.sort(function (a, b) {
			let rtA = a.rt;
			let hoursA = HourMap[rtA.unit]*parseInt(rtA.value);
			let rtB = b.rt;
			let hoursB = HourMap[rtB.unit]*parseInt(rtB.value);
			return hoursB - hoursA;
		});
		this.setState({
			items: newItems,
			lastItem: JSON.parse(JSON.stringify(emptyItem)),
		});
	}

	onShowCustomerText(index) {
		this.setState({
			showCustomerText: true,
			hotIdx: index,
			udfText: '',
		});
	}

	buildItemOne(itemOne, index, items) {
		const { itemOptions } = this.state;
		let relativeTime = itemOne.rt;
		let features = itemOne.features;
		let opComponent = (
			<Icon type="minus-circle" style={{color:'red', fontSize:20, cursor:'pointer'}}
			      onClick={this.onDeleteItem.bind(this, index)} />
		);
		if (index == -1) {
			opComponent = (
				<Icon type="plus-circle" style={{color:'green', fontSize:20, cursor:'pointer'}}
				      onClick={this.onAddItem.bind(this)} />
			);
		}
		return (
			<Row gutter={16} style={{marginTop:6}}>
				<Col span={5}>
					<Row>
						<Col span={10}>
							<InputNumber style={{width:60}}
								value={relativeTime.value}
								onChange={this.onChangeItemOne.bind(this, index, 'value')}
							/>
						</Col>
						<Col span={10} offset={1}>
							<Select style={{width:70}}
							        value={relativeTime.unit}
							        onChange={this.onChangeItemOne.bind(this, index, 'unit')}
							>
								{TimeUnitOptions.map( o => (<Select.Option key={o.v}>{o.k}</Select.Option>))}
							</Select>
						</Col>
						<Col span={1} style={{textAlign:'left'}}>前</Col>
					</Row>
				</Col>
				<Col span={17}>
					<Select mode="multiple" style={{width:'100%'}} placeholder="请选择症状"
					        filterOption={false}
							onChange={this.onChangeItemOne.bind(this, index, 'features')}
						    onSearch={this.onSearchSymptoms.bind(this)}
					        value={features}
					>
						{itemOptions.map( o => (<Select.Option key={o.v}>{o.k}</Select.Option>))}
					</Select>
				</Col>
				<Col span={1} style={{textAlign:'center'}}>
					<Icon type="highlight" style={{color:'blue', fontSize:20, cursor:'pointer'}}
					      onClick={this.onShowCustomerText.bind(this, index)}/>
				</Col>
				<Col span={1} style={{textAlign:'center'}}>
					{opComponent}
				</Col>
			</Row>
		);
	}

	onTextChange(tag, e) {
		this.onChange(tag, e.target.value);
	}

	onGetPackage(isUpdate, packageId) {
		this.setState({
			showRefPackagePopup: false
		}, function () {
			if (isUpdate) {
				this.props.onGetPackage(packageId, this.updateContent.bind(this));
			}
		}.bind(this));
	}

	buildRefPackage() {
		const { showRefPackagePopup} = this.state;
		return (
			<PackageRefPopup visible={showRefPackagePopup}
			                 fetchListData={this.props.fetchListData}
			                 onGetPackage={this.onGetPackage.bind(this)}
			/>
		);
	}

	onAddCustomerText(isUpdate) {
		const { hotIdx, items, udfText, lastItem } = this.state;
		let newState = {
			showCustomerText: false
		};
		if (isUpdate) {
			let features = lastItem.features;
			if (hotIdx >= 0) {
				features = items[hotIdx].features;
			}
			features.push('text$'+udfText);
			newState.features = features;
		}
		this.setState(newState);
	}

	buildCustomerTextPopup() {
		const { udfText, showCustomerText } = this.state;
		return (
			<Modal title="自定义文本症状" visible={showCustomerText} closable={false}
			       okText="添加" onOk={this.onAddCustomerText.bind(this, true)}
				   cancelText="取消" onCancel={this.onAddCustomerText.bind(this, false)}
			>
				<Row>
					<Col span={6}>{'自定义文本:  '}</Col>
					<Col span={18}>
						<Input style={{width:'90%'}}
						       value={udfText}
						       onChange={this.onTextChange.bind(this, 'udfText')}
						/>
					</Col>
				</Row>
			</Modal>
		);
	}

	render() {
		const { isSmartTemplate } = this.state;
		let extraComponent = (
			<div>
				<Switch style={{marginRight:10}} checkedChildren="智能模板" unCheckedChildren="纯文本"
				        checked={isSmartTemplate}
				        onChange={this.onChange.bind(this, 'isSmartTemplate')}/>
				<Icon type="share-alt" style={{cursor:'pointer'}} onClick={this.onShowRefPackage.bind(this)}/>
			</div>
		);
		const { demoText, lastItem, items, rawText } = this.state;
		const bodyStyle = {height:300, padding:8};
		if (isSmartTemplate) {
			return (
				<Card title="现病史" extra={extraComponent} bodyStyle={bodyStyle}>
					<Row gutter={16}>
						<Col span={4} className={styles.presentTableTitle}>时间</Col>
						<Col span={18} className={styles.presentTableTitle}>症状</Col>
					</Row>
					<Row style={{height:200, overflowY:'auto', paddingRight:10}}>
						{items.map(this.buildItemOne.bind(this))}
						{this.buildItemOne(lastItem, -1, null)}
					</Row>
					<Row style={{height:60}}>
						<Col span={20}>
							<Input.TextArea style={{width:'100%',height:'100%'}} disabled={true}
						                value={demoText}
							/>
						</Col>
						<Col span={2} offset={1}>
								<Button onClick={this.onPreview.bind(this, false)}
								        style={{marginRight:40}}>预览</Button>
						</Col>
					</Row>
					{this.buildRefPackage()}
					{this.buildCustomerTextPopup()}
				</Card>
			);
		} else {
			return (
				<Card title="现病史" extra={extraComponent} bodyStyle={bodyStyle}>
					<Row style={{height:100}}>
						<Input.TextArea style={{width:'100%',height:'100%'}}
						                value={rawText}
						                onChange={this.onTextChange.bind(this, 'rawText')}
						/>
					</Row>
					{this.buildRefPackage()}
				</Card>
			);
		}
	}
}
