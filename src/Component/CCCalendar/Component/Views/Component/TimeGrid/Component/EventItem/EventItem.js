import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";

const useStyle = makeStyles(
  theme => ({
    root: {
      position: "absolute",
      width: props => `${100 / (props.maxFriends + 1)}%`,
      height: props => `${props.height}%`,
      backgroundColor: props => props.backgroundColor,
      color: "#000000",
      border: "1px solid #000000",
      overflow: "hidden",
      top: props => `${props.top}%`,
      boxSizing: "border-box",
      userSelect: "none",
      cursor: "pointer",
      zIndex: props => props.friendsIndex,
      left: props => {
        if (props.maxFriends > 0) {
          if (props.friendsIndex > 0) {
            return `${(100 / (props.maxFriends + 1)) * props.friendsIndex -
              (100 / (props.maxFriends + 1)) * 0.2}%`;
          } else {
            return `${(100 / (props.maxFriends + 1)) * props.friendsIndex}%`;
          }
        } else {
          return `0%`;
        }
      }
    },
    is__dragging: {
      // width: 0,
      // height: 0
    },
    event__item: {
      position: "relative"
    },
    resize__handle: {
      position: "absolute",
      backgroundColor: "red"
    },
    resize__handle__top: {
      top: 5,
      left: "50%",
      transform: "translateX(-50%)"
    },
    resize__handle__bottom: {
      bottom: 5,
      left: "50%",
      transform: "translateX(-50%)"
    }
  }),
  { name: "EventItem" }
);

const EventItem = props => {
  const { event, slotHeight, step, id, onEventDrop, maxFriends } = props;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const eventItemRef = useRef();
  const [eventSize, setEventSize] = useState({
    maxFriends: 0,
    top: 0,
    bottom: 0
  });
  // console.log(event);
  useEffect(() => {
    if (event && event?.start && event?.end && step && slotHeight) {
      // console.log("MaxFriends", getMaxFriends(event));
      let topMinutes = event.start.hour() * 60 + event.start.minute();
      let bottomMinutes = event.end.hour() * 60 + event.end.minute();
      setEventSize({
        maxFriends: maxFriends,
        top: (topMinutes / (24 * 60)) * 100,
        height: (bottomMinutes / (24 * 60) - topMinutes / (24 * 60)) * 100,
        friendsIndex: event.friendsIndex ? event.friendsIndex : 0
      });
    } else {
      setEventSize({ maxFriends: 0, top: 0, bottom: 0 });
    }
  }, [event, slotHeight, step, maxFriends]);
  const [backgroundColor, setBackgroundColor] = useState(
    // () => "#" + Math.floor(Math.random() * 16777215).toString(16)
    "#ffffff"
  );
  useEffect(() => {
    if (eventItemRef.current) {
      // console.log(eventItemRef);
      eventItemRef.current.hidden = isDragging;
    }
  }, [isDragging]);
  const classes = useStyle({
    ...eventSize,
    step: step,
    slotHeight,
    backgroundColor: backgroundColor
  });
  // console.log(event.data.id, event.start.toString());

  return (
    <Grid
      item
      container
      id={id}
      draggable={!isResizing}
      ref={eventItemRef}
      data-start={event.start.toString()}
      data-end={event.end.toString()}
      onDrop={ev => {
        ev.preventDefault();
        ev.stopPropagation();
        ev.nativeEvent.stopImmediatePropagation();

        let data = JSON.parse(ev.dataTransfer.getData("text/plain"));
        console.log(data);
        data = {
          ...data,
          start: moment(data.start, "X"),
          end: moment(data.end, "X")
        };
        let _dropStart = event.start
          .clone()
          .startOf("day")
          .add(
            24 *
              60 *
              ((ev.currentTarget.offsetTop + ev.nativeEvent.offsetY - data.y) /
                ev.currentTarget.offsetParent.scrollHeight),
            "minutes"
          )
          .subtract(
            (24 *
              60 *
              ((ev.currentTarget.offsetTop + ev.nativeEvent.offsetY - data.y) /
                ev.currentTarget.offsetParent.scrollHeight)) %
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
        setIsDragging(false);
      }}
      onDragStart={ev => {
        console.log("DragStart", ev);
        ev.stopPropagation();
        ev.nativeEvent.stopImmediatePropagation();
        ev.dataTransfer.dropEffect = "move";
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setDragImage(
          eventItemRef.current,
          ev.nativeEvent.offsetX,
          ev.nativeEvent.offsetY
        ); //TODO:Element를 지정할수 있어서 데이터로 따로 엘리먼트 만들어 넣으면 된다, ref를 넣어야 함
        console.log("onDragStart", event);
        delete event.friends;
        ev.dataTransfer.setData(
          "text/plain",
          JSON.stringify({
            ...event,
            start: event.start.unix(),
            end: event.end.unix(),
            x: ev.nativeEvent.offsetX,
            y: ev.nativeEvent.offsetY
          })
        );
        setIsDragging(true);
      }}
      className={clsx(classes.root, { [classes.is__dragging]: isDragging })}
      onDragOver={ev => {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
      }}
      onDragEnd={e => {
        e.preventDefault();
        // console.log("onDragEnd", e);
        setIsDragging(false);
      }}
    >
      <Grid className={clsx(classes.event__item)} item container>
        <Grid
          onMouseDown={e => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            setIsResizing(true);
            console.log("onMouseDown", e);
          }}
          onMouseUp={e => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            setIsResizing(false);
            console.log("onMouseUp", e);
          }}
          onMouseLeave={e => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            setIsResizing(false);
            console.log("onMouseLeave", e);
          }}
          item
          className={clsx(classes.resize__handle, classes.resize__handle__top)}
        >
          Handle
        </Grid>
        {event.data.title}
        <Grid
          onMouseDown={e => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            setIsResizing(true);
            console.log("onMouseDown", e);
          }}
          onMouseUp={e => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            setIsResizing(false);
            console.log("onMouseUp", e);
          }}
          onMouseLeave={e => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            setIsResizing(false);
            console.log("onMouseLeave", e);
          }}
          item
          className={clsx(
            classes.resize__handle,
            classes.resize__handle__bottom
          )}
        >
          Handle
        </Grid>
      </Grid>
    </Grid>
  );
};
export default EventItem;
