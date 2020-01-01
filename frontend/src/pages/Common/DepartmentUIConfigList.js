import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Popconfirm } from 'antd';
import DepartmentUIConfigPopup from './DepartmentUIConfigPopup';

import styles from './Common.less';
let underscore = require('underscore');

@connect(({ departmentUiConfig }) => ({
	departmentUiConfig
}))
export default class DepartmentUIConfigList extends React.Component {
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
		const { page, pageSize, keyword, orgCode } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			keyword: keyword,
		};
		if (orgCode) {
			params.org_code = orgCode;
		}
		return params;
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'departmentUiConfig/init',
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
			type: 'departmentUiConfig/fetch',
			payload: this.buildListQueryParams()
		});
	}

	editDataSource(record) {
		this.setState({
			showPopup: true,
			hotOne: record,
		});
	}

	deleteDataSource(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'departmentUiConfig/delete',
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
			<span className={styles.ListOpEdit} onClick={this.editDataSource.bind(this, record)}
			      style={{marginLeft: 16}}>
					<Icon type="edit" theme="outlined"/>编辑
				</span>
		);
		let deleteOp = (
			<span className={styles.ListOpDisable} style={{marginLeft: 16}}>
				<Popconfirm title="确定删除"
				            onConfirm={this.deleteDataSource.bind(this, record)}
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

	contentRender(text, record, index) {
		const NameMap = {
			tabList: '功能页面',
		};
		let xObj = JSON.parse(text);
		let rst = (<div style={{color:'red'}}>暂不支持任何功能</div>);
		if (xObj.tabList && xObj.tabList.length > 0) {
			let names = xObj.tabList.join(',');
			rst = (<div style={{color:'green'}}>{names}</div>);
		}
		return rst;
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

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (elementType == 'checkbox') {
			realVal = val.target.checked;
		}
		let callback = null;
		if (['orgCode'].indexOf(tag) != -1) {
			callback = this.fetchListData.bind(this);
		}
		curState[tag] = realVal;
		this.setState(curState, callback);
	}

	onQuery(mode, params) {
		const { dispatch } = this.props;
		switch(mode) {
			case 'department':
				dispatch({
					type: 'departmentUiConfig/fetchDepartment',
					payload: params
				});
				break;
			default:
				break;
		}
	}

	buildOpBar() {
		const { orgOpts } = this.props.departmentUiConfig;
		const { keyword, orgCode } = this.state;
		return (
			<Row gutter={8} style={{marginTop:10, marginBottom:10}}>
				<Col span={8} >
					机构: <Select style={{width:'70%'}}
					            value={orgCode}
					            defaultActiveFirstOption={false}
					            showArrow={true} allowClear={true}
					            filterOption={false}
					            onChange={this.onChangeElement.bind(this, 'select', 'orgCode')}
				>
					{orgOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
				</Select>
				</Col>

				<Col span={8}>
					关键词: <Input.Search style={{ width:'70%'}} placeholder="input search text"
					                   onChange={this.onKeywordChange.bind(this)}
					                   onSearch={this.onKeywordSearch.bind(this)}
					                   value={keyword}
				/>
				</Col>

				<Col span={4}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建科室配置</Button>
				</Col>
			</Row>
		);
	}

	onShowNewPopup() {
		let x = {
			id: 0,
			org_code: '',
			department_code: '',
			content: '',
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	realEditDataSource(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'departmentUiConfig/edit',
			payload: {
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	onSubmit(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.realEditDataSource.bind(this, record)
		}
		this.setState({
			showPopup: false,
			hotOne: record,
		}, callback);
	}

	render() {
		const { data, total, orgOpts, departmentOpts } = this.props.departmentUiConfig;
		const { page, pageSize, showPopup, hotOne } = this.state;
		const columns = [
			{dataIndex:'department_name', title:'科室'},
			{dataIndex:'org_name', title:'机构'},
			{dataIndex:'content', title:'配置信息', render: this.contentRender.bind(this)},
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
				<DepartmentUIConfigPopup visible={showPopup}
				                         item={hotOne}
				                         onSubmit={this.onSubmit.bind(this)}
				                         orgOpts={orgOpts}
				                         departmentOpts={departmentOpts}
				                         queryFunc={this.onQuery.bind(this)}
				/>
			</div>
		);
	}
}
