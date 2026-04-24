import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ServicesManagement from "./ServicesManagement";


beforeEach(() => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () =>
                Promise.resolve([
                    {
                        service_id: 1,
                        name: "Service A",
                        description: "Desc A",
                        cost: 10,
                        is_active: true,
                        display_order: 0,
                    },
                    {
                        service_id: 2,
                        name: "Service B",
                        description: "Desc B",
                        cost: 20,
                        is_active: false,
                        display_order: 0,
                    },
                ]),
        })
    );
});

afterEach(() => {
    jest.clearAllMocks();
});

// Mock children
jest.mock("../../Components/AdminSideBar", () => () => (
    <div data-testid="admin-sidebar">Mocked Sidebar</div>
));

jest.mock("../../Components/ServicesManagementAdd", () => () => null);
jest.mock("../../Components/ServicesManagementUpdate", () => () => null);
jest.mock("../../Components/ServicesManagementDelete", () => ({ isOpen }) =>
    isOpen ? <div data-testid="delete-form">Mocked Delete</div> : null
);

describe("ServicesManagement", () => {
    test("renders services correctly", async () => {
        render(<ServicesManagement />);

        expect(screen.getByText("Services Management")).toBeInTheDocument();

        const serviceA = await screen.findByText("Service A");
        const serviceB = await screen.findByText("Service B");

        expect(serviceA).toBeInTheDocument();
        expect(serviceB).toBeInTheDocument();

        // ensure async effect finished
        await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    });

    test("opens delete form when clicked", async () => {
        render(<ServicesManagement />);

        const deleteButton = screen.getByText("Delete Service");
        fireEvent.click(deleteButton);

        expect(screen.getByTestId("delete-form")).toBeInTheDocument();
    });
});
