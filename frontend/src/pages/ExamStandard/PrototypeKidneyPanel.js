import React, { PureComponent } from 'react';
import { Row, Col, Input, Select, Checkbox, Icon, Table, Popconfirm, message, Button, Tabs, Empty,
	Tooltip, DatePicker, Card } from 'antd';
import { Tagger } from '../MasterData/TaggingSub/Tagger';
import * as TUtils from '../MasterData/TaggingSub/TaggingUtils';

import styles from './ExamStandard.less';
let underscore = require('underscore');
let moment = require('moment');
import debounce from 'lodash/debounce';
let Immutable = require('immutable');

function buildTaggerContent(x, x_tag) {
	let xTag = JSON.parse(x_tag);
	let taggerContent = {
		"content": x,
		"label":JSON.stringify({
			"entity": xTag.entity,
			"parseWordsSeq":[]
		})
	};
	return taggerContent;
}

export default class PrototypeKidneyPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initData(props.data);
	}

	initData(data) {
		let newState = {
			reportType: '',
			diagnosisTaggerContent: null,
			diagnosisTableContent: null,
			contentTaggerContent: null,
			contentTableContent: null,
		};
		if (data) {
			// ['id', 'uuid', 'type', 'diagnosis', 'diagnosis_tag', 'content', 'content_tag', 'created_at', 'updated_at',
			// 'content_lossless', 'diagnosis_lossless']
			newState.reportType = data['type'];
			newState.diagnosisTaggerContent = buildTaggerContent(data['diagnosis'], data['diagnosis_tag']);
			newState.diagnosisTableContent = data['diagnosis_lossless'];
			newState.contentTaggerContent = buildTaggerContent(data['content'], data['content_tag']);
			newState.contentTableContent = data['content_lossless'];
		}
		return newState;
	}

	componentWillReceiveProps(nextProps) {
		let isSame = Immutable.is(this.props.data, nextProps.data);
		if (isSame) {
			return;
		}
		let newState = this.initData(nextProps.data);
		this.setState(newState);
	}

	buildDiagnosisPanel() {
		const { diagnosisTaggerContent, diagnosisTableContent } = this.state;
		return (
			<ContentPanel title="诊断部分"
			              tagId='diagnosis0'
			              tableContent={diagnosisTableContent}
			              taggerContent={diagnosisTaggerContent}
			/>
		);
	}

	buildContentPanel() {
		const { contentTaggerContent, contentTableContent } = this.state;
		return (
			<ContentPanel title="光镜部分"
			              tagId='content0'
			              tableContent={contentTableContent}
			              taggerContent={contentTaggerContent}
			/>
		);
	}

	render() {
		const { extra } = this.props;
		const { reportType } = this.state;
		return (
			<Card title={reportType} extra={extra}>
				{this.buildDiagnosisPanel()}
				{this.buildContentPanel()}
			</Card>
		);
	}
}

class ContentPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			touchIndex: -1,
		};
	}

	onSelectPosFromTaggingView(idx) {
		this.setState({
			touchIndex: idx,
		});
	}

	onSelectVectorItem(entityOne) {
		const { tagId } = this.props;
		let tags = entityOne.misc.tags;
		let rangePos = [tags[0][0], tags[0][1]];
		for (let i=1; i<tags.length; i++) {
			let curT = tags[i];
			rangePos[0] = Math.min(curT[0], rangePos[0]);
			rangePos[1] = Math.max(curT[1], rangePos[1]);
		}
		this.refs['taggerBB' + tagId].drawEdgeHighlight(rangePos);
	}

	onShowAllEvents() {
		this.setState({
			touchIndex: -1,
		});
	}

	buildVectorTable() {
		const { tableContent } = this.props;
		const { touchIndex } = this.state;
		let extra = (
			<Button onClick={this.onShowAllEvents.bind(this)}
			        style={{marginLeft:6}} type="primary">展示所有事件</Button>
		);
		return (
			<Card title="事件区" size="small" extra={extra}>
				<LosslessVectorTableA tag="normalized"
				                       data={tableContent}
				                       touchIndex={touchIndex}
				                       onSelectRow={this.onSelectVectorItem.bind(this)}
				/>
			</Card>
		);
	}

	buildTagger() {
		const { tagId, taggerContent } = this.props;
		if (!taggerContent) {
			return null;
		}

		return (
			<Card title="内容区" size="small">
				<div className='bbTable bbTable_tab2' style={{marginTop: 10}}>
					<Tagger tag={"entity_" + tagId} ref={"taggerBB" + tagId}
					        data={taggerContent}
					        tools={[]}
					        defaultColor={'#ffcc00'}
					        onChange={null}
					        tagProps={TUtils.TagColorSetting}
					        op='view'
					        showColorSelector={true}
					        tagStyle={{tagPerLine:4}}
					        onSelectView={this.onSelectPosFromTaggingView.bind(this)}
					/>
				</div>
			</Card>
		)
	}

	render() {
		const { title } = this.props;
		return (
			<Card title={title} size="small">
				<Row>
					<Col span={12}>
						{this.buildTagger()}
					</Col>
					<Col span={12}>
						{this.buildVectorTable()}
					</Col>
				</Row>
			</Card>
		)
	}
}

class LosslessVectorTableA extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = this.initData(props);
	}

	initData(props) {
		let tableBody = props.data;     //props.data, mockInput()
		if (props.touchIndex != -1) {
			tableBody = this.filterDataByPosition(tableBody, props.touchIndex);
		}
		return {
			data: tableBody
		};
	}

	componentWillReceiveProps(nextProps) {
		// Immutable.IS 用来比较2个数据是否发生变化
		var sameProps = Immutable.is(this.props, nextProps);
		if (!sameProps) {
			var newState = this.initData(nextProps);
			this.setState(newState);
		}
	}

	filterDataByPosition(datum, touchIndex) {
		let rst = [];
		for (let i=0; i<datum.length; i++) {
			let curData = datum[i];
			if (!curData.misc) {
				// some deduced vectors ???
				continue;
			}
			let tags = curData.misc.tags;
			if (!tags) {
				// some deduced vectors ???
				continue;
			}
			let found = false;
			for (let i=0; i<tags.length; i++) {
				let curTag = tags[i];
				if (curTag[0] <= touchIndex && curTag[1] >= touchIndex) {
					found = true;
					break;
				}
			}
			if (found) {
				rst.push(curData);
			}
		}
		return rst;
	}

	typeRender(text, record, index) {
		let comp = null;
		if (text == 'disease') {
			comp = (<Icon type="monitor" style={{color:'blue'}} />);
		}
		return comp;
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
		return (
			<div onClick={this.onSelectRow.bind(this, index)}>
				{component}
			</div>
		);
	}

	additionRender(textObj, record, index) {
		if (!textObj) {
			return null;
		}
		let rows = [];
		for (let k in textObj) {
			let vs = textObj[k];
			if (!vs || vs.length == 0) {
				continue;
			}
			let lineOne = (
				<p>{k}:{vs.join(',')}</p>
			);
			rows.push(lineOne);
		}
		return (
			<div>{rows}</div>
		);
	}

	onSelectRow(index) {
		const { data } = this.props;
		if (this.props.onSelectRow) {
			let entityOne = data[index];
			this.props.onSelectRow(entityOne);
		}
	}

	render() {
		const { data } = this.state;
		let columns = [
			{title: '类型', dataIndex: 'type', render: this.typeRender.bind(this)},
			{title: '内容', dataIndex: 'text', render: this.textRender.bind(this, 24)},
			{title: '扩展属性', dataIndex: 'addition', render: this.additionRender.bind(this)},
		];
		return (
			<Table size='small'
			       columns={columns}
			       dataSource={data}
			       pagination={false}
			/>
		)
	}
}