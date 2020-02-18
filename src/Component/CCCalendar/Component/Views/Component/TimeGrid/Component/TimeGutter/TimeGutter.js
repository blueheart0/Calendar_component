import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import clsx from "clsx";
import React from "react";

const useStyle = makeStyles(
  theme => ({
    root: {
      width: props => props.gutterWidth,
      height: props => props.slotHeight * 2,
      borderBottom: "solid 1px #b0bec5",
      borderLeft: "solid 1px #b0bec5",
      borderRight: "solid 1px #b0bec5",
      boxSizing: "border-box",
      backgroundColor: "#eceff1",
      "&:last-child": {
        borderBottom: "none"
      }
    }
  }),
  { name: "TimeGutter" }
);

const TimeGutter = props => {
  const { date, gutterWidth, slotHeight } = props;
  const classes = useStyle({
    gutterWidth: gutterWidth,
    slotHeight: slotHeight
  });
  return (
    <Grid item className={clsx(classes.root)}>
      <Typography>{date.format("A hh:mm")}</Typography>
    </Grid>
  );
};

export default TimeGutter;
