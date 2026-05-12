import React from "react";
import { render, screen } from "@testing-library/react";
import ServiceDetail from "./ServiceDetail";

// Mock the child component
jest.mock("./ServiceDetail/ServiceDetailSection", () => () => (
    <div data-testid="service-detail-section">Mocked Service Detail Section</div>
));

describe("ServiceDetail Component", () => {
    test("renders the homepage wrapper and ServiceDetailSection", () => {
        const { container } = render(<ServiceDetail />);

        // Check if the wrapper divs with correct classes are rendered
        expect(container.firstChild).toHaveClass("homepage");
        expect(container.firstChild.firstChild).toHaveClass("homepage-content");

        // Check if the child component is rendered inside
        expect(screen.getByTestId("service-detail-section")).toBeInTheDocument();
        expect(screen.getByText("Mocked Service Detail Section")).toBeInTheDocument();
    });
});
