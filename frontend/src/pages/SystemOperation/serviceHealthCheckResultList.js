import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Select, Icon, Table, Drawer, message, Button, Popconfirm } from 'antd';


import styles from '../Admin/Org.less';
let underscore = require('underscore');

@connect(({ serviceHealthCheckResult }) => ({
  serviceHealthCheckResult
}))
export default class serviceHealthCheckResultList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'serviceHealthCheckResult/fetch',

    });
  }

  onListPageChange() {
    this.setState(this.fetchListData.bind(this));
  }

  fetchListData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'serviceHealthCheckResult/fetch',

    });
  }

  buildOpBar() {
    return (
      <Row style={{marginTop:10, marginBottom:10}}>
        <Col span={4} offset={1}>
          <Button type="primary" onClick={this.onListPageChange.bind(this)}>重新监测</Button>
        </Col>
      </Row>
    );
  }

  statusRender(text, record, index) {
    const StatusColorMap = {
      ok: 'green',
      warning: 'orange',
      timeout: 'blue',
      error: 'red',
    };
    let curColor = 'red';
    if (StatusColorMap[text]) {
      curColor = StatusColorMap[text];
    }
    let rst = (
        <div style={{color:curColor}}>{text}</div>
    );
    return rst;
  }

  render() {
    const { data, total } = this.props.serviceHealthCheckResult;
    // const { page, pageSize, showPopup, hotOne } = this.state;
    const columns = [
      {dataIndex:'name', title:'服务名称'},
      {dataIndex:'result', title:'运行状态', render: this.statusRender.bind(this)},
      {dataIndex:'message', title:'运行消息'},
      {dataIndex:'pather_service', title:'父服务'},
    ];

    return (
      <div style={{width:1000, margin:'auto', backgroundColor:'white', padding:20}}>
        {this.buildOpBar()}
        <Table columns={columns}
               dataSource={data}
        />
      </div>
    );
  }
}
