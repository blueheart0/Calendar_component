import moment from "moment";
import React, { useState } from "react";
import { CCCalendar } from "./Component/CCCalendar";

const events = [
  {
    start: moment().clone(),
    end: moment()
      .clone()
      .add(30, "minute"),
    data: {
      title: "TestEvent-1",
      id: "1"
    }
  },
  {
    start: moment()
      .clone()
      .add(30, "minute"),
    end: moment()
      .clone()
      .add(60, "minute"),
    data: {
      title: "TestEvent-2",
      id: "2"
    }
  }
];

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
      />
    </div>
  );
}

export default App;
