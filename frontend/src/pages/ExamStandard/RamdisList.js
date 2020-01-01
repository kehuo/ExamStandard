import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Checkbox, Icon, Table, Popconfirm, message, Button, Tabs,
	Tooltip, DatePicker, Card } from 'antd';

import styles from './ExamStandard.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';

const ConfidenceOpts = [
	{k:'确认100%', v:'确认100%'}, {k:'高于70%', v:'高于70%'}, {k:'低于50%', v:'低于50%'},{k:'未确认', v:'未确认'},
];

@connect(({ ramdisList }) => ({
	ramdisList
}))
export default class RamdisList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			keyword: '',
			confidence: '',
			page: 1,
			pageSize: 10,
		};
	}

	componentDidMount() {
		this.fetchListData();
	}

	buildListQueryParams() {
		const {page, pageSize, keyword, confidence} = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			keyword: keyword,
			confidence: confidence,
		};
		return params;
	}

	setPage1() {
		this.setState({
			page: 1,
		});
	}

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: 'ramdisList/fetch',
			payload: this.buildListQueryParams(),

			// 若添加callback, 会有翻页问题, 暂时注释
			// callback: this.setPage1.bind(this)
		});
	}

	onListPageChange(page, pageSize) {
		this.setState({
			page: page,
			pageSize: pageSize
		}, this.fetchListData.bind(this));
	}

	goCaseOnePanel(record) {
		let webPath = `/exam-standard/ramdis-one?id=${record.id}`;
		this.props.dispatch(routerRedux.push(webPath));
	}

	idRender(content, record, index) {
		let component = (
			<span style={{textDecoration:'underline', cursor:'pointer'}}
			      onClick={this.goCaseOnePanel.bind(this, record)}>{content}</span>
		);
		return component;
	}

	textRender(maxLength, content, record, index) {
		let component = content;
		if (content.length > maxLength) {
			let showText = content.substring(0, maxLength-3) + '...';
			component = (
				<Tooltip title={content}>
					{showText}
				</Tooltip>
			);
		}
		return component;
	}

	confidenceRender(content, record, index) {
		const ColorMap = {
			'确认100%': 'green', '高于70%':'blue',
			'低于50%': 'black', '未确认': 'red',
		};
		let color = 'black';
		if (ColorMap[content]) {
			color = ColorMap[content]
		}
		let comp = (
			<span style={{color: color}}>{content}</span>
		);
		return comp;
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (['checkbox'].indexOf(elementType) != -1) {
			realVal = val.target.checked;
		}
		curState[tag] = realVal;

		let callback = null;
		this.setState(curState, callback);
	}

	buildOpBar() {
		const { keyword, confidence } = this.state;
		let extra = (
			<Button type="primary" onClick={this.fetchListData.bind(this)}>搜索</Button>
		);
		return (
			<Card title="查询条件" size="small" extra={extra}>
				<Row style={{marginTop:10, marginBottom:10}} gutter={8}>
					<Col span={8}>
						关键词: <Input style={{width:'70%'}}
						       value={keyword}
						       onChange={this.onChangeElement.bind(this, 'input', 'keyword')}
						/>
					</Col>
					<Col span={8}>
						可信度: <Select style={{width:'70%'}}
						        value={confidence}
						        defaultActiveFirstOption={false}
						        showArrow={true} allowClear
						        filterOption={false}
						        onChange={this.onChangeElement.bind(this, 'select', 'confidence')}
						>
							{ConfidenceOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Card>
		);
	}

	render() {
		const { total, data } = this.props.ramdisList;
		const { page, pageSize } = this.state;
		const columns = [
			{dataIndex:'patient_id', title:'患者编号', render: this.idRender.bind(this)},
			{dataIndex:'confidence', title:'可信度', render: this.confidenceRender.bind(this)},
			{dataIndex:'country', title:'国家'},
			{dataIndex:'diagnosis', title:'诊断', render: this.textRender.bind(this, 24)},
			{dataIndex:'diagnosis_confirmed', title:'确诊'},
			{dataIndex:'found_in_newborn', title:'出生时发现'},
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
			<div style={{minWidth:1000, backgroundColor:'white', padding:20}}>
				{this.buildOpBar()}
				<Table size="small"
				       columns={columns}
				       dataSource={data}
				       pagination={pageOpts}
				/>
			</div>
		);
	}
}
