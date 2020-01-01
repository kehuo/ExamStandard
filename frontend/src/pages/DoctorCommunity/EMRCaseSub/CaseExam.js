import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Popconfirm, message, Button, Tabs, Card,
	Tooltip, Collapse, Checkbox } from 'antd';
import ElementComponent from '../../Template/ElementComponent';
import * as EmrCaseUtils from './EmrCaseUtils';

import styles from '../Community.less';
let underscore = require('underscore');
let immutable = require('immutable');
import {routerRedux} from 'dva/router';

export default class CaseExam extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.updateOne(props.item);
	}

	componentWillReceiveProps(nextProps) {
		let isSame = immutable.is(this.props.item, nextProps.item);
		if (isSame) {
			return;
		}
		let newState = this.updateOne(nextProps.item);
		this.setState(newState);
	}

	updateOne(item) {
		let newState = {
			exams: [],
		};
		if (item) {
			newState.exams = item;
		}
		return newState;
	}

	buildExamOne(examOne, index, examAll) {
		let color = examOne.value == 0? 'green':'red';
		let arrowComp = null;
		if (examOne.value == 2) {
			arrowComp = (
				<Icon type="arrow-up" />
			);
		} else if (examOne.value == -2) {
			arrowComp = (
				<Icon type="arrow-down" />
			);
		}
		let realValueComp = null;
		if (examOne.realValue) {
			let x = examOne.realValue[0];
			let y = x.value.join(' ');
			realValueComp = (<span style={{color:'black'}}>{y + ' ' + x.unit}</span>)
		}
		let comp = (
			<Row style={{color:color}}>{examOne.text}{arrowComp}:{realValueComp}</Row>
		);
		return comp;
	}

	render() {
		const { exams } = this.state;
		return (
			<Card title="化验和检查">
				{exams.map(this.buildExamOne.bind(this))}
			</Card>
		);
	}
}
