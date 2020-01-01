import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Popconfirm, Tooltip } from 'antd';
import ExamPopup from './ExamPopup';
import ConditionPopup from '../Common/ConditionPopup';
import { buildConditionDisplay } from '../Common/Utils';

import styles from './Exam.less';
import ImpExams from "./ImpExams";
let underscore = require('underscore');

const ExamTypeOptions = [
	{k:'检验化验', v:'0'}, {k:'检查', v:'1'}
];

@connect(({ exam }) => ({
	exam
}))
export default class ExamList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: '',

			showPopup: false,
			showConditionPopup: false,
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
		const { dispatch } = this.props;
		dispatch({
			type: 'exam/init',
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
			type: 'exam/fetch',
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
			type: 'exam/delete',
			payload: {
				updateParams: {
					id: record.id,
				},
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	editCondition(record) {
		this.setState({
			showConditionPopup: true,
			hotOne: record,
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
		let conditionOp = (
			<span className={styles.ListOpCondition} onClick={this.editCondition.bind(this, record)}
			      style={{marginLeft: 16}}>
				<Icon type="select" theme="outlined"/>条件
			</span>
		);
		return (
			<div>
				{deleteOp}
				{editOp}
				{conditionOp}
			</div>
		);
	}

	examTypeRender(text, record, index) {
		let tgt = '' + text;
		let display = '未知';
		for(let i=0; i<ExamTypeOptions.length; i++) {
			let x = ExamTypeOptions[i];
			if (x.v == tgt) {
				display = x.k;
				break;
			}
		}
		return display;
	}

	emergencyRender(text, record, index) {
		const EmergencyMap = {
			'0': '否', '1':'是'
		}
		let display = EmergencyMap[''+text];
		if(!display) {
			display = '未知';
		}
		return display;
	}

	textRender(text, record, index) {
		let component = text;
		if (text.length > 8) {
			let showText = text.substring(0, 5) + '...';
			component = (
				<Tooltip title={text}>
					{showText}
				</Tooltip>
			);
		}
		return component;
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
			page: 1,
		}, this.fetchListData.bind(this));
	}

	// onSelectChange(tag, val) {
	// 	let curState = this.state;
	// 	curState[tag] = val;
	// 	this.setState(curState, this.fetchListData.bind(this))
	// }

	buildOpBar() {
		const { keyword } = this.state;
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
					<Button type="primary" onClick={this.onShowNewPopup.bind(this, null)}>新建检查项目</Button>
				</Col>
        <Col span={4} offset={1}>
          <ImpExams/>
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
			code: '',
			exam_class: '',
			exam_type: '',
			project_type: '',
			source_id: '',
			unit: '',
			pinyin_abbr: '',
			emergency: '0',
		};
		this.setState({
			showPopup: true,
			hotOne: x
		});
	}

	realEditDataSource(record) {
		const { dispatch } = this.props;
		dispatch({
			type: 'exam/edit',
			payload: {
				updateParams: record,
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	onSubmitDataSource(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.realEditDataSource.bind(this, record)
		}
		this.setState({
			showPopup: false,
			hotOne: record,
		}, callback);
	}

	realEditConditions() {
		const { hotOne  } = this.state;
		const { dispatch } = this.props;
		dispatch({
			type: 'exam/edit',
			payload: {
				updateParams: hotOne,
				queryParams: this.buildListQueryParams(),
			}
		});
	}

	onSubmitConditions(isUpdate, x) {
		let record = this.state.hotOne;
		let callback = null;
		if (isUpdate) {
			callback = this.realEditConditions.bind(this);
			record.conditions = x;
		}
		this.setState({
			showConditionPopup: false,
			hotOne: record,
		}, callback);
	}

	render() {
		const { data, total, dataSourceOptions } = this.props.exam;
		const { page, pageSize, showPopup, hotOne, showConditionPopup } = this.state;
		const columns = [
			{dataIndex:'name', title:'名称', width:'20%', render: this.nameRender.bind(this)},
			{dataIndex:'code', title:'代码'},
			{dataIndex:'exam_type', title:'类型', render: this.examTypeRender.bind(this)},
			{dataIndex:'emergency', title:'急诊专用', render: this.emergencyRender.bind(this)},
			{dataIndex:'exam_class', title:'分类', render: this.textRender.bind(this)},
			{dataIndex:'source_name', title:'数据源', render: this.textRender.bind(this)},
			{dataIndex:'valid_flag', title:'启用', render: this.boolRender.bind(this)},
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
				<ExamPopup visible={showPopup}
				               item={hotOne}
				               onSubmit={this.onSubmitDataSource.bind(this)}
				           dataSourceOptions={dataSourceOptions}
				           ExamTypeOptions={ExamTypeOptions}
				/>
				<ConditionPopup visible={showConditionPopup}
				                item={hotOne}
				                onSubmit={this.onSubmitConditions.bind(this)}
				/>
			</div>
		);
	}
}
