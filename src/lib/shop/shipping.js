// Shop shipping prices — shared by the checkout page (display) and the
// server (the amount actually charged), so the two can never disagree.

export const CAPITAL_AREA_POSTCODES = [
  "101", "102", "103", "104", "105", "107", "108", "109", "110", "111",
  "112", "113", "116", "121", "123", "124", "125", "126", "127", "128",
  "129", "130", "132", "150", "155", "170", "172", "200", "201", "202",
  "203", "210", "212", "220", "221", "222", "225", "270", "271", "276",
];

export function isCapitalArea(zip) {
  return CAPITAL_AREA_POSTCODES.includes(String(zip || "").trim());
}

/** option: "location" (pickup point) | "home"; 0 for pickup / unknown */
export function getShippingCost(option, zip) {
  if (!option || !zip) return 0;
  const isCapital = isCapitalArea(zip);
  if (option === "location") return isCapital ? 790 : 990;
  if (option === "home") return isCapital ? 1350 : 1450;
  return 0;
}
