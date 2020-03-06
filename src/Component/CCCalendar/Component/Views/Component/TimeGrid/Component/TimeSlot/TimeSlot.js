import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import clsx from "clsx";
import React from "react";

const useStyle = makeStyles(
  theme => ({
    root: {
      width: "100%",
      height: props => props.slotHeight,
      borderRight: "1px solid #b0bec5",
      backgroundColor: "transparent",
      boxSizing: "border-box",
      "&:nth-child(even)": {
        borderBottom: "1px solid #b0bec5"
      },
      "&:last-child": {
        borderBottom: "none"
      },
      userSelect: "none"
    },
    is__hover: {
      backgroundColor: "red",
      opacity: 0.3
    },
    debugTypo: {
      color: "#edcff1"
    }
  }),
  { name: "TimeSlot" }
);

const TimeSlot = props => {
  const { start, end, gutterWidth, slotHeight } = props;
  const classes = useStyle({
    gutterWidth: gutterWidth,
    slotHeight: slotHeight
  });

  return (
    <Grid className={clsx(classes.root)} item>
      <Typography className={clsx(classes.debugTypo)}>
        {start.format("HH:mm") + " - " + end.format("HH:mm")}
      </Typography>
    </Grid>
  );
};
export default TimeSlot;
