import c from "./html/classes";

type Increment = "millisecond" | "second" | "minute" | "hour" | "day" | "month";

type Accepted = DateFunctions | Date | number | string;

function Pad(num: number, size: number) {
  let res = num.toString();
  while (res.length < size) res = "0" + res;
  return res;
}

export default class DateFunctions {
  readonly #time: number;

  static get DaysOfTheWeek() {
    const result: Array<DateFunctions> = [];
    const start = new Date("2000-01-01");
    start.setDate(1);
    for (let i = 1; i <= 7; i++) {
      start.setDate(i + 2);
      result.push(new DateFunctions(start));
    }

    return result;
  }

  constructor(data: Accepted) {
    if (typeof data === "number") this.#time = data;
    else if (typeof data === "string") this.#time = new Date(data).getTime();
    else if (data instanceof Date) this.#time = data.getTime();
    else this.#time = data.#time;
  }

  get month() {
    return new Date(this.#time).getMonth();
  }

  get month_string() {
    return new Date(this.#time).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }

  get day_of_month() {
    return new Date(this.#time).getDate();
  }

  get day_of_week_string() {
    return new Date(this.#time).toLocaleDateString(undefined, {
      weekday: "long",
    });
  }

  get date_string() {
    return new Date(this.#time).toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  }

  get value_string() {
    const result = new Date(this.#time);
    return `${result.getFullYear()}-${Pad(result.getMonth() + 1, 2)}-${Pad(
      result.getDate(),
      2
    )}`;
  }

  difference(comparitor: Accepted) {
    const against = new DateFunctions(comparitor);
    return this.#time - against.#time;
  }

  same_day(comparitor: Accepted) {
    const against = new DateFunctions(comparitor);

    return this.value_string === against.value_string;
  }

  plus(unit: Increment, amount: number) {
    switch (unit) {
      case "millisecond":
        return new DateFunctions(this.#time + amount);
      case "second":
        return new DateFunctions(this.#time + amount * 1000);
      case "minute":
        return new DateFunctions(this.#time + amount * 60 * 1000);
      case "hour":
        return new DateFunctions(this.#time + amount * 60 * 60 * 1000);
      case "day":
        const date = new Date(this.#time);
        date.setDate(date.getDate() + amount);
        return new DateFunctions(date);
      case "month":
        const month = new Date(this.#time);
        month.setMonth(month.getMonth() + amount);
        return new DateFunctions(month);
    }
  }

  get start_of_day() {
    const result = new Date(this.#time);
    result.setHours(0, 0, 0, 0);
    return new DateFunctions(result);
  }

  get start_of_month() {
    const result = new Date(this.#time);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return new DateFunctions(result);
  }

  get day_of_week() {
    const result = new Date(this.#time);
    return result.getDay();
  }

  get days_in_month() {
    const result = new Date(this.#time);
    return new Date(result.getFullYear(), result.getMonth(), 0).getDate();
  }

  get start_of_week() {
    const result = new Date(this.#time);
    const day = result.getDay();
    const diff = result.getDate() - day + (day == 0 ? -6 : 1);
    return new DateFunctions(new Date(result.setDate(diff)));
  }

  month_model(selected: string) {
    const result: Array<{ class: string; data: DateFunctions }> = [];
    const start_of_month = this.start_of_month;
    const start = start_of_month.start_of_week;
    let current = start;
    for (let w = 0; w < 6; w++) {
      for (let i = 0; i < 7; i++) {
        result.push({
          class: c(
            "day",
            "option",
            ["weekend", current.day_of_week === 0 || current.day_of_week === 6],
            ["wrong-month", current.month !== this.month],
            ["current", current.same_day(selected)]
          ),
          data: current,
        });
        current = current.plus("day", 1);
      }
    }

    return result;
  }
}
