import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Template.less";

export default class TemplateUpdateStatusPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(null);
	}

	componentDidMount() {
		// if (!this.props.item || !this.props.item.id) {
		// 	return;
		// }
		// this.initData(this.props.item);
	}

	initData(item) {
		let newState = {
			disease: '',
			allergy: '', allergyDiff: '',
			family: '', familyDiff: '',
			past: '', pastDiff: '',
			physical: '', physicalDiff: '',
			present: '', presentDiff: '',
		};
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let sameProps = Immutable.is(this.props.item, nextProps.item);
		if (sameProps) {
			return;
		}

		let newState = this.initData(nextProps.item);
		let callback = null;
		if (nextProps.item && nextProps.item.id) {
			callback = this.getAllText.bind(this);
		}
		this.setState(newState, callback);
	}

	onSubmit(isUpdate) {
		if (!this.props.onSubmit) {
			return;
		}
		this.props.onSubmit(false, null);
	}

	getAllText() {
		const { item, queryText } = this.props;
		if (!queryText) {
			return;
		}
		//TODO ???
		// queryText(item, this.updateAllText.bind(this));
	}

	updateAllText(data) {
		//TODO ???
	}

	buildItemOne(tagOne, index, tags) {
		const TagNameMap = {
			'present': '现病史','physical':'体格检查', 'past':'既往史', 'family':'家族史', 'allergy':'过敏史'
		};
		let curState = this.state;
		let diffTag = tagOne + 'Diff';
		let mData = curState[tagOne];
		let dData = curState[diffTag];
		return (
			<Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>{TagNameMap[tagOne]}:</Col>
					<Col span={16} offset={1}>{mData ? mData : ''}</Col>
				</Row>
				{dData && <Row>
					<Col span={6} offset={2} style={{textAlign:'right'}}>差异:</Col>
					<Col span={14} offset={1}>{dData}</Col>
				</Row>}
			</Row>
		)
	}

	render() {
		const { disease } = this.state;
		const { visible } = this.props;
		let title = '模板更新细节';
		const tags = ['present','physical', 'past', 'family', 'allergy'];
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>疾病:</Col>
					<Col span={16} offset={1}>{disease}</Col>
				</Row>
				{tags.map(this.buildItemOne.bind(this))}
			</Modal>
		);
	}
}
