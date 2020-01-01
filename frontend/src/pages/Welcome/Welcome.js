import React from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Tabs, DatePicker, Divider } from 'antd';
import Bar from '../../components/Charts/Bar';

let underscore = require('underscore');
import numeral from 'numeral';
import { getTimeDistance } from '@/utils/utils';

import styles from "./Welcome.less";

@connect(({ userOperationStat }) => ({
	userOperationStat
}))
export default class Welcome extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			rangePickerValue: getTimeDistance('month'),
			tabKey: 'record_count',
			displayMode: 'day',
		};
	}

	componentDidMount() {
		const { dispatch } = this.props;
		dispatch({
			type: 'userOperationStat/init',
			payload: {
				opType: 'generate',
				params: this.buildQueryParams()
			}
		});
	}

	buildQueryParams() {
		const { rangePickerValue, tabKey, displayMode } = this.state;
		let x = {
			start: rangePickerValue[0].format('YYYY-MM-DD'),
			end: rangePickerValue[1].format('YYYY-MM-DD'),
			mode: tabKey,
			displayType: displayMode,
		};
		return x;
	}

	updateList() {
		const { dispatch } = this.props;
		dispatch({
			type: 'userOperationStat/fetchOperationData',
			payload: {
				opType: 'generate',
				params: this.buildQueryParams()
			}
		});
	}

	onChange(tag, val) {
		let callback = null;
		let curState = this.state;
		curState[tag] = val;
		if (tag == 'tabKey') {
			callback = this.updateList.bind(this);
		}
		this.setState(curState, callback);
	}

	handleRangePickerChange(rangePickerValue) {
		this.setState({
			rangePickerValue,
		}, this.updateList.bind(this));
	};

	selectDate(type) {
		this.setState({
			rangePickerValue: getTimeDistance(type),
		}, this.updateList.bind(this));
	};

	isActive(type) {
		const { rangePickerValue } = this.state;
		const value = getTimeDistance(type);
		if (!rangePickerValue[0] || !rangePickerValue[1]) {
			return '';
		}
		if (
			rangePickerValue[0].isSame(value[0], 'day') &&
			rangePickerValue[1].isSame(value[1], 'day')
		) {
			return styles.aActive;
		}
		return styles.aInactive;
	}

	selectDisplayMode(mode) {
		this.setState({
			displayMode: mode,
		}, this.updateList.bind(this));
	}

	isActiveDisplayMode(mode) {
		if (mode == this.state.displayMode)	{
			return styles.aActive;
		}
		return styles.aInactive;
	}

	buildTitle() {
		return (
			<Row style={{width:'100%', textAlign:'center', fontSize:32, fontWeight:'bold'}}>
				数据汇总
			</Row>
		);
	}

	buildNumbers() {
		const { numberOrganization, numberDepartment, numberOperator} = this.props.userOperationStat;
		return (
			<Card bordered={false} style={{marginTop:10, marginBottom:10}}>
				<Row gutter={24} style={{width:'100%', margin:0, padding:0}}>
					<Col span={8}>
						<Card className={styles.numberCard}>
							<Row className={styles.numberCardTitle}>医疗机构</Row>
							<Row className={styles.numberCardNumber}>{numberOrganization}</Row>
						</Card>
					</Col>
					<Col span={8}>
						<Card className={styles.numberCard}>
							<Row className={styles.numberCardTitle}>科室</Row>
							<Row className={styles.numberCardNumber}>{numberDepartment}</Row>
						</Card>
					</Col>
					<Col span={8}>
						<Card className={styles.numberCard}>
							<Row className={styles.numberCardTitle}>医生</Row>
							<Row className={styles.numberCardNumber}>{numberOperator}</Row>
						</Card>
					</Col>
				</Row>
			</Card>
		)
	}

	listRender(item, i) {
		let y = i < 3 ? styles.active : '';
		let className = `${styles.rankingItemNumber} ${y}`;
		return (
			<li key={item.title}>
	           <span className={className}>
	             {i + 1}
	           </span>
	           <span className={styles.rankingItemTitle} title={item.title}>
	             {item.title}
	           </span>
	           <span className={styles.rankingItemValue}>
	             {numeral(item.total).format('0,0')}
	           </span>
			</li>
		);
	}

	buildRecordCount() {
		const { recordCount } = this.props.userOperationStat;
		return (
			<Row>
				<Col xl={16} lg={12} md={12} sm={24} xs={24}>
					<div className={styles.salesBar}>
						<Bar
							height={295}
							title="病历生成量趋势"
							data={recordCount.dataList}
						/>
					</div>
				</Col>
				<Col xl={8} lg={12} md={12} sm={24} xs={24}>
					<div className={styles.salesRank}>
						<h4 className={styles.rankingTitle}>
							诊断排名
						</h4>
						<ul className={styles.rankingList}>
							{recordCount.dataRank.map(this.listRender.bind(this))}
						</ul>
					</div>
				</Col>
			</Row>
		);
	}

	buildOperationTime() {
		const { operationTime } = this.props.userOperationStat;
		return (
			<Row>
				<Col xl={16} lg={12} md={12} sm={24} xs={24}>
					<div className={styles.salesBar}>
						<Bar
							height={295}
							title="停留时间趋势"
							data={operationTime.dataList}
						/>
					</div>
				</Col>
				<Col xl={8} lg={12} md={12} sm={24} xs={24}>
					<div className={styles.salesRank}>
						<h4 className={styles.rankingTitle}>
							诊断排名
						</h4>
						<ul className={styles.rankingList}>
							{operationTime.dataRank.map(this.listRender.bind(this))}
						</ul>
					</div>
				</Col>
			</Row>
		);
	}

	buildOperationClick() {
		const { operationClick } = this.props.userOperationStat;
		return (
			<Row>
				<Col xl={16} lg={12} md={12} sm={24} xs={24}>
					<div className={styles.salesBar}>
						<Bar
							height={295}
							title="操作次数趋势"
							data={operationClick.dataList}
						/>
					</div>
				</Col>
				<Col xl={8} lg={12} md={12} sm={24} xs={24}>
					<div className={styles.salesRank}>
						<h4 className={styles.rankingTitle}>
							诊断排名
						</h4>
						<ul className={styles.rankingList}>
							{operationClick.dataRank.map(this.listRender.bind(this))}
						</ul>
					</div>
				</Col>
			</Row>
		);
	}

	buildOperationStatistics() {
		const { rangePickerValue, tabKey } = this.state;

		const dateExtra = (
			<Row style={{marginBottom: 6}}>
				<Col span={5}>
					<a className={this.isActive('week')} onClick={() => this.selectDate('week')}>
						最近一周&nbsp;&nbsp;
					</a>
					<a className={this.isActive('month')} onClick={() => this.selectDate('month')}>
						最近一月&nbsp;&nbsp;
					</a>
					<a className={this.isActive('year')} onClick={() => this.selectDate('year')}>
						最近一年
					</a>
				</Col>
				<Col span={1}><Divider type="vertical" /></Col>
				<Col span={5}>
					<a className={this.isActiveDisplayMode('day')} onClick={() => this.selectDisplayMode('day')}>
						按天显示&nbsp;&nbsp;
					</a>
					<a className={this.isActiveDisplayMode('month')} onClick={() => this.selectDisplayMode('month')}>
						按月显示
					</a>
				</Col>
				<Col span={1}><Divider type="vertical" /></Col>
				<Col span={6}>
					<DatePicker.RangePicker
						value={rangePickerValue}
						onChange={this.handleRangePickerChange.bind(this)}
						style={{ width: 256 }}
					/>
				</Col>
			</Row>
		);

		return (
			<Card >
				{dateExtra}
				<Row className={styles.salesCard}>
					<Tabs size="large" tabPosition="left"
					      tabBarStyle={{ marginBottom: 24 }}
					      activeKey={tabKey} onChange={this.onChange.bind(this, 'tabKey')}
					>
						<Tabs.TabPane tab="生成病历量" key="record_count">
							{this.buildRecordCount()}
						</Tabs.TabPane>
						<Tabs.TabPane tab="病历助手停留时间" key="time_avg">
							{this.buildOperationTime()}
						</Tabs.TabPane>
						<Tabs.TabPane tab="病历助手操作数" key="click_avg">
							{this.buildOperationClick()}
						</Tabs.TabPane>
					</Tabs>
				</Row>
			</Card>
		);
	}

	render() {
		return (
			<div style={{width:1200, margin:'auto', backgroundColor:'transparent', padding:20}}>
				{this.buildTitle()}
				{this.buildNumbers()}
				{this.buildOperationStatistics()}
			</div>
		);
	}
}
