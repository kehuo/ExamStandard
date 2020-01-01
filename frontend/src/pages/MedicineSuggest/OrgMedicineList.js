import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Popconfirm } from 'antd';
import OrgMedicinePopup from './OrgMedicinePopup';

import styles from '../Common/Common.less';
let underscore = require('underscore');

@connect(({ orgMedicineList }) => ({
	orgMedicineList
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
			type: 'orgMedicineList/init',
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
			type: 'orgMedicineList/fetch',
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
			type: 'orgMedicineList/delete',
			payload: {
				updateParams: {
					id: record.id,
				},
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	boolRender(text, record, index) {
		let status = (record['valid_flag'] === true) ? '启用' : '禁用';
		return(
			<div>
				{status}
			</div>
		)
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
		const { dataSourceOpts } = this.props.orgMedicineList;
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
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建机构药品</Button>
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
			code: '',
			name: '',
			medicine_class: '',
			dosage_form: '',
			spec: '',
			std_code: '',
			common_name: '',
			source_id: '',
			valid_flag: true
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	realEditDataSource(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'orgMedicineList/edit',
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
		const { data, total, dataSourceOpts } = this.props.orgMedicineList;
		const { page, pageSize, showPopup, hotOne } = this.state;
		const columns = [
			{dataIndex:'name', title:'名称'},
			{dataIndex:'code', title:'代码'},
			{dataIndex:'medicine_class', title:'类别'},
			{dataIndex:'source_name', title:'数据源'},
			{dataIndex:'valid_flag', title:'启用', render: this.boolRender.bind(this)},
			// {dataIndex:'dosage_form', title:'剂型'},
			// {dataIndex:'spec', title:'包装规格'},
			// {dataIndex:'common_name', title:'通用名'},
			// {dataIndex:'std_code', title:'医保编码'},
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
				<OrgMedicinePopup visible={showPopup}
				              item={hotOne}
				              onSubmit={this.onSubmit.bind(this)}
				                  dataSourceOpts={dataSourceOpts}
				/>
			</div>
		);
	}
}
