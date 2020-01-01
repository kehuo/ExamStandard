import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Popconfirm } from 'antd';
import DiseaseSystemPopup from './DiseaseSystemPopup';

import styles from './Common.less';
import ImpDiseaseSystems from "./ImpDiseaseSystems";
let underscore = require('underscore');

@connect(({ diseaseSystem }) => ({
	diseaseSystem
}))
export default class DiseaseSystemList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',
			dataSource: 'all',

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
		};
		if (dataSource && dataSource != 'all') {
			params.sourceId = dataSource;
		}
		return params;
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'diseaseSystem/init',
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
			type: 'diseaseSystem/fetch',
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
			type: 'diseaseSystem/delete',
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

	// onSelectChange(tag, val) {
	// 	let curState = this.state;
	// 	curState[tag] = val;
	// 	this.setState(curState, this.fetchListData.bind(this))
	// }

	buildOpBar() {
		const { keyword, dataSource } = this.state;
		const { dataSources } = this.props.diseaseSystem;
		return (
			<Row style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					关键词: <Input.Search style={{ width:'70%'}} placeholder="input search text"
					                   onChange={this.onKeywordChange.bind(this)}
					                   onSearch={this.onKeywordSearch.bind(this)}
					                   value={keyword}
				/>
				</Col>
				<Col span={5} offset={1}>
					数据源: <Select style={{width:'60%'}} value={dataSource}
					            onSelect={this.onChange.bind(this, 'dataSource')}>
						<Select.Option value="all">全部</Select.Option>
						{dataSources.map( o => <Select.Option value={''+o.id}>{o.source}</Select.Option>)}
					</Select>
				</Col>
				<Col span={4} offset={1}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建疾病系统</Button>
				</Col>
        <Col span={4} offset={1}>
          <ImpDiseaseSystems/>
        </Col>
			</Row>
		);
	}

	onChange(tag, val) {
		let curState = this.state;
		let callback = null;
		curState[tag] = val;
		if (tag == 'dataSource') {
			callback = this.fetchListData.bind(this);
		}
		this.setState(curState, callback);
	}

	onShowNewPopup() {
		let x = {
			id: 0,
			name: '',
			description: '',
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
			type: 'diseaseSystem/edit',
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

	loadItem(id, callback) {
		const { dispatch } = this.props;
		dispatch({
			type: 'diseaseSystem/load',
			payload: id,
			callback: callback
		});
	}

	render() {
		const { data, total, dataSources, bodyParts } = this.props.diseaseSystem;
		const { page, pageSize, showPopup, hotOne } = this.state;
		const columns = [
			{dataIndex:'name', title:'名称'},
			{dataIndex:'description', title:'描述'},
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
		let itemId = null;
		if (hotOne) {
			itemId = hotOne.id;
		}
		return (
			<div style={{width:1000, margin:'auto', backgroundColor:'white', padding:20}}>
				{this.buildOpBar()}
				<Table columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
				<DiseaseSystemPopup visible={showPopup}
				               item={itemId}
				               onSubmit={this.onSubmit.bind(this)}
				               dataSources={dataSources}
				               bodyParts={bodyParts}
				               loadItem={this.loadItem.bind(this)}
				/>
			</div>
		);
	}
}
