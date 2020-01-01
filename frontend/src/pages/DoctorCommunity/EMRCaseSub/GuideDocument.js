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
import debounce from 'lodash/debounce';

export default class GuideDocument extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.updateOne(props.item);
		this.getDiseaseList = debounce(this.getDiseaseList, 500);
	}

	componentWillReceiveProps(nextProps) {
		let isSame = immutable.is(this.props.item, nextProps.item);
		if (isSame) {
			return;
		}
		let newState = this.updateOne(nextProps.item);
		this.setState(newState, this.getGuideList.bind(this));
	}

	updateOne(item) {
		let newState = {
			gDiagnosis: '',
			diseaseOpts: [],

			guideOpts: [],
			guideIdx: '',

			gSource: '',
			gText: '',
		};
		if (item) {
			newState.gDiagnosis = item;
			newState.diseaseOpts = [{k:item, v:item}];
		}
		return newState;
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (elementType == 'checkbox') {
			realVal = val.target.checked;
		} else if (elementType.startsWith('ageRange')) {
			if (!curState[tag]) {
				curState[tag] = {
					ageRange_start_val: '', ageRange_start_unit: '',
					ageRange_end_val: '', ageRange_end_unit: '',
				};
			}
			realVal = curState[tag];
			realVal[elementType] = val;
		}
		curState[tag] = realVal;

		let callback = null;
		if (tag == 'guideIdx') {
			callback = this.getGuideOne.bind(this);
		} else if (tag == 'gDiagnosis') {
			callback = this.getGuideList.bind(this);
		}
		this.setState(curState, callback);
	}

	getDiseaseList(keyword) {
		if (this.props.onQueryDisease) {
			this.props.onQueryDisease(keyword, this.updateDiseaseList.bind(this));
		}
	}

	updateDiseaseList(data) {
		let opts = [];
		for (let i=0; i<data.diseases.length; i++) {
			let curD = data.diseases[i];
			opts.push({k:curD.name, v:curD.name});
		}
		this.setState({
			diseaseOpts: opts,
		});
	}

	updateOptList(data) {
		let opts = [];
		for (let i=0; i<data.documents.length; i++) {
			let curD = data.documents[i];
			opts.push({
				k:curD.diagnosis + ' ' + curD.source_description , v:'' + curD.id
			});
		}
		let callback = null;
		let newState = {
			guideOpts: opts,
			guideIdx: '',
		};
		if (data.documents.length > 0) {
			callback = this.updateDocumentOnly.bind(this, data.docOne);
			newState.guideIdx = '' + data.documents[0].id;
		} else {
			newState.gSource = '';
			newState.gText = '';
		}
		this.setState(newState, callback);
	}

	getGuideList() {
		const { gDiagnosis } = this.state;
		if (this.props.onQueryDocument) {
			this.props.onQueryDocument('list', gDiagnosis, this.updateOptList.bind(this));
		}
	}

	updateDocumentOnly(data) {
		this.setState({
			gSource: data.source_description,
			gText: data.guide_text,
		});
	}

	getGuideOne() {
		const { guideIdx } = this.state;
		if (this.props.onQueryDocument) {
			this.props.onQueryDocument('one', guideIdx, this.updateDocumentOnly.bind(this));
		}
	}

	buildSelectBar() {
		const { gDiagnosis, diseaseOpts, guideOpts, guideIdx} = this.state;
		return (
			<Card title="选择">
				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>疾病:</Col>
					<Col span={17}>
						<Select style={{width:'100%'}}
						        showSearch
						        value={gDiagnosis}
						        defaultActiveFirstOption={false}
						        showArrow={false}
						        filterOption={false}
						        onSearch={this.getDiseaseList.bind(this)}
						        onChange={this.onChangeElement.bind(this, 'select', 'gDiagnosis')}
						        notFoundContent={null}
						>
							{diseaseOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>

				<Row style={{marginBottom:6}}>
					<Col span={6} style={{textAlign:'right'}}>文献:</Col>
					<Col span={17}>
						<Select style={{width:'100%'}}
						        value={guideIdx}
						        defaultActiveFirstOption={false}
						        showArrow={true}
						        filterOption={false}
						        onChange={this.onChangeElement.bind(this, 'select', 'guideIdx')}
						>
							{guideOpts.map( o=> <Select.Option key={o.v}>{o.k}</Select.Option>)}
						</Select>
					</Col>
				</Row>
			</Card>
		);
	}

	buildDocument() {
		const { gDiagnosis, gSource, gText } = this.state;
		return (
			<Card title={gDiagnosis} extra={gSource}>
				{gText}
			</Card>
		);
	}

	render() {
		return (
			<Card title="参考文献">
				{this.buildSelectBar()}
				{this.buildDocument()}
			</Card>
		)
	}
}