import React from "react";
import { render, screen } from "@testing-library/react";
import Services from "./Services";

// Mock the child component
jest.mock("../Components/Services/ServicesSection", () => () => (
    <div data-testid="services-section">Mocked Services Section</div>
));

describe("Services Component", () => {
    test("renders the homepage wrapper and ServicesSection", () => {
        const { container } = render(<Services />);

        // Check if the wrapper divs with correct classes are rendered
        expect(container.firstChild).toHaveClass("homepage");
        expect(container.firstChild.firstChild).toHaveClass("homepage-content");

        // Check if the child component is rendered inside
        expect(screen.getByTestId("services-section")).toBeInTheDocument();
        expect(screen.getByText("Mocked Services Section")).toBeInTheDocument();
    });
});
