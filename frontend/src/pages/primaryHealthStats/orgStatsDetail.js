import React from "react";
import { connect } from "dva";
import { Row, Col, Card, Tabs, DatePicker, Divider, Tree, Menu, Dropdown, Button, Icon, message, Table , Select } from "antd";
const { TreeNode, DirectoryTree } = Tree;

import Bar from "../../components/Charts/Bar";
import { G2, Chart, Geom, Axis, Tooltip, Coord, Label, Legend, View, Guide, Shape, Facet, Util } from "bizcharts";

let underscore = require("underscore");
import numeral from "numeral";
import { getTimeDistance } from "@/utils/utils";

// import styles from "./Welcome.less";
G2.track(false);

@connect(({ primaryHealthOrgDetail }) => ({
    primaryHealthOrgDetail
}))
export default class orgStatsDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rangePickerValue: getTimeDistance("month"),
            district: "",
            org: "",
            orgName: "",
            subject: "",
            subjectName: "",
            selectedKeys: [],
            page: 0,
            pageSize: 10

        };
    }

    componentDidMount() {
        const { dispatch } = this.props;
        // this.buildEmrVistStats();
        dispatch({
            type: "primaryHealthOrgDetail/init",
            payload: {
                params: this.buildQueryParams()
            },
            callback: this.buildEmrVisitStats1.bind(this)
        });
    }

    buildQueryParams() {
        const { rangePickerValue, org, subject } = this.state;
        let x = {};
        if (org) {
            x.org = org;
        }
        if (subject) {
            x.subject = subject;
        }
        if (rangePickerValue.length > 0) {
            x.startDate = rangePickerValue[0].format("YYYY-MM-DD");
        }
        if (rangePickerValue.length > 1) {
            x.endDate = rangePickerValue[1].format("YYYY-MM-DD");
        }
        return x;
    }

    renderTreeNodes = data => data.map((item) => {
        if (item.orgs) {
            return (
                <TreeNode title={item.title} key={item.key} dataRef={item}>
                    {this.renderTreeNodes(item.orgs)}
                </TreeNode>
            );
        }
        return <TreeNode {...item} dataRef={item}/>;
    });

    buildDistrictOrgTree() {
        const { districtOrgs } = this.props.primaryHealthOrgDetail;
        return (
            <div style={{ width: '100%' }}>
                <DirectoryTree defaultExpandAll onSelect={this.onTreeSelect} onExpand={this.onExpand}>
                    {this.renderTreeNodes(districtOrgs)}
                </DirectoryTree>
            </div>
        );
    }

    buildEmrVisitStats1(orgEmrVisitStats) {
        if (!orgEmrVisitStats) {
            return;
        }
        orgEmrVisitStats = orgEmrVisitStats.orgEmrVisitStats;
        var chartData = [];
        for (var i in orgEmrVisitStats) {
            let temp = {};
            temp.title = "病历数";
            temp.month = orgEmrVisitStats[i].date_month;
            temp.value = orgEmrVisitStats[i].emr_count;
            chartData.push(temp);
            temp = {};
            temp.title = "就诊量";
            temp.month = orgEmrVisitStats[i].date_month;
            temp.value = orgEmrVisitStats[i].total_visit;
            chartData.push(temp);
        }
        return chartData;
    }

    onTreeSelect = (selectedKeys, info) => {
        let org = info.node.props.dataRef.key;
        let orgName = info.node.props.dataRef.title;
        let district = info.node.props.dataRef.district;
        this.setState({ org, orgName, district });
    };

    onExpand = () => {
    };

    handleRangePickerChange(rangePickerValue) {
        this.setState({
            rangePickerValue
        }, this.updateList.bind(this));
    }

    updateList() {
        const { dispatch } = this.props;
        let params = this.buildQueryParams();
        if (!params.org) {
            return;
        }
        dispatch({
            type: "primaryHealthOrgDetail/fetchPrimaryHealthOrgData",
            payload: {
                params: params
            },
            callback: this.buildEmrVisitStats1.bind(this)
        });
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
        this.setState(curState);
    }

    buildQueryResult(e) {
        const { dispatch } = this.props;
        dispatch({
            type: "primaryHealthOrgDetail/fetchPrimaryHealthOrgData",
            payload: {
                params: this.buildQueryParams()
            },
            callback: this.buildEmrVisitStats1.bind(this)
        });
    }

    onListPageChange(page, pageSize) {
        this.setState({
            page: page,
            pageSize: pageSize
        }, this.fetchListData.bind(this));
    }

    buildSearchBar() {
        const { rangePickerValue, subjectName } = this.state;
        return (
            <Row gutter={8}>
                <Col span={12}>
                    <DatePicker.RangePicker
                        value={rangePickerValue}
                        onChange={this.handleRangePickerChange.bind(this)}
                        style={{ width: '90%' }}
                    />
                </Col>
                <Col span={6}>
                    学科:<Select style={{width:'70%'}} allowClear={true}
                               value={subjectName}
                               defaultActiveFirstOption={false}
                               showArrow={true}
                               filterOption={false}
                               onChange={this.onChangeElement.bind(this, 'select', 'subjectName')}
                >
                    <Select.Option key={'pediatrics'}>儿科</Select.Option>
                    <Select.Option key={'general'}>全科</Select.Option>
                </Select>
                </Col>
            </Row>
        )
    }
    buildMidPart() {
        const { page, pageSize } = this.state;
        const { doctorEventsStats } = this.props.primaryHealthOrgDetail;
        const columns = [
            { dataIndex: "doctor_code", title: "账号" },
            { dataIndex: "total_visit", title: "接诊总数" },
            { dataIndex: "first_referral_count", title: "初复诊比" },
            { dataIndex: "emr_visit_ratio", title: "完整病历%" },
            { dataIndex: "emr_avg_score", title: "病历平均分" },
            { dataIndex: "referral_count", title: "转诊数" },
            { dataIndex: "valid_referral_count", title: "有效转诊" },
            { dataIndex: "succeed_rec_exam_ratio", title: "推荐检查" },
            { dataIndex: "succeed_rec_medicine_ratio", title: "推荐药品" },
            { dataIndex: "medicine_fit_ratio", title: "用药符合率" }
        ];
        let pageOpts = {
            current: page,
            pageSize: pageSize,
            size: "small",
            total: doctorEventsStats.total,
            onChange: this.onListPageChange.bind(this),
            onShowSizeChange: this.onListPageChange.bind(this)
        };
        return (
            <Row>
                <div style={{ width: '100%' }}>
                    <Table columns={columns}
                           dataSource={doctorEventsStats.doctorEvents}
                           pagination={pageOpts}
                           scroll={{ x: 1500, y: 300 }}
                    />
                </div>
            </Row>
        );
    }

    buildFigure1st() {
        const { orgEmrVisitStats } = this.props.primaryHealthOrgDetail;
        return (
            <Row>
                <Chart height={400} data={orgEmrVisitStats} forceFit>
                    <Axis name="month"/>
                    <Axis name="value"/>
                    <Legend/>
                    <Tooltip crosshairs={{type: "y"}} />
                    <Geom
                        type="interval"
                        position="month*value"
                        color={"title"}
                        adjust={[{type: "dodge", marginRatio: 1/32}]}
                    />
                </Chart>
            </Row>
        );
    }

    buildFigure2nd() {
        const { orgEmrQualityStats } = this.props.primaryHealthOrgDetail;
        // 定义度量
        const cols = {
            x: {
                range: [0, 1]
            }
        };
        return (
            <Row>
                <Chart height={400}
                    data={orgEmrQualityStats}
                    scale={cols}
                    // padding={[80, 100, 80, 80]}
                    forceFit
                >
                    <Coord type="theta" radius={1}/>
                    <Axis name="percent"/>
                    <Legend
                        position="right"
                        offsetY={-window.innerHeight / 2 + 120}
                        offsetX={-500}
                    />
                    <Tooltip
                        showTitle={false}
                        itemTpl="<li><span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>{name}: {value}</li>"
                    />
                    <Geom
                        type="intervalStack"
                        position="percent"
                        color="item"
                        tooltip={["item*percent",
                            (item, percent) => {
                                percent = percent + "%";
                                return {
                                    name: item,
                                    value: percent
                                };
                            }
                        ]}
                        style={{ lineWidth: 1, stroke: "#fff" }}
                    >
                        <Label
                            content="percent"
                            offset={-40}
                            textStyle={{
                                rotate: 0,
                                textAlign: "center",
                                shadowBlur: 2,
                                shadowColor: "rgba(0, 0, 0, .45)"
                            }}
                        />
                    </Geom>
                </Chart>
            </Row>
        );
    }

    buildFigure3rd() {
        const { orgMedicineExamReferralStats } = this.props.primaryHealthOrgDetail;
        // 定义度量
        const cols = {
            x: {
                range: [0, 1]
            }
        };
        return (
            <Row>
                <Chart height={400} data={orgMedicineExamReferralStats} scale={cols} forceFit>
                    <Legend />
                    <Axis name="x" />
                    <Axis
                        name="v"
                        label={{formatter: val => `${val}`,}}
                    />
                    <Tooltip
                        crosshairs={{type: 'y',}}
                    />
                    <Geom type="line" position="x*v" size={2} color={'y'} />
                    <Geom
                        type="point"
                        position="x*v"
                        size={4}
                        shape={'circle'}
                        color={'y'}
                        style={{stroke: '#fff',lineWidth: 1,}}
                    />
                </Chart>
            </Row>
        );
    }

    render() {
        let districtOrg = '';
        if (this.state.district && this.state.orgName){
            districtOrg = this.state.district + "\\" + this.state.orgName;
        }
        let extra = (
            <Button onClick={this.buildQueryResult.bind(this)}>查询</Button>
        );
        return (
            <div style={{ minWidth: 1400, overflowX:'auto' }}>
                <Row gutter={8} style={{marginTop:10, marginBottom:10}}>
                    <Col span={6}>
                        <Card bordered={false}>
                            {this.buildDistrictOrgTree()}
                        </Card>
                    </Col>
                    <Col span={18}>
                        <Card bordered={false} title={districtOrg} extra={extra}>
                            {this.buildSearchBar()}
                            <Row>
                                <Col span={8}>
                                    {this.buildFigure1st()}
                                </Col>
                                <Col span={8}>
                                    {this.buildFigure2nd()}
                                </Col>
                                <Col span={8}>
                                    {this.buildFigure3rd()}
                                </Col>
                            </Row>
                            {this.buildMidPart()}
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }
}

