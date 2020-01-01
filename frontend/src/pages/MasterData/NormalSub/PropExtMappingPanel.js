import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, message, Button, Popconfirm, Modal, TreeSelect, Spin } from 'antd';
import { buildTreeData } from '../../../utils/utils'

import styles from '../MasterData.less';
let underscore = require('underscore');


class PropMappingOnePanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.item);
	}

	initData(item) {
		let newState = {
			id: 0,
			vName: '',
			vectorId: '',
		};
		if (item && item.id) {
			newState.id = item.id;
			newState.vName = item.vName;
			newState.vectorId = item.vectorId;
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
		const { id, vName, vectorId } = this.state;
		if (!this.props.onSubmit) {
			return;
		}
		if (!isUpdate) {
			this.props.onSubmit(false, null);
			return;
		}

		if (!vName || !vectorId) {
			message.error('请正确填写属性名称和映射矢量!');
			return;
		}
		let x = {
			id: id,
			vName: vName,
			vectorId: vectorId
		};
		this.props.onSubmit(true, x);
	}

	onChange(tag, val) {
		let curState = this.state;
		if (['vName'].indexOf(tag) != -1) {
			curState[tag] = val.target.value;
		} else {
			curState[tag] = val;
		}
		this.setState(curState);
	}

	render() {
		const {id, vName, vectorId} = this.state;
		let disabled = false;
		if (id !== 0) {
			disabled = true
		}
		const { visible, treeData } = this.props;
		let title = '新建分拆矢量';
		if (id) {
			title = '编辑分拆矢量';
		}
		return (
			<Modal  title={title} visible={visible} closable={false}
			        okText="确定" onOk={this.onSubmit.bind(this, true)}
			        cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
			>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>属性名称:</Col>
					<Col span={16} offset={1}>
						<Input style={{width:'100%'}}
						       disabled={disabled}
						       value={vName}
						       onChange={this.onChange.bind(this, 'vName')}
						/>
					</Col>
				</Row>
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>映射矢量:</Col>
					<Col span={16} offset={1}>
						<TreeSelect
							showSearch
							optionFilterProp="children"
							style={{width:'100%'}}
							value={vectorId}
							treeNodeFilterProp={'title'}
							dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
							treeData={treeData}
							placeholder="Please select"
							treeDefaultExpandAll
							allowClear
							onChange={this.onChange.bind(this, 'vectorId')}
						/>
					</Col>
				</Row>
			</Modal>
		);
	}
}

export default class PropExtMappingPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',
			data: [],
			total: 0,
			treeData: [],
			showPopup: false,
			hotOne: {},
			spinning: false
		};
	}

	componentDidMount() {
		let curState = this.state;
		curState['spinning'] = true;
		this.setState(curState, this.fetchListData());
	}

	fetchListData() {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: this.buildListQueryParams(),
			callback: this.updateList.bind(this),
		};
		onQuery('prop_mapping_list', params);
	}

	searchPropsMapping() {
		this.setState({
			page: 1,
			spinning: true,
		}, this.fetchListData.bind(this));
	}

	buildListQueryParams() {
		const { page, pageSize, keyword } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
		};
		if (keyword) {
			params.keyword = keyword;
		}
		return params;
	}

	updateList(data) {
		let { page, pageSize } = this.state;
		let totalPage = Math.ceil(data.total/pageSize);

		if (totalPage > 0 && page > totalPage) {
			page = totalPage
		}

		this.setState({
			data: data.propMapping,
			spinning: false,
			page: page,
			extensions: data.extensions,
			treeData: buildTreeData(data.extensions, 'name', 'id', 'id'),
			total: data.total,
		});
	}

	updateList1(data) {
		let { page, pageSize } = this.state;
		let totalPage = Math.ceil(data.total/pageSize);

		if (totalPage > 0 && page > totalPage) {
			page = totalPage
		}

		this.setState({
			spinning: false,
			page: page,
			data: data.propMapping,
			total: data.total,
		});
	}


	onShowNewPopup() {
		let x = {
			id: 0,
			vName: '',
			vectorId: '',
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		}
		curState[tag] = realVal;
		this.setState(curState);
	}

	buildOpBar() {
		const { keyword } = this.state;
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					关键词: <Input.Search style={{width: '80%'}}
					                   value={keyword}
					                   onChange={this.onChangeElement.bind(this, 'input', 'keyword')}
					                   onSearch={this.searchPropsMapping.bind(this)}
				/>
				</Col>
				<Col span={4} offset={1}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建扩展属性映射</Button>
				</Col>
			</Row>
		);
	}

	editItem(record) {
		this.setState({
			showPopup: true,
			hotOne: record,
		});
	}

	onSubmit(isUpdate, record) {
		if (!isUpdate) {
			this.setState({
				spinning: false,
				showPopup: false,
			});
			return;
		}

		let callback = this.realEditItem.bind(this, record);
		this.setState({
			spinning: true,
			showPopup: false,
			hotOne: record,
		}, callback);
	}

	realEditItem(record) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList1.bind(this),
		};
		if (record.id === 0) {
			onQuery('new_prop_mapping_one', params);
		} else {
			onQuery('edit_prop_mapping_one', params);
		}
	}

	doDeleteItem(record) {
		const { onQuery } = this.props;
		if (!onQuery) {
			return;
		}
		let params = {
			payload: {
				id: record.id,
				queryParams: this.buildListQueryParams(),
			},
			callback: this.updateList1.bind(this),
		};
		onQuery('delete_prop_mapping_one', params);
	}

	onDeleteItem(record) {
		this.setState({
			spinning: true,
		}, this.doDeleteItem.bind(this, record))
	}

	opRender(text, record, index) {
		let editOp = (
			<span className={styles.ListOpEdit} onClick={this.editItem.bind(this, record)}>
					<Icon type="edit" theme="outlined"/>编辑
				</span>
		);
		let deleteOp = (
			<span className={styles.ListOpDisable} style={{marginLeft:8}}>
				<Popconfirm title="确定删除"
				            onConfirm={this.onDeleteItem.bind(this, record)}
				            onCancel={null}
				>
					<Icon type="close-circle" theme="outlined" />删除
				</Popconfirm>
			</span>
		);
		return (
			<div>
				{editOp}
				{deleteOp}
			</div>
		);
	}

	onListPageChange(page, pageSize) {
		this.setState({
			spinning: true,
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	render() {
		const { page, pageSize, showPopup, data, total, hotOne, treeData, spinning } = this.state;
		const columns = [
			{dataIndex:'id', title:'ID'},
			{dataIndex:'vName', title:'矢量名称'},
			{dataIndex:'stdName', title:'标准矢量名称'},
			{dataIndex:'stdCode', title:'标准矢量代码'},
			{dataIndex:'id', title:'操作', render: this.opRender.bind(this)}
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
			<div style={{width:1000, backgroundColor:'white', padding:10}}>
				{this.buildOpBar()}
				<Spin spinning={spinning}>
					<Table columns={columns}
					       dataSource={data}
					       pagination={pageOpts}
					/>
				</Spin>
				<PropMappingOnePanel visible={showPopup}
				                     item={hotOne}
				                     treeData={treeData}
				                     onSubmit={this.onSubmit.bind(this)}
				/>
			</div>
		);
	}
}
