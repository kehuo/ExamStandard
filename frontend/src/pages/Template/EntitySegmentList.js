import React, { PureComponent } from "react";
import { connect } from "dva";
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Tooltip, Popconfirm } from "antd";
import EntitySegmentPopup from "./EntitySegmentPopup";

import styles from "./Template.less";
import ImpEntitySegments from "./ImpEntitySegments";
let underscore = require("underscore");

@connect(({ entitySegment }) => ({
	entitySegment
}))
export default class EntitySegmentList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			page: 1,
			pageSize: 10,
			keyword: "",

			showEditTag: false,
			hotTag: {}
		};
	}

	buildListQueryParams() {
		const { page, pageSize, keyword } = this.state;
		let params = {
			page: page,
			pageSize: pageSize,
			keyword: keyword,
		};
		if (!keyword) {
			delete params.keyword;
		}
		return params;
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: "entitySegment/init",
			payload: this.buildListQueryParams(),
		});
	}

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: "entitySegment/fetch",
			payload: this.buildListQueryParams(),
		});
	}

	onChange(tag, val) {
		let curState = this.state;
		curState[tag] = val;
		this.setState(curState);
	}

	onListPageChange(page, pageSize) {
		this.setState(
			{
				page: page,
				pageSize: pageSize
			},
			this.fetchListData.bind(this)
		);
	}

	deleteTag(record) {
		const { dispatch } = this.props;
		dispatch({
			type: "entitySegment/delete",
			payload: {
				queryParams: this.buildListQueryParams(),
				updateParams: {
					id: record.id
				}
			},
		});
	}

	editTag(record) {
		let x = null;
		if (!record) {
			let content = JSON.stringify({
				label: "",
				type: "CHECKBOX",
				description: "",
				options: []
			});
			x = {
				id: 0,
				sub_sequence: 1,
				body_part_id: 1,
				content: content
			};
		} else {
			x = underscore.clone(record);
		}
		this.setState({
			showEditTag: true,
			hotTag: x
		});
	}

	buildTagOneOp(text, record, index) {
		let deleteOp = (
			<span className={styles.ListOpDisable}>
				<Popconfirm title="确定删除"
				            onConfirm={this.deleteTag.bind(this, record)}
				            onCancel={null}
				>
					<Icon type="close-circle" theme="outlined" />删除
				</Popconfirm>
			</span>
		);
		let editOp = (
			<span
				className={styles.ListOpEdit}
				onClick={this.editTag.bind(this, record)}
				style={{ marginLeft: 16 }}
			>
	            <Icon type="edit" theme="outlined"/>编辑
	        </span>
		);
		return (
			<div>
				{deleteOp}
				{editOp}
			</div>
		);
	}


	textRender(tag, text, record, index) {
		let rawText = text;
		if (tag == 'vector') {
			rawText = buildVectorText(rawText);
		}
		let component = rawText;
		if (rawText.length > 10) {
			let showText = rawText.substring(0, 8) + '...';
			component = (
				<Tooltip title={rawText}>
					{showText}
				</Tooltip>
			);
		}
		return component;
	}

	onKeywordChange(e) {
		this.setState({
			keyword: e.target.value
		});
	}

	onKeywordSearch(value) {
		this.setState(
			{
				keyword: value,
				page: 1,
			},
			this.fetchListData.bind(this)
		);
	}

	buildOpBar() {
		const {keyword} = this.state;
		return (
			<Row style={{ marginTop: 10, marginBottom: 10 }}>
				<Col span={8}>
					关键词:{" "}
					<Input.Search
						style={{ width: "70%" }}
						placeholder="input search text"
						onSearch={this.onKeywordSearch.bind(this)}
						onChange={this.onKeywordChange.bind(this)}
					    value={keyword}
					/>
				</Col>
				<Col span={6} offset={1}>
					<Button type="primary" onClick={this.editTag.bind(this, null)}>
						新建句段
					</Button>
				</Col>
        <Col span={6} offset={1}>
          <ImpEntitySegments/>
        </Col>
			</Row>
		);
	}

	updateOrCreateRecord(record) {
		const { dispatch } = this.props;
		const { hotTag } = this.state;
		console.log("record", record);
		let recordA = {
			id: hotTag.id,
			pos_display: record.pos_display,
			neg_display: record.neg_display,
			freeze: record.freeze,
			system_id: record.system_id,
		};

		dispatch({
			type: "entitySegment/edit",
			payload: {
				queryParams: this.buildListQueryParams(),
				updateParams: recordA
			}
		});
	}

	onCloseEditTag(isUpdate, record) {
		let callback = null;
		if (isUpdate) {
			callback = this.updateOrCreateRecord.bind(this, record);
		}
		this.setState(
			{
				showEditTag: false
			},
			callback
		);
	}

	render() {
		const { data, total, systemOptions } = this.props.entitySegment;
		const { page, pageSize, showEditTag, hotTag } = this.state;
		const columns = [
			{ dataIndex: "vector", title: "标识", render: this.textRender.bind(this, 'vector') },
			{ dataIndex: "disease_system_name", title: "所属疾病系统"},
			{ dataIndex: "pos_display", title: "正常描述", render: this.textRender.bind(this, 'pos_display') },
			{ dataIndex: "neg_display", title: "异常常描述", render: this.textRender.bind(this, 'neg_display') },
			{ dataIndex: "id", title: "操作", render: this.buildTagOneOp.bind(this) }
		];
		let pageOpts = {
			current: page,
			pageSize: pageSize,
			size: "small",
			total: total,
			onChange: this.onListPageChange.bind(this),
			onShowSizeChange: this.onListPageChange.bind(this)
		};
		let title = hotTag && hotTag.id ? "编辑句段" : "新建句段";
		return (
			<div style={{ width: 1000, margin: "auto", backgroundColor:'white', padding:20 }}>
				{this.buildOpBar()}
				<Table columns={columns} dataSource={data} pagination={pageOpts} />
				<EntitySegmentPopup
					title={title} visible={showEditTag} item={hotTag}
					systemOptions={systemOptions}
				    onSubmit={this.onCloseEditTag.bind(this)}
				/>
			</div>
		);
	}
}

function buildVectorText(rawText) {
	// 疼痛$symptom_外耳@type52900$牵拉痛
	let idxName = rawText.indexOf('$');
	let idxBody = rawText.indexOf('_');
	let idxExt = rawText.indexOf('@');
	let mainName = rawText.substring(0, idxName);
	if (idxBody>-1 && idxBody>idxName) {
		let last = rawText.length + 1;
		if (idxExt >-1) {
			last = idxExt;
		}
		mainName += ':' + rawText.substring(idxBody+1, last);
	}
	if (idxExt >-1) {
		mainName += '[';
		let fullExt = rawText.substring(idxExt+1);
		let fields = fullExt.split('@');
		for (let i=0; i<fields.length; i++) {
			let thisText = fields[i];
			let textIdx = thisText.indexOf('$');
			mainName += thisText.substring(textIdx+1) + ',';
		}
		mainName = mainName.substring(0, mainName.length-1);
		mainName += ']';
	}
	rawText = mainName;
	return rawText;
}
