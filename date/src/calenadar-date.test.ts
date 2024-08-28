import MockDate from "mockdate";
import {
  today,
  todayTimezone,
} from "./calenadar-date";

describe("date 테스트", () => {
  beforeAll(() => {
    // MockDate.set("2022-07-20T05:35:55.973Z");
  });

  afterAll(() => {
    // MockDate.reset();
  });

  describe("now() 테스트", () => {
    test("ISO 포맷 DateTime 으로 반환되어야 한다.", () => {
      expect(today()).toBe("2022-07-20 14:35:55");
    });
    test("ISO 포맷 DateTime 으로 반환되어야 한다.", () => {
      expect(todayTimezone('America/Los_Angeles')).toBe("2022-07-20 14:35:55");
    });
    test("ISO 포맷 DateTime 으로 반환되어야 한다.", () => {
      expect(todayTimezone('Asia/Seoul')).toBe("2022-07-20 14:35:55");
    });
  });
});
