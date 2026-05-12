import React from "react";
import { render, screen } from "@testing-library/react";
import AdminServices from "./Services";

// Mock components
jest.mock("../../Components/AdminSideBar", () => () => (
    <div data-testid="admin-sidebar">Mock Sidebar</div>
));

jest.mock("../../Components/AuthErrorPage/AuthErrorPage", () => () => (
    <div data-testid="auth-error">Auth Error</div>
));

describe("AdminServices", () => {

    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    test("shows AuthErrorPage when user is not authorized", () => {
        render(<AdminServices />);

        expect(screen.getByTestId("auth-error")).toBeInTheDocument();
    });

    test("shows admin page when authToken exists", () => {
        sessionStorage.setItem("authToken", "fake-token");

        render(<AdminServices />);

        expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
        expect(screen.getByText("Services")).toBeInTheDocument();
    });

    test("shows admin page when user role is admin", () => {
        localStorage.setItem(
            "user",
            JSON.stringify({ role: "admin" })
        );

        render(<AdminServices />);

        expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
        expect(screen.getByText("Services")).toBeInTheDocument();
    });

});
