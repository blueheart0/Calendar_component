import { Box, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { TimeGroup, TimeGutter, WeekHeader } from "./Component";

const gutter_width = 90;
const slot_height = 36;
const header_height = 36;
const scroll_gutter_width = 16.5;
const useStyle = makeStyles(
  theme => ({
    root: {
      width: "inherit",
      height: "100%"
    },
    header: {
      width: "inherit"
    },
    slot__header: {},
    gutter__header: {
      width: gutter_width,
      minWidth: gutter_width,
      // height: slot_height,
      backgroundColor: "#fff",
      borderTop: "1px solid #b8bec5",
      borderBottom: "1px solid #b8bec5",
      borderLeft: "1px solid #b8bec5",
      boxSizing: "border-box",
      "&:last-child": {
        borderBottom: "none"
      }
    },
    gutter__group: {
      width: gutter_width
    },
    time_content: {
      overflowY: "auto",
      height: props => `calc(100% - ${props.headerContainerHeight}px)`,
      borderBottom: "1px solid #b8bec5"
    },
    scroll__gutter: {
      minWidth: scroll_gutter_width,
      width: scroll_gutter_width,
      // height: slot_height,
      border: "1px solid #b8bec5"
    }
  }),
  { name: "TimeGrid" }
);

const getAllDaySlot = function*(
  { start, end },
  headerHeight,
  needScrollGutter,
  scrollGutterWidth
) {
  let _day = start.clone();
  do {
    yield (
      <Grid
        key={"AllDay_" + _day.toISOString()}
        item
        style={{
          width: `${100 / 7}%`,
          height: slot_height,
          backgroundColor: "red"
        }}
      />
    );
    _day.add(1, "day");
  } while (_day.isSameOrBefore(end));
};

const getTimeGutter = function*(step = 15, slotHeight) {
  let _start = moment().startOf("day");
  let _end = moment().endOf("day");
  do {
    yield (
      <TimeGutter
        key={"TimeGutter_" + _start.toISOString()}
        date={_start.clone()}
        gutterWidth={gutter_width}
        slotHeight={slotHeight}
      />
    );
    _start.add(step * 2, "minutes");
  } while (_start.isSameOrBefore(_end));
};

const getWeekHeader = function*(
  { start, end },
  headerHeight,
  needScrollGutter,
  scrollGutterWidth
) {
  let _day = start.clone();
  do {
    yield (
      <WeekHeader
        key={"WeekHeader_" + _day.toISOString()}
        date={_day.clone()}
        gutterWidth={gutter_width}
        needScrollGutter={needScrollGutter}
        headerHeight={headerHeight}
        scrollGutterWidth={scrollGutterWidth}
      />
    );
    _day.add(1, "day");
  } while (_day.isSameOrBefore(end));
};
const getTimeGroup = function*(
  { start, end },
  step = 15,
  gutterWidth,
  slotHeight,
  needScrollGutter,
  scrollGutterWidth,
  events,
  onEventDrop,
  onEventResize
) {
  let _start = start.clone().startOf("day");
  let _end = end.clone().endOf("day");
  let index = 0;
  do {
    yield (
      <TimeGroup
        key={"TimeGroup_" + _start.toISOString()}
        date={_start.clone()}
        events={events}
        step={step}
        gutterWidth={gutterWidth}
        slotHeight={slotHeight}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        index={index++}
      />
    );
    _start.add(1, "day");
  } while (_start.isSameOrBefore(_end));
};
const TimeGrid = props => {
  const { range, onEventDrop, onEventResize, events, ...others } = props;
  const [needScrollGutter, setNeedScrollGutter] = useState(false);

  const timeContentRef = useRef();
  const [headerContainerHeight, setHeaderContainerHeight] = useState(
    slot_height + header_height
  );
  const headerRef = useRef();
  const classes = useStyle({ headerContainerHeight: headerContainerHeight });
  const timeContentResizeObserver = new ResizeObserver(entries => {
    // console.log(entries);
    if (entries && entries[0] && entries[0].target) {
      if (entries[0].contentRect.height < entries[0].target.scrollHeight) {
        if (!needScrollGutter) setNeedScrollGutter(true);
      } else {
        if (needScrollGutter) setNeedScrollGutter(false);
      }
    }
  });
  const headerResizeObserver = new ResizeObserver(entries => {
    if (entries && entries[0] && entries[0].target) {
      if (
        entries[0].contentRect.height !==
        headerContainerHeight - header_height
      ) {
        setHeaderContainerHeight(header_height + entries[0].contentRect.height);
      }
    }
  });
  useEffect(() => {
    timeContentResizeObserver.observe(timeContentRef.current);
    headerResizeObserver.observe(headerRef.current);
  }, [timeContentRef, timeContentResizeObserver]);

  // console.log(onEventDrop);
  return (
    <Box className={clsx(classes.root)}>
      <Grid container direction={"column"} style={{ height: "inherit" }}>
        <Grid
          className={clsx(classes.header)}
          item
          container
          direction={"row"}
          wrap={"nowrap"}
        >
          <Grid item className={classes.gutter__header} />
          <Grid
            item
            container
            style={{
              width: `calc(100% - ${props.gutterWidth}px - ${
                props.needScrollGutter ? props.scrollGutterWidth : 0
              }px) `
            }}
            direction={"column"}
          >
            <Grid item container>
              {[
                ...getWeekHeader(
                  range,
                  header_height,
                  needScrollGutter,
                  scroll_gutter_width
                )
              ]}
            </Grid>
            <Grid item container ref={headerRef}>
              {[
                ...getAllDaySlot(
                  range,
                  header_height,
                  needScrollGutter,
                  scroll_gutter_width
                )
              ]}
            </Grid>
          </Grid>
          {needScrollGutter && <Grid item className={classes.scroll__gutter} />}
        </Grid>
        <Grid
          item
          container
          className={clsx(classes.time_content)}
          ref={timeContentRef}
        >
          <Grid
            item
            container
            direction={"column"}
            className={clsx(classes.gutter__group)}
          >
            {[...getTimeGutter(15, slot_height)]}
          </Grid>
          {[
            ...getTimeGroup(
              range,
              15,
              gutter_width,
              slot_height,
              needScrollGutter,
              scroll_gutter_width,
              events,
              onEventDrop,
              onEventResize
            )
          ]}
        </Grid>
      </Grid>
    </Box>
  );
};
export default TimeGrid;
