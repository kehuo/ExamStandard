import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Common.less";

const SourceTypeOptions = [
	{k:'疾病', v:'1'}, {k:'化验和检查', v:'2'}, {k:'药品', v:'3'},
];
export default class DataSourcePopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			source: '',
			description: '',
			source_type: '',
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.description = item.description;
			newState.source = item.source;
			newState.source_type = '' + item.source_type;
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
		const { id, source, description, source_type } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!source || !source_type) {
			message.error('请检查名称、类型等信息是否选择或填写!');
			return;
		}
		let x = {
			id: id,
			source: source,
			description: description,
			source_type: parseInt(source_type),
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['description','source'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	render() {
		const {id, source, description, source_type } = this.state;
		const { visible } = this.props;
		let title = '新建数据源';
		if (id) {
			title = '编辑数据源';
		}
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>名称:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       value={source} onChange={this.onChange.bind(this, 'source')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>类型:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}}
						        value={''+source_type}
						        placeholder="请选择类型"
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'source_type')}
						>
							{SourceTypeOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>描述:</Col>
					<Col span={16} offset={1}>
						<Input.TextArea style={{width:'100%'}}
						                autosize={{ minRows: 3, maxRows: 3 }}
						                value={description} onChange={this.onChange.bind(this, 'description')}
						/>
					</Col>
				</Row>
			</Modal>
		);
	}
}
