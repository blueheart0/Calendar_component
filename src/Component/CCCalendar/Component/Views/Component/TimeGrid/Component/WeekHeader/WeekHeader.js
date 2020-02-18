import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import React from "react";

const useStyle = makeStyles(theme => ({
  root: {
    width: props =>
      `calc((100% - ${props.gutterWidth}px - ${
        props.needScrollGutter ? props.scrollGutterWidth : 0
      }px) / 7)`,
    height: props => props.headerHeight,
    backgroundColor: "#fff",
    borderTop: "1px solid #b8bec5",
    borderBottom: "1px solid #b8bec5",
    borderLeft: "1px solid #b8bec5",
    "&:list-child": {
      borderRight: "1px solid #b8bec5"
    },
    boxSizing: "border-box"
  }
}));

const WeekHeader = props => {
  const {
    date,
    gutterWidth,
    headerHeight,
    needScrollGutter,
    scrollGutterWidth
  } = props;
  const classes = useStyle({
    gutterWidth: gutterWidth,
    headerHeight: headerHeight,
    needScrollGutter: needScrollGutter,
    scrollGutterWidth: scrollGutterWidth
  });
  return (
    <Grid
      item
      className={clsx(classes.root)}
      container
      justify={"center"}
      alignItems={"center"}
    >
      <Typography>{date.format("ddd DD")}</Typography>
    </Grid>
  );
};

export default WeekHeader;
