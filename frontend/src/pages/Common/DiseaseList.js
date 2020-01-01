import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Popconfirm } from 'antd';
import DiseasePopup from './DiseasePopup';

import styles from './Common.less';
import ImpDiseases from "./ImpDiseases";
let underscore = require('underscore');

@connect(({ disease }) => ({
	disease
}))
export default class DiseaseList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',

			showPopup: false,
			hotOne: {},
		};
	}

	buildListQueryParams() {
		const { page, pageSize, keyword } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			keyword: keyword,
		};
		return params;
	}

	componentDidMount() {
		let query = this.props.location.query;
		let queryState = {};
		for (let k in query) {
			let val = query[k];
			if (k == 'page' || k == 'pageSize') {
				val = parseInt(val);
			}
			queryState[k] = val;
		}
		if (Object.keys(queryState).length>0) {
			this.setState(queryState, this.onInit.bind(this));
		} else{
			this.onInit();
		}
	}

	onInit() {
		const { dispatch } = this.props;
		dispatch({
			type: 'disease/init',
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
			type: 'disease/fetch',
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
			type: 'disease/delete',
			payload: {
				updateParams: {
					id: record.id,
				},
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	statusRender(text, record, index) {
		let enabled = (text == 1);
		let display = enabled ? '使用中':'禁用中';
		let colorStyle = enabled ? styles.ListOpEnable : styles.ListOpDelete;
		return (
			<span className={colorStyle}>{display}</span>
		);
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

	// onSelectChange(tag, val) {
	// 	let curState = this.state;
	// 	curState[tag] = val;
	// 	this.setState(curState, this.fetchListData.bind(this))
	// }

	buildOpBar() {
		const {keyword} = this.state;
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					关键词: <Input.Search style={{ width:'70%'}} placeholder="input search text"
					                   onChange={this.onKeywordChange.bind(this)}
					                   onSearch={this.onKeywordSearch.bind(this)}
					                   value={keyword}
				/>
				</Col>
				<Col span={4} offset={1}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建疾病</Button>
				</Col>
        <Col span={4} offset={1}>
          <ImpDiseases/>
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
			source: '',
			description: '',
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	realEditDataSource(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'disease/edit',
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
		const { data, total, diseaseSystemOptions, dataSourceOptions } = this.props.disease;
		const { page, pageSize, showPopup, hotOne } = this.state;
		const columns = [
			{dataIndex:'code', title:'代码'},
			{dataIndex:'name', title:'名称'},
			{dataIndex:'system_name', title:'疾病系统'},
			{dataIndex:'source_name', title:'数据源'},
			{dataIndex:'status', title:'状态', render: this.statusRender.bind(this)},
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
				<DiseasePopup visible={showPopup}
				                 item={hotOne}
				                 onSubmit={this.onSubmit.bind(this)}
				                 diseaseSystemOptions={diseaseSystemOptions}
				                 dataSourceOptions={dataSourceOptions}
				/>
			</div>
		);
	}
}
