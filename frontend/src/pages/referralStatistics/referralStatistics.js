import React, { PureComponent } from "react";
import { connect } from "dva";
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Popconfirm, Form, Card } from "antd";
import ReactDOM from "react-dom";
import { G2, Chart, Geom, Axis, Tooltip, Coord, Label, Legend, View, Guide, Shape, Facet, Util } from "bizcharts";

let moment = require("moment");
let qs = require("qs");
G2.track(false);

@connect(({ referralStatistics }) => ({
    referralStatistics
}))
export default class referralStatistics extends React.Component {
    constructor(props) {
        super(props);
        let month = this.getMonth(props.location.search);
        let now = moment();
        let options = [];
        for (let i = 0; i < 12; i++) {
            let x = now.format("YYYY-MM");
            options.push(x);
            now.subtract(1, "months");
        }
        this.state = {
            monthSelected: month,
            monthOptions: options
        };
    }

    getMonth(search) {
        let rst = null;
        let prefixed = qs.parse(search, { ignoreQueryPrefix: true });
        if (prefixed.month) {
            rst = prefixed.month;
        } else {
            rst = moment().format("YYYY-MM");
        }
        return rst;
    }

    buildListQueryParams(monthX) {
        const { page, pageSize, keyword } = this.state;
        let params = {
            page: page,
            pageSize: pageSize,
            keyword: keyword,
            startDate: monthX.startDate,
            endDate: monthX.endDate
        };
        if (!keyword) {
            delete params.keyword;
        }
        return params;
    }

    getDayPairOfMonth(monthX) {
        let x = moment(monthX, "YYYY-MM");
        let first = x.startOf("month").format("YYYY-MM-DD");
        let last = x.endOf("month").format("YYYY-MM-DD");
        let rst = {
            startDate: first,
            endDate: last
        };
        return rst;
    }

    onChangeMonth(val) {
        this.setState({
            monthSelected: val
        }, this.updateAllView.bind(this));
    }

    updateAllView() {
        let payload = this.getDayPairOfMonth(this.state.monthSelected);
        this.props.dispatch({
            type: "referralStatistics/fetch",
            payload: payload,
            callback: this.buildTotalReferralStatsData.bind(this)
        });
    }

    buildSelectors() {
        let curState = this.state;
        return (
            <Card bodyStyle={{ padding: 8 }}>
                <Form layout="inline" style={{ backgroundColor: "white" }}>
                    <Form.Item label="分析月份" style={{ marginLeft: 16 }}>
                        <Select value={curState.monthSelected} style={{ width: 200 }}
                                onChange={this.onChangeMonth.bind(this)}
                        >
                            {(curState.monthOptions).map(o =>
                                <Select.Option key={o}>{o}</Select.Option>
                            )}
                        </Select>
                    </Form.Item>
                </Form>
            </Card>
        );
    }

    onListPageChange() {
        this.setState({
                page: page,
                pageSize: pageSize
            },
            this.fetchListData.bind(this)
        );
    }

    fetchListData() {
        const { dispatch } = this.props;
        let month = this.getDayPairOfMonth(this.state.monthSelected);
        dispatch({
            type: "referralStatistics/fetch",
            payload: this.buildListQueryParams(month),
            callback: this.buildTotalReferralStatsData.bind(this)
        });
    }

