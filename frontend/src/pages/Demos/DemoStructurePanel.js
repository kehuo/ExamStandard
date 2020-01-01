import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Card, Divider, message, Button, Tabs } from 'antd';

import VectorTable from '../MasterData/NormalSub/VectorTable';
import { Tagger } from '../MasterData/TaggingSub/Tagger';
import * as TUtils from '../MasterData/TaggingSub/TaggingUtils';

import styles from './Demo.less';
let underscore = require('underscore');
import {routerRedux} from 'dva/router';
import { ReportTagColorSetting, ReportVectorTable } from './ReportUtils';

@connect(({ demoStructure }) => ({
	demoStructure
}))
export default class DemoStructurePanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			paperType: '',
			typeOpts: [],

			paperTitle: '',
			titleOpts: [],

			leftData: '',
			rightData: '',
			contentType: '',
			touchIndex: -1,
			refDate: '',
		};
	}

	onChangeElement(elementType, tag, val) {
		let curState = this.state;
		let realVal = val;
		if (['input', 'textArea'].indexOf(elementType) != -1) {
			realVal = val.target.value;
		} else if (elementType == 'checkbox') {
			realVal = val.target.checked;
		}
		curState[tag] = realVal;

		let callback = null;
		if (['paperType'].indexOf(tag) != -1) {
			callback = this.getTitleList.bind(this);
		}
		this.setState(curState, callback);
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'demoStructure/fetch',
			payload: {},
			callback: this.updatePaperTypes.bind(this),
		});
	}

	updatePaperTypes(data) {
		let paperType = '';
		if (data.emrType.length > 0) {
			paperType = data.emrType[0].emrType;
		}
		for (let i=0; i<data.emrType.length; i++) {
			let curE = data.emrType[i];
			if (!curE.emrType) {
				curE.emrType = curE.type;
			}
		}
		this.setState({
			paperType: paperType,
			typeOpts: data.emrType,
		}, this.getTitleList.bind(this));
	}

	getTitleList() {
		const { dispatch } = this.props;
		const { paperType } = this.state;
		dispatch({
			type: 'demoStructure/getTitleList',
			payload: {
				emrType: paperType
			},
			callback: this.updatePaperTitles.bind(this),
		});
	}

	updatePaperTitles(data) {
		this.setState({
			paperTitle: '',
			titleOpts: data.Records,
		});
	}

	onGetStructureContent() {
		const { paperTitle, titleOpts } = this.state;
		let contentType = '';
		for (let i=0; i<titleOpts.length; i++) {
			let curT = titleOpts[i];
			if ('' + curT.emrId == paperTitle) {
				contentType = curT.contentType;
				break;
			}
		}
		if (!paperTitle || !contentType) {
			message.error('确认选择合法的文本!')
			return;
		}

		const { dispatch } = this.props;
		dispatch({
			type: 'demoStructure/getStructure',
			payload: {
				emrId: paperTitle,
				contentType: contentType
			},
			callback: this.updateStructureContent.bind(this, contentType),
		});

	}

	updateStructureContent(contentType, data) {
		let leftData = null;
		let rightData = null;
		let refDate = '';
		switch (contentType) {
		case 'content':
			{
				refDate = data.date;
				let x = {
					parseWordsSeq: [],
					entity: data.tags,
				};
				leftData = {
					content: data.content,
					label: JSON.stringify(x)
				};
				rightData= data.entities;
			}
			break;
		case 'Doppler-Bus-ChestAbdomen':
		case 'EEG':
		case 'EMG':
		case 'MRI-Brain':
		case 'Doppler-Bus-Heart':
		case 'X-Ray':
			{
				refDate = data.date;
				let x = {
					parseWordsSeq: [],
					entity: data.tags,
				};
				leftData = {
					content: data.content,
					label: JSON.stringify(x)
				};
				rightData= data.entities;
			}
			break;
		default:
			break;
		}
		this.setState({
			contentType: contentType,
			leftData: leftData,
			rightData: rightData,
			refDate: refDate,
			touchIndex: -1,
		});
	}

	buildSearchBar() {
		const { paperType, typeOpts, paperTitle, titleOpts } = this.state;
		let extra = (
			<Button type="primary" onClick={this.onGetStructureContent.bind(this)}>格式化</Button>
		);
		return (
			<Card title="选择病历文档" extra={extra}>
				<Row gutter={8}>
					<Col span={10}>
						<Row style={{marginBottom:6}}>
							<Col span={8} style={{textAlign:'right'}}>文档类型:</Col>
							<Col span={15} style={{marginLeft:6}}>
								<Select style={{width:'100%'}}
								        value={paperType}
								        defaultActiveFirstOption={false}
								        showArrow={true}
								        filterOption={false}
								        onChange={this.onChangeElement.bind(this, 'select', 'paperType')}
								>
									{typeOpts.map( o=> <Select.Option key={o.emrType}>{o.emrName}</Select.Option>)}
								</Select>
							</Col>
						</Row>
					</Col>

					<Col span={10}>
						<Row style={{marginBottom:6}}>
							<Col span={8} style={{textAlign:'right'}}>医学文档:</Col>
							<Col span={15} style={{marginLeft:6}}>
								<Select style={{width:'100%'}}
								        value={paperTitle}
								        defaultActiveFirstOption={false}
								        showArrow={true}
								        filterOption={false}
								        onChange={this.onChangeElement.bind(this, 'select', 'paperTitle')}
								>
									{titleOpts.map( o=> <Select.Option key={''+o.emrId}>{o.title}</Select.Option>)}
								</Select>
							</Col>
						</Row>
					</Col>
				</Row>
			</Card>
		);
	}

	onSelectVectorItem(entityOne) {
		// {"misc": {"deco": [], "tags": [[10, 14, "pathogen", "曾吃过海鲜"]], "timex3": [{}]}, "normalization": 0, "source": "pathogen", "text": "曾吃过海鲜", "time": "2017-12-12", "type": "disease", "value": 1}
		if (!entityOne.misc || !entityOne.misc.tags || entityOne.misc.tags.length == 0) {
			return;
		}
		let tags = entityOne.misc.tags;
		let rangePos = [tags[0][0], tags[0][1]];
		for (let i=1; i<tags.length; i++) {
			let curT = tags[i];
			rangePos[0] = Math.min(curT[0], rangePos[0]);
			rangePos[1] = Math.max(curT[1], rangePos[1]);
		}
		this.refs['taggerBB'].drawEdgeHighlight(rangePos);
	}

	onSelectPosFromTaggingView(idx) {
		this.setState({
			touchIndex: idx,
		});
	}

	onShowAllEvents() {
		this.setState({
			touchIndex: -1,
		});
	}

	buildStructureInfo() {
		const {contentType, leftData, rightData, touchIndex, refDate} = this.state;
		let isContent = (contentType == 'content');

		let leftContent = isContent ? leftData : '{"content":"","label":{"entity":[],"parseWordsSeq":[]}}';
		let rightContent = isContent ? rightData : [];
		let touchIndexContent = isContent ? touchIndex : -1;

		let leftReport = isContent ? '{"content":"","label":{"entity":[],"parseWordsSeq":[]}}' : leftData;
		let rightReport = isContent ? [] : rightData;
		let touchIndexReport = isContent ? -1 : touchIndex;

		let rawContentComp = (
			<div className='bbTable bbTable_tab2' style={{marginTop: 10}}>
				<Tagger tag={"entity_0"} ref="taggerBB"
				        data={leftContent}
				        tools={[]}
				        defaultColor={'#ffcc00'}
				        onChange={null}
				        tagProps={TUtils.TagColorSetting}
				        op='view'
				        showColorSelector={false}
				        onSelectView={this.onSelectPosFromTaggingView.bind(this)}
				/>
			</div>
		);
		let vectorTableContentComp = (
			<Tabs className="sdpTabs" type="card" animated={false} style={{marginTop:5}}>
				{/*<Tabs.TabPane tab="原始事件" key="lossless">
				 病历基准时间：{refDate}
				 <VectorTable tag="lossless"
				 data={rightData.lossless}
				 touchIndex={touchIndex}
				 onSelectRow={this.onSelectVectorItem.bind(this)}
				 />
				 </Tabs.TabPane>*/}
				<Tabs.TabPane tab="规范事件" key="normalized">
					病历基准时间：{refDate}
					<VectorTable tag="normalized"
					             data={rightContent}
					             touchIndex={touchIndexContent}
					             onSelectRow={this.onSelectVectorItem.bind(this)}
					/>
				</Tabs.TabPane>
			</Tabs>
		);
		let rawReportComp = (
			<div className='bbTable bbTable_tab2' style={{marginTop: 10}}>
				<Tagger tag={"entity_1"} ref="taggerBB"
				        data={leftReport}
				        tools={[]}
				        defaultColor={'#ffcc00'}
				        onChange={null}
				        tagProps={ReportTagColorSetting}
				        op='view'
				        showColorSelector={false}
				        onSelectView={this.onSelectPosFromTaggingView.bind(this)}
				/>
			</div>
		);
		let vectorTableReportComp = (
			<Tabs className="sdpTabs" type="card" animated={false} style={{marginTop:5}}>
				<Tabs.TabPane tab="报告细节" key="normalized">
					病历基准时间：{refDate}
					<ReportVectorTable
						data={rightReport}
						touchIndex={touchIndexReport}
						onSelectRow={this.onSelectVectorItem.bind(this)}
					/>
				</Tabs.TabPane>
			</Tabs>
		);

		let extra = (
			<Button onClick={this.onShowAllEvents.bind(this)}
			        style={{marginLeft:6}} type="primary">展示所有事件</Button>
		);
		return (
			<Row gutter={8}>
				<Col span={12}>
					<Card title="内容区">
						{isContent && rawContentComp}
						{!isContent && rawReportComp}
					</Card>
				</Col>
				<Col span={12}>
					<Card title="事件区" extra={extra}>
						{isContent && vectorTableContentComp}
						{!isContent && vectorTableReportComp}
					</Card>
				</Col>
			</Row>
		);
	}

	render() {
		return (
			<div style={{minWidth: 1000}}>
				{this.buildSearchBar()}
				{this.buildStructureInfo()}
			</div>
		);
	}
}
