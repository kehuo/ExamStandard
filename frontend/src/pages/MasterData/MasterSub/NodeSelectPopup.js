import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
	Divider, Radio, Checkbox, Tree, Tag } from "antd";

let underscore = require("underscore");
let Immutable = require('immutable');
let moment = require('moment');

import styles from "../MasterData.less";

export default class NodeSelectPopup extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initOne(props, true);
	}

	initOne(props, isFirst) {
		const { title } = this.props;
		let hotItems = [];
		for (let i=0; i<props.value.length; i++) {
			let x = JSON.parse(JSON.stringify(props.value[i]));
			hotItems.push(x);
		}
		let newState = {
			hotItems: hotItems,
		};
		if (isFirst) {
			newState.treeData = [{
				title: title,
				key: '1',
				isLeaf: false,
			}];
		}
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = (this.props.visible==nextProps.visible || !nextProps.visible);
		if (isSame) {
			return;
		}
		let newState = this.initOne(nextProps, false);
		this.setState(newState);
	}

	onSubmit(isUpdate) {
		if (!this.props.onSubmit) {
			return;
		}
		let x = null;
		if (isUpdate) {
			const { hotItems } = this.state;
			if (hotItems.length == 0) {
				message.error('请选择节点');
				return;
			}
			x = hotItems;
		}
		this.props.onSubmit(isUpdate, x);
	}

	onRemoveOne(index) {
		let hotItems = this.state.hotItems;
		hotItems.splice(index, 1);
		this.setState({
			hotItems: hotItems,
		});
	}

	buildTagOne(itemOne, index, items) {
		return (
			<Tag closable style={{marginLeft:6}} color="#108ee9"
			     onClose={this.onRemoveOne.bind(this, index)}>
				{itemOne.title}
			</Tag>
		);
	}

	onSelect(selectedKeys, e) {
		//e :{selected: bool, selectedNodes, node, event}
		let hotItems = [];
		for (let i = 0; i < e.selectedNodes.length; i++) {
			let curNode = e.selectedNodes[i];
			hotItems.push({
				title: curNode.props.title,
				key: curNode.key,
			});
		}
		this.setState({
			hotItems: hotItems
		});
	}

	addNewData(curKey, childs) {
		let treeData = this.state.treeData;
		const loop = (data) => {
			data.forEach((item) => {
				if (curKey === item.key ) {
					if (childs.length === 0) {
						item.isLeaf = true;
					} else {
						item.children = childs;
					}
				} else if (item.children) {
					loop(item.children);
				}
			});
		};
		loop(treeData);
		this.setState({treeData: treeData});
	}

	updateTreeData(curKey, data) {
		if (data) {
			let childs = [];
			for (let i=0; i<data.length; i++) {
				childs.push({
					title: data[i].name,
					key: '' + data[i].id,
					isLeaf: false,
				});
			}
			this.addNewData(curKey, childs);
		}
	}

	onLoadData(treeNode) {
		const { onMoreData } = this.props;
		if (treeNode.props.isLeaf ||
			(!treeNode.props.isLeaf && treeNode.props.children && treeNode.props.children.length>0)
		) {
			return new Promise((resolve)=>{resolve()});
		}
		let curKey = treeNode.props.eventKey;
		let callback = this.updateTreeData.bind(this, curKey);
		onMoreData(curKey, callback);
		return new Promise((resolve)=>{resolve()});
	}

	loop(item) {
		if (item.children) {
			return (
				<Tree.TreeNode title={item.title} key={item.key}>
					{item.children.map(this.loop.bind(this))}
				</Tree.TreeNode>
			);
		}
		return (
			<Tree.TreeNode title={item.title} key={item.key} isLeaf={item.isLeaf} />
		);
	}

	render() {
		const { title, visible } = this.props;
		const { hotItems, treeData } = this.state;
		return (
			<Modal title={title} closable={false} visible={visible}
			       onOk = {this.onSubmit.bind(this, true)}
			       onCancel = {this.onSubmit.bind(this, false)}
			>
				<Card>
					{hotItems.map(this.buildTagOne.bind(this))}
				</Card>
				<Card>
					<Tree
						onSelect={this.onSelect.bind(this)}
						loadData={this.onLoadData.bind(this)}
					>
						{treeData.map(this.loop.bind(this))}
					</Tree>
				</Card>
			</Modal>
		);
	}
}
