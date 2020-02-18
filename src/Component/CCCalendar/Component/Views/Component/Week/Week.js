import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import React from "react";
import View from "../../../../Constants/View";
import { TimeGrid } from "../index";

const useStyle = makeStyles(
  theme => ({
    root: {
      width: "100%",
      height: "100%"
    }
  }),
  { name: "Week" }
);

const Week = props => {
  const { date, ...others } = props;
  const classes = useStyle();
  const range = date => ({
    start: date.clone().startOf(View.WEEK),
    end: date.clone().endOf(View.WEEK)
  });
  return (
    <Box className={clsx(classes.root)}>
      <TimeGrid {...others} range={range(date)} />
    </Box>
  );
};
export default Week;
