import { describe, expect, test } from "bun:test";
import { app } from "../src/index";
import { calculateFlowerState, evaluateInactiveState } from "../src/modules/garden/garden.state-machine";
import { FlowerState, MoodType } from "../src/common/types";

describe("Backend State Machine & Core API", () => {
  test("Flower state machine streak calculation", () => {
    const res = calculateFlowerState(
      FlowerState.TICH_CUC,
      "2026-10-08",
      "2026-10-09",
      6,
      80,
      MoodType.HAPPY
    );
    expect(res.streak).toBe(7);
    expect(res.state).toBe(FlowerState.CHAM_HOC);
    expect(res.storyMessage).toContain("hào quang");
  });

  test("Evaluate inactive states (thieu_nuoc & heo_kho)", () => {
    const thirsty = evaluateInactiveState("2026-10-05", "2026-10-09");
    expect(thirsty.state).toBe(FlowerState.THIEU_NUOC);

    const wilting = evaluateInactiveState("2026-08-01", "2026-10-09");
    expect(wilting.state).toBe(FlowerState.HEO_KHO);
  });

  test("Root healthcheck endpoint", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("healthy");
  });

  test("Diagnostics endpoint returns questions", async () => {
    const res = await app.request("/api/diagnostics/Toán%20học");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });
});
