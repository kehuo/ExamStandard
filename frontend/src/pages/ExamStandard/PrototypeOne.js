import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Checkbox, Icon, Table, Popconfirm, message, Button, Tabs, Empty,
	Tooltip, DatePicker, Card } from 'antd';
import PrototypeKidneyPanel from './PrototypeKidneyPanel';

import styles from './ExamStandard.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';
let moment = require('moment');
import debounce from 'lodash/debounce';

@connect(({ prototypeOne }) => ({
	prototypeOne
}))
export default class PrototypeOne extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {}
		};
	}

	componentDidMount() {
		const { location, dispatch } = this.props;
		let caseId = location.query.id;

		if (!caseId) {
			message.error('无效id!');
			return;
		}

		dispatch({
			type: 'prototypeOne/fetch',
			payload: caseId,
			callback: this.updateAll.bind(this)
		});
	}

	updateAll(data) {
		this.setState({
			data: data
		});
	}

	onReturnList() {
		let webPath = `/exam-standard/prototype-list`;
		this.props.dispatch(routerRedux.push(webPath));
	}

	buildKidneyPanel(data) {
		let extra = (
			<Button type="primary" onClick={this.onReturnList.bind(this)}>返回列表</Button>
		);
		return (
			<PrototypeKidneyPanel data={data}
	                              extra={extra}
			/>
		);

	}

	buildContentComponent() {
		const { data } = this.state;
		let comp = (
			<Row>
				暂不支持 {data.type}
			</Row>
		);
		switch(data.type) {
		case '肾病理报告':
			comp = this.buildKidneyPanel(data);
			break;
		case '肝病理报告':
			comp = this.buildKidneyPanel(data);
			break;
		default:
			break;
		}
		return comp;
	}

	render() {
		const { data } = this.state;
		if (!data || !data.type) {
			return (
				<Empty />
			);
		}
		return (
			<div style={{minWidth:1000, backgroundColor:'white', padding:20}}>
				{this.buildContentComponent()}
			</div>
		)
	}
}