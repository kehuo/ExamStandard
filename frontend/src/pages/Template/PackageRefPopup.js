import React, { PureComponent } from "react";
import { Row, Col, Input, Select, Icon, Modal, Button, Table, Switch, message, Tooltip } from "antd";
import { buildConditionDisplay } from '../Common/Utils';
let underscore = require("underscore");
let Immutable = require('immutable');

import styles from "./Template.less";

export default class PackageRefPopup extends React.Component{
	constructor(props) {
		super(props);
		this.state = this.initData();
	}

	initData() {
		let newState = {
			packageList: [],
			page: 1,
			pageSize: 10,
			total: 0,
			keyword: '',
			status: 'all',
		};
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		if (!this.props.visible && nextProps.visible) {
			let newState = this.initData();
			this.setState(newState);
		}
	}

	onSelectPackage(index, checked) {
		let packageList  = this.state.packageList;
		packageList[index].checked = checked;
		if (checked) {
			for (let i=0; i<packageList.length; i++) {
				let packageOne = packageList[i];
				if (i != index) {
					packageOne.checked = false;
				}
			}
		}
		this.setState({
			packageList: packageList
		});
	}

	onKeywordChange(e) {
		this.setState({
			keyword: e.target.value
		});
	}

	onKeywordSearch(value) {
		this.setState({
			keyword: value,
			page: 1,
		}, this.fetchListData.bind(this));
	}

	onStatusChange(val) {
		this.setState({
			status: val
		}, this.fetchListData.bind(this))
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	fetchListData() {
		if (this.props.fetchListData) {
			this.props.fetchListData(this.buildListQueryParams(), this.updateListData.bind(this));
		}
	}

	buildListQueryParams() {
		const { page, pageSize, keyword, status } = this.state;
		let realStatus = 1;
		switch(status) {
			case '0': realStatus=0; break;
			case '1': realStatus=1; break;
			default: break;
		}
		let params = {
			page: page,
			pageSize: pageSize,
			keyword: keyword,
			status: realStatus,
		};
		if (status == 'all') {
			delete params.status;
		}
		if (!keyword) {
			delete params.keyword;
		}
		return params;
	}

	updateListData(data) {
		this.setState({
			packageList: data.disease_packages,
			total: data.total,
		})
	}

	buildOpBar() {
		const { status, keyword } = this.state;
		return (
			<Row style={{marginTop:10, marginBottom:10, width:'100%'}}>
				<Col span={15}>
					关键词: <Input.Search style={{ width:'80%'}} placeholder="input search text"
					                   onChange={this.onKeywordChange.bind(this)}
					                   onSearch={this.onKeywordSearch.bind(this)}
					                   value={keyword}
				/>
				</Col>
				<Col span={2} offset={1} style={{textAlign:'right'}}>{'状态: '}</Col>
				<Col span={6} >
					<Select style={{width:'80%'}} value={status}
					            onSelect={this.onStatusChange.bind(this)}>
						<Select.Option value="all">全部</Select.Option>
						<Select.Option value="1">使用中</Select.Option>
						<Select.Option value="0">禁用中</Select.Option>
					</Select>
				</Col>
			</Row>
		);
	}

	onGetPackage(isUpdate) {
		let packageList  = this.state.packageList;
		let id = null;
		if (isUpdate) {
			let index = -1;
			for (let i=0; i<packageList.length; i++) {
				let packageOne = packageList[i];
				if (packageOne.checked) {
					index = i;
					break;
				}
			}
			if (index < 0) {
				message.error('请选择疾病模板');
				return;
			}
			id = packageList[index].id;
		}
		if (this.props.onGetPackage) {
			this.props.onGetPackage(isUpdate, id);
		}
	}

	opRender(text, record, index) {
		return (
			<Switch style={{marginRight:10}}
			        checked={record.checked}
			        onChange={this.onSelectPackage.bind(this, index)}/>
		);
	}

	ownerTypeRender(text, record, index) {
		const typeMap = {
			'operator': '个人',
			'department': '部门',
		};
		let title = typeMap[text];
		if (!title) {
			title = '未知';
		}
		return title;
	}

	nameRender(text, record, index) {
		let conditions = null;
		try {
			if (record.conditions) {
				conditions = JSON.parse(record.conditions);
			}
		} catch(e) {
			// console.log(conditions);
		}
		if (!conditions) {
			return text;
		}
		let display = buildConditionDisplay(conditions);
		let component = (
			<Tooltip title={display}>
				<span style={{color:'red'}}>*</span> {text}
			</Tooltip>
		);
		return component;
	}

	render() {
		const { visible } = this.props;
		const { page, pageSize, packageList, total } = this.state;
		const columns = [
			{dataIndex:'disease_name', title:'疾病名称', render: this.nameRender.bind(this)},
			{dataIndex:'virtual_department_name', title:'虚拟组名称'},
			{dataIndex:'owner_type', title:'类型', render: this.ownerTypeRender.bind(this)},
			{dataIndex:'id', title:'选择', render: this.opRender.bind(this)},
		];
		let pageOpts = {
			current: page,
			pageSize: pageSize,
			size: 'small',
			total: total,
			onChange: this.onListPageChange.bind(this),
			onShowSizeChange: this.onListPageChange.bind(this)
		};
		return (
			<Modal title="查找参考模板" width={600}
			       visible={visible} closable={false}
			       okText="确定" onOk={this.onGetPackage.bind(this, true)}
			       cancelText="取消" onCancel={this.onGetPackage.bind(this, false)}
			>
				<div style={{width:'100%', margin:'auto', height:500}}>
					{this.buildOpBar()}
					<Table columns={columns} size="small"
					       dataSource={packageList}
					       pagination={pageOpts}
					/>
				</div>
			</Modal>
		);
	}
}