    buildTimelineChartDataY(first, last, data) {
        let chartsData = [];
        let firstDay = moment(first, "YYYY-MM-DD");
        while (!firstDay.isAfter(last)) {
            // x = x + 1;
            let day = firstDay.format("YYYY-MM-DD");
            let y1 = "";
            let y2 = "";
            let y3 = "";
            let y4 = '';
            let y1_flag = false;
            let y2_flag = false;
            let y3_flag = false;
            let y4_flag = false;
            let match_perday = data.match_perday;
            let apply_perday = data.apply_perday;
            let visit_perday = data.visit_perday;
            let match_apply_perday = data.match_apply_perday;

            for (let i = 0; i < match_perday.length; i++) {
                // console.log(data[i]);
                if (day == match_perday[i]["match_date"]) {
                    y1 = match_perday[i]["match_cnt"];
                    y1_flag = true;
                    break;
                }
            }
            for (let i = 0; i < apply_perday.length; i++) {
                // console.log(data[i]);
                if (day == apply_perday[i]["apply_date"]) {
                    y2 = apply_perday[i]["apply_cnt"];
                    y2_flag = true;
                    break;
                }
            }
            for (let i = 0; i < visit_perday.length; i++) {
                // console.log(data[i]);
                if (day == visit_perday[i]["visit_date"]) {
                    y3 = visit_perday[i]["visit_cnt"];
                    y3_flag = true;
                    break;
                }
            }
            for (let i = 0; i < match_apply_perday.length; i++) {
                // console.log(data[i]);
                if (day == match_apply_perday[i]["match_apply_date"]) {
                    y4 = match_apply_perday[i]["match_apply_cnt"];
                    y4_flag = true;
                    break;
                }
            }
            if (y1_flag == false) {
                y1 = 0;
            }
            if (y2_flag == false) {
                y2 = 0;
            }
            if (y3_flag == false) {
                y3 = 0;
            }
            if (y4_flag == false) {
                y4 = 0;
            }
            chartsData.push({ x: day, y1: "预测需转诊次数", v: y1 });
            chartsData.push({ x: day, y1: "转诊次数", v: y2 });
            chartsData.push({ x: day, y1: "就诊次数", v: y3 });
            chartsData.push({ x: day, y1: "预测正确次数", v: y4 });
            firstDay = firstDay.add(1, "d");
        }

        return chartsData;
    }

    buildTotalReferralStatsData(firstDayOfMonth, totalReferralStats) {
        let month = moment(firstDayOfMonth, "YYYY-MM");
        // let firstOfMonth = month.startOf("month").format("YYYY-MM-DD");
        let last = month.endOf("month").format("YYYY-MM-DD");
        let today = moment();
        if (today < month.endOf("month")) {
            last = today.format("YYYY-MM-DD");
        }

        let chartsData = this.buildTimelineChartDataY(firstDayOfMonth, last, totalReferralStats);
        return chartsData;
    }

    componentDidMount() {
        const { dispatch } = this.props;
        // const { orgReferralList, total, totalReferralStats } = this.props.referralStatistics;
        let month = this.getDayPairOfMonth(this.state.monthSelected);
        dispatch({
            type: "referralStatistics/fetch",
            payload: this.buildListQueryParams(month),
            callback: this.buildTotalReferralStatsData.bind(this)
        });
    }

    render() {
        const { orgReferralList, total, totalReferralStats } = this.props.referralStatistics;
        const { page, pageSize } = this.state;
        const columns = [
            { dataIndex: "org_code", title: "机构代码" },
            { dataIndex: "org_name", title: "机构名称" },
            { dataIndex: "total_match", title: "助手提醒次数" },
            { dataIndex: "total_apply", title: "转诊数" },
            { dataIndex: "total_visit", title: "就诊人次数" }
        ];

        let pageOpts = {
            current: page,
            pageSize: pageSize,
            size: "small",
            total: total,
            onChange: this.onListPageChange.bind(this),
            onShowSizeChange: this.onListPageChange.bind(this)
        };

        // 定义度量
        const cols = {
            x: {
                range: [0, 1]
            }
        };
        return (
            <div style={{ width: 1000, margin: "auto", backgroundColor: "white", padding: 20 }}>
                {this.buildSelectors()}
                <Table columns={columns}
                       dataSource={orgReferralList}
                       pagination={pageOpts}
                />
                <Row>
                    <Chart height={400} data={totalReferralStats} scale={cols} forceFit >
                        <Legend/>
                        <Axis name="x"/>
                        <Axis
                            name="v"
                            label={{
                                formatter: val => `${val}`
                            }}
                        />
                        <Tooltip
                            crosshairs={{
                                type: "y"
                            }}
                        />
                        <Geom
                            type="line"
                            position="x*v"
                            size={2}
                            color={"y1"}
                        />
                        <Geom
                            type="point"
                            position="x*v"
                            size={4}
                            shape={"circle"}
                            color={"y1"}
                            style={{
                                stroke: "#fff",
                                lineWidth: 1
                            }}
                        />
                    </Chart>
                </Row>
            </div>


        );
    }

}

