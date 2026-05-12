import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { useLocation } from "react-router-dom";

jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element,
}));

jest.mock("./Pages/Homepage", () => () => <div>Homepage Mock</div>);
jest.mock("./Pages/CustomerDashboard", () => () => <div>Customer Dashboard Mock</div>);
jest.mock("./Pages/Appointments", () => () => <div>Appointments Mock</div>);
jest.mock("./Pages/Services", () => () => <div>Services Mock</div>);
jest.mock("./Pages/News", () => () => <div>News Mock</div>);
jest.mock("./Pages/Login", () => () => <div>Admin Login Mock</div>);
jest.mock("./Pages/CustomerLogin", () => () => <div>Customer Login Mock</div>);
jest.mock("./Pages/ServiceDetail", () => () => <div>Service Detail Mock</div>);
jest.mock("./Pages/CustomerCreation", () => () => <div>Customer Creation Mock</div>);
jest.mock("./Pages/CustomerUpdate", () => () => <div>Customer Update Mock</div>);

jest.mock("./Pages/AdminDashboard", () => () => <div>Admin Dashboard Mock</div>);
jest.mock("./Pages/AdminPages/CustomerList", () => () => <div>Customer List Mock</div>);
jest.mock("./Pages/AdminPages/Appointments", () => () => <div>Admin Appointments Mock</div>);
jest.mock("./Pages/AdminPages/ServicesManagement", () => () => <div>Services Management Mock</div>);
jest.mock("./Pages/AdminPages/Invoices", () => () => <div>Invoices Mock</div>);
jest.mock("./Pages/AdminPages/Messages", () => () => <div>Messages Mock</div>);
jest.mock("./Pages/AdminPages/Management", () => () => <div>Management Mock</div>);

jest.mock("./Components/ServicePopUp/UiContext", () => ({
  UiProvider: ({ children }) => <>{children}</>,
}));

jest.mock("./Components/MobileNavContext", () => ({
  MobileNavProvider: ({ children }) => <>{children}</>,
}));

jest.mock("./Components/ServicePopUp/ServicesBar", () => () => <div>ServiceBar Mock</div>);
jest.mock("./Components/SideNavbar", () => () => <div>SideNavbar Mock</div>);
jest.mock("./Components/InfoBar", () => () => <div>InfoBar Mock</div>);
jest.mock("./Components/Header", () => () => <div>Header Mock</div>);

describe("App routing", () => {
  test("shows public layout on non-admin routes", () => {
    useLocation.mockReturnValue({ pathname: "/" });

    render(<App />);

    expect(screen.getByText("Homepage Mock")).toBeInTheDocument();
    expect(screen.getByText("InfoBar Mock")).toBeInTheDocument();
    expect(screen.getByText("Header Mock")).toBeInTheDocument();
    expect(screen.getByText("SideNavbar Mock")).toBeInTheDocument();
    expect(screen.getByText("ServiceBar Mock")).toBeInTheDocument();
  });

  test("hides public layout on admin routes", () => {
    useLocation.mockReturnValue({ pathname: "/admin" });

    render(<App />);

    expect(screen.getByText("Admin Dashboard Mock")).toBeInTheDocument();
    expect(screen.queryByText("InfoBar Mock")).not.toBeInTheDocument();
    expect(screen.queryByText("Header Mock")).not.toBeInTheDocument();
    expect(screen.queryByText("SideNavbar Mock")).not.toBeInTheDocument();
    expect(screen.queryByText("ServiceBar Mock")).not.toBeInTheDocument();
  });
});