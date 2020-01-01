import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox, Switch } from "antd";
import PhysicalExamItemPopup from './PhysicalExamItemPopup';
import PackageRefPopup from './PackageRefPopup';

let underscore = require("underscore");
let Immutable = require('immutable');
import debounce from 'lodash/debounce';

import styles from "./Template.less";

function isString(str){
	return (typeof str=='string')&&str.constructor==String;
}

function findExistItem(items, tgtLabel) {
	let tgt = null;
	for (let i=0; i<items.length; i++) {
		let cur = items[i];
		if (cur.label == tgtLabel) {
			tgt = cur;
			break;
		}
	}
	return tgt;
}

function mergeItemOpt(existOne, itemOptOne) {
	if (!existOne) {
		return;
	}
	let value = [];
	for (let i=0; i<existOne.options.length; i++) {
		let cur = existOne.options[i];
		value.push(cur.value);
	}
	itemOptOne.value = value;
	return;
}

function mergeItem(existOne, itemOptOne) {
	if (!existOne) {
		return;
	}
	let refValues = existOne.value;
	if (isString(existOne.value)) {
		refValues = [existOne.value];
	}
	let value = [];
	for (let i=0; i<itemOptOne.options.length; i++) {
		let curOpt = itemOptOne.options[i];
		let idx = refValues.indexOf(curOpt.value);
		if (idx != -1) {
			value.push(curOpt.value);
		}
	}
	if (value.length === 0) {
		value.push('0');
	}
	itemOptOne.value = value;
	return;
}

function modifyItemType(itemOne) {
	if (itemOne.type != 'CHECKBOX') {
		return;
	}
	// change checkbox to radio only if 2 options available
	if (itemOne.options.length == 2) {
		itemOne.type = 'RADIO';
	}
}

