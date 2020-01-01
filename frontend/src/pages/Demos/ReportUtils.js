import React, { Component, PropTypes } from 'react';
import { Card, Button, Row, Col, Tabs, Popover, Icon, Table, Input, Select, message } from 'antd';

var Immutable = require('immutable');
var _ = require('underscore');

export class ReportVectorTable extends Component {
	constructor(props, context) {
		super(props, context);
		this.state = this.initData(props);
	}

	onSelectRow(index) {
		const { tableBody } = this.state;
		if (this.props.onSelectRow) {
			let entityOne = tableBody[index];
			let x = {
				misc: {
					tags: entityOne.pos,
				}
			};
			this.props.onSelectRow(x);
		}
	}

	initData(props) {
		let that = this;

		let bodyRender = function (text, record, index) {
			return (
				<div onClick={that.onSelectRow.bind(that, index)}>
					{text}
				</div>
			);
		};

		let negRender = function (text, record) {
			let textA = '';
			if (text) {
				textA = '是';
			}
			return textA;
		};

		let valueRender = function (text, record) {
			if (record.value_ext) {
				return (
					<div>
						<Popover content={record.value_ext} title="附加信息">
							{text}
						</Popover>
					</div>
				);
			}
			return text;
		};

		let tableHead = [];
		let tableHead4 = [
			{title: '部位', dataIndex: 'body', render: bodyRender,
				sorter: (a, b) => (a.body).localeCompare(b.body)},
			{title: '属性', dataIndex: 'index',
				sorter: (a, b) => (a.index).localeCompare(b.index)},
			{title: '否定', dataIndex: 'neg', width:'15%', render: negRender,
				sorter: (a, b) => (''+a.neg).localeCompare(''+b.neg)},
			{title: '取值/描述', dataIndex: 'value', render: valueRender,
				sorter: (a, b) => (a.value).localeCompare(b.value)},
		];
		tableHead = tableHead.concat(tableHead4);
		let tableBody = props.data;     //props.data, mockInput()
		if (props.touchIndex != -1) {
			tableBody = this.filterDataByPosition(tableBody, props.touchIndex);
		}
		return {
			tableHead: tableHead,
			tableBody: tableBody
		};
	}

	filterDataByPosition(datum, touchIndex) {
		let rst = [];
		for (let i=0; i<datum.length; i++) {
			let curData = datum[i];
			let tags = curData.pos;
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

	componentWillReceiveProps(nextProps) {
		var sameProps = Immutable.is(this.props, nextProps);
		if (!sameProps) {
			var newState = this.initData(nextProps);
			this.setState(newState);
		}
	}

	render() {
		const { tableHead, tableBody } = this.state;
		return (
			<Table id={'vectorList'} size="small"
			       columns={tableHead}
			       dataSource={tableBody}
			       pagination={false}
			/>
		);
	}
}

export const ReportTagColorSetting = [
	{"name":"body","description":"解剖/生理","color":"#EFB041"},
	{"name":"value","description":"检查项","color":"#C2F2B1"},
	{"name":"index","description":"药物","color":"#FFA0CE"},
	{"name":"neg","description":"否定","color":"#80D9E7"},
	{"name":"and","description":"矢量段落","color":"#c4e1ff"},
];
