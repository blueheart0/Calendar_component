import React, { useReducer } from "react";

const initialState = {
  events: []
};
const EventsContext = React.createContext();
const EVENTS = {
  ADD: "EVENTS>ADD"
};
const reducer = (state, action) => {
  switch (action.type) {
    case EVENTS.ADD:
      return { ...state, events: state.events.push(action.target) };
    // case EVENTS.MODIFY:
    //     break;
    // case EVENT.DELETE:
    //     break;
    default:
      return { ...state };
  }
};
const EventsContextConsumer = EventsContext.Consumer;
const EventsContextProvider = props => {
  const [eventsContext, dispatchEvents] = useReducer(reducer, {
    ...initialState,
    events: props.events
  });
  const value = {
    value: eventsContext,
    dispatchEvents
  };
  return (
    <EventsContext.Provider value={value}>
      {props.children}
    </EventsContext.Provider>
  );
};
export default EventsContextProvider;
export { EventsContext, EventsContextConsumer };
