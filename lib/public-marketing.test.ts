import { describe, expect, it } from "vitest";

import { getCourse } from "./courses";
import {
  programmeComparison,
  programmeDelivery,
  programmePackages,
  programmeStages,
  publicProduct,
  publicTeam,
} from "./public-marketing";

describe("public marketing contract", () => {
  it("keeps the three-stage programme and corrected delivery model", () => {
    expect(programmeStages.map((stage) => stage.title)).toEqual([
      "Electronic concepts",
      "Breadboard build / test",
      "KiCad schematic & PCB design",
    ]);
    expect(programmeDelivery).toMatchObject({
      weeks: 3,
      liveSessions: 6,
      schoolPracticals: 2,
      practicalMinutes: 150,
    });
  });

  it("keeps approved cohort pricing and full-capacity arithmetic", () => {
    expect(programmePackages.map(({ priceHkd, maxLearners }) => priceHkd / maxLearners)).toEqual([
      32000 / 12,
      2080,
      1880,
    ]);
    expect(programmePackages[1].badge).toBe("Designed for one class");
  });

  it("keeps all six public roles and the user's corrected name order", () => {
    expect(publicTeam).toHaveLength(6);
    expect(publicTeam.find((member) => member.id === "edison-chan")?.role).toBe(
      "Web Integration Lead & AI Bot Developer",
    );
    expect(publicTeam.find((member) => member.id === "shi-zheng-hang" )?.name).toBe("Zheng Hang Shi");
    expect(publicTeam.find((member) => member.id === "shi-lin-han")?.name).toBe("Yi Lin Shi");
  });

  it("retains comparison price units and honest coverage labels", () => {
    expect(programmeComparison.offers.map((offer) => offer.price)).toEqual([
      "HK$2,080 per learner at full 25-learner capacity",
      "≈ HK$16,650 per classroom kit for up to 24 learners",
      "HK$6,680 per learner per module",
      "HK$4,620 per learner, plus HK$180 new-student registration",
    ]);
    expect(programmeComparison.offers[2].coverage).toContain("prototype-listed");
  });

  it("uses DrawerSense publicly without changing the internal course key", () => {
    expect(publicProduct.name).toBe("DrawerSense Mini");
    expect(getCourse("open-guard-mini")?.slug).toBe("open-guard-mini");
    expect(JSON.stringify({ publicProduct, programmeStages })).not.toContain("correctIndex");
  });
});
