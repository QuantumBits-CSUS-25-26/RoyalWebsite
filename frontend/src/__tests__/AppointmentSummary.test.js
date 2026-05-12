import React from "react";
import { render, screen } from "@testing-library/react";
import AppointmentSummary from "../Components/AppointmentSummary";

describe("RW-229 AppointmentSummary.test.js", () => {
  test("renders fallback when no appointments", () => {
    render(<AppointmentSummary appointments={[]} />);
    expect(screen.getByText(/appointment summary/i)).toBeInTheDocument();
    expect(screen.getByText(/no appointments/i)).toBeInTheDocument();
  });

  test("renders appointment rows", () => {
    render(
      <AppointmentSummary
        appointments={[
          {
            appointment_id: 1,
            service_type: "Oil Change",
            scheduled_at: "2026-04-23T10:00:00Z",
            cost: "65.00",
            vehicle: { make: "Honda", model: "Civic" },
          },
        ]}
      />
    );

    expect(screen.getByText("Oil Change")).toBeInTheDocument();
    expect(screen.getByText("Honda Civic")).toBeInTheDocument();
    expect(screen.getByText("$65.00")).toBeInTheDocument();
  });
});
