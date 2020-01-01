import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Popconfirm } from 'antd';
import DepartmentPopup from './DepartmentPopup';
import ImpDepartments from './ImpDepartments';

import styles from './Org.less';
let underscore = require('underscore');

@connect(({ department }) => ({
	department
}))
export default class DepartmentList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',
			orgCode: '',

			showPopup: false,
			hotOne: {},
		};
	}

	buildListQueryParams() {
		const { page, pageSize, orgCode, keyword } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			keyword: keyword,
			orgCode: orgCode,
		};
		return params;
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'department/init',
			payload: this.buildListQueryParams()
		});
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
			type: 'department/fetch',
			payload: this.buildListQueryParams()
		});
	}

	editDepartment(record) {
		this.setState({
			showPopup: true,
			hotOne: record,
		});
	}

	deleteDepartment(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'department/delete',
			payload: {
				updateParams: {
					id: record.id,
				},
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	disableDepartment(record, disabled) {
		const { dispatch } = this.props;
		record.disabled = disabled;
		dispatch({
			type: 'department/edit',
			payload: {
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	opRender(text, record, index) {
		let statusOp = (
			<span className={styles.ListApplyOnline} onClick={this.disableDepartment.bind(this, record, 1)}>
				<Icon type="close-circle" theme="outlined"/>启动运营
			</span>
		);
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editDepartment.bind(this, record)}
			      style={{marginLeft: 16}}>
				<Icon type="edit" theme="outlined"/>编辑
			</span>
		);
		let deleteOp = (
			<span className={styles.ListOpDelete} style={{marginLeft: 16}}>
				<Popconfirm title="确定删除"
				            onConfirm={this.deleteDepartment.bind(this, record)}
				            onCancel={null}
				>
					<Icon type="delete" theme="outlined"/>删除
				</Popconfirm>
			</span>
		);
		if (record.disabled == 1) {
			statusOp = (
				<span className={styles.ListIsOnline}>
					<Icon type="fire" theme="outlined"/>运营中
				</span>
			);
			editOp = (
				<span className={styles.ListOpEdit} onClick={this.editDepartment.bind(this, record)}
				      style={{marginLeft: 16}}>
					<Icon type="edit" theme="outlined"/>查看
				</span>
			);
			deleteOp = null;
		}
		return (
			<div>
				{statusOp}
				{deleteOp}
				{editOp}
			</div>
		);
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

	onSelectChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState, this.fetchListData.bind(this))
	}

	buildOpBar() {
		const { orgOptions } = this.props.department;
		const { orgCode } = this.state;
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					关键词: <Input.Search style={{ width:'70%'}} placeholder="input search text"
					                   onChange={this.onKeywordChange.bind(this)}
					                   onSearch={this.onKeywordSearch.bind(this)}
				/>
				</Col>
				<Col span={3} offset={1}>
					机构: <Select style={{width:'60%'}} value={orgCode}
					            onSelect={this.onSelectChange.bind(this, 'orgCode')}>
						{orgOptions.map( o => <Select.Option key={o.v}>{o.k}</Select.Option>)}
					</Select>
				</Col>
				<Col span={4} offset={1}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建科室</Button>
				</Col>
				<Col span={4} offset={1}>
				<ImpDepartments />
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
			code: '',
			name: '',
			org_code: '',
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	editOrganization(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'department/edit',
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
		const { data, total, orgOptions } = this.props.department;
		const { page, pageSize, showPopup, hotOne } = this.state;
		const columns = [
			{dataIndex:'name', title:'名称'},
			{dataIndex:'code', title:'编码'},
			{dataIndex:'org_name', title:'机构'},
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
				<DepartmentPopup visible={showPopup}
				                   item={hotOne}
				                   onSubmit={this.onSubmit.bind(this)}
				                 orgOptions={orgOptions}
				/>
			</div>
		);
	}
}
