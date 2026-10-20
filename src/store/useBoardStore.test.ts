import { beforeEach, describe, expect, it } from "vitest";
import { createSampleBoard } from "@/lib/sampleData";
import { parseBoard } from "@/lib/schema";
import { HISTORY_LIMIT, useBoardStore } from "./useBoardStore";

const store = () => useBoardStore.getState();
const cardIds = (columnId: string) => store().columns[columnId].cardIds;

beforeEach(() => {
  useBoardStore.setState({ ...createSampleBoard(), past: [], future: [] });
});

describe("useBoardStore", () => {
  it("moveCard reorders within the same column", () => {
    store().moveCard("c1", "todo", 2);
    expect(cardIds("todo")).toEqual(["c2", "c3", "c1"]);
  });

  it("moveCard moves a card across columns", () => {
    store().moveCard("c1", "doing", 1);
    expect(cardIds("todo")).toEqual(["c2", "c3"]);
    expect(cardIds("doing")).toEqual(["c4", "c1", "c5", "c6"]);
  });

  it("moveCard moves a card to the end of a column", () => {
    store().moveCard("c1", "done", 99);
    expect(cardIds("done")).toEqual(["c7", "c8", "c9", "c1"]);
  });

  it("moveCard to the same position does not create history", () => {
    store().moveCard("c1", "todo", 0);
    expect(store().past).toHaveLength(0);
  });

  it("deleteColumn also removes its cards", () => {
    store().deleteColumn("todo");
    expect(store().columns.todo).toBeUndefined();
    expect(store().columnOrder).toEqual(["doing", "done"]);
    for (const id of ["c1", "c2", "c3"]) expect(store().cards[id]).toBeUndefined();
  });

  it("undo / redo restore previous and next states", () => {
    store().deleteCard("c1");
    store().addColumn("Review");
    expect(store().columnOrder).toHaveLength(4);

    store().undo();
    expect(store().columnOrder).toHaveLength(3);
    expect(store().cards.c1).toBeUndefined();

    store().undo();
    expect(store().cards.c1).toBeDefined();
    expect(cardIds("todo")).toEqual(["c1", "c2", "c3"]);

    store().redo();
    expect(store().cards.c1).toBeUndefined();
    store().redo();
    expect(store().columnOrder).toHaveLength(4);
  });

  it("a new change clears the redo stack", () => {
    store().deleteCard("c1");
    store().undo();
    store().deleteCard("c2");
    expect(store().future).toHaveLength(0);
  });

  it(`keeps at most ${HISTORY_LIMIT} history entries`, () => {
    for (let i = 0; i < HISTORY_LIMIT + 10; i++) store().addColumn(`Column ${i}`);
    expect(store().past).toHaveLength(HISTORY_LIMIT);
  });

  it("addCard and updateCard", () => {
    store().addCard("todo", { title: "  New  ", priority: "high", tags: ["x"] });
    const id = cardIds("todo").at(-1) ?? "";
    expect(store().cards[id]).toMatchObject({ title: "New", priority: "high", tags: ["x"] });

    store().updateCard(id, { title: "Renamed" });
    expect(store().cards[id].title).toBe("Renamed");
  });

  it("ignores blank titles", () => {
    store().addColumn("   ");
    store().addCard("todo", { title: " ", priority: "low", tags: [] });
    expect(store().past).toHaveLength(0);
  });
});

describe("parseBoard", () => {
  it("accepts a valid board", () => {
    expect(parseBoard(createSampleBoard())).not.toBeNull();
  });

  it("rejects corrupt data", () => {
    expect(parseBoard({ cards: {}, columns: {} })).toBeNull();
    const board = createSampleBoard();
    board.columns.todo.cardIds.push("missing");
    expect(parseBoard(board)).toBeNull();
  });
});
