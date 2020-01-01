import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Checkbox, message, Button,
	Tooltip, Radio, Card, Tag, Divider } from 'antd';
import { buildStatTreeData } from './stat2featureUtils';

import styles from '../TrainModel.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

export default class FeatureDesignMiniPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(null);
	}

	initData(item) {
		let newState = {
			timeTypes: [],

			vType: 'bin',
			extension: [],
		};
		if (item) {
			newState = JSON.parse(JSON.stringify(item));
		}
		return newState;
	}

	componentDidMount() {
		// TODO
	}

	componentWillReceiveProps(nextProps) {
		let x = JSON.stringify(this.props.item);
		let y = JSON.stringify(nextProps.item);
		let isSame = (x==y);
		if (isSame) {
			return;
		}
		let newState = this.initData(nextProps.item);
		this.setState(newState);
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea','radio'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (elementType == 'checkbox') {
			realVal = val.target.checked;
		}

		if (tag.startsWith('ext')) {
			let index = parseInt(tag.substring(3));
			curState['extension'][index].checked = realVal;
		} else {
			curState[tag] = realVal;
		}

		this.setState(curState);
	}

	buildTimeCfg() {
		const { timeTypes } = this.state;
		const typeOpts = ['onset','duration'];
		return (
			<Row>
				<Divider orientation="left">
					<span style={{fontSize:20, fontWeight:'bold'}}>时间矢量</span>
				</Divider>
				<Row>
					<Col span={6} style={{textAlign:'right'}}>事件类型:</Col>
					<Col span={16} style={{marginLeft:6}}>
						<Checkbox.Group style={{marginLeft:6}} options={typeOpts}
						                value={timeTypes}
						          onChange={this.onChangeElement.bind(this, 'checkboxGroup', 'timeTypes')}>
						</Checkbox.Group>
					</Col>
				</Row>
			</Row>
		);
	}

	build3Type() {
		const { vType } = this.state;
		const typeOpts = ['bin', 'number','oneHot'];
		return (
			<Row>
				<Divider orientation="left">
					<span style={{fontSize:20, fontWeight:'bold'}}>排他矢量</span>
				</Divider>
				<Row>
					<Col span={6} style={{textAlign:'right'}}>矢量类型:</Col>
					<Col span={17} style={{marginLeft:6}}>
						<Radio.Group style={{marginLeft:6}} size="small"
						             options={typeOpts}
						                value={vType}
						                onChange={this.onChangeElement.bind(this, 'radio', 'vType')}>
						</Radio.Group>
					</Col>
				</Row>
			</Row>
		)
	}

	buildExtOne(extOne, index, extension) {
		return (
			<Tag.CheckableTag checked={extOne.checked} style={{marginTop:10}}
			                  onChange={this.onChangeElement.bind(this, 'tagCheck', 'ext'+index)}
			>
				{extOne.name}
			</Tag.CheckableTag>
		);
	}

	buildOneHotCfg() {
		const { vType, extension } = this.state;
		if (vType != 'oneHot') {
			return null;
		}

		return (
			<Row style={{marginTop:12}}>
				<Row style={{fontWeight:'bold'}}>可选扩展</Row>
				<Row>
					{extension.map(this.buildExtOne.bind(this))}
				</Row>
			</Row>
		);
	}

	onSubmit() {
		const { vType, text } = this.props;
		if (this.props.onSubmit) {
			let feature = text + '$' + vType;
			let x = JSON.stringify(this.state);
			this.props.onSubmit(feature, x);
		}
	}

	buildNameTag(vType, hotFeature) {
		const TypeColorMap = {
			exam:'green', symptom:'magenta', disease:'geekblue',
			treatment:'volcano', medicine:'purple'
		};
		if (!hotFeature) {
			return null;
		}

		let color = TypeColorMap[vType];
		if (!color) {
			color = '#f50';
		}

		let text = hotFeature;
		let component = text;
		if (text.length > 12) {
			let showText = text.substring(0, 12-2) + '...';
			component = (
				<Tooltip title={text}>
					{showText}
				</Tooltip>
			);
		}
		return (
			<Tag color={color}>{component}</Tag>
		);
	}

	render() {
		const { vType, text } = this.props;
		let nameComp = this.buildNameTag(vType, text);
		return (
			<Card title="特征设计" size="small">
				<Row>{nameComp}</Row>
				{this.buildTimeCfg()}
				{this.build3Type()}
				{this.buildOneHotCfg()}
				<Row style={{textAlign:'right', marginRight:20, marginTop:6}}>
					<Button type="primary" onClick={this.onSubmit.bind(this)}>确定</Button>
				</Row>
			</Card>
		);
	}
}
