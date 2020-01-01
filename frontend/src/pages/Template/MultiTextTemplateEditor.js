import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Divider, Button, Card, InputNumber, Switch, message, Modal } from "antd";
import PackageRefPopup from './PackageRefPopup';
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Template.less";

const TemplateKeys = [
	{v:'family', k:'家族史'}, {v:'allergy', k:'过敏史'}, {v:'past', k:'既往史'},
];
export default class MultiTextTemplateEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props);
	}

	componentDidMount() {
		// this.initData(this.props);
	}

	initData(props) {
		let template = props.template;
		let newState = {};
		for (let i=0; i<TemplateKeys.length; i++) {
			let curK = TemplateKeys[i];
			// {
			// 		"id": 320,
			// 		"category": "FAMILY",
			// 		"type": "TEXT",
			// 		"description": ""
			// 		"content": "山药2",
			// }
			let content = '';
			if(template[curK.v] && template[curK.v].type == 'TEXT' && template[curK.v].content) {
				content = template[curK.v].content;
			}
			if (!content) {
				content = '无';
			}
			newState[curK.v] = content;
		}
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = Immutable.is(this.props.template, nextProps.template);
		if (isSame || this.props.init) {
			return;
		}
		let newState = this.initData(nextProps);
		this.setState(newState);
	}

	onChangeText(tag, e) {
		let curState = this.state;
		let content = e.target.value;
		curState[tag] = content;
		this.setState(curState);
	}

	collect() {
		let x = {};
		for (let i=0; i<TemplateKeys.length; i++) {
			let curK = TemplateKeys[i];
			let content = this.state[curK.v];
			if (content == '无') {
				content = '';
			}
			x[curK.v] = content;
		}
		return x;
	}

	buildTemplateOne(cfg, index, dataArray) {
		let content = this.state[cfg.v];
		return (
			<Col span={8}>
				<Row style={{width:'100%', textAlign:'center'}}>{cfg.k}</Row>
				<Row style={{width:'100%', textAlign:'center'}}>
					<Input.TextArea
						style={{width:'90%',height:'100%'}}
						onChange={this.onChangeText.bind(this, cfg.v)}
						value={content}
					/>
				</Row>
			</Col>
		);
	}

	render() {
		const bodyStyle = {height:100, padding:8};
		return (
			<Card bodyStyle={bodyStyle}>
				<Row gutter={8}>
					{TemplateKeys.map(this.buildTemplateOne.bind(this))}
				</Row>
			</Card>
		);
	}
}
