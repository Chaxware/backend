import { createUser } from "@/app/(modules)/services/auth";
import { userTable, otpTable } from "@/app/(modules)/db/schema";

import { jest } from "@jest/globals";

// Mock functions
const insertUser = jest.fn().mockReturnThis();

// Mock database module
const db = {
  query: {
    userTable: {
      findFirst: undefined,
    },
  },
  insert: (table) => ({
    values: insertUser,
  }),
};

describe("Authentication Service", () => {
  afterEach(() => {
    jest.clearAllMocks();

    db.query.userTable.findFirst = undefined;
  });

  it("should create a new user", async () => {
    db.query.userTable.findFirst = jest.fn().mockResolvedValue(null);

    const response = await createUser(db, {
      username: "testuser",
      email: "test@example.com",
      displayName: "TestUser",
      avatar: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });

    expect(db.query.userTable.findFirst).toHaveBeenCalledTimes(2);
    expect(db.insert(userTable).values.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        username: "testuser",
        email: "test@example.com",
        displayName: "TestUser",
        avatar: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      })
    );

    expect(response).toEqual({ message: "User has been created" });
  });

  it("should create a new user with only necessary data", async () => {
    db.query.userTable.findFirst = jest.fn().mockResolvedValue(null);

    const response = await createUser(db, {
      username: "testuser",
      email: "test@example.com",
    });

    expect(db.query.userTable.findFirst).toHaveBeenCalledTimes(2);
    expect(db.insert(userTable).values.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        username: "testuser",
        email: "test@example.com",
        displayName: "testuser",
        avatar: undefined,
      })
    );

    expect(response).toEqual({ message: "User has been created" });
  });

  it("should return an error if the email already exists", async () => {
    db.query.userTable.findFirst = jest.fn().mockResolvedValueOnce({
      id: "existing-user-id", // Email conflict
    });

    const response = await createUser(db, {
      username: "newuser",
      email: "test@example.com",
    });

    expect(db.query.userTable.findFirst).toHaveBeenCalledTimes(1);
    expect(db.insert(userTable).values).not.toHaveBeenCalled();

    expect(response).toEqual({
      error: "A user with this email already exists",
      errorCode: 400,
    });
  });

  it("should return an error if the username already exists", async () => {
    db.query.userTable.findFirst = jest
      .fn()
      .mockResolvedValueOnce(null) // No email conflict
      .mockResolvedValueOnce({
        id: "existing-user-id", // Username conflict
      });

    const response = await createUser(db, {
      username: "existinguser",
      email: "newemail@example.com",
    });

    expect(db.query.userTable.findFirst).toHaveBeenCalledTimes(2);
    expect(db.insert(userTable).values).not.toHaveBeenCalled();

    expect(response).toEqual({
      error: "A user with this username already exists; Try another username",
      errorCode: 400,
    });
  });
});
