import userController from "../../controllers/userController";
import httpMocks from "node-mocks-http";
import incorrectUserData from "../data/incorrectUser.json";
import correctUserData from "../data/correctUserInfo.json";
import arrayUsers from "../data/arrayUsers.json";
import userModel from "../../models/user";

let req;
let res;
let next;

userModel.create = jest.fn();
userModel.find = jest.fn();
userModel.findById = jest.fn();
userModel.findByIdAndUpdate = jest.fn();
userModel.save = jest.fn();
userModel.findByIdAndDelete = jest.fn();

describe("User Controller POST", () => {
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });
  it("should have a function userCreate", async () => {
    expect(typeof userController.userCreate).toBe("function");
  });
  it.each(incorrectUserData)("should handle incorrect request", async () => {
    await userController.userCreate(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toStrictEqual({
      message: "incorrect form",
    });
    expect(res._isEndCalled()).toBeTruthy();
  });
  it("should call User.create", async () => {
    req.body = correctUserData;
    await userController.userCreate(req, res, next);

    expect(userModel.create).toBeCalled();
    expect(userModel.create).toBeCalledWith(correctUserData);
  });
  it("should return status code 201 and new user info in json", async () => {
    req.body = correctUserData;
    userModel.create.mockReturnValue(correctUserData); // 주의
    await userController.userCreate(req, res, next);

    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toStrictEqual(correctUserData);
    expect(res._isEndCalled()).toBeTruthy();
  });
});

describe("User Controller GET", () => {
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });
  it("should have a function getUser()", () => {
    expect(typeof userController.getUsers).toBe("function");
  });
  it("should call userModel.find", async () => {
    await userController.getUsers(req, res, next);

    expect(userModel.find).toBeCalled();
  });
  it("should return status code 200 and user data", async () => {
    userModel.find.mockReturnValue(arrayUsers);
    await userController.getUsers(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toStrictEqual(arrayUsers);
    expect(res._isEndCalled()).toBeTruthy();
  });
  it("should have a function getUserById", () => {
    expect(typeof userController.getUserById).toBe("function");
  });
  it("should call a function userModel.findById", async () => {
    await userController.getUserById(req, res, next);

    expect(userModel.findById).toBeCalled();
  });
  it("should return status code 200 and user data that matches with userId", async () => {
    userModel.findById.mockReturnValue(correctUserData);
    req.params.userId = "60c9b892ceec351fb41b84e5";
    await userController.getUserById(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toStrictEqual(correctUserData);
    expect(res._isEndCalled()).toBeTruthy();
  });
  it("should return status code 500 when ObjectId is invalid", async () => {
    req.params.userId = "60c9b892ceec351";
    await userController.getUserById(req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toStrictEqual({ message: "invalid user id" });
  });
  it("should handle when no userId is found", async () => {
    userModel.findById.mockReturnValue(null);
    await userController.getUserById(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toStrictEqual({ message: "no user found" });
    expect(res._isEndCalled()).toBeTruthy();
  });
});

describe("User Controller PUT", () => {
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });
  it("should have a function userUpdate", () => {
    expect(typeof userController.userUpdate).toBe("function");
  });
  it("should call userModel.findByIdAndUpdate", async () => {
    req.params.userId = "60c9b892ceec351fb41b84e5";
    await userController.userUpdate(req, res, next);

    expect(userModel.findByIdAndUpdate).toBeCalled();
  });
  it("should return status code 200 and updated user info", async () => {
    req.params.userId = "60c9b892ceec351fb41b84e5";
    const fix = {
      email: "eastHoon@naver.com",
      password: "asdok123asdc",
      name: {
        firstName: "modified",
        lastName: "modified",
      },
    };
    req.body = fix;
    userModel.findByIdAndUpdate.mockReturnValue(fix);
    await userController.userUpdate(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toStrictEqual(fix);
  });
  it("should handler when no user is found", async () => {
    userModel.findByIdAndUpdate.mockReturnValue(null);
    req.params.userId = "60c9b892ceec351fb41b84e0";
    await userController.userUpdate(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toStrictEqual({ message: "no user found" });
    expect(res._isEndCalled()).toBeTruthy();
  });
  it("should return status code 500 when ObjectId is invalid", async () => {
    req.params.userId = "60c9b892ceec351";
    await userController.userUpdate(req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toStrictEqual({ message: "invalid user id" });
  });
});

describe("User Controller DEL", () => {
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });
  it("should have a function userDelete", () => {
    expect(typeof userController.userDelete).toBe("function");
  });
  it("should call userModel.findByIdAndDelete", async () => {
    req.params.userId = "60c9b892ceec351fb41b84e5";
    await userController.userDelete(req, res, next);

    expect(userModel.findByIdAndDelete).toBeCalled();
    expect(userModel.findByIdAndDelete).toBeCalledWith(req.params.userId);
  });
  it("should return status code 200 when user datum is deleted", async () => {
    userModel.findByIdAndDelete.mockReturnValue({ pass: "Yes" });
    await userController.userDelete(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._isEndCalled()).toBeTruthy();
  });
  it("should return json of deleted user data", async () => {
    userModel.findByIdAndDelete.mockReturnValue(correctUserData);
    req.params.userId = "60c9b892ceec351fb41b84e5";
    await userController.userDelete(req, res, next);

    expect(res._getJSONData()).toStrictEqual(correctUserData);
  });
  it("should handler when no user is found", async () => {
    userModel.findByIdAndDelete.mockReturnValue(null);
    req.params.userId = "60c9b892ceec351fb41b84e0";
    await userController.userDelete(req, res, next);

    expect(res._getJSONData()).toStrictEqual({ message: "no user found" });
    expect(res.statusCode).toBe(404);
    expect(res._isEndCalled()).toBeTruthy();
  });

  it("should return status code 500 when ObjectId is invalid", async () => {
    req.params.userId = "60c9b892ceec351";
    await userController.userDelete(req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toStrictEqual({ message: "invalid user id" });
  });
});
