import React, { PureComponent } from "react";
import {
  Row, Col, Input, Select, Icon, Tooltip, Button, Card, Modal, message,
  Divider, Radio, Checkbox
} from "antd";

let underscore = require("underscore");
let Immutable = require("immutable");

import styles from "./ThirdParty.less";

export default class HeredopathiaHpoPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initData(props.item);
  }

  initData(item) {
    let newState = {
      id: 0,
      description: "",
      provider: "",
      module_name: "",
      parameters: "",
      init_info: ""
    };
    if (item && item.id) {
      newState.id = item.id;
      newState.provider = item.provider;
      newState.parameters = item.parameters;
      newState.module_name = item.module_name;
      newState.init_info = item.init_info;
      newState.description = item.description;
    }
    return newState;
  }

  componentWillReceiveProps(nextProps) {
    let isSame = (this.props.visible == nextProps.visible || !nextProps.visible);
    if (isSame) {
      return;
    }
    let newState = this.initData(nextProps.item);
    this.setState(newState);
  }

  onSubmit(isUpdate) {
    const {
      id, description,
      parameters, provider, module_name, init_info
    } = this.state;
    if (!this.props.onSubmit) {
      return;
    }
    if (!isUpdate) {
      this.props.onSubmit(false, null);
      return;
    }

    if (!description || !module_name || !provider) {
      message.error("请检查相关信息是否选择或填写!");
      return;
    }
    let x = {
      id: id,
      description: description,
      // port: parseInt(port),
      provider: provider,
      module_name: module_name,
      // service_location: service_location,
      parameters: parameters,
      init_info: init_info
    };
    this.props.onSubmit(true, x);
  }

  onChange(tag, val) {
    let curState = this.state;
    if (["description", "parameters", "provider", "module_name", "init_info"].indexOf(tag) != -1) {
      curState[tag] = val.target.value;
    } else {
      curState[tag] = val;
    }
    this.setState(curState);
  }

  render() {
    const {
      id, description,parameters, provider, module_name, init_info
    } = this.state;
    const { visible } = this.props;
    let title = "新建接口";
    if (id) {
      title = "编辑接口";
    }
    return (
      <Modal title={title} visible={visible} closable={false}
             okText="确定" onOk={this.onSubmit.bind(this, true)}
             cancelText="取消" onCancel={this.onSubmit.bind(this, false)}
      >
        <Row style={{ marginBottom: 6 }}>
          <Col span={6} style={{ textAlign: "right" }}>描述:</Col>
          <Col span={16} offset={1}>
            <Input style={{ width: "100%" }}
                   value={description} onChange={this.onChange.bind(this, "description")}
            />
          </Col>
        </Row>
        <Row style={{ marginBottom: 6 }}>
          <Col span={6} style={{ textAlign: "right" }}>模块名:</Col>
          <Col span={16} offset={1}>
            <Input style={{ width: "100%" }}
                   value={module_name} onChange={this.onChange.bind(this, "module_name")}
            />
          </Col>
        </Row>
        <Row style={{ marginBottom: 6 }}>
          <Col span={6} style={{ textAlign: "right" }}>提供者:</Col>
          <Col span={16} offset={1}>
            <Input style={{ width: "100%" }}
                   value={provider} onChange={this.onChange.bind(this, "provider")}
            />
          </Col>
        </Row>
        {/*<Row style={{ marginBottom: 6 }}>*/}
          {/*<Col span={6} style={{ textAlign: "right" }}>初始化信息:</Col>*/}
          {/*<Col span={16} offset={1}>*/}
            {/*<Input style={{ width: "100%" }}*/}
                   {/*value={init_info} onChange={this.onChange.bind(this, "init_info")}*/}
            {/*/>*/}
          {/*</Col>*/}
        {/*</Row>*/}

        {/*<Row style={{ marginBottom: 6 }}>*/}
          {/*<Col span={6} style={{ textAlign: "right" }}>服务位置:</Col>*/}
          {/*<Col span={16} offset={1}>*/}
            {/*<Input style={{ width: "100%" }}*/}
                   {/*value={service_location} onChange={this.onChange.bind(this, "service_location")}*/}
            {/*/>*/}
          {/*</Col>*/}
        {/*</Row>*/}
        <Row style={{ marginBottom: 6 }}>
          <Col span={6} style={{ textAlign: "right" }}>调用参数说明:</Col>
          <Col span={16} offset={1}>
            <Input.TextArea style={{ width: "100%" }}
                            autosize={{ minRows: 3, maxRows: 3 }}
                            value={parameters} onChange={this.onChange.bind(this, "parameters")}
            />
          </Col>
        </Row>
        <Row style={{ marginBottom: 6 }}>
          <Col span={6} style={{ textAlign: "right" }}>初始化信息:</Col>
          <Col span={16} offset={1}>
            <Input.TextArea style={{ width: "100%" }}
                            autosize={{ minRows: 12, maxRows: 12 }}
                            value={init_info}
                            onChange={this.onChange.bind(this, "init_info")}
            />
          </Col>
        </Row>
      </Modal>
    );
  }
}
