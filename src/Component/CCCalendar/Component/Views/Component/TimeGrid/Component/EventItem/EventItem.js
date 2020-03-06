import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDrag, useDragLayer } from "react-dnd";

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
      opacity: 0
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
  const eventUpperHandleRef = useRef();
  const stepPercent = useMemo(() => {
    return (step / (AllDayHour * OneHourMinutes)) * 100;
  }, [step]);
  const [eventItemHeight, setEventItemHeight] = useState(
    eventItemRef?.current?.offsetHeight
  );
  const [eventSize, setEventSize] = useState({
    maxFriends: 0,
    top: 0,
    bottom: 0
  });
  const [eventResizeSize, setEventResizeSize] = useState({
    top: 0,
    height: 0
  });
  // console.log(eventItemRef?.current?.offsetTop);
  const [collectedProps, dragRef, previewRef] = useDrag({
    item: {
      id: id,
      type: Symbol.for("EventItemDrag"),
      event: event,
      eventElHeight: eventItemRef?.current?.offsetHeight
    },
    options: {
      eventEl: eventItemRef
    },
    collect: monitor => {
      return {
        isDragging: !!monitor.isDragging()
      };
    }
  });

  const [
    collecteUpperdResizeProps,
    upperResizeRef,
    upperResizePreview
  ] = useDrag({
    item: {
      id: id,
      type: Symbol.for("EventItemResize"),
      event: event,
      eventEl: eventUpperHandleRef
    },
    collect: monitor => {
      // console.log(monitor.getDifferenceFromInitialOffset());
      // if (
      //   monitor.getItemType() === Symbol.for("EventItemResize") &&
      //   event.data.id === monitor.getItem().id
      // ) {
      //   let yPos = monitor.getDifferenceFromInitialOffset()?.y;
      //   let screenHeight = ((AllDayHour * OneHourMinutes) / step) * slotHeight;
      //   return {
      //     id: monitor.getItem().id,
      //     needUpperResize: yPos
      //       ? (Math.abs(yPos) / screenHeight) * 100 >= 1
      //       : false,
      //     upperSize: Math.ceil((yPos / screenHeight) * 100)
      //   };
      // }
    },
    isDragging: monitor => {
      console.log(isDragging);
      setIsDragging(true);
    }
  });
  const collectedLayerProps = useDragLayer(monitor => {
    if (monitor.getItemType() === Symbol.for("EventItemResize")) {
      let yPos = monitor.getDifferenceFromInitialOffset()?.y;
      let screenHeight = ((AllDayHour * OneHourMinutes) / step) * slotHeight;
      return {
        id: monitor.getItem().id,
        needUpperResize: yPos
          ? (Math.abs(yPos) / screenHeight) * 100 >= 1
          : false,
        upperSize: Math.ceil((yPos / screenHeight) * 100)
      };
    }
  });

  const needUpperResize = useMemo(() => {
    // console.log(collectedLayerProps);
    if (!!collectedLayerProps) {
      return {
        id: collectedLayerProps.id,
        need: !!collectedLayerProps?.needUpperResize,
        upperSize: collectedLayerProps?.upperSize
          ? collectedLayerProps.upperSize
          : 0
      };
    } else {
      return {
        id: null,
        need: false,
        upperSize: 0
      };
    }
  }, [collectedLayerProps]);
  useEffect(() => {
    // console.log(collectedLayerProps);
    if (needUpperResize.need && needUpperResize?.id === event.data.id) {
      // console.log("needUpperResize", needUpperResize);
      let _resizeStart =
        needUpperResize.upperSize > 0
          ? event.start
              .clone()
              .subtract(
                AllDayHour *
                  OneHourMinutes *
                  (stepPercent / 100) *
                  needUpperResize.upperSize,
                "minutes"
              )
          : event.start
              .clone()
              .add(
                AllDayHour *
                  OneHourMinutes *
                  (stepPercent / 100) *
                  needUpperResize.upperSize,
                "minutes"
              );
      let _resizeStartMinutes =
        _resizeStart.hours() * OneHourMinutes + _resizeStart.minutes();
      let bottomMinutes =
        event.end.hour() * OneHourMinutes + event.end.minute();
      setEventResizeSize({
        maxFriends: 0,
        friends: 0,
        top: (_resizeStartMinutes / (AllDayHour * OneHourMinutes)) * 100,
        height:
          (bottomMinutes / (AllDayHour * OneHourMinutes) -
            _resizeStartMinutes / (AllDayHour * OneHourMinutes)) *
          100,
        friendsIndex: 0,
        step: step
      });
    }
  }, [needUpperResize]);
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
        friendsIndex: event.friendsIndex ? event.friendsIndex : 0,
        step: step
      });
      setEventResizeSize({
        top: (topMinutes / (AllDayHour * OneHourMinutes)) * 100,
        height:
          (bottomMinutes / (AllDayHour * OneHourMinutes) -
            topMinutes / (AllDayHour * OneHourMinutes)) *
          100
      });
    } else {
      setEventSize({ maxFriends: 0, top: 0, bottom: 0 });
      setEventResizeSize({
        top: 0,
        bottom: 0
      });
    }
  }, [event, slotHeight, step, maxFriends]);
  const [backgroundColor, setBackgroundColor] = useState(
    // () => "#" + Math.floor(Math.random() * 16777215).toString(16)
    "#ffffff"
  );

  const classes = useStyle({
    ...eventSize,
    step: step,
    slotHeight,
    backgroundColor: backgroundColor,
    layoutAlgorithm: layoutAlgorithm
  });

  return (
    <>
      <div className={clsx(classes.root)} ref={previewRef}>
        {event.data.title}
      </div>
      <div
        className={clsx(classes.root)}
        ref={upperResizePreview}
        style={{
          top: `${eventResizeSize.top}%`,
          height: `${eventResizeSize.height}%`
        }}
      >
        {event.data.title}
      </div>
      <Grid
        item
        container
        id={id}
        ref={ref => {
          eventItemRef.current = ref;
          dragRef(ref);
        }}
        data-start={event.start.toString()}
        data-end={event.end.toString()}
        className={clsx(classes.root, { [classes.is__dragging]: isDragging })}
      >
        <Grid className={clsx(classes.event__item)} item container>
          <Grid
            ref={ref => {
              eventUpperHandleRef.current = ref;
              upperResizeRef(ref);
            }}
            id={"DragUpperHandle_" + id}
            item
            className={clsx(
              classes.resize__handle,
              classes.resize__handle__top
            )}
          >
            Handle
          </Grid>
          {event.data.title}
          {/*<Grid*/}
          {/*  item*/}
          {/*  className={clsx(*/}
          {/*    classes.resize__handle,*/}
          {/*    classes.resize__handle__bottom*/}
          {/*  )}*/}
          {/*  draggable={true}*/}
          {/*  onDragStart={ev => {*/}
          {/*    ev.stopPropagation();*/}
          {/*    ev.nativeEvent.stopImmediatePropagation();*/}
          {/*    setIsResizing(true);*/}
          {/*    console.log("onDragStart-Resize", ev);*/}
          {/*    delete event.friends;*/}
          {/*    ev.dataTransfer.setDragImage(*/}
          {/*      document.createElement("div"),*/}
          {/*      ev.nativeEvent.offsetX,*/}
          {/*      ev.nativeEvent.offsetY*/}
          {/*    );*/}
          {/*    ev.dataTransfer.setData(*/}
          {/*      "text/plain",*/}
          {/*      JSON.stringify({*/}
          {/*        ...event,*/}
          {/*        start: event.start.unix(),*/}
          {/*        end: event.end.unix(),*/}
          {/*        x: ev.nativeEvent.offsetX,*/}
          {/*        y: ev.nativeEvent.offsetY,*/}
          {/*        type: "resize"*/}
          {/*      })*/}
          {/*    );*/}
          {/*  }}*/}
          {/*  onDrag={ev => {*/}
          {/*    ev.persist();*/}
          {/*    ev.stopPropagation();*/}
          {/*    ev.nativeEvent.stopImmediatePropagation();*/}
          {/*    ev.preventDefault();*/}
          {/*    ev.dataTransfer.dropEffect = "move";*/}
          {/*    throttle(handleLowerResize(ev.nativeEvent), 500);*/}
          {/*  }}*/}
          {/*  onDragEnd={ev => {*/}
          {/*    setIsResizing(false);*/}
          {/*    let _start = event.start*/}
          {/*      .clone()*/}
          {/*      .startOf("day")*/}
          {/*      .add(*/}
          {/*        (eventSize.top / 100) * (AllDayHour * OneHourMinutes),*/}
          {/*        "minutes"*/}
          {/*      );*/}
          {/*    let _end = _start*/}
          {/*      .clone()*/}
          {/*      .add(*/}
          {/*        (eventSize.height / 100) * (AllDayHour * OneHourMinutes),*/}
          {/*        "minutes"*/}
          {/*      );*/}
          {/*    onEventResize &&*/}
          {/*      onEventResize({*/}
          {/*        start: _start,*/}
          {/*        end: _end,*/}
          {/*        event: {*/}
          {/*          start: _start,*/}
          {/*          end: _end,*/}
          {/*          data: event.data*/}
          {/*        }*/}
          {/*      });*/}
          {/*  }}*/}
          {/*>*/}
          {/*  Handle*/}
          {/*</Grid>*/}
        </Grid>
      </Grid>
    </>
  );
};
export default EventItem;
