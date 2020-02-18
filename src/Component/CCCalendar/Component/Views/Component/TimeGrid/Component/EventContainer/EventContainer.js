import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import moment from "moment";
import React, { useMemo, useRef } from "react";
import { EventItem } from "../EventItem";

const useStyle = makeStyles(
  theme => ({
    root: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%"
    },
    is__hover: {
      backgroundColor: "red",
      opacity: 0.3
    }
  }),
  { name: "EventContainer" }
);

const getEvent = function*(events, slotHeight, step, onEventDrop) {
  for (let i = 0; i < events.length; i++) {
    // console.log(events);
    yield (
      <EventItem
        key={"Event_" + events[i].data.id + events[i].start.toString()}
        event={events[i]}
        slotHeight={slotHeight}
        step={step}
        index={i}
        id={events[i].data.id}
        onEventDrop={onEventDrop}
      />
    );
  }
};
const sortFunc = (a, b) => {
  if (b.start.isAfter(a.start, "days")) return -1;
  if (b.start.isBefore(a.start, "days")) return 1;
  return 0;
};

const EventContainer = props => {
  const { date, step, slotHeight, events, index, onEventDrop } = props;
  const eventContainerRef = useRef();
  const classes = useStyle();
  const currentEvent = useMemo(() => {
    if (events) {
      return events
        .sort(sortFunc)
        .reduce((accumulator, currentValue) => {
          currentValue.friends = [];
          accumulator.push(currentValue);
          return accumulator;
        }, [])
        .reduce((accumulator, currentValue, currentIndex, array) => {
          if (
            currentValue.start.isBetween(
              date.clone().startOf("day"),
              date.clone().endOf("day")
            ) ||
            currentValue.end.isBetween(
              date.clone().startOf("day"),
              date.clone().endOf("day")
            )
          ) {
            let _currentStart = currentValue.start.clone();
            let _currentEnd = currentValue.end.clone();
            for (let i = currentIndex + 1; i < array.length; i++) {
              let _next = array[i];
              let _nextStart = _next.start.clone();
              let _nextEnd = _next.end.clone();
              console.log();
              if (
                (_nextStart.isSameOrBefore(_currentStart) &&
                  _currentStart.isBefore(_nextEnd)) ||
                (_currentStart.isSameOrBefore(_nextStart) &&
                  _nextStart.isSameOrBefore(_currentEnd))
              ) {
                currentValue.friends.push(_next);
                _next.friends.push(currentValue);
              }
            }
            accumulator.push(currentValue);
          }
          return accumulator;
        }, []);
    } else {
      return [];
    }
  }, [date, events]);
  const _start = useMemo(() => date.clone().startOf("day"), [date]);
  if (currentEvent.length > 0) console.log(currentEvent);

  return (
    <Grid
      ref={eventContainerRef}
      item
      container
      className={clsx(classes.root)}
      onDrop={ev => {
        ev.preventDefault();
        ev.stopPropagation();
        ev.nativeEvent.stopImmediatePropagation();

        let data = JSON.parse(ev.dataTransfer.getData("text/plain"));
        data = {
          ...data,
          start: moment(data.start, "X"),
          end: moment(data.end, "X")
        };
        let _dropStart = _start
          .clone()
          .add(
            24 *
              60 *
              ((ev.nativeEvent.offsetY - data.y) /
                eventContainerRef.current.scrollHeight),
            "minutes"
          )
          .subtract(
            (24 *
              60 *
              ((ev.nativeEvent.offsetY - data.y) /
                eventContainerRef.current.scrollHeight)) %
              step,
            "minutes"
          );
        onEventDrop({
          start: _dropStart,
          end: _dropStart
            .clone()
            .add(moment.duration(data.end.diff(data.start))),
          resourceId: null,
          droppedOnAllDaySlot: false,
          data: data.data
        });
      }}
      onDragOver={ev => {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
      }}
    >
      {[...getEvent(currentEvent, slotHeight, step, onEventDrop)]}
    </Grid>
  );
};
export default EventContainer;
