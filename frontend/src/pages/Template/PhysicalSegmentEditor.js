import React, { PureComponent } from "react";
import { connect } from "dva";
import { Row, Col, Input, Select, Icon, Divider, Button, Card } from "antd";
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Template.less";

export default class PhysicalSegmentEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props);
	}

	initData(props) {
		let newState = JSON.parse(props.segment.content);
		if (!newState.options) {
			newState.options = [];
		}
		for (let i = 0; i < newState.options.length; i++) {
			let curOpt = newState.options[i];
			if (!curOpt.addition) {
				curOpt.addition = {
					label: "",
					name: "",
					description: "",
					value: "",
					type: ""
				};
			}
		}
		newState.sub_sequence = props.segment.sub_sequence;
		newState.body_part_id = ''+props.segment.body_part_id;
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = Immutable.is(this.props.segment, nextProps.segment);
		if (isSame) {
			return;
		}
		let newState = this.initData(nextProps);
		this.setState(newState);
	}

	onCancel() {
		if (this.props.onCancel) {
			this.props.onCancel(null);
		}
	}

	onSubmit() {
		if (this.props.onSubmit) {
			let x = JSON.parse(JSON.stringify(this.state));
			for (let i = 0; i < x.options.length; i++) {
				let curOpt = x.options[i];
				let addition = curOpt.addition;
				let hasValid = false;
				for (let k in addition) {
					let val = addition[k];
					if (val && val != 'null') {
						hasValid = true;
						break;
					}
				}
				if (!hasValid) {
					delete curOpt.addition;
				}
			}
			delete x.body_part_id;
			delete x.sub_sequence;

			const { sub_sequence, body_part_id, label, description } = this.state;
			let y = {
				sub_sequence: parseInt(sub_sequence),
				body_part_id: parseInt(body_part_id),
				label: label,
				description: description,
				content: JSON.stringify(x),
			}
			this.props.onSubmit(y);
		}
	}

	buildButtons() {
		return (
			<div
				style={{
		          position: "absolute",
		          bottom: 0,
		          width: "100%",
		          borderTop: "1px solid #e8e8e8",
		          padding: "10px 16px",
		          textAlign: "right",
		          left: 0,
		          background: "#fff",
		          borderRadius: "0 0 4px 4px"
		        }}
			>
				<Button style={{ marginRight: 8 }} onClick={this.onCancel.bind(this)}>
					取消
				</Button>
				<Button onClick={this.onSubmit.bind(this)} type="primary">
					提交
				</Button>
			</div>
		);
	}

	onChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState);
	}

	onTextChange(groupName, tag, index, e) {
		if (groupName == "basic") {
			this.onChange(tag, e.target.value);
			return;
		}
		if (groupName == "option") {
			let options = this.state.options;
			let tgtOpt = options[index];
			tgtOpt[tag] = e.target.value;
			this.onChange("options", options);
			return;
		}
		if (groupName == "option-props") {
			let options = this.state.options;
			let tgtOpt = options[index];
			tgtOpt.props[tag] = e.target.value;
			this.onChange("options", options);
			return;
		}
		if (groupName == "option-addition") {
			let options = this.state.options;
			let tgtOpt = options[index];
			tgtOpt.addition[tag] = e.target.value;
			this.onChange("options", options);
			return;
		}
	}

	onSelectChange(groupName, tag, index, value, option) {
		if (groupName == "basic") {
			this.onChange(tag, value);
			return;
		}
		if (groupName == "option") {
			let options = this.state.options;
			let tgtOpt = options[index];
			tgtOpt[tag] = value;
			this.onChange("options", options);
			return;
		}
		if (groupName == "option-props") {
			let options = this.state.options;
			let tgtOpt = options[index];
			tgtOpt.props[tag] = value;
			this.onChange("options", options);
			return;
		}
		if (groupName == "option-addition") {
			let options = this.state.options;
			let tgtOpt = options[index];
			tgtOpt.addition[tag] = value;
			this.onChange("options", options);
			return;
		}
	}

	buildText(cfg, groupName, index) {
		let curState = this.state;
		let options = curState.options;
		let value = "";
		switch (groupName) {
			case "basic":
				value = curState[cfg.itemTag];
				break;
			case "option":
				value = options[index][cfg.itemTag];
				break;
			case "option-props":
				value = options[index].props[cfg.itemTag];
				break;
			case "option-addition":
				value = options[index].addition[cfg.itemTag];
				break;
			default:
				break;
		}
		let inputComponent = (
			<Input
				placeholder="请填写"
				value={value}
				disabled={cfg.disabled}
				onChange={this.onTextChange.bind(this, groupName, cfg.itemTag, index)}
			/>
		);
		return (
			<Col span={cfg.componentWidth}>
				<Row style={{ marginBottom: 12 }}>
					<Col span={cfg.titleWidth} style={{ textAlign: "right" }}>
						{cfg.itemTag}:
					</Col>
					<Col span={24 - cfg.titleWidth}>{inputComponent}</Col>
				</Row>
			</Col>
		);
	}

	buildSelect(cfg, groupName, index) {
		let curState = this.state;
		let options = curState.options;
		let value = "";
		switch (groupName) {
			case "basic":
				value = curState[cfg.itemTag];
				break;
			case "option":
				value = options[index][cfg.itemTag];
				break;
			case "option-props":
				value = options[index].props[cfg.itemTag];
				break;
			case "option-addition":
				value = options[index].addition[cfg.itemTag];
				break;
			default:
				break;
		}
		let selectComponent = (
			<Select
				style={{ width: "90%" }}
				value={value}
				disabled={cfg.disabled}
				onSelect={this.onSelectChange.bind(this, groupName, cfg.itemTag, index)}
			>
				{cfg.options.map(o => (
					<Select.Option key={o.v}>{o.k}</Select.Option>
				))}
			</Select>
		);
		if (cfg.itemTag == "color") {
			selectComponent = (
				<Select
					style={{ width: "90%" }}
					value={value}
					onSelect={this.onSelectChange.bind(this, groupName, cfg.itemTag, index)}
				>
					{cfg.options.map(o => (
						<Select.Option key={o.v}>
							<span style={{ color: o.v }}>{o.k}</span>
						</Select.Option>
					))}
				</Select>
			);
		}
		return (
			<Col span={cfg.componentWidth}>
				<Row style={{ marginBottom: 12 }}>
					<Col span={cfg.titleWidth} style={{ textAlign: "right" }}>
						{cfg.itemTag}:
					</Col>
					<Col span={24 - cfg.titleWidth}>{selectComponent}</Col>
				</Row>
			</Col>
		);
	}

	buildItemOne(groupName, index, itemCfg, indexLocal, cfgs) {
		let component = null;
		switch (itemCfg.itemType) {
			case "text":
				component = this.buildText(itemCfg, groupName, index);
				break;
			case "select":
				component = this.buildSelect(itemCfg, groupName, index);
				break;
			default:
				break;
		}
		return component;
	}

	buildBasic() {
		// {"label": "脾", "type": "CHECKBOX", "options": [{"display": "脾未触及", "props": {"color": "FF00B050"}, "key": "未触及", "label": "未触及", "value": "0", "addition": null}, {"display": "脾触及肋下", "props": {"color": "FFFF0000"}, "key": "触及肋下", "label": "触及肋下", "value": "1", "addition": {"label": "", "value": "", "name": "memo", "type": "text", "description": "cm"}}], "description": " "}
		const { bodyPartOptions } = this.props;
		let { id } = this.state;
		let disabled = false;
		if (id != 0) {
			disabled = true;
		}
		const TagBasicConfig = [
			{
				itemType: "text",
				itemTag: "label",
				componentWidth: 8,
				titleWidth: 8,
				disabled: false
			},
			{
				itemType: "text",
				itemTag: "description",
				componentWidth: 8,
				titleWidth: 8,
				disabled: false
			},
			{
				itemType: "select",
				itemTag: "type",
				componentWidth: 8,
				titleWidth: 8,
				disabled: false,
				options: [
					{ k: "RADIO", v: "RADIO" },
					{ k: "CHECKBOX", v: "CHECKBOX" },
					{ k: "TEXT", v: "TEXT" }
				]
			},
			{
				itemType: "text",
				itemTag: "sub_sequence",
				componentWidth: 8,
				titleWidth: 8,
				disabled: false
			},
			{
				itemType: "select",
				itemTag: "body_part_id",
				componentWidth: 8,
				titleWidth: 8,
				disabled: false,
				options: bodyPartOptions
			},
		];
		return (
			<Card title="基本信息">
				<Row gutter={16}>
					{TagBasicConfig.map(this.buildItemOne.bind(this, "basic", 0))}
				</Row>
			</Card>
		);
	}

	deleteOption(index) {
		let options = this.state.options;
		options.splice(index, 1);
		this.setState({
			options: options
		});
	}

	createOption() {
		let options = this.state.options;
		let x = {
			label: "",
			key: "",
			display: "",
			value: "",
			props: { color: "green" },
			addition: {
				label: "",
				name: "",
				description: "",
				value: "",
				type: ""
			}
		};
		options.push(x);
		this.setState({
			options: options
		});
	}

	buildOptionsOne(optOne, index, opts) {
		const TagOptionConfig = [
			{ itemType: "text", itemTag: "label", componentWidth: 8, titleWidth: 8 },
			{ itemType: "text", itemTag: "key", componentWidth: 8, titleWidth: 8 },
			{
				itemType: "text",
				itemTag: "display",
				componentWidth: 8,
				titleWidth: 8
			},
			{ itemType: "text", itemTag: "value", componentWidth: 8, titleWidth: 8 }
		];
		const TagOptionPropsConfig = [
			{
				itemType: "select",
				itemTag: "color",
				componentWidth: 8,
				titleWidth: 8,
				options: [{ k: "正常", v: "green" }, { k: "严重", v: "red" }]
			}
		];
		const TagOptionAdditionConfig = [
			{ itemType: "text", itemTag: "label", componentWidth: 8, titleWidth: 8 },
			{ itemType: "text", itemTag: "name", componentWidth: 8, titleWidth: 8 },
			{ itemType: "text", itemTag: "value", componentWidth: 8, titleWidth: 8 },
			{
				itemType: "text",
				itemTag: "description",
				componentWidth: 8,
				titleWidth: 8
			},
			{
				itemType: "select",
				itemTag: "type",
				componentWidth: 8,
				titleWidth: 8,
				options: [{ k: "text", v: "text" },{k: "无效", v: "null"}]
			}
		];
		return (
			<Card>
				{TagOptionConfig.map(this.buildItemOne.bind(this, "option", index))}
				<Divider dashed>props</Divider>
				{TagOptionPropsConfig.map(
					this.buildItemOne.bind(this, "option-props", index)
				)}
				<Divider dashed>addition</Divider>
				{TagOptionAdditionConfig.map(
					this.buildItemOne.bind(this, "option-addition", index)
				)}
				<Divider dashed />
				<Row>
          <span
	          className={styles.ListOpDisable}
	          onClick={this.deleteOption.bind(this, index)}
          >
            <Icon type="close-circle" theme="outlined" />
            删除
          </span>
				</Row>
			</Card>
		);
	}

	buildOptions() {
		const { options } = this.state;
		return (
			<Card title="可选配置">
				{options.map(this.buildOptionsOne.bind(this))}
				<Row>
          <span
	          className={styles.ListOpEnable}
	          onClick={this.createOption.bind(this)}
          >
            <Icon type="plus-circle" theme="outlined" />
            添加
          </span>
				</Row>
			</Card>
		);
	}

	render() {
		return (
			<div>
				{this.buildBasic()}
				{this.buildOptions()}
				{this.buildButtons()}
			</div>
		);
	}
}
