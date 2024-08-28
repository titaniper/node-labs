import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import duration from "dayjs/plugin/duration";
import customParserFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advanced);
dayjs.extend(duration);
dayjs.extend(customParserFormat);

type DateTime = string;

export function today(): string {
  return dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
}

export function todayTimezone(timezone: string): string {
  return dayjs(new Date()).tz(timezone).format("YYYY-MM-DD HH:mm:ss");
}