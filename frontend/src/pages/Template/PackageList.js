import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Modal, Tooltip } from 'antd';
import {routerRedux} from 'dva/router';
import { stringify } from 'qs';
import { buildConditionDisplay } from '../Common/Utils';
import styles from './Template.less';
let underscore = require('underscore');
let Immutable = require('immutable');

@connect(({ packageList, user }) => ({
	packageList,
	// currentUser: user.currentUser
}))
export default class PackageList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',
			status: 'all',
			diseaseStatus: 'all',
			selectVirtualDeptId: 'all',

			showDiseasePopup: false,
			diseaseId: '',
			diseaseOptions: [],
			virtualDeptId: 'all',
		};
	}

	buildListQueryParams() {
		const { page, pageSize, keyword, status, selectVirtualDeptId, diseaseStatus } = this.state;
		// let realStatus = 1;
		// switch(status) {
		// 	case '0': realStatus=0; break;
		// 	case '1': realStatus=1; break;
		// 	default: break;
		// }
		let params = {
			page: page,
			pageSize: pageSize,
			keyword: keyword,
			status: status,
			diseaseStatus: diseaseStatus,
			virtualdept: selectVirtualDeptId,
		};
		if (status == 'all') {
			delete params.status;
		}
		if (diseaseStatus == 'all') {
			delete params.diseaseStatus;
		}
		if (['all',''].indexOf(selectVirtualDeptId) != -1) {
			delete params.virtualdept;
		}
		if (!keyword) {
			delete params.keyword;
		}
		return params;
	}

	componentDidMount() {
		let query = this.props.location.query;
		let queryState = {
			page: 1,
			pageSize: 10,
		};
		for (let k in query) {
			let val = query[k];
			if (['page', 'pageSize', 'keyword'].indexOf(k) == -1) {
				continue;
			}
			if (k == 'page' || k == 'pageSize') {
				val = parseInt(val);
			}
			queryState[k] = val;
		}
		this.setState(queryState, this.fetchInit.bind(this));
	}

	// componentWillReceiveProps(nextProps) {
	// 	let isSame = (this.props.currentUser.roleName == nextProps.currentUser.roleName);
	// 	if (isSame) {
	// 		return;
	// 	}
	// 	this.fetchInit();
	// }

	fetchInit() {
		// let role = this.props.packageList.user.roleName;
		// if (!role) {
		// 	return;
		// }
		const { dispatch } = this.props;
		dispatch({
			type: 'packageList/init',
			payload: {
				// role: role,
				queryParams: this.buildListQueryParams()
			},
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
			type: 'packageList/fetch',
			payload: this.buildListQueryParams()
		});
	}

	disableTemplate(record, status) {
		const { dispatch } = this.props;
		dispatch({
			type: 'packageList/changeStatus',
			payload: {
				updateParams: {
					id: record.id,
					status: status,
				},
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	editTemplate(record) {
		const { diseaseId, virtualDeptId } = this.state;
		let listOpts = this.buildListQueryParams();
		if (record.id) {
			listOpts.id = record.id;
			listOpts.virtualDeptId = record.owner_id;
		} else {
			listOpts.id = 0;
			if (!diseaseId) {
				message.error('请选择疾病名称!');
				return;
			}
			listOpts.diseaseId = diseaseId;
			if(!virtualDeptId) {
				message.error('请选择虚拟组名称!');
				return;
			}
			listOpts.virtualDeptId = virtualDeptId;
		}
		let webPath = `/template/package-editor?${stringify(listOpts)}`;
		this.props.dispatch(routerRedux.push(webPath));
	}

	opRender(text, record, index) {
		let statusOp = (
			<span className={styles.ListOpDisable} onClick={this.disableTemplate.bind(this, record, 0)}>
				<Icon type="close-circle" theme="outlined"/>禁用
			</span>
		);
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editTemplate.bind(this, record)}
			      style={{marginLeft: 16}}>
					<Icon type="edit" theme="outlined"/>编辑
				</span>
		);
		let deleteOp = null;
		if (record.status == 0) {
			statusOp = (
				<span className={styles.ListOpEnable} onClick={this.disableTemplate.bind(this, record, 1)}>
					<Icon type="check-circle" theme="outlined"/>启用
				</span>
			);
			// deleteOp = (
			// 	<span className={styles.ListOpDisable} onClick={this.deleteTemplate.bind(this, record)}
			// 	      style={{marginLeft: 16}}>
			// 		<Icon type="delete" theme="outlined"/>删除
			// 	</span>
			// );
		}
		return (
			<div>
				{statusOp}
				{deleteOp}
				{editOp}
			</div>
		);
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

	onKeywordChange(e) {
		this.setState({
			keyword: e.target.value
		});
	}

	onKeywordSearch(value) {
		this.setState({
			keyword: value,
			page: 1
		}, this.fetchListData.bind(this));
	}

	onSelectChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState, this.fetchListData.bind(this))
	}

	buildOpBar() {
		const { status, keyword, selectVirtualDeptId, diseaseStatus } = this.state;
		const { virtualDepartments } = this.props.packageList;
		return (
			<Row gutter={8} style={{marginTop:10, marginBottom:10}}>
				<Col span={7}>
					关键词: <Input.Search style={{ width:'70%'}} placeholder="input search text"
					                   onChange={this.onKeywordChange.bind(this)}
					                   onSearch={this.onKeywordSearch.bind(this)}
					                   value={keyword}
				/>
				</Col>
				<Col span={4}>
					模板状态: <Select style={{width:'60%'}} value={status}
					            onSelect={this.onSelectChange.bind(this, 'status')}>
						<Select.Option value="all">全部</Select.Option>
						<Select.Option value="1">使用中</Select.Option>
						<Select.Option value="0">禁用中</Select.Option>
					</Select>
				</Col>
				<Col span={5}>
					虚拟组: <Select style={{width:'60%'}} value={selectVirtualDeptId}
					            onSelect={this.onSelectChange.bind(this, 'selectVirtualDeptId')}>
					{virtualDepartments.map( o => <Select.Option value={o.v}>{o.k}</Select.Option>)}
					</Select>
				</Col>
				<Col span={4}>
					疾病状态: <Select style={{width:'60%'}} value={diseaseStatus}
					              onSelect={this.onSelectChange.bind(this, 'diseaseStatus')}>
					<Select.Option value="all">全部</Select.Option>
					<Select.Option value="1">使用中</Select.Option>
					<Select.Option value="0">禁用中</Select.Option>
				</Select>
				</Col>
				<Col span={3}>
					<Button type="primary" onClick={this.onShowDiseasePopup.bind(this, null)}>新建模板</Button>
				</Col>
			</Row>
		);
	}

	onDiseaseSearch(keyword) {
		const { dispatch } = this.props;
		const { virtualDeptId } = this.state;
		if (virtualDeptId == 'all') {
			message.error('请选择确定的虚拟组!');
			return;
		}
		dispatch({
			type: 'packageList/queryDisease',
			payload: {
				keyword: keyword,
				page: 1,
				pageSize: 200,
				virtualDepartmentId: virtualDeptId
			},
			callback: function(data) {
				this.setState({
					diseaseOptions: data,
				});
			}.bind(this)
		});
	}

	onChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState);
	}

	onShowDiseasePopup() {
		this.setState({
			showDiseasePopup: true,
		});
	}

	onCreateNewPackage(isUpdate) {
		let callback = null;
		if (isUpdate) {
			if (!this.state.diseaseId) {
				message.error('请选择疾病');
				return;
			}
			if (this.state.virtualDeptId == 'all') {
				message.error('请选择虚拟组');
				return;
			}
			callback = this.editTemplate.bind(this, {})
		}
		this.setState({
			showDiseasePopup: false,
		}, callback);
	}

	buildDiseasePopup() {
		const { diseaseId, diseaseOptions, showDiseasePopup, virtualDeptId } = this.state;
		const { virtualDepartments } = this.props.packageList;
		return (
			<Modal title="新建疾病模板" visible={showDiseasePopup} closable={false}
			       okText="创建" onOk={this.onCreateNewPackage.bind(this, true)}
			       cancelText="取消" onCancel={this.onCreateNewPackage.bind(this, false)}
			>
				<Row>
					<Col span={4}>疾病:</Col>
					<Col span={19} offset={1}>
						<Select style={{width:'90%'}}
					        showSearch
					        value={''+diseaseId}
					        placeholder="请选择疾病"
					        defaultActiveFirstOption={false}
					        showArrow={false}
					        filterOption={false}
					        onSearch={this.onDiseaseSearch.bind(this)}
					        onChange={this.onChange.bind(this, 'diseaseId')}
					        notFoundContent={null}
						>
							{diseaseOptions.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
				<Row style={{marginTop: 6}}>
					<Col span={4}>虚拟组:</Col>
					<Col span={19} offset={1}>
						<Select style={{width:'90%'}}
						        showSearch
						        value={''+virtualDeptId}
						        defaultActiveFirstOption={false}
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChange.bind(this, 'virtualDeptId')}
						>
							{virtualDepartments.map( o => <Select.Option value={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Modal>
		)
	}

	render() {
		const { data, total } = this.props.packageList;
		const { page, pageSize } = this.state;
		const columns = [
			{dataIndex:'disease_name', title:'疾病名称', render: this.nameRender.bind(this)},
			{dataIndex:'disease_system_name', title:'归属系统'},
			{dataIndex:'virtual_department_name', title:'虚拟组名称'},
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
			<div style={{minWidth:1200, margin:'auto', backgroundColor:'white', padding:20}}>
				{this.buildOpBar()}
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
				{this.buildDiseasePopup()}
			</div>
		);
	}
}

