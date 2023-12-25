import { Pluralize } from "./pluralize";

type Language = "english" | "russian";

const languages = {
  russian: {
    d: {
      oneObject: "день",
      someObjects: "дня",
      manyObjects: "дней",
    },
    h: {
      oneObject: "час",
      someObjects: "часа",
      manyObjects: "часов",
    },
    m: {
      oneObject: "минута",
      someObjects: "минуты",
      manyObjects: "минут",
    },
    s: {
      oneObject: "секунда",
      someObjects: "секунды",
      manyObjects: "секунд",
    },
  },
  english: {
    d: {
      oneObject: "day",
      manyObjects: "days",
    },
    h: {
      oneObject: "hour",
      manyObjects: "hours",
    },
    m: {
      oneObject: "minute",
      manyObjects: "minutes",
    },
    s: {
      oneObject: "second",
      manyObjects: "seconds",
    },
  },
};

export function getDuration(seconds: number, language: Language) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const values = ["d", "h", "m", "s"] as const;
  let return_value = "";

  for (let i = 0; i < values.length; i++) {
    const value = eval(values[i]);

    if (value > 0) {
      const word = Pluralize(value, "", languages[language][values[i]]);
      return_value += `${value} ${word} `;
    }
  }
  return return_value.trim();
}
