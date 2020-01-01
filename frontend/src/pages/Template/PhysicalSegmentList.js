import React, { PureComponent } from "react";
import { connect } from "dva";
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button } from "antd";
import PhysicalSegmentEditor from "./PhysicalSegmentEditor";

import styles from "./Template.less";
import ImpPhysicalSegments from "./ImpPhysicalSegments";
let underscore = require("underscore");

@connect(({ physicalSegment }) => ({
	physicalSegment
}))
export default class PhysicalSegmentList extends React.Component {
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
			type: "physicalSegment/init",
			payload: this.buildListQueryParams(),
		});
	}

	fetchListData() {
		const { dispatch } = this.props;
		dispatch({
			type: "physicalSegment/fetch",
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
			type: "physicalSegment/delete",
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
			<span className={styles.ListOpDisable} onClick={this.deleteTag.bind(this, record)}>
				<Icon type="close-circle" theme="outlined" />删除
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
         <ImpPhysicalSegments/>
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
			label: record.label,
			sub_sequence: record.sub_sequence,
			description: record.description,
			content: record.content,
			body_part_id: record.body_part_id
		};

		dispatch({
			type: "physicalSegment/edit",
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
		const { data, total, bodyPartOptions } = this.props.physicalSegment;
		const { page, pageSize, showEditTag, hotTag } = this.state;
		const columns = [
			{ dataIndex: "label", title: "标识" },
			{ dataIndex: "body_part_name", title: "所属部位"},
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
		let title = hotTag && hotTag.id ? "编辑片段" : "新建片段";
		return (
			<div style={{ width: 1000, margin: "auto", backgroundColor:'white', padding:20 }}>
				{this.buildOpBar()}
				<Table columns={columns} dataSource={data} pagination={pageOpts} />
				<Drawer
					visible={showEditTag}
					title={title}
					width={920}
					closable={false}
					maskClosable={false}
					placement="right"
					onClose={this.onCloseEditTag.bind(this, false)}
					style={{
			            height: "calc(100% - 55px)",
			            overflow: "auto",
			            paddingBottom: 53
			          }}
				>
					<PhysicalSegmentEditor
						segment={hotTag}
						bodyPartOptions={ bodyPartOptions }
						onCancel={this.onCloseEditTag.bind(this, false)}
						onSubmit={this.onCloseEditTag.bind(this, true)}
					/>
				</Drawer>
			</div>
		);
	}
}
