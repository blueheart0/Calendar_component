import moment from "moment";
import "moment-timezone";
import ko from "moment/locale/ko";

moment.defineLocale("ko", ko);

export { default as CCCalendar } from "./CCCalendar";
