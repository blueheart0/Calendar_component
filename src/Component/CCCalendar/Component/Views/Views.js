import React from "react";
import { View } from "../../Constants";
import { Week } from "./Component";

const Views = props => {
  const { view, ...others } = props;
  switch (view) {
    case View.MONTH:
    case View.DAY:
    case View.WORKWEEK:
      return <div></div>;
    default:
    case View.WEEK:
      return <Week {...others} />;
  }
};
export default Views;
