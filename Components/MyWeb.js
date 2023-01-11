import React, { Component } from 'react';
import { WebView , Alert} from 'react-native-webview';

export default class MyWeb extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <WebView 
      source={{ uri: 'https://staging.dmvs-apac.com/webview_test/index.html' }} 
      onMessage={this.props.onMessage}
      ref={this.props.reference}
      injectedJavaScript={this.props.injectedInfo}
      />;
  }
}