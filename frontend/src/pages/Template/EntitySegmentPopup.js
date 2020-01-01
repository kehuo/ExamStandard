import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox, Switch } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Template.less";

export default class EntitySegmentPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		if (!item) {
			return {
				text: '',
				pos_display: '',
				neg_display: '',
				freeze: false,
				system_id: '1',
			};
		}

		let newState = {
			text: item.vector,
			pos_display: item.pos_display,
			neg_display: item.neg_display,
			freeze: item.freeze==1? true:false,
			system_id: item.system_id,
		};
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
		const { pos_display, neg_display, freeze, system_id } = this.state;
		if (!this.props.onSubmit) {
			return;
		}

		if (!isUpdate) {
			this.props.onSubmit(isUpdate, null);
			return;
		}

		if (!pos_display) {
			message.error('正常描述必须有!');
			return;
		}

		let x = {
			pos_display: pos_display,
			neg_display: neg_display,
			freeze: freeze? 1:0,
			system_id: parseInt(system_id),
		};
		this.props.onSubmit(isUpdate, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['pos_display','neg_display'].indexOf(tag) != -1) {
			val = val.target.value;
		}
		curState[tag] = val;
		this.setState(curState);
	}

	render() {
		const { text, pos_display, neg_display, freeze, system_id } = this.state;
		const { visible, title, systemOptions } = this.props;
		return (
			<Modal title={title} visible={visible} closable={true}
			       okText="确定" onOk={this.onSubmit.bind(this, true)}
			       cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row style={{textAlign:'center'}}>
					{text}
				</Row>
				<Row style={{marginTop: 8}}>
					<Col span={6} style={{textAlign:'right'}}>疾病系统:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}}
						        value={''+system_id}
						        placeholder="请选择疾病系统"
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'system_id')}
						>
							{systemOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
				<Row style={{marginTop:6}}>
					<Col span={6} style={{textAlign:'right'}}>内容编辑:</Col>
					<Col span={16} offset={1}>
						<Switch checkedChildren="禁止修改" unCheckedChildren="允许修改"
						       value={freeze} onChange={this.onChange.bind(this, 'freeze')}
						/>
					</Col>
				</Row>
				<Row style={{marginTop:6}}>
					<Col span={6} style={{textAlign:'right'}}>正常描述:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={pos_display} onChange={this.onChange.bind(this, 'pos_display')}
						/>
					</Col>
				</Row>
				<Row style={{marginTop:6}}>
					<Col span={6} style={{textAlign:'right'}}>异常描述:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={neg_display} onChange={this.onChange.bind(this, 'neg_display')}
						/>
					</Col>
				</Row>
			</Modal>
		);
	}
}
