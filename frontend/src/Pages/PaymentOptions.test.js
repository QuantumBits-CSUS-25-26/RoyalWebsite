// PaymentOptions.test.jsx
import { render, screen, waitFor } from "@testing-library/react";
import CustomerDashboard from "../CustomerDashboard";
import axios from "axios";

// Mock axios
jest.mock("axios");

describe("CustomerDashboard Payment Options", () => {
    const mockPaymentOptions = [
        { id: 1, name: "Cash", logo: "💵", type: "cash", is_active: true },
        { id: 2, name: "Credit/Debit", logo: "💳", type: "card", is_active: true },
        { id: 3, name: "Apple Pay", logo: "🍏", type: "digital", is_active: true },
        { id: 4, name: "Google Pay", logo: "🅖", type: "digital", is_active: false }, // inactive
    ];

    beforeEach(() => {
        axios.get.mockResolvedValue({ data: mockPaymentOptions });
    });

    it("renders only active payment options", async () => {
        render(<CustomerDashboard />);

        // Wait for API fetch to complete
        await waitFor(() => {
            // Emoji payment options
            expect(screen.getByText("Cash")).toBeInTheDocument();
            expect(screen.getByText("Credit / Debit")).toBeInTheDocument();
            expect(screen.getByText("Apple Pay")).toBeInTheDocument();

            // Inactive option should not appear
            expect(screen.queryByText("Google Pay")).not.toBeInTheDocument();
        });
    });

    it("renders the correct number of payment boxes", async () => {
        render(<CustomerDashboard />);

        await waitFor(() => {
            const boxes = screen.getAllByText(/Cash|Credit \/ Debit|Apple Pay/);
            expect(boxes.length).toBe(3); // Only 3 active options
        });
    });
});