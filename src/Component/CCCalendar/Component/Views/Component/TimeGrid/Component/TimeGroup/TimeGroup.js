import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import React, { useRef, useState } from "react";

import { EventContainer, TimeSlot } from "../index";

const useStyle = makeStyles(
  theme => ({
    root: {
      position: "relative",
      width: props => `calc((100% - ${props.gutterWidth}px) / 7 )`,
      backgroundColor: "#eceff1"
    },
    is__hover: {
      // border: "1px solid blue"
    }
  }),
  { name: "TimeGroup" }
);
const getTimeSlot = function*(
  date,
  step,
  gutterWidth,
  slotHeight,
  onEventDrop
) {
  let _start = date.clone().startOf("day");
  let _end = date.clone().endOf("day");
  // console.log("_start", _start);
  do {
    yield (
      <TimeSlot
        key={"TimeSlot_" + _start.toISOString()}
        start={_start.clone()}
        end={_start.clone().add(step, "minutes")}
        step={step}
        gutterWidth={gutterWidth}
        slotHeight={slotHeight}
        onEventDrop={onEventDrop}
      />
    );
    _start.add(step, "minutes");
  } while (_start.isSameOrBefore(_end));
};
const TimeGroup = props => {
  const {
    date,
    step,
    gutterWidth,
    slotHeight,
    events,
    onEventDrop,
    onEventResize,
    index
  } = props;
  const timeGroupRef = useRef();
  const classes = useStyle({
    gutterWidth: gutterWidth
  });
  const [isHover, setIsHover] = useState(false);
  return (
    <Grid
      item
      container
      direction={"column"}
      ref={timeGroupRef}
      className={clsx(classes.root, { [classes.is__hover]: isHover })}
      onDragEnter={ev => {
        // console.log(ev);
        setIsHover(true);
      }}
      onDragLeave={ev => {
        // console.log(ev);
        setIsHover(false);
      }}
      onDropCapture={ev => {
        // console.log(ev);
        setIsHover(false);
      }}
    >
      {[...getTimeSlot(date, step, gutterWidth, slotHeight)]}
      <EventContainer
        events={events}
        gutterWidth={gutterWidth}
        slotHeight={slotHeight}
        date={date}
        step={step}
        index={index}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
      />
    </Grid>
  );
};
export default TimeGroup;
