import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import InfoBar from "./InfoBar";

jest.mock("../config", () => ({
  API_BASE_URL: "http://test-api.com",
}));

describe("InfoBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

    test("renders without crashing", async () => {
    global.fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue([]),
    });

    render(<InfoBar />);

    await waitFor(() => {
        expect(document.querySelector(".info-bar")).toBeInTheDocument();
    });
    });

  test("fetches and displays business info", async () => {
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([
        {
          phone: "123-456-7890",
          address: "123 Main St",
          hours: "9am - 5pm",
        },
      ]),
    });

    render(<InfoBar />);

    await waitFor(() => {
      expect(screen.getByText("123-456-7890")).toBeInTheDocument();
    });

    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText("9am - 5pm")).toBeInTheDocument();
  });

  test("handles empty API response gracefully", async () => {
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([]),
    });

    render(<InfoBar />);

    await waitFor(() => {
      expect(document.querySelector(".info-bar")).toBeInTheDocument();
    });

    expect(screen.queryByText("123-456-7890")).not.toBeInTheDocument();
  });

  test("handles missing fields in API response", async () => {
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([
        {
          phone: "555-555-5555",
          hours: "10am - 6pm",
        },
      ]),
    });

    render(<InfoBar />);

    await waitFor(() => {
      expect(screen.getByText("555-555-5555")).toBeInTheDocument();
    });

    expect(screen.getByText("10am - 6pm")).toBeInTheDocument();
  });

  test("only calls API once on mount", async () => {
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue([
        {
          phone: "111-111-1111",
          address: "Test Address",
          hours: "Always",
        },
      ]),
    });

    render(<InfoBar />);

    await waitFor(() => {
      expect(screen.getByText("111-111-1111")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});