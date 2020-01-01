import React from "react";
import { connect } from "dva";
import { Row, Col, Card, Tabs, DatePicker, Divider } from "antd";
import { G2, Chart, Geom, Axis, Tooltip, Coord, Label, Legend, View, Guide, Shape, Facet, Util } from "bizcharts";
import { getTimeDistance } from "@/utils/utils";

let moment = require("moment");
let qs = require("qs");
const { MonthPicker } = DatePicker;
G2.track(false);

@connect(({ referralAcceptStatistics }) => ({
    referralAcceptStatistics
}))
export default class ReferralAcceptStats extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            rangePickerValue: getTimeDistance("month"),
            // monthOptions: options,
            size: "default",
            topN: 10
        };
    }

    handleRangePickerChange(rangePickerValue) {
        this.setState({
            rangePickerValue
        }, this.updateList.bind(this));
    };

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
            type: "referralAcceptStatistics/fetch",
            payload:  this.buildQueryParams(),
        });
    }

    buildQueryParams() {
        const { rangePickerValue, topN } = this.state;
        let x = {
            startDate: rangePickerValue[0].format("YYYY-MM-DD"),
            endDate: rangePickerValue[1].format("YYYY-MM-DD"),
            topN: topN
        };
        return x;
    }

    updateList() {
        const { dispatch } = this.props;
        dispatch({
            type: "referralAcceptStatistics/fetch",
            payload: this.buildQueryParams(),

        });
    }

    render() {
        const { rangePickerValue } = this.state;
        const { orgReferralAcceptTopNList } = this.props.referralAcceptStatistics;
        const cols = {
            total_accept: {
                tickInterval: 20
            }
        };
        return (
            <div>
                <Row>
                    <Col span={6}>
                        <DatePicker.RangePicker
                            value={rangePickerValue}
                            onChange={this.handleRangePickerChange.bind(this)}
                            style={{ width: 256 }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Chart height={400} data={orgReferralAcceptTopNList} scale={cols} forceFit>
                        <Axis name="org_name"/>
                        <Axis name="total_accept"/>
                        <Tooltip
                            crosshairs={{
                                type: "y"
                            }}
                        />
                        <Geom type="interval" position="org_name*total_accept"/>
                    </Chart>
                </Row>
            </div>
        );
    }

}
