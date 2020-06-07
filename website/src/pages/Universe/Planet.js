import React from 'react';
import styles from './planet.module.css';

const getAnimationDuration = (size) => `${size / 20}s`;

export default ({ label, color, size }) => {
  return (
    <div className={styles.planetResizer}>
      <div
        className={styles.planetMover}
        style={{ animationDuration: getAnimationDuration(size) }}
      >
        <div
          className={styles.planet}
          style={{
            backgroundColor: color,
            width: size,
            height: size,
          }}
        >
          <div className={styles.hover} />
        </div>
        <span className={styles.planetLabel}>{label}</span>
      </div>
    </div>
  );
};
