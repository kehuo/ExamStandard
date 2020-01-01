import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox, DatePicker } from "antd";
import ElementComponent from './ElementComponent';
let underscore = require("underscore");
let Immutable = require('immutable');
let moment = require('moment');

import styles from "./Template.less";

const DefaultAge = {
	ageRange_start_val: '',
	ageRange_start_unit: 'year',
	ageRange_end_val: '',
	ageRange_end_unit: 'year',
};

export default class PackageConditionCard extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props);
	}

	initData(props) {
		let newState = {
			age: JSON.parse(JSON.stringify(DefaultAge)),
			gender: 'UNDEFINED',
		};
		if (props.data) {
			let x = {};
			if (props.data) {
				x = JSON.parse(props.data);
			}
			let tags = ['age', 'gender'];
			for (let i=0; i<tags.length; i++) {
				let tagOne = tags[i];
				switch (tagOne) {
					case 'age':
					{
						let curVal = x[tagOne];
						if (curVal) {
							newState[tagOne] = {
								ageRange_start_val: '' + curVal.start_val,
								ageRange_start_unit: curVal.start_unit,
								ageRange_end_val: '' + curVal.end_val,
								ageRange_end_unit: curVal.end_unit,
							};
						}
					}
						break;
					case 'gender':
					{
						let gVal = x[tagOne];
						if (!gVal) {
							gVal = 'UNDEFINED';
						}
						newState['gender'] = gVal;
					}
						break;
					default:
						newState[tagOne] = '' + x[tagOne];
						break;
				}
			}
		}
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = Immutable.is(this.props.data, nextProps.data);
		if (isSame || this.props.init) {
			return;
		}
		let newState = this.initData(nextProps);
		this.setState(newState);
	}

	collect() {
		let x = underscore.clone(this.state);
		let tags = ['age', 'gender'];
		for (let i=0; i<tags.length; i++) {
			let tagOne = tags[i];
			if (!x[tagOne]) {
				delete x[tagOne];
			}
			switch(tagOne){
				case 'age':
				{
					let curVal = x.age;
					if (!curVal.ageRange_start_unit || !curVal.ageRange_end_unit
						|| !curVal.ageRange_start_val ||!curVal.ageRange_end_val) {
						delete x[tagOne];
					} else {
						let y = {
							start_val: parseInt(curVal.ageRange_start_val),
							start_unit: curVal.ageRange_start_unit,
							end_val: parseInt(curVal.ageRange_end_val),
							end_unit: curVal.ageRange_end_unit,
						};
						x.age = y;
					}
				}
					break;
				case 'gender':
					if (x.gender == 'UNDEFINED') {
						delete x.gender;
					}
					break;
				default:
					break
			}
		}
		if (Object.keys(x).length == 0) {
			return null;
		}
		return x;
	}

	render() {
		const lines = [
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'selectSimple',
					title:'性别', tag:'gender',
					options:[{k:'女', v:'F'}, {k:'男', v:'M'},{k:'不区分', v:'UNDEFINED'}]
				}]
			},
			{
				split: 24,
				items: [{
					layout: {title:6, element:16}, elementType:'ageRange',
					title:'年龄范围', tag:'age'
				}]
			},
		];
		return (
			<Row>
				{lines.map(this.renderLine.bind(this))}
			</Row>
		)
	}
}