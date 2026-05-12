import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AppStepThree from "./AppointmentComponents/AppStepThree";

describe("AppStepThree (Date and Time)", () => {
	const REAL_DATE = Date;

	beforeAll(() => {
		// Freeze system time to 2026-04-23 for deterministic tests
		jest.useFakeTimers("modern");
		jest.setSystemTime(new Date("2026-04-23T00:00:00"));
	});

	afterAll(() => {
		jest.useRealTimers();
		global.Date = REAL_DATE;
	});

	test("selecting a valid future date calls onSelectDate and clears time", () => {
		const onSelectDate = jest.fn();
		const onSelectTime = jest.fn();

		render(<AppStepThree selectedDate={null} selectedTime={null} onSelectDate={onSelectDate} onSelectTime={onSelectTime} />);

		// April 24, 2026 should be selectable (day after frozen today)
		const apr24 = screen.getByLabelText(/Apr 24 2026/);
		expect(apr24).toBeInTheDocument();
		expect(apr24).not.toBeDisabled();

		fireEvent.click(apr24);

		expect(onSelectDate).toHaveBeenCalledTimes(1);
		const calledDate = onSelectDate.mock.calls[0][0];
		expect(calledDate.getFullYear()).toBe(2026);
		expect(calledDate.getMonth()).toBe(3); // April (0-indexed)
		expect(calledDate.getDate()).toBe(24);
		expect(onSelectTime).toHaveBeenCalledWith(null);
	});

	test("past dates are disabled and cannot be selected", () => {
		const onSelectDate = jest.fn();
		render(<AppStepThree selectedDate={null} selectedTime={null} onSelectDate={onSelectDate} onSelectTime={() => {}} />);

		// April 22, 2026 is before the frozen today (Apr 23)
		const apr22 = screen.getByLabelText(/Apr 22 2026/);
		expect(apr22).toBeDisabled();
		fireEvent.click(apr22);
		expect(onSelectDate).not.toHaveBeenCalled();
	});

	test("Sundays are disabled and cannot be selected", () => {
		const onSelectDate = jest.fn();
		render(<AppStepThree selectedDate={null} selectedTime={null} onSelectDate={onSelectDate} onSelectTime={() => {}} />);

		// April 26, 2026 is a Sunday
		const apr26 = screen.getByLabelText(/Apr 26 2026/);
		expect(apr26).toBeDisabled();
		fireEvent.click(apr26);
		expect(onSelectDate).not.toHaveBeenCalled();
	});

	test("selecting same-day shows notice and disables time slots", () => {
		const onSelectDate = jest.fn();
		const onSelectTime = jest.fn();

		// Provide selectedDate as today so time slots render, then click the same-day cell to trigger notice
		const today = new Date("2026-04-23T00:00:00");
		render(<AppStepThree selectedDate={today} selectedTime={null} onSelectDate={onSelectDate} onSelectTime={onSelectTime} />);

		const apr23Btn = screen.getByLabelText(/Apr 23 2026/);
		expect(apr23Btn).toBeInTheDocument();
		expect(apr23Btn).not.toBeDisabled();

		fireEvent.click(apr23Btn);

		// Same-day notice should appear
		expect(screen.getByText(/Same-day scheduling may be available by phone/i)).toBeInTheDocument();

		// Time slots container should render but buttons must be disabled when same-day notice is active
		const firstSlotBtn = screen.getByRole('button', { name: /8AM/ });
		expect(firstSlotBtn).toBeDisabled();
	});
});
