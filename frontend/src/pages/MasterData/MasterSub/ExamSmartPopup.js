import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
import ElementComponent from '../../Template/ElementComponent';
import * as Constants from './ConstExamSmart';

let underscore = require("underscore");
let Immutable = require('immutable');
let moment = require('moment');

import styles from "../MasterData.less";

function searchNextOpts(opts, val) {
	let tgtIdx = -1;
	for (let i=0; i<opts.length; i++) {
		let curO = opts[i];
		if (val == curO.v) {
			tgtIdx = i;
			break;
		}
	}
	if (tgtIdx < 0) {
		return [];
	}
	// let rst = opts[tgtIdx].nextOpts;
	// if (!rst) {
	// 	rst = [];
	// }
	// return rst;
	return opts[tgtIdx].nextOpts;
}

export default class ExamSmartPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.resetAll();
	}

	resetAll() {
		let newState = {
			name: '',
			source: 'BB',
			description: '',

			parentName: '',
			parentId: '',

			sub1Opts: [],
			sub2Opts: [],
			sub3Opts: [],
			sub4Opts: [],
			sub5memo: '',

			code: '',
			typeA: '',
			sub1: '',
			sub2: '',
			sub3: '',
			sub4: '',
			sub5: '',
		};
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let newState = this.resetAll();
		this.setState(newState);
	}

	updateOptsByTypeA(typeA, curState) {
		// always bypass 麻醉 in bodySystem
		if (typeA == 'B') {
			// {"bit":[2], "name":"亚类1", "code":["A-Z"]},
			// {"bit":[3,4], "name":"分析物", "code":["AA-ZZ"], "memo":"扩展00-99,A0-Z9,0A-9Z,每个对应一个指标"},
			// {"bit":[5,6], "name":"实验方法", "code":["01-99"]},
			// {"bit":[7], "name":"标本", "code":["1-9"]},
			// {"bit":[8], "name":"顺序码", "code":["1-9"]}
			curState.sub1Opts = Constants.BSub1Opts;
			curState.sub1 = curState.sub1Opts[0].v;

			curState.sub2 = '';
			curState.sub3 = '';
			curState.sub4 = '';

			curState.sub5 = '**';
			curState.sub5memo = '00-99,A0-Z9,0A-9Z';
		} else if (typeA == 'C') {
			// {"bit":[2], "name":"亚类1", "code":["A-Z"]},
			// {"bit":[3], "name":"亚类2", "code":["A-Z"]},
			// {"bit":[4], "name":"亚类3", "code":["A-Z"]},
			// {"bit":[5,6,7,8], "name":"顺序码", "code":["0001-9999"]}
			curState.sub1Opts = Constants.CSub1Opts;
			curState.sub1 = curState.sub1Opts[0].v;
			curState.sub2Opts = curState.sub1Opts[0].nextOpts;
			curState.sub2 = curState.sub2Opts[0].v;
			curState.sub3Opts = curState.sub2Opts[0].nextOpts;
			curState.sub3 = curState.sub3Opts[0].v;

			curState.sub4 = ''
			curState.sub5 = '****';
			curState.sub5memo = '0001-9999';
		} else if (typeA == 'E') {
			// {"bit":[2], "name":"亚类1", "code":["A-Z"]},
			// {"bit":[3], "name":"基本操作", "code":["A-Z"]},
			// {"bit":[4], "name":"系统", "code":["A-Z"]},
			// {"bit":[5], "name":"部位", "code":["A-Z"]},
			// {"bit":[6,7,8], "name":"顺序码", "code":["001-999"]}
			curState.sub1Opts = Constants.ESub1Opts;
			curState.sub1 = curState.sub1Opts[0].v;
			curState.sub2Opts = curState.sub1Opts[0].nextOpts;
			curState.sub2 = curState.sub2Opts[0].v;

			curState.sub3Opts = Constants.BodySystemOpts;
			curState.sub3 = curState.sub3Opts[1].v;
			curState.sub4Opts = curState.sub1Opts[1].nextOpts;
			curState.sub4 = curState.sub4Opts[0].v;

			curState.sub5 = '***';
			curState.sub5memo = '001-999';
		} else if (typeA == 'F') {
			// {"bit":[2], "name":"系统", "code":["B-Z"], "memo":"附件 1"},
			// {"bit":[3], "name":"部位或功能", "code":["A-Z"], "memo":"附件 2"},
			// {"bit":[4,5], "name":"基本操作", "code":["01-09"], "memo":"附件 3"},
			// {"bit":[6], "name":"入路", "code":["1-9"], "memo":"附件 4"},
			// {"bit":[7,8], "name":"顺序码", "code":["01-99"]}
			curState.sub1Opts = Constants.BodySystemOpts;
			curState.sub1 = curState.sub1Opts[1].v;
			curState.sub2Opts = curState.sub1Opts[1].nextOpts;
			curState.sub2 = curState.sub2Opts[0].v;

			curState.sub3Opts = Constants.FBasicOps;
			curState.sub3 = Constants.FBasicOps[0].v;
			curState.sub4Opts = Constants.InPathOpts;
			curState.sub4 = Constants.InPathOpts[0].v;

			curState.sub5 = '**';
			curState.sub5memo = '01-99';
		}
		this.setState(curState);
	}

	updateOptsBySubX(realVal, curState, tag) {
		let typeA = curState.typeA;
		if (typeA == 'B') {
			// only sub1 supported, so do nothing
		}

		if (typeA == 'C') {
			if (tag == 'sub1') {
				let sub2optsC = searchNextOpts(curState.sub1Opts, realVal);
				let sub3optsC = sub2optsC[0].nextOpts;
				curState.sub2Opts = sub2optsC;
				curState.sub2 = sub2optsC[0].v;
				curState.sub3Opts = sub3optsC;
				curState.sub3 = sub3optsC[0].v;
			}
			if (tag == 'sub2') {
				let sub3optsC1 = searchNextOpts(curState.sub2Opts, realVal);
				curState.sub3Opts = sub3optsC1;
				curState.sub3 = sub3optsC1[0].v;
			}
		}

		if (typeA == 'E') {
			if (tag == 'sub1') {
				let sub2optsE = searchNextOpts(curState.sub1Opts, realVal);
				curState.sub2Opts = sub2optsE;
				curState.sub2 = sub2optsE[0].v;
			}
			if (tag == 'sub3') {
				let sub4optsE = searchNextOpts(curState.sub3Opts, realVal);
				curState.sub4Opts = sub4optsE;
				curState.sub42 = sub4optsE[0].v;
			}
		}

		if (typeA == 'F') {
			if (tag == 'sub1') {
				let sub2optsF = searchNextOpts(curState.sub1Opts, realVal);
				curState.sub2Opts = sub2optsF;
				curState.sub2 = sub2optsF[0].v;
			}
		}
	}

	onChangeCodePart(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		}
		if (tag == 'typeA') {
			this.updateOptsByTypeA(realVal, curState);
		} else if (['sub1','sub2','sub3','sub4'].indexOf(tag) != -1) {
			this.updateOptsBySubX(realVal, curState, tag);
		}
		curState[tag] = realVal;
		curState.code = curState.typeA + curState.sub1 + curState.sub2 +
			curState.sub3 + curState.sub4 + curState.sub5;
		if (curState.typeA != 'B') {
			curState.code = curState.code + 'b'
		}
		this.setState(curState);
	}

	buildSubXSelect(tag, index) {
		const { typeA } = this.state;
		let val = this.state[tag];
		let opts = this.state[tag + 'Opts'];
		let show = true;
		if (typeA == 'B') {
			if (['sub2', 'sub3', 'sub4'].indexOf(tag) != -1) {
				show = false;
			}
		}
		if (typeA == 'C') {
			if (['sub4'].indexOf(tag) != -1) {
				show = false;
			}
		}
		if (!show) {
			return null;
		}
		return (
			<Row style={{marginBottom:6}}>
				<Select style={{width:'100%'}}
				        value={val}
				        defaultActiveFirstOption={false}
				        showArrow={true}
				        filterOption={false}
				        onChange={this.onChangeCodePart.bind(this, 'select', tag)}
				>
					{opts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
				</Select>
			</Row>
		);
	}

	buildSmartCode() {
		const { typeA, sub5, sub5memo, code } = this.state;
		const subXs = ['sub1', 'sub2', 'sub3', 'sub4'];
		return (
			<Card title="代码选择">
				<Row style={{marginBottom:6}}>
					<Select style={{width:'100%'}}
						value={typeA}
						defaultActiveFirstOption={false}
						showArrow={true}
						filterOption={false}
						onChange={this.onChangeCodePart.bind(this, 'select', 'typeA')}
					>
						{Constants.TypeAOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
					</Select>
				</Row>
				{ subXs.map(this.buildSubXSelect.bind(this)) }
				<Row style={{marginBottom:6}}>
					<Col span={16} style={{textAlign:'right'}}>扩展码字({sub5memo}):</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>完整代码:</Col>
					<Col span={10} style={{marginLeft:6}}>
						{code}
					</Col>
				</Row>
			</Card>
		)
	}
	
	buildNormalPart() {
		const lines = [
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '名称', tag: 'name'
				}],
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'input',
					title: '来源', tag: 'source'
				}],
			},
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'textArea',
					title: '描述', tag: 'description'
				}],
			},
		];
		return (
			<Row>
				{lines.map(this.renderLine.bind(this))}
			</Row>
		)
	}

	isValidContent() {
		const { name, code } = this.state;
		let valid = true;
		let errMsg = [];
		if (!name) {
			errMsg.push('名称');
		}
		if (!code) {
			errMsg.push('编码');
		}
		if (errMsg.length > 0) {
			valid = false;
		}
		return {
			valid: valid,
			errMsg: '请填写或选择' + errMsg.join(',')
		}
	}

	collect() {
		const { name, code, source, description } = this.state;
		let x = {
			name: name,
			code: code,
			source: source,
			description: description,
		};
		return x;
	}

	onSubmit(isUpdate) {
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
		}
		let rst = this.isValidContent();
		if (!rst.valid) {
			message.error(rst.msg);
			return;
		}
		let x = this.collect();
		this.props.onSubmit(true, x);
	}

	render() {
		const { visible } = this.props;
		let title = '新建检查(解释性方法)';
		return (
			<Modal closable={false} title={title} visible={visible}
			       width={800}
			       onCancel={this.onSubmit.bind(this, false)}
			       onOk={this.onSubmit.bind(this, true)}
			>
				{this.buildSmartCode()}
				<Divider />
				{this.buildNormalPart()}
			</Modal>
		);
	}
}
