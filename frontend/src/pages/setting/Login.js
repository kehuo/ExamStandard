import React, { Component } from 'react';
import { connect } from 'dva';
// import { formatMessage, FormattedMessage } from 'umi/locale';
import Link from 'umi/link';
import { Checkbox, Alert, Icon } from 'antd';
import Login from '@/components/Login';
import styles from './Login.less';

const { UserName, Password, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
  getting: loading.effects['login/getCaptcha'],
}))
export default class LoginPage extends Component {
  state = {}


  handleSubmit = (err, values) => {
    if (!err) {
      this.props.dispatch({
        type: 'login/login',
        payload: {
          ...values,
        },
      });
    }
  }

  renderMessage = (content) => {
    return (
      <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
    );
  }

  handleSubmitFake () {
    let that = this;
    this.refs['loginForm'].validateFields((err, fieldsValue) => {
      that.handleSubmit(err, fieldsValue);
    });
  }

  render() {
    const { login, submitting, getting } = this.props;
    const { type } = this.state;
    return (
      <div className={styles.main}>

        <Login onSubmit={this.handleSubmit} ref="loginForm">
          {
            login.status === 'error' &&
            !login.submitting &&
            this.renderMessage('账户密码错误或验证码错误')
          }
          <UserName name="userName" />
          <Password name="password" onPressEnter={this.handleSubmitFake.bind(this)}/>
          <Submit loading={submitting}>登录</Submit>
        </Login>
      </div>
    );
  }
}

