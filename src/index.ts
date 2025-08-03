import express from "express";
import { prismaClient } from "./db";

import { z } from "zod";

export const app = express();
app.use(express.json());

const input = z.object({
  a: z.number(),
  b: z.number(),
});

app.get("/sum", (req, res) => {
  const parsedResponse = input.safeParse({
    a: Number(req.headers["a"]),
    b: Number(req.headers["b"]),
  });

  if (!parsedResponse.success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  const answer = parsedResponse.data.a + parsedResponse.data.b;

  res.json({
    answer,
  });
});

app.post("/sum", async (req, res) => {
  const parsedResponse = input.safeParse(req.body);

  if (!parsedResponse.success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }

  let a, b;
  a = parsedResponse.data.a;
  b = parsedResponse.data.b;

  if (a > 10000000 || b > 10000000) {
    return res.status(422).json({
      message: "Sorry we dont support big numbers",
    });
  }

  const answer = a + b;

  await prismaClient.sum.create({
    data: {
      a: parsedResponse.data.a,
      b: parsedResponse.data.b,
      result: answer,
    },
  });

  res.json({
    answer,
  });
});

app.post("/multiply", async (req, res) => {
  const parsedResponse = input.safeParse(req.body);

  if (!parsedResponse.success) {
    return res.status(411).json({
      message: "Incorrect inputs",
    });
  }
  const a = parsedResponse.data.a;
  const b = parsedResponse.data.b;

  const result = a * b;

  const request = await prismaClient.request.create({
    data: {
      a,
      b,
      type: "Multiply",
      answer: result,
    },
  });

  res.json({
    answer: request.answer,
    id: request.id,
  });
});
