import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import moment from "moment";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

const getMaxFriends = (event, maxFriends = 0, visited = []) => {
  for (let i = 0; i < event.friends.length; i++) {
    let _targetFriends = event.friends[i];
    if (visited.findIndex(item => item.id === _targetFriends.id) !== -1) {
      continue;
    }
    if (!_targetFriends?.friends?.length) {
      continue;
    }
    maxFriends =
      maxFriends > _targetFriends.friends.length
        ? maxFriends
        : _targetFriends.friends.length;
    visited.push(_targetFriends);
    let newMaxFriends = getMaxFriends(_targetFriends, maxFriends, visited);
    maxFriends = maxFriends > newMaxFriends ? maxFriends : newMaxFriends;
  }
  return maxFriends;
};
const getEvent = function*(events, slotHeight, step, onEventDrop) {
  for (let i = 0; i < events.length; i++) {
    console.log(events[i].data.title, events[i].friends);
    yield (
      <EventItem
        key={"Event_" + events[i].data.id + events[i].start.toString()}
        event={events[i]}
        slotHeight={slotHeight}
        step={step}
        index={i}
        id={events[i].data.id}
        onEventDrop={onEventDrop}
        maxFriends={events[i].friends ? getMaxFriends(events[i]) : 0}
      />
    );
  }
};
const sortFunc = (a, b) => {
  if (b.start.isAfter(a.start)) return -1;
  if (b.start.isBefore(a.start)) return 1;
  return 0;
};
const getFriends = rawEvent => {
  let _temp = [...rawEvent].sort(sortFunc);

  for (let i = 0; i < _temp.length; i++) {
    if (!_temp[i].friends) _temp[i].friends = [];
    for (let j = i + 1; j < _temp.length; j++) {
      if (!_temp[j].friends) _temp[j].friends = [];
      if (
        _temp[j].start.isSameOrAfter(_temp[i].start) &&
        _temp[j].start.isBefore(_temp[i].end)
      ) {
        _temp[i].friends.push(_temp[j]);
        _temp[j].friends.push(_temp[i]);
      }
    }
  }
  for (let i = 0; i < _temp.length; i++) {
    let bitmap = [
      ...(function*() {
        for (let i = 0; i < 100; i++) {
          yield 1;
        }
      })()
    ];
    for (let j = 0; j < _temp[i].friends.length; j++) {
      if (_temp[i].friends[j].friendsIndex !== undefined) {
        bitmap[_temp[i].friends[j]?.friendsIndex] = 0;
      }
    }
    _temp[i].friendsIndex = bitmap.indexOf(1);
  }
  return _temp;
};

const EventContainer = props => {
  const { date, step, slotHeight, events, index, onEventDrop } = props;
  const eventContainerRef = useRef();
  const classes = useStyle();
  const [currentEvent, setCurrentEvent] = useState([]);
  const rawEvent = useMemo(() => {
    return events && events.length > 0
      ? events
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
              accumulator.push(currentValue);
            }
            return accumulator;
          }, [])
      : [];
  }, [date, events]);
  // console.log(rawEvent);
  useEffect(() => {
    if (rawEvent && rawEvent.length > 0) {
      setCurrentEvent(getFriends(rawEvent));
    } else {
      setCurrentEvent([]);
    }
  }, [rawEvent]);
  const _start = useMemo(() => date.clone().startOf("day"), [date]);
  // if (currentEvent.length > 0) console.log(currentEvent);

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
