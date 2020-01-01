import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Common.less";

export default class DiseaseSystemPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			id: 0,
			name: '',
			description: '',
			source_id: '',
			mappings: [],
		};
	}

	componentDidMount() {
		if (this.props.item == 0) {
			return;
		}
		this.updateOne(this.props.item);
	}

	updateOne(id) {
		if (!id) {
			return;
		}
		if (this.props.loadItem) {
			this.props.loadItem(id, this.updateAll.bind(this))
		}
	}

	updateAll(res) {
		this.setState({
			id: res.id,
			name: res.name,
			description: res.description,
			source_id: '' + res.source_id,
			mappings: makeOnlyIdArray(res.mappings, 'body_id'),
		});
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		this.updateOne(nextProps.item);
	}

	onSubmit(isUpdate) {
		const { id, name, description, source_id, mappings } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!name || !source_id) {
			message.error('请检查名称、数据源等信息是否选择或填写!');
			return;
		}
		let ys = [];
		for (let i=0; i<mappings.length; i++) {
			ys.push(parseInt(mappings[i]));
		}
		let x = {
			id: id,
			name: name,
			description: description,
			source_id: parseInt(source_id),
			mappings: ys,
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['description','name'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	render() {
		const {id, name, description, source_id, mappings } = this.state;
		const { visible, dataSources, bodyParts } = this.props;
		let title = '新建疾病系统';
		if (id) {
			title = '编辑疾病系统';
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
						       value={name} onChange={this.onChange.bind(this, 'name')}
						/>
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
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>数据源:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}} value={source_id} showArrow={true}
						             onSelect={this.onChange.bind(this, 'source_id')}>
							{dataSources.map( o => <Select.Option value={''+o.id}>{o.source}</Select.Option>)}
						</Select>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>关联部位:</Col>
					<Col span={16} offset={1}>
						<Select style={{width:'100%'}} mode="multiple" showArrow={true}
						        value={mappings}
						        placeholder="请选择关联部位"
						        defaultActiveFirstOption={false}
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'mappings')}
						>
							{bodyParts.map( o=> <Select.Option key={''+o.id}>{o.name}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Modal>
		);
	}
}

function makeOnlyIdArray(datum, tag) {
	let rst = [];
	for (let i=0; i<datum.length; i++) {
		rst.push(''+datum[i][tag]);
	}
	return rst;
}

