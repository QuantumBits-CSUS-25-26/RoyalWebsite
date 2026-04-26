import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import HeroSection from "../Components/HeroSection";
import { MemoryRouter } from "react-router-dom";

// Mock hero image import
jest.mock("../images/HeroImage.jpg", () => "mock-hero-image.jpg");

// Mock config
jest.mock("../config", () => ({
	API_BASE_URL: "http://mock-api"
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

	it("renders default title before fetch", () => {
		render(
			<MemoryRouter>
				<HeroSection />
			</MemoryRouter>
		);
		expect(screen.getByText(/Royal Auto and Body Repair/i)).toBeInTheDocument();
		expect(screen.getByRole("region", { name: /hero/i })).toBeInTheDocument();
	});

	it("renders business name after fetch", async () => {
		render(
			<MemoryRouter>
				<HeroSection />
			</MemoryRouter>
		);
		await waitFor(() => {
			expect(screen.getByText(/Test Business/i)).toBeInTheDocument();
		});
	});

	it("renders the booking button linking to /admin", () => {
		render(
			<MemoryRouter>
				<HeroSection />
			</MemoryRouter>
		);
		const button = screen.getByRole("button", { name: /book an appointment/i });
		expect(button).toBeInTheDocument();
		const link = button.closest("a");
		expect(link).toHaveAttribute("href", "/admin");
	});

	it("sets the background image style", () => {
		render(
			<MemoryRouter>
				<HeroSection />
			</MemoryRouter>
		);
		const section = screen.getByRole("region", { name: /hero/i });
		expect(section).toHaveStyle({ backgroundImage: expect.stringContaining("mock-hero-image.jpg") });
	});
    	
    it("shows fallback title if fetch fails", async () => {
		jest.spyOn(global, "fetch").mockImplementationOnce(() => Promise.reject("API error"));
		render(
			<MemoryRouter>
				<HeroSection />
			</MemoryRouter>
		);
		// Wait for useEffect to run
		await waitFor(() => {
			expect(screen.getByText(/Royal Auto and Body Repair/i)).toBeInTheDocument();
		});
	});
});
