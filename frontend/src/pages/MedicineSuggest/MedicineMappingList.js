import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Popconfirm } from 'antd';
import MedicineMappingPopup from './MedicineMappingPopup';

import styles from '../Template/Template.less';
let underscore = require('underscore');

@connect(({ medicineMappingList }) => ({
	medicineMappingList
}))
export default class OrgMedicineList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',
			dataSource: '',

			showPopup: false,
			hotOne: {},
		};
	}

	buildListQueryParams() {
		const { page, pageSize, keyword, dataSource } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			keyword: keyword,
			dataSource: dataSource,
		};
		return params;
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'medicineMappingList/init',
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
			type: 'medicineMappingList/fetch',
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
			type: 'medicineMappingList/delete',
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
			<span className={styles.ListOpDelete} style={{marginLeft: 16}}>
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
		if (tag == 'dataSource') {
			callback = this.fetchListData.bind(this);
		}
		curState[tag] = realVal;
		this.setState(curState, callback);
	}

	buildOpBar() {
		const { dataSourceOpts } = this.props.medicineMappingList;
		const { keyword, dataSource } = this.state;
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					关键词: <Input.Search style={{ width:'70%'}} placeholder="input search text"
					                   onChange={this.onKeywordChange.bind(this)}
					                   onSearch={this.onKeywordSearch.bind(this)}
					                   value={keyword}
				/>
				</Col>
				<Col span={8}>
					数据源: <Select style={{width:'70%'}}
					             allowClear showArrow
					             value={dataSource}
					             defaultActiveFirstOption={false}
					             showArrow={false}
					             filterOption={false}
					             onChange={this.onChangeElement.bind(this, 'select', 'dataSource')}
				>
					{dataSourceOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
				</Select>
				</Col>
				<Col span={4} offset={1}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建药品映射</Button>
				</Col>
				{/*<Col span={4} offset={1}>
				 <ImpDiseases/>
				 </Col>*/}
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
			bb_medicine_id: '',
			medicine_id: '',
			bb_medicine_name: '',
			medicine_name: '',
			source_id: '',
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	realEditDataSource(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'medicineMappingList/edit',
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

	queryMedicine(params, callback) {
		const { dispatch } = this.props;
		dispatch({
			type: 'medicineMappingList/queryMedicine',
			payload: params,
			callback: callback,
		});
	}

	render() {
		const { data, total, dataSourceOpts } = this.props.medicineMappingList;
		const { page, pageSize, showPopup, hotOne } = this.state;
		const columns = [
			{dataIndex:'bb_medicine_name', title:'标准药品'},
			{dataIndex:'medicine_name', title:'机构药品'},
			{dataIndex:'source_name', title:'数据源'},
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
				<MedicineMappingPopup visible={showPopup}
				                  item={hotOne}
				                  onSubmit={this.onSubmit.bind(this)}
				                  dataSourceOpts={dataSourceOpts}
				                      queryMedicine={this.queryMedicine.bind(this)}
				/>
			</div>
		);
	}
}
