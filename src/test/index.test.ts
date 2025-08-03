import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../index";
import { prismaClient } from "../__mocks__/db";

// vi.mock("../db", () => ({
//   prismaClient: {
//     sum: { create: vi.fn() },
//     request: { create: vi.fn() },
//   },
// }));

vi.mock("../db");

describe("POST /sum", () => {
  it("should return the sum of two numbers", async () => {
    const res = await request(app).post("/sum").send({
      a: 1,
      b: 2,
    });
    // console.log(res);
    expect(res.statusCode).toBe(200);
    expect(res.body.answer).toBe(3);
  });
  it("should fail for incorrect inputs", async () => {
    const res = await request(app).post("/sum").send({
      a: ["12,3"],
    });
    expect(res.statusCode).toBe(411);
    expect(res.body.message).toBe("Incorrect inputs");
  });

  it("should fail for large inputs", async () => {
    const res = await request(app).post("/sum").send({
      a: 1000000000000000,
      b: 1,
    });
    expect(res.statusCode).toBe(422);
    expect(res.body.message).toBe("Sorry we dont support big numbers");
  });
});

describe("GET /sum ", () => {
  it("should return the sum of two numbers", async () => {
    const res = await request(app).get("/sum").set({
      a: "1",
      b: "2",
    }).send();
    expect(res.statusCode).toBe(200);
    expect(res.body.answer).toBe(3);
  });

  it("should return 411 if no inputs are provided", async () => {
    const res = await request(app).get("/sum").send();
    expect(res.statusCode).toBe(411);
  });
});

describe("POST /mulitply", () => {
  it("should return the mulitplication of two numbers", async () => {
    prismaClient.request.create.mockResolvedValue({
      id: 1,
      type: "Multiply",
      a: 1,
      b: 2,
      answer: 2,
    });

    vi.spyOn(prismaClient.request, "create");

    const res = await request(app).post("/multiply").send({
      a: 1,
      b: 2,
    });

    expect(prismaClient.request.create).toHaveBeenCalledWith({
      data: {
        a: 1,
        b: 2,
        type: "Multiply",
        answer: 2,
      },
    });
    expect(prismaClient.request.create).toHaveBeenCalledTimes(1);

    expect(res.body.answer).toBe(2);
    expect(res.body.id).toBe(1);
    expect(res.statusCode).toBe(200);
  });
  it("should fail for incorrect inputs", async () => {
    const res = await request(app).post("/multiply").send({
      a: ["12,3"],
    });
    expect(res.statusCode).toBe(411);
    expect(res.body.message).toBe("Incorrect inputs");
  });
});
