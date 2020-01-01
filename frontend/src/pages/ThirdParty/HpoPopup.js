import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./ThirdParty.less";

export default class HpoPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			code: '',
			en_name: '',
			cn_name: '',
			parents: '',
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.code = item.code;
			newState.en_name = item.en_name;
			newState.cn_name = item.cn_name;
			newState.parents = item.parents;
		}
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let newState = this.initData(nextProps.item);
		this.setState(newState);
	}

	onSubmit(isUpdate) {
		const { id, cn_name, en_name, parents, code } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!en_name || !code ) {
			if (code != 'HP:0000001' && !parents) {
				message.error('请检查父类等信息是否选择或填写!');
				return;
			}
			message.error('请检查英文名称、代码等信息是否选择或填写!');
			return;
		}
		let x = {
			id: id,
			code: code,
			en_name: en_name,
			cn_name: cn_name,
			parents: parents,
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['en_name','cn_name','parents'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	render() {
		const {id, code, cn_name, en_name, parents } = this.state;
		const { visible } = this.props;
		let title = '新建HPO项';
		if (id) {
			title = '编辑HPO项';
		}
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>代码:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={code} onChange={this.onChange.bind(this, 'code')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>英文名称:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={en_name} onChange={this.onChange.bind(this, 'en_name')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>中文名称:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={cn_name} onChange={this.onChange.bind(this, 'cn_name')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>父类:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={parents} onChange={this.onChange.bind(this, 'parents')}
						/>
					</Col>
				</Row>
			</Modal>
		);
	}
}
