import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import HeroSection from "../Components/HeroSection";
import { MemoryRouter } from "react-router-dom";

// Mock hero image import
jest.mock("../images/HeroImage.jpg", () => "mock-hero-image.jpg");

// Mock config
jest.mock("../config", () => ({
  API_BASE_URL: "http://mock-api",
}));

describe("HeroSection", () => {
  beforeEach(() => {
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ name: "Test Business" }]),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function renderHero() {
    render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>
    );

    // Let the effect settle to avoid act warnings in tests
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://mock-api/api/business-info/"
      );
    });
  }

  it("renders default title before fetch resolves", () => {
    render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>
    );

    expect(screen.getByText(/Royal Auto and Body Repair/i)).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /hero/i })).toBeInTheDocument();
  });

  it("renders business name after fetch", async () => {
    await renderHero();

    expect(await screen.findByText(/Test Business/i)).toBeInTheDocument();
  });

  it("renders the booking button linking to /appointments", async () => {
    await renderHero();

    const button = screen.getByRole("button", { name: /book an appointment/i });
    expect(button).toBeInTheDocument();

    const link = button.closest("a");
    expect(link).toHaveAttribute("href", "/appointments");
  });

  it("sets the background image style", async () => {
    await renderHero();

    const section = screen.getByRole("region", { name: /hero/i });
    expect(section).toHaveStyle(
      `background-image: url(mock-hero-image.jpg)`
    );
  });

  it("shows fallback title if fetch fails", async () => {
    jest.restoreAllMocks();
    jest.spyOn(global, "fetch").mockImplementationOnce(() => Promise.reject("API error"));

    render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Royal Auto and Body Repair/i)).toBeInTheDocument();
  });
});