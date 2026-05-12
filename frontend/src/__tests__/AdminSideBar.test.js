import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminSideBar from "../Components/AdminSideBar";

describe("RW-228 AdminSideBar.test.js", () => {
  test("renders key admin nav links", () => {
    render(
      <MemoryRouter>
        <AdminSideBar />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/appointments/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/invoices/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/messages/i).length).toBeGreaterThan(0);
  });
});
