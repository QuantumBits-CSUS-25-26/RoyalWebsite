import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "../Components/Header";
import { UiProvider } from "../Components/ServicePopUp/UiContext";
import { MobileNavProvider } from "../Components/MobileNavContext";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,

  MemoryRouter: ({ children }) => <div>{children}</div>,

  NavLink: ({ children, to, className, ...props }) => (
    <a
      href={to}
      className={
        typeof className === "function"
          ? className({ isActive: false })
          : className
      }
      {...props}
    >
      {children}
    </a>
  ),
}));

function renderHeader() {
  return render(
    <MemoryRouter>
      <UiProvider>
        <MobileNavProvider>
          <Header />
        </MobileNavProvider>
      </UiProvider>
    </MemoryRouter>
  );
}

function openMobileMenu() {
  fireEvent.click(screen.getByLabelText(/toggle navigation/i));
}

describe("Header", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders without crashing", () => {
    renderHeader();

    expect(screen.getByText(/Royal Auto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/toggle navigation/i)).toBeInTheDocument();
  });

  it("opens and closes mobile nav", () => {
    renderHeader();

    const toggler = screen.getByLabelText(/toggle navigation/i);

    fireEvent.click(toggler);
    expect(screen.getByText(/Menu/i)).toBeVisible();

    fireEvent.click(toggler);
    expect(screen.getByText(/Menu/i)).not.toBeVisible();
  });

  it("navigates home on brand click", () => {
    renderHeader();

    fireEvent.click(screen.getByText(/Royal Auto/i));

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("renders all main nav links", () => {
    renderHeader();
    openMobileMenu();

    const links = [
      { text: "Home", href: "/" },
      { text: "Account", href: "/login" },
      { text: "Appointments", href: "/appointments" },
      { text: "News", href: "/news" },
      { text: "View all services", href: "/services" },
    ];

    links.forEach(({ text, href }) => {
      const link = screen.getByText(text);
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", href);
    });
  });

  it("renders all service links", () => {
    renderHeader();
    openMobileMenu();

    const serviceLinks = [
      { text: "Brake Work", href: "/service/brakes" },
      { text: "Body Work", href: "/service/body" },
      {
        text: "Engine / Transmission",
        href: "/service/engine-transmission",
      },
      { text: "Hybrid Services", href: "/service/hybrid" },
      { text: "Oil Change", href: "/service/oil-change" },
      {
        text: "Suspension Work / Tune Up",
        href: "/service/suspension-tune-up",
      },
    ];

    serviceLinks.forEach(({ text, href }) => {
      const link = screen.getByText(text);
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", href);
    });
  });

  it("closes menu when a nav link is clicked", () => {
    renderHeader();
    openMobileMenu();

    expect(screen.getByText(/Menu/i)).toBeVisible();

    fireEvent.click(screen.getByText("Home"));

    expect(screen.getByText(/Menu/i)).not.toBeVisible();
  });
});