export default class PhysicalExamEditor2 extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.template);
		// this.state = this.initData(mocks.PhysicalTemplate);
		this.onItemSearch = debounce(this.onItemSearch, 500);
	}

	componentDidMount() {
		// do nothing ???
	}

	initData(template) {
		let newState = {
			id: 0,

			itemId: '',
			itemOptions:[],
			selectItem: {},
			showItemPopup: false,

			items: [],
			demoText: '',
			isSmartTemplate: true,
			rawText: '',
		};
		if (!template) {
			return newState;
		}

		if (template.id) {
			newState.id = template.id;
		}
		if (template.category != 'PHYSICAL') {
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
		let newState = this.initData(packageOne.physical);
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

	onPreview() {
		const { items } = this.state;
		if (this.props.onPreview) {
			this.props.onPreview(items, function(data) {
				this.setState({demoText: data});
			}.bind(this));
		}
	}

	onItemSearch(keyword) {
		if (!keyword) {
			return;
		}
		if (this.props.onItemSearch) {
			this.props.onItemSearch(keyword, function(data) {
				this.setState({itemOptions: data});
			}.bind(this))
		}
	}

	onItemSelect(id, option) {
		const { itemOptions, items } = this.state;
		let itemOne = null;
		for (let i=0; i<itemOptions.length; i++) {
			if (itemOptions[i].v == id) {
				itemOne = itemOptions[i];
				if (isString(itemOne.content)) {
					itemOne.content = JSON.parse(itemOne.content);
				}
				break;
			}
		}
		let content = itemOne.content;
		if (content.type == 'TEXT') {
			this.onAddItem(true, content);
			return;
		} else if (content.type == 'RADIO') {
			// if (!content.value) {
			// 	content.value = '0';
			// }
			// content.type == 'CHECKBOX';
			// content.value = ['0'];
			// this.onAddItem(true, content);
			// return;
		} else if (content.type == 'CHECKBOX' && content.options.length==2) {
			// content.type = 'RADIO';
			// if (!content.value) {
			// 	content.value = '0';
			// }
			// this.onAddItem(true, content);
			// return;
		}

		// assuming only checkbox with multiple options here
		let existOne = findExistItem(items, content.label);
		mergeItemOpt(existOne, content);
		this.setState({
			showItemPopup: true,
			itemId: id,
			selectItem: content,
		});
	}

	collect() {
		const { items, isSmartTemplate, rawText } = this.state;
		if (isSmartTemplate) {
			let corrected = JSON.parse(JSON.stringify(items));
			for (let i=0; i<corrected.length; i++) {
				let curC = corrected[i];
				// if (curC.type == 'CHECKBOX' && curC.options.length == 2) {
				// 	curC.type = 'RADIO';
				// }
				switch(curC.type) {
				case 'CHECKBOX':
					if (!(curC.value instanceof Array) || curC.value.length == 0) {
						// curC.value = ['0'];
						// allow empty values
						curC.value = [];
					}
					break;
				case 'RADIO':
					if (!curC.value) {
						// curC.value = '0';
						// allow empty values
						curC.value = [];
					}
					break;
				case 'TEXT':
				default:
					curC.value = '';
					break;
				}
			}
			return corrected;
		}
		return rawText;
	}

	onChangeItem(index, mode, values) {
		let items = this.state.items;
		let itemOne = items[index];
		if (['TEXT'].indexOf(mode) != -1) {
			// values -> e
			itemOne.value = values.target.value;
		} else if (mode == 'RADIO') {
			let x = values.target.value;
			itemOne.value = [x];
		} else if (mode == 'SELECT') {
			//here value is an array
			if (values.length>1) {
				let zeroIdx = values.indexOf('0');
				let lastHasZero = (itemOne.value.indexOf('0') != -1);
				if (zeroIdx != -1) {
					if (lastHasZero) {
						values.splice(zeroIdx, 1);
					} else {
						values = ['0'];
					}
				}
			}
			itemOne.value = values;
		} else {
			itemOne.value = values;
		}
		this.setState({
			items: items,
		});
	}

	onDisableItem(index) {
		let items = this.state.items;
		let itemOne = items[index];
		if (itemOne.type == 'TEXT') {
			return;
		}
		itemOne.value = [];
		this.setState({
			items: items,
		});
	}

	onDeleteItem(index) {
		let items = this.state.items;
		items.splice(index, 1);
		this.setState({
			items: items,
		});
	}

	onAddItem(isUpdate, itemOne) {
		if (!isUpdate) {
			this.setState({
				showItemPopup: false,
			});
			return;
		}

		let items = this.state.items;
		let tgtIdx = -1;
		for (let i=0; i<items.length; i++) {
			if (items[i].label == itemOne.label) {
				tgtIdx = i;
				break;
			}
		}
		let modifyStr = '添加';
		if (tgtIdx>=0) {
			if (itemOne.type == 'CHECKBOX') {
				mergeItem(items[tgtIdx], itemOne);
			}
			items[tgtIdx] = itemOne;
			modifyItemType(items[tgtIdx]);
			modifyStr = '修改';
		} else {
			itemOne.value = [];
			modifyItemType(itemOne);
			items.push(itemOne);
		}
		this.setState({
			items: items,
			showItemPopup: false,
		}, function() {
			let title = modifyStr + '[' + itemOne.label + '] 成功';
			message.success(title);
		});
	}

	buildItemOneDataByType(itemOne, index) {
		if (itemOne.type == 'TEXT') {
			if (itemOne.description) {
				return (
					<Input style={{width:'100%'}}
					       value={itemOne.value} addonAfter={itemOne.description}
					       onChange={this.onChangeItem.bind(this, index, 'TEXT')}
					/>
				);
			}
			return (
				<Input style={{width:'100%'}}
						value={itemOne.value}
					    onChange={this.onChangeItem.bind(this, index, 'TEXT')}
				/>
			);
		}
		if (itemOne.type == 'RADIO') {
			// return (
			// 	<Radio.Group value={itemOne.value} onChange={this.onChangeItem.bind(this, index, 'RADIO')}>
			// 		{itemOne.options.map( o => (<Radio value={o.value}>{o.label}</Radio>))}
			// 	</Radio.Group>
			// );
			let x = '';
			if (itemOne.value.length>0) {
				x = itemOne.value[0];
			}
			return (
				<Radio.Group options={itemOne.options} value={x}
				             onChange={this.onChangeItem.bind(this, index, 'RADIO')}
				/>
			);
			// let fakeValues = [];
			// if (itemOne.value) {
			// 	fakeValues = itemOne.value;
			// }
			// return (
			// 	<Checkbox.Group
			// 		options={itemOne.options}
			// 		value={fakeValues}
			// 		onChange={this.onChangeItem.bind(this, index, 'RADIO')}
			// 	/>
			// );
		}
		if (itemOne.type == 'CHECKBOX') {
			return (
				<Checkbox.Group
					options={itemOne.options}
					value={itemOne.value}
					onChange={this.onChangeItem.bind(this, index, 'SELECT')}
				/>
			);
		}
		return null;
	}

	buildItemOne(itemOne, index, items) {
		let isNegative = -1;
		if (itemOne.type == 'RADIO') {
			if (itemOne.value == '0') {
				isNegative = 1;
			} else {
				isNegative = 0;
			}
		} else if (itemOne.type == 'CHECKBOX') {
			if (itemOne.value.indexOf('0') != -1) {
				isNegative = 1;
			}  else {
				isNegative = 0;
			}
		}
		let nameColor = 'black';
		switch (isNegative) {
			case 1: nameColor = 'green'; break;
			case 0: nameColor = 'red'; break;
			case -1:
			default: nameColor = 'black'; break;
		}
		let name = itemOne.label;
		// if (itemOne.type == 'RADIO') {
		// 	name = name + '(单选)';
		// }
		let nameComponent = (<span style={{color:nameColor}}>{name}</span>);
		if (name.length>8) {
			let shortName = name.substring(0, 7);
			// if (itemOne.type == 'RADIO') {
			// 	shortName = name.substring(0, 3) + '(单选)';
			// }
			nameComponent = (
				<Tooltip title={name}>
					<span style={{color:nameColor}}>{shortName}</span>
				</Tooltip>
			);
		}
		let curStyle = {marginTop:8};
		if (index == 0) {
			curStyle = {marginTop:2};
		}
		return (
			<Row style={curStyle}>
				<Col span={2}>
					<Icon type="delete" style={{cursor:'pointer'}}
					      onClick={this.onDeleteItem.bind(this, index)}/>
				</Col>
				<Col span={6} style={{cursor:'pointer'}}
				     onClick={this.onDisableItem.bind(this, index)}>
					{nameComponent}
				</Col>
				<Col span={15}>
					{this.buildItemOneDataByType(itemOne, index)}
				</Col>
			</Row>
		);
	}

	onChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState);
	}

	onTextChange(tag, e) {
		this.onChange(tag, e.target.value);
	}

	onShowRefPackage() {
		this.setState({
			showRefPackagePopup: true,
		});
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

	render() {
		const { demoText, itemId, itemOptions, items, selectItem, showItemPopup,
			isSmartTemplate, rawText } = this.state;
		let extraComponent = (
			<div>
				<Switch style={{marginRight:10}} checkedChildren="智能模板" unCheckedChildren="纯文本"
				        checked={isSmartTemplate}
				        onChange={this.onChange.bind(this, 'isSmartTemplate')}/>
				<Icon type="share-alt" style={{cursor:'pointer'}} onClick={this.onShowRefPackage.bind(this)}/>
			</div>
		);
		const bodyStyle = {height:300, padding:8};
		if (isSmartTemplate) {
			return (
				<div>
					<Card title="体格检查" bodyStyle={bodyStyle} extra={extraComponent}>
						<Row>
							<Col span={12}>
								<Row >
									<Select style={{width:'100%'}}
									        showSearch
									        value={''+itemId}
									        placeholder="请选择句段"
									        defaultActiveFirstOption={false}
									        showArrow={false}
									        filterOption={false}
									        onSearch={this.onItemSearch.bind(this)}
									        onSelect={this.onItemSelect.bind(this)}
									        notFoundContent={null}
									>
										{itemOptions.map(o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
									</Select>
								</Row>
								<Row style={{height:200, overflowY:'auto', marginTop:12}}>
									{items.map(this.buildItemOne.bind(this))}
								</Row>
								<Row style={{textAlign:'right', marginTop:8}}>
									<Button onClick={this.onPreview.bind(this)}>预览</Button>
								</Row>
							</Col>
							<Col span={11} offset={1}>
								<Input.TextArea style={{width:'100%'}} disabled={true}
								                autosize={{ minRows: 14, maxRows: 14 }}
								                value={demoText}
								/>
							</Col>
						</Row>
					</Card>
					<PhysicalExamItemPopup
						visible={showItemPopup}
						item={selectItem}
						onSubmit={this.onAddItem.bind(this)}
					/>
					{this.buildRefPackage()}
				</div>
			);
		}
		return (
			<div>
				<Card title="体格检查" bodyStyle={bodyStyle} extra={extraComponent}>
					<Input.TextArea style={{width:'100%',height:'100%'}}
					                value={rawText}
					                onChange={this.onTextChange.bind(this, 'rawText')}
					/>
				</Card>
				{this.buildRefPackage()}
			</div>
		);
	}
}


