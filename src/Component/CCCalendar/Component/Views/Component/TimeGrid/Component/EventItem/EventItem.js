import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import moment from "moment";
import React, { useEffect, useMemo, useRef, useState } from "react";

const useStyle = makeStyles(theme => ({
  root: {
    position: "absolute",
    width: "100%",
    height: props => `${props.height}%`,
    backgroundColor: props => props.backgroundColor,
    color: "#ffffff",
    top: props => `${props.top}%`,
    userSelect: "none",
    cursor: "pointer"
  },
  is__dragging: {
    // width: 0,
    // height: 0
  }
}));
const EventItem = props => {
  const { event, slotHeight, step, id, onEventDrop } = props;
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState([0, 0]);
  const eventItemRef = useRef();
  // console.log(event.start.minute());
  const eventSize = useMemo(() => {
    if (event && event?.start && event?.end && step && slotHeight) {
      let topMinutes = event.start.hour() * 60 + event.start.minute();
      let bottomMinutes = event.end.hour() * 60 + event.end.minute();
      return {
        // top: (topMinutes / step) * slotHeight,
        top: (topMinutes / (24 * 60)) * 100,
        height: (bottomMinutes / (24 * 60) - topMinutes / (24 * 60)) * 100
      };
    } else {
      return { top: 0, bottom: 0 };
    }
  }, [event, slotHeight, step]);
  const [backgroundColor, setBackgroundColor] = useState(
    // () => "#" + Math.floor(Math.random() * 16777215).toString(16)
    "#050505"
  );
  useEffect(() => {
    if (eventItemRef.current) {
      console.log(eventItemRef);
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
    <>
      <div
        id={id}
        draggable={true}
        ref={eventItemRef}
        onDrop={ev => {
          console.log("EventItem-onDrop", ev);
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
                ((ev.currentTarget.offsetTop +
                  ev.nativeEvent.offsetY -
                  data.y) /
                  ev.currentTarget.offsetParent.scrollHeight),
              "minutes"
            )
            .subtract(
              (24 *
                60 *
                ((ev.currentTarget.offsetTop +
                  ev.nativeEvent.offsetY -
                  data.y) /
                  ev.currentTarget.offsetParent.scrollHeight)) %
                step,
              "minutes"
            );
          // console.log(event.start.toISOString());
          // console.log(_dropStart.toISOString());
          // _dropStart = _dropStart.isSame(event.start) ? event.start : _dropStart;

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
          // setIsHover(true);
          // ev.nativeEvent.offsetY =
          //   ev.nativeEvent.offsetY - (ev.nativeEvent.offsetY % step);
        }}
        onDragEnd={e => {
          e.preventDefault();
          console.log("onDragEnd", e);
          setIsDragging(false);
        }}
      >
        {event.data.title}
      </div>
    </>
  );
};
export default EventItem;
