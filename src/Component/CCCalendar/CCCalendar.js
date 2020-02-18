import React from "react";
import { Views } from "./Component";

const CCCalendar = props => {
  const { locale, ...others } = props;

  return <Views {...others} />;
};
export default CCCalendar;
