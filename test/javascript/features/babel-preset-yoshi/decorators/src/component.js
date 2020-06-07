import React from 'react';

function punctuate(value) {
  return function (target) {
    const originalMethod = target.descriptor.value;
    target.descriptor.value = function (message) {
      return originalMethod.call(this, `${message}${value}`);
    };
  };
}

export default class Test extends React.Component {
  @punctuate('!')
  renderMessage(message) {
    return <div id="decorators">{message}</div>;
  }

  render() {
    return this.renderMessage('decorators are working');
  }
}
