import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tag, Button, Card, Modal, message,
	Divider, Radio, Checkbox, Tooltip } from "antd";
import ElementComponent from './ElementComponent';

let underscore = require("underscore");
let Immutable = require('immutable');
import debounce from "lodash/debounce";

import styles from "./Template.less";

export default class AssociatedSymptomPopup extends ElementComponent {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
		this.getSymptomList = debounce(this.getSymptomList, 500);
	}

	componentDidMount() {
		if (!this.props.item || !this.props.item.id) {
			return;
		}
		let newState = this.initData(this.props.item);
		this.setState(newState);
	}

	initData(item) {
		let newState = {
			id: 0,
			vector: '',
			associated: [],

			masterX: '',
			symptomMasterOpts: [],
			associatedX: '',
			symptomAssociatedOpts: [],
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.vector = item.vector;
			if (item.associated) {
				newState.associated = JSON.parse(item.associated);
			}
		}
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let callback = null;
		let newState = this.initData(nextProps.item);
		if (newState.org_code) {
			callback = this.getDepartmentList.bind(this);
		}
		this.setState(newState, callback);
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (elementType == 'checkbox') {
			realVal = val.target.checked;
		}
		let callback = null;
		curState[tag] = realVal;
		this.setState(curState, callback);
	}

	updateSymptomOpts(tag, data) {
		let curState = this.state;
		let opts = [];
		for (let i=0; i<data.length; i++) {
			let curD = data[i];
			let x = {k: curD.name, v: curD.name + '$symptom'};
			opts.push(x);
		}
		curState[tag] = opts;
		this.setState(curState);
	}

	getSymptomList(tag, keyword) {
		if (!this.props.queryFunc) {
			return;
		}
		let callback = this.updateSymptomOpts.bind(this, tag);
		this.props.queryFunc(keyword, callback);
	}

	isValidContent() {
		const { id, vector, associated } = this.state;
		let msgs = [];
		if (!vector ) {
			msgs.push('主症状不能为空!');
		}
		if (!associated || associated.length == 0 ) {
			msgs.push('关联症状不能为空!');
		}
		let rst = {
			ok: (msgs.length == 0),
			msg: msgs.join(',')
		};
		return rst;
	}

	onSubmit(isUpdate) {
		const { id, vector, associated } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		let rst = this.isValidContent();
		if (!rst.ok ) {
			message.error(rst.msg);
			return;
		}

		let x = {
			id: id,
			vector: vector,
			associated: JSON.stringify(associated),
		};
		this.props.onSubmit(true, x);
	}

	buildTag(x, func) {
		const ColorMap = {
			symptom: 'geekblue', exam: 'magenta', disease: 'cyan',
			treatment:'#f50', medicine: '#108ee9', unknown: 'black'
		};
		if (!x) {
			return null;
		}

		let fields = x.split('$');
		let vText = x;
		let vType = 'unknown';
		if (fields.length == 2) {
			vText = fields[0];
			vType = fields[1];
		}
		let color = ColorMap[vType];
		if (!color) {
			color = 'black';
		}
		if (vText.length > 12) {
			let shortText = vText.substr(0, 10) + '...';
			return (
				<Tooltip title={vText}>
					<Tag color={color} closable={true} onClose={func}>{shortText}</Tag>
				</Tooltip>
			);
		}
		return (<Tag color={color} closable={true} onClose={func}>{vText}</Tag>);
	}

	onSetMaster() {
		const { masterX } = this.state;
		this.setState({
			vector: masterX
		});
	}

	clearMaster() {
		this.setState({
			vector: ''
		});
	}

	buildMasterPart() {
		const { vector, symptomMasterOpts } = this.state;
		const linesA = [
			{
				split: 24,
				items: [{
					layout: {title: 6, element: 16}, elementType: 'selectRemote',
					title: '候选', tag: 'masterX', options: symptomMasterOpts,
					searchFunc: this.getSymptomList.bind(this, 'symptomMasterOpts')
				}]
			},
		];
		let component = this.buildTag(vector, this.clearMaster.bind(this));
		return (
			<Card>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}} >主症状:</Col>
					<Col span={16}>
						{component}
					</Col>
				</Row>
				{linesA.map(this.renderLine.bind(this))}
				<Row style={{textAlign:'center'}}>
					<Button type="primary" onClick={this.onSetMaster.bind(this)}>更新主症状</Button>
				</Row>
			</Card>
		);
	}

	removeAssociateOne(content) {
		let associated = this.state.associated;
		let tgtIdx = -1;
		for (let i=0; i<associated.length; i++) {
			if (associated[i] == content) {
				tgtIdx = i;
				break;
			}
		}
		if (tgtIdx < 0) {
			return;
		}
		associated.splice(tgtIdx, 1);
		this.setState({
			associated: associated
		});
	}

	onAddAssociated() {
		const { associatedX } = this.state;
		let associated = this.state.associated;
		associated.push(associatedX);
		this.setState({
			associated: associated
		});
	}

	buildAssociatedPart() {
		const { associated, symptomAssociatedOpts } = this.state;
		const linesB = [	{
			split: 24,
			items: [{
				layout: {title: 6, element: 16}, elementType: 'selectRemote',
				title: '候选', tag: 'associatedX', options: symptomAssociatedOpts,
				searchFunc: this.getSymptomList.bind(this, 'symptomAssociatedOpts')
			}]
		},
		];
		let ms = [];
		for (let i=0; i<associated.length; i++) {
			let component = this.buildTag(associated[i], this.removeAssociateOne.bind(this, associated[i]));
			ms.push(component);
		}
		return (
			<Card>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}} >关联症状:</Col>
					<Col span={16}>
						{ms}
					</Col>
				</Row>
				{linesB.map(this.renderLine.bind(this))}
				<Row style={{textAlign:'center'}}>
					<Button type="primary" onClick={this.onAddAssociated.bind(this)}>添加关联症状</Button>
				</Row>
			</Card>
		);
	}

	render() {
		const { id } = this.state;
		const { visible } = this.props;
		let title = '新建症状关联配置';
		if (id) {
			title = '编辑症状关联配置';
		}
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				{this.buildMasterPart()}
				{this.buildAssociatedPart()}
			</Modal>
		);
	}
}
