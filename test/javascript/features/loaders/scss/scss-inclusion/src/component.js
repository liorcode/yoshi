import React from 'react';
import styles from './style.scss';

export default function () {
  return (
    <div>
      <p id="scss-inclusion" className={styles['scss-modules-inclusion']}>
        SCSS Modules are working!
      </p>
    </div>
  );
}
