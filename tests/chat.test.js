import {
  getAllHubs,
  getHubData,
  getChannelData,
  sendMessage,
} from "@/app/(modules)/services/chat";
import {
  hubTable,
  channelTable,
  messageTable,
} from "@/app/(modules)/db/schema";

import { eq } from "drizzle-orm";
import { jest } from "@jest/globals";

// Mock functions
const insertValues = jest.fn().mockReturnThis();

// Mock database module
const db = {
  query: {
    hubTable: {
      findFirst: undefined,
      findMany: undefined,
    },
    channelTable: {
      findFirst: undefined,
    },
    messageTable: {
      findFirst: undefined,
    },
  },
  insert: (table) => ({
    values: insertValues,
    returning: undefined,
  }),
};

describe("Chat Service", () => {
  afterEach(() => {
    jest.clearAllMocks();

    db.query.hubTable.findMany = undefined;
    db.query.hubTable.findFirst = undefined;
    db.query.channelTable.findFirst = undefined;
    db.insert = (table) => ({
      values: insertValues,
      returning: undefined,
    });
  });

  it("should return all hubs", async () => {
    const hubs = [
      { id: "1", name: "Hub 1" },
      { id: "2", name: "Hub 2" },
    ];
    db.query.hubTable.findMany = jest.fn().mockResolvedValue(hubs);

    const result = await getAllHubs(db);

    expect(result).toEqual({ hubs });
    expect(db.query.hubTable.findMany).toHaveBeenCalledTimes(1);
  });

  it("should return hub data if hub exists", async () => {
    const hub = {
      id: "1",
      name: "Hub 1",
      description: "A test hub",
      channels: [{ id: "1", name: "Channel 1" }],
    };
    db.query.hubTable.findFirst = jest.fn().mockResolvedValue(hub);

    const result = await getHubData(db, "1");

    expect(result).toEqual(hub);
    expect(db.query.hubTable.findFirst).toHaveBeenCalledWith({
      where: eq(hubTable.id, "1"),
      with: { channels: true },
    });
  });

  it("should return an error if hub does not exist", async () => {
    db.query.hubTable.findFirst = jest.fn().mockResolvedValue(null);

    const result = await getHubData(db, "1");

    expect(result).toEqual({
      error: "Hub not found",
      errorCode: 404,
    });
  });

  it("should return channel data if channel exists", async () => {
    const channel = {
      id: "1",
      name: "Channel 1",
      messages: [{ id: "1", text: "Hello" }],
    };
    db.query.channelTable.findFirst = jest.fn().mockResolvedValue(channel);

    const result = await getChannelData(db, "1");

    expect(result).toEqual(channel);
    expect(db.query.channelTable.findFirst).toHaveBeenCalledWith({
      where: eq(channelTable.id, "1"),
      with: {
        messages: {
          orderBy: expect.any(Function),
          limit: 50,
        },
      },
    });
  });

  it("should return an error if channel does not exist", async () => {
    db.query.channelTable.findFirst = jest.fn().mockResolvedValue(null);

    const result = await getChannelData(db, "1");

    expect(result).toEqual({
      error: "Channel not found",
      errorCode: 404,
    });
  });

  it("should successfully send a message if the channel exist", async () => {
    const channel = { id: "1", hubId: "1" };
    const message = [
      { id: "1", text: "Hello", channelId: "1", userId: "user1" },
    ];

    db.query.channelTable.findFirst = jest.fn().mockResolvedValue(channel);
    db.insert = (table) => ({
      values: insertValues,
      returning: jest.fn().mockResolvedValue(message),
    });

    const result = await sendMessage(db, "1", {
      text: message[0].text,
      authorId: message[0].userId,
    });

    expect(result).toEqual({ success: true, message: message[0] });
    expect(db.query.channelTable.findFirst).toHaveBeenCalledWith({
      where: eq(channelTable.id, "1"),
    });
    expect(db.insert(messageTable).values.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        text: message[0].text,
        userId: message[0].userId,
        channelId: channel.id,
      })
    );
  });

  it("should return an error if channel does not exist for sent message", async () => {
    db.query.channelTable.findFirst = jest.fn().mockResolvedValue(null);

    const result = await sendMessage(db, "1", {
      text: "Hello",
      authorId: "testuser",
    });

    expect(result).toEqual({ error: "Channel not found", errorCode: 404 });
    expect(db.query.channelTable.findFirst).toHaveBeenCalledWith({
      where: eq(channelTable.id, "1"),
    });
    expect(insertValues).not.toHaveBeenCalled();
  });
});
