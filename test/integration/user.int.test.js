import httpMocks from "node-mocks-http";
import mongoose from "mongoose";
import app, { test } from "../../src/server";
import request from "supertest";
import { Key } from "../../config/Key";
import faker from "faker";

let req = httpMocks.createRequest();
let res = httpMocks.createResponse();
let next = jest.fn();

let testData = [];

beforeAll(async () => {
  await test();
  await mongoose.connect(Key, {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  });

  // only for test
  for (let i = 0; i < 15; i++) {
    let createData = {};
    createData.name = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };
    createData.email = faker.internet.email();
    createData.password = faker.internet.password();
    testData.push(createData);
  }
});
afterAll(() => {
  mongoose.disconnect();
});

describe("/user POST", () => {
  it("POST /user", async () => {
    // run at least more than two times
    const index = Math.floor(Math.random() * 15);
    const response = await request(app).post("/user").send(testData[index]);

    expect(response.statusCode).toBe(201);
    expect(response.body.name).toStrictEqual(testData[index].name);
    expect(response.body.email).toBe(testData[index].email);
  });
  it("POST /user incorrect user data", async () => {
    const response = await request(app)
      .post("/user")
      .send({
        email: "east2@naver.com",
        name: {
          firstName: "Kim",
          lastName: "East",
        },
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toStrictEqual({ message: "incorrect form" });
  });
});
describe("/user GET", () => {
  let forCheck;
  beforeEach(async () => {
    const response = await request(app).get("/user");
    forCheck = response.body[2];
  });
  it("GET all users", async () => {
    const response = await request(app).get("/user");

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body[0].email).toBeDefined();
    expect(response.body[0].password).toBeDefined();
    expect(response.body[0].name).toBeDefined();
  });
  it("GET user by id", async () => {
    const response = await request(app).get(`/user/${forCheck._id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe(forCheck.email);
    expect(response.body.password).toBe(forCheck.password);
    expect(response.body.name).toStrictEqual(forCheck.name);
  });
  it("GET handle error when user id is not found", async () => {
    const response = await request(app).get(`/user/60c9b892ceec351fb41b84e0`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toStrictEqual({ message: "no user found" });
  });
});

describe("/user PUT", () => {
  let forCheck;
  beforeEach(async () => {
    const response = await request(app).get("/user");
    forCheck = response.body[1];
  });
  it("PUT user by id ", async () => {
    const dataModified = {
      email: faker.internet.email(),
      name: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
      },
      password: faker.internet.password(),
    };
    const response = await request(app)
      .put(`/user/${forCheck._id}`)
      .send(dataModified);

    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe(dataModified.email);
    expect(response.body.name).toStrictEqual(dataModified.name);
  });
  it("PUT handle error when user id is not found", async () => {
    const response = await request(app)
      .put(`/user/60c9b892ceec351fb41b84e0`)
      .send({});

    expect(response.statusCode).toBe(404);
    expect(response.body).toStrictEqual({ message: "no user found" });
  });
});

describe("/user DEL", () => {
  let forCheck;
  beforeAll(async () => {
    const response = await request(app).get("/user");
    forCheck = response.body[1];
  });
  it("DEL user by id", async () => {
    const response = await request(app).delete(`/user/${forCheck._id}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(forCheck);
  });
  it("DEL handle error when user id is not found", async () => {
    const response = await request(app).delete(`/user/${forCheck._id}`);

    expect(response.statusCode).toBe(404);
    expect(response.body).toStrictEqual({
      message: "no user found",
    });
  });
});
