import React from 'react';
import styles from './style.sass';

export default function () {
  return (
    <div>
      <p id="sass-inclusion" className={styles['sass-modules-inclusion']}>
        SASS Modules are working!
      </p>
    </div>
  );
}
