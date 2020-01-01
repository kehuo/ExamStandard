import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Popconfirm, message, Button, Tabs, Card,
	Tooltip, Collapse, Checkbox } from 'antd';
import ElementComponent from '../../Template/ElementComponent';
import * as EmrCaseUtils from './EmrCaseUtils';

import styles from '../Community.less';
let underscore = require('underscore');
let immutable = require('immutable');
import {routerRedux} from 'dva/router';
import debounce from 'lodash/debounce';

export default class CaseDiagnosis extends React.Component {
	constructor(props) {
		super(props);
		// [{code, name, confirmed}]
		this.state = this.updateOne(props.item);
		this.onQueryDisease = debounce(this.onQueryDisease, 500);
	}

	componentWillReceiveProps(nextProps) {
		let isSame = immutable.is(this.props.item, nextProps.item);
		if (isSame) {
			return;
		}
		let newState = this.updateOne(nextProps.item);
		this.setState(newState);
	}

	updateOne(item) {
		let newState = {
			target: [],
		};
		if (item) {
			let itemObj = JSON.parse(item);
			let x = [];
			for (let i=0; i<itemObj.target.length; i++) {
				let confBool = (itemObj.confirmed[i]==1 ? true : false);
				let optVal = itemObj.code[i] + ' ' + itemObj.target[i];
				let curT = {
					code: itemObj.code[i],
					confirmed: confBool,
					target: optVal,
					opts: [{k:optVal, v:optVal}],
				};
				x.push(curT);
			}
			newState = {
				target: x,
			};
		}
		return newState;
	}

	onChangeArrayElement(element, index, tag, val) {
		let target = this.state.target;
		let cur = target[index];
		let realVal = val;
		if (['input'].indexOf(element) != -1) {
			realVal = val.target.value;
		} else if (['checkbox'].indexOf(element) != -1) {
			realVal = val.target.checked;
		}
		if (tag == 'target') {
			let fields = realVal.split(' ');
			cur.code = fields[0];
		}
		cur[tag] = realVal;

		this.setState({
			target: target,
		});
	}

	onQueryDisease(index, keyword) {
		if (this.props.onQuery) {
			let callback = this.updateDiseaseOpts.bind(this, index);
			this.props.onQuery(keyword, callback);
		}
	}

	updateDiseaseOpts(index, data) {
		let target = this.state.target;
		let opts = [];
		for (let i=0; i<data.diseases.length; i++) {
			let curD = data.diseases[i];
			let kstr = curD.code + ' ' + curD.name;
			opts.push({k:kstr, v:kstr});
		}
		target[index].opts = opts;
		this.setState({
			target: target,
		})
	}

	deleteOne(index) {
		let target = this.state.target;
		target.splice(index, 1);
		this.setState({
			target: target,
		});
	}

	addOne() {
		let target = this.state.target;
		let x = {
			code: '',
			target: '',
			confirmed: 0,
			opts: [],
		};
		target.push(x);
		this.setState({
			target: target,
		});
	}

	buildTargetOne(record, index, dataAll) {
		return (
			<Row gutter={8} style={{marginTop: 4}}>
				<Col span={4}>
					<label>{record.code}</label>
				</Col>
				<Col span={14}>
					疾病:<Select style={{width:'90%'}}
					        showSearch
					        value={record.target}
					        defaultActiveFirstOption={false}
					        showArrow={false}
					        filterOption={false}
					        onSearch={this.onQueryDisease.bind(this, index)}
					        onChange={this.onChangeArrayElement.bind(this, 'select', index, 'target')}
					        notFoundContent={null}
					>
						{record.opts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
					</Select>
				</Col>
				<Col span={3}>
					<Checkbox checked={record.confirmed}
					          onClick={this.onChangeArrayElement.bind(this, 'checkbox', index, 'confirmed')}/>确诊
				</Col>
				<Col span={3}>
					<span onClick={this.deleteOne.bind(this, index)} style={{cursor:'pointer'}}>
						<Icon type="close-circle" style={{color:'red'}}/>删除
					</span>
				</Col>
			</Row>
		);
	}

	isValidContent() {
		const { target } = this.state;
		let valid = true;
		let errMsg = [];
		for (let i=0; i<target.length; i++) {
			let curT = target[i];
			if (!curT.target) {
				errMsg.push('疾病' + i);
			}
		}
		return {
			valid: valid,
			errMsg: '请填写或选择' + errMsg.join(',')
		}
	}

	collect() {
		const { target } = this.state;
		let rst = this.isValidContent();
		if (!rst.valid) {
			message.error(rst.errMsg);
			return null;
		}

		let codeA = [];
		let confirmedA = [];
		let targetA = [];
		for (let i=0; i<target.length; i++) {
			let curT = target[i];

			codeA.push(curT.code);

			let intConf = curT.confirmed ? 1 : 0;
			confirmedA.push(intConf);

			let fields = (curT.target).split(' ');
			targetA.push(fields[1]);
		}
		let x = {
			code: codeA,
			confirmed: confirmedA,
			target: targetA,
		};
		return x;
	}

	render() {
		const { target } = this.state;
		let extra = (
			<span onClick={this.addOne.bind(this)} style={{cursor:'pointer'}}>
				<Icon type="plus-circle" style={{color:'blue'}}/>添加
			</span>
		);
		return (
			<Card title="诊断" style={{marginTop: 6}} extra={extra}>
				{target.map(this.buildTargetOne.bind(this))}
			</Card>
		);
	}
}
