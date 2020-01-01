import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Modal } from 'antd';
import {routerRedux} from 'dva/router';
import { stringify } from 'qs';

import PersonForm from './PersonForm';
import TemplateQueryCard from './TemplateQueryCard';
import AutoGenerateResult from './AutoGenerateResult';

import styles from './Template.less';
let underscore = require('underscore');

@connect(({ templateTest }) => ({
	templateTest
}))
export default class TestTemplate extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'templateTest/init',
			payload: {
				page: 1,
				pageSize: 1000,
			}
		});
	}

	onSubmit() {
		const { dispatch } = this.props;
		let x = this.refs["inquiryInfo"].collect();
		let y = this.refs["templateQueryInfo"].collect();
		if (!x || !y) {
			return;
		}
		dispatch({
			type: 'templateTest/generateText',
			payload: {
				data: {
					person: x,
					params: y,
				},
			}
		});
	}

	onSearchOperator(orgCode, ownerType) {
		const { dispatch } = this.props;
		dispatch({
			type: 'templateTest/queryOperator',
			payload: {
				orgCode: orgCode,
				ownerType: ownerType,
				page: 1,
				pageSize: 1000,
			}
		});
	}

	onSearchDisease(keyword) {
		const { dispatch } = this.props;
		dispatch({
			type: 'templateTest/queryDisease',
			payload: {
				page: 1,
				pageSize: 1000,
				keyword: keyword
			}
		});
	}

	render() {
		const { orgOptions, operatorOptions, diseaseOptions, result } = this.props.templateTest;
		return (
			<div style={{width:1000, margin:'auto', backgroundColor:'white', padding:20}}>
				<TemplateQueryCard ref="templateQueryInfo"
				                   orgOptions={orgOptions}
				                   operatorOptions={operatorOptions}
				                   diseaseOptions={diseaseOptions}
				                   onSearchOperator={this.onSearchOperator.bind(this)}
				                   onSearchDisease={this.onSearchDisease.bind(this)}
				/>
				<PersonForm ref="inquiryInfo" />
				<Row style={{textAlign:'center', marginTop:10}}>
					<Button type="primary" onClick={this.onSubmit.bind(this)}>提交</Button>
				</Row>
				<AutoGenerateResult item={result} />
			</div>
		);
	}
}
