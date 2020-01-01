import React from "react";
import { connect } from "dva";
import { Row, Col, Card, Tabs, DatePicker, Divider, Radio } from "antd";

import Bar from "../../components/Charts/Bar";
import { G2, Chart, Geom, Axis, Tooltip, Coord, Label, Legend, View, Guide, Shape, Facet, Util } from "bizcharts";

const { TabPane } = Tabs;
const { MonthPicker } = DatePicker;
let moment = require("moment");
G2.track(false);

@connect(({ primaryHealthOverview }) => ({
    primaryHealthOverview
}))
export default class DistrictOrgStats extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            subject: "pediatrics",
            selectedMonth: moment(moment().format("YYYY-MM")),
            city: "350200",
            subjectName: "儿科",

            plotData: [],
        };
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
            type: "primaryHealthOverview/fetch",
            payload: {
                params: this.buildQueryParams()
            }
        });
    }

    buildQueryParams() {
        const { selectedMonth, subject, city } = this.state;
        let x = {
            month: selectedMonth.format("YYYY-MM"),
            subject: subject,
            city: city
        };
        return x;
    }

    handlePickerChange(selectedMonth, dateString) {
        this.setState(
            { selectedMonth }, this.buildQueryResult.bind(this)
        );
    }

    // buildDistrictOrgStatsBar() {
    //     const { district_stats } = this.props.primaryHealthOverview;
    //     let UIdata = [];
    //     const scale = {
    //         "total_visit": {
    //             type: "linear",
    //             range: [0, 1],
    //             tickCount: 5
    //         }
    //     };
    //     let keys = Object.keys(district_stats);
    //     for (var i in keys) {
    //         var districtName = keys[i];
    //         var datas = district_stats[districtName];
    //         var totalEmr = 0;
    //         var totalScore = 0;
    //         var referralCount = 0;
    //         var totalVisit = 0;
    //         for (var i in datas) {
    //             let emrVisitRatio = datas[i].emr_visit_ratio;
    //             let score = datas[i].emr_avg_score;
    //             let validReferral = datas[i].referral_count_valid;
    //             datas[i].title = emrVisitRatio + "|" + score + "|" + validReferral;
    //             totalEmr = totalEmr + datas[i].emr_count;
    //             totalScore = totalScore + datas[i].score;
    //             referralCount = referralCount + datas[i].valid_referral;
    //             totalVisit = totalVisit + datas[i].total_visit;
    //
    //         }
    //         let referral = referralCount.toString() + "/" + totalVisit.toString();
    //         let avgScore = totalScore / totalVisit;
    //         UIdata.push(
    //             (
    //                 <div>
    //                     <Row gutter={16}>
    //                         <Col span={12}>
    //                             <Card bordered={false} title={districtName}>
    //                                 <Chart height={400} padding="auto" data={datas} scale={scale} forceFit>
    //                                     <Coord transpose/>
    //                                     <Axis
    //                                         name="org_name"
    //                                         label={{ offset: 12 }}
    //                                     />
    //                                     <Axis name="total_visit"/>
    //                                     <Tooltip/>
    //                                     <Geom type="interval" position="org_name*total_visit">
    //                                         <Label content="title" offset={20}/>
    //                                     </Geom>
    //                                 </Chart>
    //
    //                             </Card>
    //                         </Col>
    //                     </Row>
    //                     <Row>
    //                         <Col span={12}>
    //                             <Card title={this.state.subjectName} >
    //
    //                                 <Row>
    //                                     <Col span={4} offset={2}>书写:{totalEmr}</Col>
    //                                 </Row>
    //                                 <Row>
    //                                     <Col span={4} offset={2}>评分:{avgScore}</Col>
    //                                 </Row>
    //                                 <Row>
    //                                     <Col span={4} offset={2}>转诊:{referral}</Col>
    //                                 </Row>
    //                             </Card>
    //
    //                         </Col>
    //                     </Row>
    //                 </div>
    //             )
    //         );
    //
    //     }
    //
    //
    //     return UIdata;
    // }

    buildBlockOne(item, index, arrayX) {
        const scale = {
            "total_visit": {
                type: "linear",
                range: [0, 1],
                tickCount: 5
            }
        };
        return (
            <Col span={8}>
                <Row>
                    <Card bordered={false} size="small" title={item.districtName}>
                        <Chart height={400} padding="auto" data={item.datas} scale={scale} forceFit>
                            <Coord transpose/>
                            <Axis
                                name="org_name"
                                label={{ offset: 12 }}
                            />
                            <Axis name="total_visit"/>
                            <Tooltip/>
                            <Geom type="interval" position="org_name*total_visit">
                                <Label content="title" offset={20}/>
                            </Geom>
                        </Chart>
                    </Card>
                </Row>
                <Row>
                    <Card title={this.state.subjectName} size="small">
                        <span>书写:{item.totalEmr}</span>
                        <span style={{marginLeft:6}}>评分:{item.avgScore}</span>
                        <span style={{marginLeft:6}}>转诊:{item.referral}</span>
                    </Card>
                </Row>
            </Col>
        );
    }

    updateSubplotData() {
        const { district_stats } = this.props.primaryHealthOverview;
        let plotData = [];
        let keys = Object.keys(district_stats);
        for (let i in keys) {
            let districtName = keys[i];
            let datas = district_stats[districtName];
            let totalEmr = 0;
            let totalScore = 0;
            let referralCount = 0;
            let totalVisit = 0;
            for (let m in datas) {
                let emrVisitRatio = datas[m].emr_visit_ratio;
                let score = datas[m].emr_avg_score;
                let validReferral = datas[m].referral_count_valid;
                datas[m].title = emrVisitRatio + "|" + score + "|" + validReferral;
                totalEmr = totalEmr + datas[m].emr_count;
                totalScore = totalScore + datas[m].score;
                referralCount = referralCount + datas[m].valid_referral;
                totalVisit = totalVisit + datas[m].total_visit;
            }
            let referral = referralCount.toString() + "/" + totalVisit.toString();
            let avgScore = totalScore / totalVisit;

            let x = {
                districtName: districtName,
                datas: datas,
                totalEmr: totalEmr,
                avgScore: avgScore,
                referral: referral,
            };
            plotData.push(x);
        }
        this.setState({
            plotData: plotData,
        });
    }

    onRadioChange = e => {
        let subjectName = "";
        if (e.target.value == "pediatrics") {
            subjectName = "儿科";
        } else {
            subjectName = "全科";
        }
        this.setState({
            subject: e.target.value,
            subjectName: subjectName
        }, this.buildQueryResult.bind(this));
    };

    buildQueryResult() {
        const { dispatch } = this.props;
        dispatch({
            type: "primaryHealthOverview/fetch",
            payload: {
                params: this.buildQueryParams()
            },
            callback: this.updateSubplotData.bind(this)
        });
    }

    render() {
        const { subject, plotData } = this.state;
        return (
            <div style={{minWidth:1400}}>
                <Tabs type="line" tabBarGutter={0}>
                    <TabPane tab="概览" key="1">
                        <Row>
                        <MonthPicker
                            defaultValue={this.state.selectedMonth} onChange={this.handlePickerChange.bind(this)}
                        />
                        <Radio.Group style={{marginLeft: 10}}
                            onChange={this.onRadioChange} value={subject}
                        >
                            <Radio value={"pediatrics"}>儿科</Radio>
                            <Radio value={"general"}>全科</Radio>
                        </Radio.Group>
                        </Row>
                        <Row style={{marginTop:10}}>
                            {plotData.map(this.buildBlockOne.bind(this))}
                        </Row>
                    </TabPane>
                </Tabs>
            </div>
        );


    }
}
