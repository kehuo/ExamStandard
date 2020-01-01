import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Tooltip, message, Button, Tag, Card, Collapse } from 'antd';
import TagPopup from './TagPopup';
import * as Const from './FeatureConstants';
import ElementComponent from '../../Template/ElementComponent';

import styles from '../TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

@connect(({ featureDesignOne }) => ({
	featureDesignOne
}))
export default class FeatureDesignPanel extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(null);
	}

	componentDidMount() {
		const { dispatch } = this.props;
		let query = this.props.location.query;
		if (query.id) {
			let callback = this.updateAll.bind(this);
			dispatch({
				type: 'featureDesignOne/fetch',
				payload: {
					id: query.id
				},
				callback: callback,
			});
		}
	}

	initData(data) {
		let newState = {
			id: 0,
			name: '',
			description: '',

			showTagPopup: false,
			tag: '',
			item: null,

			binEnum: '1',
			binValue: '2',

			oneHot:[],
			time: [],
			number: [],
		};
		if (!data) {
			return newState;
		}
		newState.id = data.id;
		newState.name = data.name;
		newState.description = data.description;
		if (data.content) {
			let content = JSON.parse(data.content);
			newState.binEnum = '' + content.bin.enum;
			newState.binValue = '' + content.bin.value;

			newState.number = content.number;
			newState.time = content.time;
			newState.oneHot = content.one_hot;
		}

		return newState;
	}

	updateAll(data) {
		let newState = this.initData(data);
		this.setState(newState);
	}

	onGotSubmitResult(isSuccess) {
		const { dispatch } = this.props;
		if (!isSuccess) {
			message.error('提交特征设计方案失败!');
			return;
		}
		message.success('提交特征设计方案成功');
		let webPath = `/train-model/surreal-model?active=FeatureDesign`;
		dispatch(routerRedux.push(webPath));
	}

	isValidContent() {
		const { id, name, description } = this.state;
		let rst = {
			ok: true, msg:''
		};
		if (!name || !description) {
			rst.ok = false;
			rst.msg = '请填写名称和说明!';
		}
		return rst;
	}

	buildContent() {
		const { id, name, description, binEnum, binValue, number, time, oneHot } = this.state;
		let rst = {
			id: id,
			name: name,
			description: description,
		};

		let content = {
			bin: {},
			number: number,
			time: time,
			one_hot: oneHot
		};
		content.bin.enum = parseInt(binEnum);
		content.bin.value = parseInt(binValue);
		rst.content = JSON.stringify(content);
		return rst;
	}

	onSubmit(isUpdate) {
		const { dispatch } = this.props;
		if (!isUpdate) {
			let webPath = `/train-model/surreal-model?active=FeatureDesign`;
			dispatch(routerRedux.push(webPath));
			return;
		}

		let rst = this.isValidContent();
		if (!rst.ok) {
			message.error(rst.msg);
			return;
		}

		let params = this.buildContent();
		let callback = this.onGotSubmitResult.bind(this);
		dispatch({
			type: 'featureDesignOne/edit',
			payload: params,
			callback: callback,
		});
	}

	buildBasic() {
		const BasicLines = [
			{
				split: 24,
				items: [{
					layout: {title: 4, element: 16}, elementType: 'input',
					title: '名称', tag: 'name'
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title: 4, element: 16}, elementType: 'textArea',
					title: '描述', tag: 'description'
				}]
			},
		];
		let extra = (
			<div>
				<Button type="primary" onClick={this.onSubmit.bind(this, true)}>提交修改</Button>
				<Button style={{marginLeft:6}} onClick={this.onSubmit.bind(this, false)}>返回</Button>
			</div>
		);
		return (
			<Card title="基本信息" type="small" extra={extra}>
				{BasicLines.map(this.renderLine.bind(this))}
			</Card>
		);
	}

	buildItemDescription(item, index, arrayX) {
		return (
			<Row gutter={8}>
				<Col span={6} style={{textAlign:'right', fontWeight:'bold', fontSize:16}}>
					{item.name}
				</Col>
				<Col span={17}>
					{item.description}
				</Col>
			</Row>
		);
	}

	buildDescription(items) {
		return (
			<Collapse bordered={false} defaultActiveKey={[]} style={{marginTop:-16}}>
				<Collapse.Panel header="说明" key="1">
					{items.map(this.buildItemDescription.bind(this))}
				</Collapse.Panel>
			</Collapse>
		);
	}

	buildBinPart() {
		const BinLines = [
			{
				split: 8,
				items: [{
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'当做枚举', tag:'binEnum',
					options: [{k:'是', v:'1'}, {k:'否', v:'0'}]
				}, {
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'枚举值集合', tag:'binValue',
					options:[{k:'二值', v:'2'}, {k:'三值', v:'3'}]
				}]
			},
		];
		return (
			<Card title="二进制变量" type="small">
				{this.buildDescription(Const.BinDescription)}
				<Row style={{height:10}}></Row>
				{BinLines.map(this.renderLine.bind(this))}
			</Card>
		);
	}

	onShowTagPopup(tag, item) {
		this.setState({
			showTagPopup: true,
			tag: tag,
			item: item,
		});
	}

	removeTag(mode, index) {
		let curState = this.state;
		let data = curState[mode];
		if (!data) {
			return;
		}
		data.splice(index, 1);
		this.setState(curState);
	}

	buildTagOne(mode, item, index, arrayX) {
		const ColorMap = {
			symptom: 'magenta', exam:'green', disease: 'blue',
			treatment: 'purple', medicine: 'orange'
		};
		let shortText = item.text;
		if (shortText.length > 8) {
			shortText = shortText.substring(0, 6) + '...';
		}
		let color = '#108ee9';
		if (ColorMap[item.type]) {
			color = ColorMap[item.type];
		}
		return (
			<Tag style={{marginBottom:6}} color={color}
				closable={true} onClose={this.removeTag.bind(this, mode, index)}
			><span onClick={this.onShowTagPopup.bind(this, mode, item)}>{shortText}</span></Tag>
		);
	}

 	buildNumberPart() {
	    const { number } = this.state;
		let extra = (
			<Button type="primary" onClick={this.onShowTagPopup.bind(this, 'number', null)}>添加</Button>
		);
		return (
			<Card title="数值变量" type="small" extra={extra}>
				{this.buildDescription(Const.NumberDescription)}
				<Row style={{width:'100%', maxHeight:200, overflowY:'auto', marginTop:10}}>
					{number.map(this.buildTagOne.bind(this, 'number'))}
				</Row>
			</Card>
		);
	}

	buildTimePart() {
		const { time } = this.state;
		let extra = (
			<Button type="primary" onClick={this.onShowTagPopup.bind(this, 'time', null)}>添加</Button>
		);
		return (
			<Card title="时间变量" type="small" extra={extra}>
				{this.buildDescription(Const.TimeDescription)}
				<Row style={{width:'100%', maxHeight:200, overflowY:'auto', marginTop:10}}>
					{time.map(this.buildTagOne.bind(this, 'time'))}
				</Row>
			</Card>
		);
	}

	buildOneHotPart() {
		const { oneHot } = this.state;
		let extra = (
			<Button type="primary" onClick={this.onShowTagPopup.bind(this, 'oneHot', null)}>添加</Button>
		);
		return (
			<Card title="枚举变量" type="small" extra={extra}>
				{this.buildDescription(Const.OneHotDescription)}
				<Row style={{width:'100%', maxHeight:200, overflowY:'auto', marginTop:10}}>
					{oneHot.map(this.buildTagOne.bind(this, 'oneHot'))}
				</Row>
			</Card>
		);
	}

	onQuery(mode, params, callback) {
		const { dispatch } = this.props;
		if (mode == 'vector') {
			dispatch({
				type: 'featureDesignOne/queryVector',
				payload: params,
				callback: callback,
			});
			return;
		}
		if (mode == 'extension') {
			dispatch({
				type: 'featureDesignOne/queryExtension',
				payload: params,
				callback: callback,
			});
			return;
		}
	}

	onAddTag(isUpdate, x) {
		const { tag } = this.state;
		let curState = this.state;
		if (isUpdate) {
			let tags = curState[tag];
			insertTag(tags, x)
		}
		curState.showTagPopup = false;
		curState.item = null;
		this.setState(curState);
	}

	render() {
		const { showTagPopup, tag, item } = this.state;
		return (
			<div style={{minWidth:1000}}>
				{this.buildBasic()}
				{this.buildBinPart()}
				{this.buildNumberPart()}
				{this.buildTimePart()}
				{this.buildOneHotPart()}
				<TagPopup
					visible={showTagPopup}
				    mode={tag}
				    item={item}
				    onQuery={this.onQuery.bind(this)}
				    onSubmit={this.onAddTag.bind(this)}
				/>
			</div>
		);
	}
}

function insertTag(tags, x) {
	let finished = false;
	for (let i=0; i<tags.length; i++) {
		let curTag = tags[i];
		if (curTag.text == x.text && curTag.type == x.type) {
			tags[i] = x;
			finished = true;
			break;
		}
	}
	if (!finished) {
		tags.push(x);
	}
	return;
}