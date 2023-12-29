export function numberWith(number: number | string, seperator: string = " ") {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, seperator);
}
