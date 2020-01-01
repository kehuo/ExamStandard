import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Popconfirm } from 'antd';
import RolePopup from './RolePopup';

import styles from './Org.less';
let underscore = require('underscore');

@connect(({ role }) => ({
	role
}))
export default class RoleList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,

			showPopup: false,
			hotOne: {},
		};
	}

	buildListQueryParams() {
		const { page, pageSize } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
		};
		return params;
	}

	componentDidMount() {
		this.fetchListData();
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: 'role/fetch',
			payload: this.buildListQueryParams()
		});
	}

	editRole(record) {
		this.setState({
			showPopup: true,
			hotOne: record,
		});
	}

	deleteRole(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'role/delete',
			payload: {
				updateParams: {
					id: record.id,
				},
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	opRender(text, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editRole.bind(this, record)}
			      style={{marginLeft: 16}}>
					<Icon type="edit" theme="outlined"/>编辑
				</span>
		);
		let deleteOp = (
			<span className={styles.ListOpDelete} style={{marginLeft: 16}}>
				<Popconfirm title="确定删除"
				            onConfirm={this.deleteRole.bind(this, record)}
				            onCancel={null}
				>
					<Icon type="delete" theme="outlined"/>删除
				</Popconfirm>
			</span>
		);
		return (
			<div>
				{deleteOp}
				{editOp}
			</div>
		);
	}

	buildOpBar() {
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={4} offset={1}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建角色</Button>
				</Col>
			</Row>
		);
	}

	onChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState);
	}

	onShowNewPopup() {
		let x = {
			id: 0,
			name: '',
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	editOrganization(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'role/edit',
			payload: {
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	onSubmit(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.editOrganization.bind(this, record)
		}
		this.setState({
			showPopup: false,
			hotOne: record,
		}, callback);
	}

	render() {
		const { data, total } = this.props.role;
		const { page, pageSize, showPopup, hotOne } = this.state;
		const columns = [
			{dataIndex:'name', title:'名称'},
			{dataIndex:'id', title:'操作', render: this.opRender.bind(this)},
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
			<div style={{width:1000, margin:'auto', backgroundColor:'white', padding:20}}>
				{this.buildOpBar()}
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
				<RolePopup visible={showPopup}
				                   item={hotOne}
				                   onSubmit={this.onSubmit.bind(this)}
				/>
			</div>
		);
	}
}
