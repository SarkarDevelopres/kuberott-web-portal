import React from "react";
import styles from "./spinner.module.css";

function SpinnerComp() {
  return (
    <div className={styles.overlay}>
      {/* Spinner */}
      <div className={styles.spinnerWrapper}>
        <div className={styles.outerRing}></div>
        <div className={styles.spinRing}></div>
        <div className={styles.innerDot}></div>
      </div>

      {/* Loading text */}
      <div className={styles.textWrapper}>
        <p className={styles.text}>Loading...</p>
      </div>
    </div>
  );
}

export default SpinnerComp;
