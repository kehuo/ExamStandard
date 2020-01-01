import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
import PackageConditionCard from '../Template/PackageConditionCard';

let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Common.less";

export default class ConditionPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	// componentWillReceiveProps(nextProps) {
	// 	let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
	// 	if (isSame) {
	// 		return;
	// 	}
	// 	let newState = this.initData(nextProps.item);
	// 	this.setState(newState);
	// }

	onSubmit(isUpdate) {
		let x = '';
		if (isUpdate) {
			let conditions = this.refs['conditionsRef'].collect();
			if (conditions) {
				x = JSON.stringify(conditions);
			}
		}
		this.props.onSubmit(isUpdate, x);
	}

	render() {
		const { visible, item } = this.props;
		let title = '编辑条件';
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				{item && <PackageConditionCard ref="conditionsRef"
					data={item.conditions}
				/>}
			</Modal>
		);
	}
}

