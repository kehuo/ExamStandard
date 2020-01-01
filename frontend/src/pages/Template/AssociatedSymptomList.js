import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Tag, message, Button, Popconfirm } from 'antd';
import AssociatedSymptomPopup from './AssociatedSymptomPopup';

import styles from './Template.less';
let underscore = require('underscore');

@connect(({ associateSymptom }) => ({
	associateSymptom
}))
export default class AssociatedSymptomList extends React.Component {
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
			type: 'associateSymptom/fetch',
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
			type: 'associateSymptom/delete',
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

	onQuery(keyword, callback) {
		const { dispatch } = this.props;
		dispatch({
			type: 'associateSymptom/fetchSymptom',
			payload: {
				page: 1, pageSize: 200,
				type: 'symptom', keyword: keyword,
				dataType: 'mapping'
			},
			callback: callback
		});
	}

	buildOpBar() {
		const { keyword } = this.state;
		return (
			<Row gutter={8} style={{marginTop:10, marginBottom:10}}>
				<Col span={8}>
					关键词: <Input.Search style={{ width:'70%'}} placeholder="input search text"
					                   onChange={this.onKeywordChange.bind(this)}
					                   onSearch={this.onKeywordSearch.bind(this)}
					                   value={keyword}
				/>
				</Col>

				<Col span={4}>
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建症状关联</Button>
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
			type: 'associateSymptom/edit',
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

	masterRender(text, record, index) {
		let component = buildTag(text);
		return component;
	}

	associateRender(text, record, index) {
		let tagOnes = [];
		if (text) {
			let ms = JSON.parse(text);
			for (let i=0; i<ms.length; i++) {
				let component = buildTag(ms[i]);
				tagOnes.push(component);
			}
		}
		return (
			<div>
				{tagOnes}
			</div>
		);
	}

	render() {
		const { data, total } = this.props.associateSymptom;
		const { page, pageSize, showPopup, hotOne } = this.state;
		const columns = [
			{dataIndex:'vector', title:'主症状', render: this.masterRender.bind(this)},
			{dataIndex:'associated', title:'关联症状', render: this.associateRender.bind(this)},
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
				<AssociatedSymptomPopup visible={showPopup}
				                         item={hotOne}
				                         onSubmit={this.onSubmit.bind(this)}
				                         queryFunc={this.onQuery.bind(this)}
				/>
			</div>
		);
	}
}

function buildTag(x) {
	const ColorMap = {
		symptom: 'geekblue', exam: 'magenta', disease: 'cyan',
		treatment:'#f50', medicine: '#108ee9', unknown: 'black'
	};
	let fields = x.split('$');
	let vText = x;
	let vType = 'unknown';
	if (fields.length == 2) {
		vText = fields[0];
		vType = fields[1];
	}
	let color = ColorMap[vType];
	if (!color) {
		color = 'black';
	}
	if (vText.length > 12) {
		let shortText = vText.substr(0, 10) + '...';
		return (
			<Tooltip title={vText}>
				<Tag color={color}>{shortText}</Tag>
			</Tooltip>
		);
	}
	return (<Tag color={color}>{vText}</Tag>);
}