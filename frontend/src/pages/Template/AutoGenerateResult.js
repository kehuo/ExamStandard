import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
import ElementComponent from './ElementComponent';

let underscore = require("underscore");
let Immutable = require('immutable');
let moment = require('moment');

import styles from "./Template.less";

export default class AutoGenerateResult extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = {
			present: '',
			physical: '',
			history: '',
			family: '',
			allergy: '',
			exams: [],
		};
	}

	componentWillReceiveProps(nextProps) {
		let isSame = Immutable.is(this.props.item, nextProps.item);
		if (isSame) {
			return;
		}
		let item = nextProps.item;
		this.setState({
			present: item.present,
			physical: item.physical,
			history: item.history,
			family: item.family,
			allergy: item.allergy,
			exams: item.exams,
		});
	}

	buildExamOne(examOne, idx, exams) {
		let mark = (
			<Icon type="stop" style={{color:'red'}} />
		);
		if (examOne.checked) {
			mark = (
				<Icon type="fire" style={{color:'blue'}} />
			);
		}
		return (
			<Col span={6}>
				{mark}
				{examOne.name}
			</Col>
		);
	}

	buildExams() {
		const { exams } = this.state;
		return (
			<Card title="推荐检查" style={{marginTop:10}}>
				<Row>
					{exams.map(this.buildExamOne.bind(this))}
				</Row>
			</Card>
		);
	}

	buildText() {
		const lines = [
			{
				split: 24,
				items: [{
					layout: {title:2, element:20}, elementType:'textArea',
					title:'现病史', tag:'present', none:'无',
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:20}, elementType:'textArea',
					title:'体格检查', tag:'physical', none:'无',
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:20}, elementType:'textArea',
					title:'既往史', tag:'history', none:'无',
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:20}, elementType:'textArea',
					title:'家族史', tag:'family', none:'无',
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:2, element:20}, elementType:'textArea',
					title:'过敏史', tag:'allergy', none:'无',
				}]
			},
		];
		return (
			<Card title="生成部分">
				{lines.map(this.renderLine.bind(this))}
			</Card>
		);
	}

	render() {
		return (
			<div style={{marginTop:10}}>
				{this.buildText()}
				{this.buildExams()}
			</div>
		);
	}
}
