import moment from "moment";
import React, { useState } from "react";
import { CCCalendar } from "./Component/CCCalendar";

const DummyCount = 10;
const makeData = function*() {
  for (let i = 0; i < DummyCount; i++) {
    let current = moment().add(24 * Math.random(), "hour");
    // let current = moment().add(i, "hour");
    yield {
      start: current.clone(),
      end: current.clone().add(30, "minute"),
      data: {
        title: `TestEvent-${i}`,
        // id: uuid.v4()
        id: i
      }
    };
  }
};

const events = [...makeData()];

function App() {
  const [eventsArr, setEventArr] = useState(events);
  // console.log(eventsArr);
  return (
    <div className="App" style={{ height: "80vh" }}>
      <CCCalendar
        date={moment()}
        events={eventsArr}
        onEventDrop={e => {
          // let _temp = JSON.parse(JSON.stringify(eventsArr));
          let _temp = [...eventsArr];
          _temp[_temp.findIndex(item => item.data.id === e.data.id)] = e;

          // console.log(_temp);
          setEventArr(_temp);
        }}
        onEventResize={e => {
          let _temp = [...eventsArr];
          console.log(e.event);
          _temp[_temp.findIndex(item => item.data.id === e.event.data.id)] =
            e.event;
          console.log(e.event);
          // console.log(_temp);
          setEventArr(_temp);
        }}
      />
    </div>
  );
}

export default App;
