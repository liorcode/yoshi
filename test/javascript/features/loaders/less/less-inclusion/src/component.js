import React from 'react';
import styles from './style.less';

export default function () {
  return (
    <div>
      <p id="less-inclusion" className={styles['less-modules-inclusion']}>
        LESS Modules are working!
      </p>
    </div>
  );
}
