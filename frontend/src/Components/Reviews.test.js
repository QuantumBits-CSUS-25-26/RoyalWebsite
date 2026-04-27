import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Reviews from "./Reviews";
test("shows top three reviews ordered by rating then recency", async () => {
	const reviews = [
		{ author_name: "Reviewer A", rating: 5, time: 200, text: "A" },
		{ author_name: "Reviewer B", rating: 4, time: 300, text: "B" },
		{ author_name: "Reviewer C", rating: 5, time: 100, text: "C" },
		{ author_name: "Reviewer D", rating: 5, time: 250, text: "D" },
	];

	mockFetchSuccess(reviews);

	const { container } = render(<Reviews />);

	await waitFor(() => expect(global.fetch).toHaveBeenCalled());

	// wait until the top reviewer is rendered
	await screen.findByText(/Reviewer D/i);

	// three reviews should be displayed and in order D (5,250), A (5,200), C (5,100)
	const authors = Array.from(container.querySelectorAll('.review-author')).map(n => n.textContent.trim());
	expect(authors.length).toBeGreaterThanOrEqual(3);
	expect(authors[0]).toContain('Reviewer D');
	expect(authors[1]).toContain('Reviewer A');
	expect(authors[2]).toContain('Reviewer C');
});

test("renders static reviews and logs error when fetch fails", async () => {
	mockFetchFailure(500, 'Server Error');

	jest.spyOn(console, 'error').mockImplementation(() => {});

	render(<Reviews />);

	await waitFor(() => expect(global.fetch).toHaveBeenCalled());

	expect(console.error).toHaveBeenCalledWith('Reviews API error', 500, 'Server Error');

	// static review author should be present
	expect(screen.getByText(/Daniel C\./i)).toBeInTheDocument();
});

const sampleReviewsPayload = (reviews) => ({ status: 'OK', result: { reviews } });

const mockFetchSuccess = (reviews) => {
	global.fetch = jest.fn((url) => {
		if (url && url.toString().endsWith('/api/places/reviews')) {
			return Promise.resolve({ ok: true, json: () => Promise.resolve(sampleReviewsPayload(reviews)) });
		}
		return Promise.reject(new Error(`Unhandled fetch: ${url}`));
	});
};

const mockFetchFailure = (status = 500, statusText = 'Server Error') => {
	global.fetch = jest.fn((url) => {
		if (url && url.toString().endsWith('/api/places/reviews')) {
			return Promise.resolve({ ok: false, status, statusText, json: () => Promise.resolve({}) });
		}
		return Promise.reject(new Error(`Unhandled fetch: ${url}`));
	});
};