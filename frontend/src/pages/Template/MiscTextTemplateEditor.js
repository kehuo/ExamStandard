import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Divider, Button, Card, InputNumber, Switch, message, Modal } from "antd";
import PackageRefPopup from './PackageRefPopup';
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Template.less";

export default class MiscTextTemplateEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props);
	}

	componentDidMount() {
		// this.initData(this.props);
	}

	initData(props) {
		if (!props.misc) {
			return {
				showPopup: false,
				parts: []
			};
		}
		let parts = [];
		for (let i=0; i<props.misc.length; i++) {
			let curM = props.misc[i];
			let x = JSON.parse(JSON.stringify(curM));
			parts.push(x);
		}
		let newState = {
			showPopup: false,
			parts: parts
		};
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = Immutable.is(this.props.misc, nextProps.misc);
		if (isSame || this.props.init) {
			return;
		}
		let newState = this.initData(nextProps);
		this.setState(newState);
	}

	collect() {
		let parts = [];
		for (let i=0; i<this.state.parts.length; i++) {
			let curP = this.state.parts[i];
			let x = JSON.parse(JSON.stringify(curP));
			parts.push(x);
		}
		return parts;
	}

	onChange(key, index, e) {
		let parts = this.state.parts;
		parts[index][key] = e.target.value;
		this.setState({
			parts: parts,
		});
	}

	deleteItem(index) {
		let parts = this.state.parts;
		parts.splice(index, 1);
		this.setState({
			parts: parts,
		});
	}

	buildItemOne(item, index) {
		return (
			<Row gutter={8}>
				<Col span={2} style={{textAlign:'center', cursor:'pointer'}}
				     onClick={this.deleteItem.bind(this, index)}
				>
					<Icon type="minus-circle" style={{color:'red'}} />删除
				</Col>
				<Col span={4} style={{textAlign:'center'}}>
					<p>键值:{item.key}</p>
					<p>名称{item.name}</p>
				</Col>
				<Col span={17}>
					<Input.TextArea autosize={{minRows: 2, maxRows: 6}}
						value={item.content}
						onChange={this.onChange.bind(this, 'content', index)}
					/>
				</Col>
			</Row>
		);
	}

	showPopup() {
		this.setState({
			showPopup: true,
		});
	}

	addItemOne(isUpdate, x) {
		if (!isUpdate) {
			this.setState({
				showPopup: false,
			});
			return;
		}

		let hasError = false;
		let parts = this.state.parts;
		for (let i=0; i<parts.length; i++) {
			let curP = parts[i];
			if (x.name == curP.name || x.key == curP.key) {
				hasError = true;
				break;
			}
		}
		if (hasError) {
			message.error('重复键值或名称!');
			return;
		}
		
		parts.push(x);
		this.setState({
			showPopup: false,
			parts: parts,
		});
	}

	buildAddPopup() {
		const { showPopup } = this.state;
		return (
			<AddTextPopup visible={showPopup}
			              onSubmit={this.addItemOne.bind(this)}
			/>
		);
	}

	render() {
		const { parts } = this.state;
		const bodyStyle = {padding:8};
		let extraComp = (
			<span style={{textAlign:'right', paddingRight:6, cursor:'pointer'}}
			      onClick={this.showPopup.bind(this)}
			>
				<Icon type="plus-circle" style={{color:'green'}} />添加
			</span>
		);
		return (
			<Card title="其他内容" bodyStyle={bodyStyle} extra={extraComp}>
				{parts.map(this.buildItemOne.bind(this))}
				{this.buildAddPopup()}
			</Card>
		);
	}
}

class AddTextPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			key: '',
			name: ''
		};
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (!this.props.visible && nextProps.visible);
		if (isSame) {
			return;
		}
		this.setState({
			key: '',
			name: ''
		});
	}

	onChange(key, e) {
		let curState = this.state;
		curState[key] = e.target.value;
		this.setState(curState);
	}

	onSubmit(isUpdate) {
		if (!this.props.onSubmit) {
			return;
		}
		if(!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		let x = JSON.parse(JSON.stringify(this.state));
		x.key = x.key.replace(' ', '');
		x.name = x.name.replace(' ', '');
		if (!x.key || !x.name) {
			message.error('请填写相应字段!');
			return;
		}
		x.content = '';
		this.props.onSubmit(isUpdate, x);
	}

	render() {
		const { visible } = this.props;
		const { key, name } = this.state;
		return (
			<Modal title="添加文本" visible={visible} closable={false}
			       okText="确定" onOk={this.onSubmit.bind(this, true)}
			       cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row>
					键值: <Input value={key}
					       onChange={this.onChange.bind(this, 'key')}
					/>
				</Row>
				<Row>
					名称: <Input value={name}
					           onChange={this.onChange.bind(this, 'name')}
				/>
				</Row>
			</Modal>
		);
	}
}