import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { getMemorisedNumItems } from "./cartSlice";
import styles from "./CartLink.module.css";

export function CartLink() {
  const numItems = useAppSelector(getMemorisedNumItems);
  return (
    <Link to="/cart" className={styles.link}>
      <span className={styles.text}>🛒&nbsp;&nbsp;{numItems ? numItems : 'Cart'}</span>
    </Link>
  );
}
