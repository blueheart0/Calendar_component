import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";

const useStyle = makeStyles(
  theme => ({
    root: {
      position: "absolute",
      width: props => {
        // console.log(props.friends);
        switch (props.layoutAlgorithm) {
          default:
          case "overlap":
            return `${Math.min(
              (100 / (props.friends ? props.friends + 2 : 1)) * 1.7,
              100
            )}%`;
          case "noOverlap":
            return `${100 / (props.maxFriends + 1)}%`;
        }
      },
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
        let left;
        let width;
        switch (props.layoutAlgorithm) {
          default:
          case "overlap":
            if (props?.friends) {
              if (props.friendsIndex > 0) {
                left =
                  (100 / (props.friends + 1)) * props.friendsIndex -
                  (100 / (props.friends + 1)) * 0.2;
                width = Math.min(
                  (100 / (props.friends ? props.friends + 2 : 1)) * 1.7,
                  100
                );
                return `${Math.min(100 - width, left)}%`;
              } else {
                return `${(100 / (props.friends + 1)) * props.friendsIndex}%`;
              }
            } else {
              return `0%`;
            }
          case "noOverlap":
            if (props.maxFriends > 0) {
              if (props.friendsIndex > 0) {
                left =
                  (100 / (props.maxFriends + 1)) * props.friendsIndex -
                  (100 / (props.maxFriends + 1)) * 0.2;
                width = 100 / (props.maxFriends + 1);
                return `${left < 100 - width ? left : 100 - width}%`;
              } else {
                return `${(100 / (props.maxFriends + 1)) *
                  props.friendsIndex}%`;
              }
            } else {
              return `0%`;
            }
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
      transform: "translateX(-50%)",
      cursor: "ns-resize"
    },
    resize__handle__bottom: {
      bottom: 5,
      left: "50%",
      transform: "translateX(-50%)",
      cursor: "ns-resize"
    }
  }),
  { name: "EventItem" }
);

// const debounce = function(fn, wait) {
//   let lastTimeoutId = null;
//   return (...args) => {
//     if (lastTimeoutId) {
//       clearTimeout(lastTimeoutId);
//       lastTimeoutId = null;
//     }
//     lastTimeoutId = setTimeout(() => {
//       fn(...args);
//       lastTimeoutId = null;
//     }, wait);
//   };
// };
const debounce = function debonuce(f, interval) {
  let timer = null;

  return (...args) => {
    clearTimeout(timer);
    return new Promise(resolve => {
      timer = setTimeout(() => resolve(f(...args)), interval);
    });
  };
};
function throttle(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}
const AllDayHour = 24;
const OneHourMinutes = 60;

const EventItem = props => {
  const {
    event,
    layoutAlgorithm,
    slotHeight,
    step,
    id,
    onEventDrop,
    maxFriends,
    onEventResize
  } = props;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
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
      let topMinutes =
        event.start.hour() * OneHourMinutes + event.start.minute();
      let bottomMinutes =
        event.end.hour() * OneHourMinutes + event.end.minute();
      setEventSize({
        maxFriends: maxFriends,
        friends: event?.friends?.length,
        top: (topMinutes / (AllDayHour * OneHourMinutes)) * 100,
        height:
          (bottomMinutes / (AllDayHour * OneHourMinutes) -
            topMinutes / (AllDayHour * OneHourMinutes)) *
          100,
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
  useEffect(() => {
    setIsInteracting(false);
  }, [eventSize]);
  const classes = useStyle({
    ...eventSize,
    step: step,
    slotHeight,
    backgroundColor: backgroundColor,
    layoutAlgorithm: layoutAlgorithm
  });
  // console.log(event.data.id, event.start.toString());
  const handleUpperResize = event => {
    let heightDiff = event.layerY;
    // if (heightDiff > 0) {
    //   return true;
    // }
    let stepPercent = (step / (AllDayHour * OneHourMinutes)) * 100;
    // console.table({
    //   a: heightDiff > 0,
    //   b: eventSize.height <= step,
    //   "eventSize.height": eventSize.height,
    //   step: step,
    //   stepPercent: stepPercent,
    //   filter: heightDiff > 0 && eventSize.height <= step
    // });
    if (heightDiff > 0 && eventSize.height <= stepPercent) {
      return true;
    }
    let upperHeightDiff =
      (step / (AllDayHour * OneHourMinutes)) *
      eventItemRef.current.offsetParent.scrollHeight;
    let needExpand = Math.abs(heightDiff) > upperHeightDiff;

    if (needExpand && eventItemRef.current && !isInteracting) {
      setIsInteracting(true);
      // console.log(eventItemRef);
      // console.table({
      //   heightDiff: heightDiff,
      //   upperHeightDiff: upperHeightDiff,
      //   needExpand: needExpand,
      //   "eventSize.height": eventSize.height,
      //   result:
      //     eventSize.height +
      //     (upperHeightDiff / eventItemRef.current.offsetParent.scrollHeight) *
      //       100
      // });
      // console.table([]);

      setEventSize({
        ...eventSize,
        top:
          heightDiff > 0
            ? eventSize.top +
              (upperHeightDiff /
                eventItemRef.current.offsetParent.scrollHeight) *
                100
            : eventSize.top -
              (upperHeightDiff /
                eventItemRef.current.offsetParent.scrollHeight) *
                100,
        height:
          heightDiff > 0
            ? eventSize.height -
              (upperHeightDiff /
                eventItemRef.current.offsetParent.scrollHeight) *
                100
            : eventSize.height +
              (upperHeightDiff /
                eventItemRef.current.offsetParent.scrollHeight) *
                100
      });
    }
  };

  const handleLowerResize = event => {
    let heightDiff = event.layerY;
    let stepPercent = (step / (AllDayHour * OneHourMinutes)) * 100;
    // if (heightDiff < 0) {
    //   return true;
    // }
    if (heightDiff < 0 && eventSize.height <= stepPercent) {
      return true;
    }
    let upperHeightDiff =
      (step / (AllDayHour * OneHourMinutes)) *
      eventItemRef.current.offsetParent.scrollHeight;
    let needExpand = Math.abs(heightDiff) > upperHeightDiff;

    if (needExpand && eventItemRef.current && !isInteracting) {
      setIsInteracting(true);
      // console.log(eventItemRef);
      // console.table({
      //   heightDiff: heightDiff,
      //   upperHeightDiff: upperHeightDiff,
      //   needExpand: needExpand,
      //   "eventSize.height": eventSize.height,
      //   result:
      //     eventSize.height +
      //     (upperHeightDiff / eventItemRef.current.offsetParent.scrollHeight) *
      //       100
      // });
      // console.table([]);

      setEventSize({
        ...eventSize,
        // top:
        //   eventSize.top +
        //   (upperHeightDiff / eventItemRef.current.offsetParent.scrollHeight) *
        //     100,
        height:
          heightDiff < 0
            ? eventSize.height -
              (upperHeightDiff /
                eventItemRef.current.offsetParent.scrollHeight) *
                100
            : eventSize.height +
              (upperHeightDiff /
                eventItemRef.current.offsetParent.scrollHeight) *
                100
      });
    }
  };

  // console.log("eventSize", eventSize);
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
        switch (data.type) {
          default:
          case "drag":
            data = {
              ...data,
              start: moment(data.start, "X"),
              end: moment(data.end, "X")
            };
            let _dropStart = event.start
              .clone()
              .startOf("day")
              .add(
                AllDayHour *
                  OneHourMinutes *
                  ((ev.currentTarget.offsetTop +
                    ev.nativeEvent.offsetY -
                    data.y) /
                    ev.currentTarget.offsetParent.scrollHeight),
                "minutes"
              )
              .subtract(
                (AllDayHour *
                  OneHourMinutes *
                  ((ev.currentTarget.offsetTop +
                    ev.nativeEvent.offsetY -
                    data.y) /
                    ev.currentTarget.offsetParent.scrollHeight)) %
                  step,
                "minutes"
              );
            onEventDrop &&
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
            break;
          case "resize":
            break;
        }
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
            y: ev.nativeEvent.offsetY,
            type: "drag"
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
          draggable={true}
          onDragStart={ev => {
            ev.stopPropagation();
            ev.nativeEvent.stopImmediatePropagation();
            setIsResizing(true);
            console.log("onDragStart-Resize", ev);
            delete event.friends;
            ev.dataTransfer.setDragImage(
              document.createElement("div"),
              ev.nativeEvent.offsetX,
              ev.nativeEvent.offsetY
            );
            ev.dataTransfer.setData(
              "text/plain",
              JSON.stringify({
                ...event,
                start: event.start.unix(),
                end: event.end.unix(),
                x: ev.nativeEvent.offsetX,
                y: ev.nativeEvent.offsetY,
                type: "resize"
              })
            );
          }}
          onDrag={ev => {
            ev.persist();
            ev.stopPropagation();
            ev.nativeEvent.stopImmediatePropagation();
            ev.preventDefault();
            ev.dataTransfer.dropEffect = "move";
            throttle(handleUpperResize(ev.nativeEvent), 400);
          }}
          onDragEnd={ev => {
            setIsResizing(false);
            // console.log(ev);
            // console.log(ev.type);
            // // let data = JSON.parse(ev.dataTransfer.getData("text/plain"));
            // console.log(ev.dataTransfer.getData("text/plain"));
            let _start = event.start
              .clone()
              .startOf("day")
              .add(
                (eventSize.top / 100) * (AllDayHour * OneHourMinutes),
                "minutes"
              );
            let _end = _start
              .clone()
              .add(
                (eventSize.height / 100) * (AllDayHour * OneHourMinutes),
                "minutes"
              );
            onEventResize &&
              onEventResize({
                start: _start,
                end: _end,
                event: {
                  start: _start,
                  end: _end,
                  data: event.data
                }
              });
          }}
          item
          className={clsx(classes.resize__handle, classes.resize__handle__top)}
        >
          Handle
        </Grid>
        {event.data.title}
        <Grid
          item
          className={clsx(
            classes.resize__handle,
            classes.resize__handle__bottom
          )}
          draggable={true}
          onDragStart={ev => {
            ev.stopPropagation();
            ev.nativeEvent.stopImmediatePropagation();
            setIsResizing(true);
            console.log("onDragStart-Resize", ev);
            delete event.friends;
            ev.dataTransfer.setDragImage(
              document.createElement("div"),
              ev.nativeEvent.offsetX,
              ev.nativeEvent.offsetY
            );
            ev.dataTransfer.setData(
              "text/plain",
              JSON.stringify({
                ...event,
                start: event.start.unix(),
                end: event.end.unix(),
                x: ev.nativeEvent.offsetX,
                y: ev.nativeEvent.offsetY,
                type: "resize"
              })
            );
          }}
          onDrag={ev => {
            ev.persist();
            ev.stopPropagation();
            ev.nativeEvent.stopImmediatePropagation();
            ev.preventDefault();
            ev.dataTransfer.dropEffect = "move";
            throttle(handleLowerResize(ev.nativeEvent), 500);
          }}
          onDragEnd={ev => {
            setIsResizing(false);
            let _start = event.start
              .clone()
              .startOf("day")
              .add(
                (eventSize.top / 100) * (AllDayHour * OneHourMinutes),
                "minutes"
              );
            let _end = _start
              .clone()
              .add(
                (eventSize.height / 100) * (AllDayHour * OneHourMinutes),
                "minutes"
              );
            onEventResize &&
              onEventResize({
                start: _start,
                end: _end,
                event: {
                  start: _start,
                  end: _end,
                  data: event.data
                }
              });
          }}
        >
          Handle
        </Grid>
      </Grid>
    </Grid>
  );
};
export default EventItem;
