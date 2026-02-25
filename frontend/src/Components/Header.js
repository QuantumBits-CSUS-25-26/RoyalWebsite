import React, { useCallback } from "react";
import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Offcanvas,
  OffcanvasHeader,
  OffcanvasBody,
  Nav,
  NavItem,
} from "reactstrap";
import { useUi } from "./ServicePopUp/UiContext";
import { useMobileNav } from "./MobileNavContext";

const Header = () => {
  const navigate = useNavigate();
  const { setServiceOpen } = useUi();

  // ✅ use shared mobile nav state (so other components can open it)
  const { mobileNavOpen, toggleMobileNav, closeMobileNav } = useMobileNav();

  const closeAll = useCallback(() => {
    setServiceOpen(false);
    closeMobileNav();
  }, [setServiceOpen, closeMobileNav]);

  const goHome = () => {
    navigate("/");
    closeAll();
  };

  // IMPORTANT: these IDs must match your /service/:id data
  const serviceLinks = [
    { id: "brakes", label: "Brake Work" },
    { id: "body", label: "Body Work" },
    { id: "engine-transmission", label: "Engine / Transmission" },
    { id: "hybrid", label: "Hybrid Services" },
    { id: "oil-change", label: "Oil Change" },
    { id: "suspension-tune-up", label: "Suspension Work / Tune Up" },
  ];

  return (
    <>
      {/* Mobile-only top bar */}
      <Navbar
        color="light"
        light
        className="mobileOffcanvasNav fixed-top d-md-none"
        container="fluid"
      >
        <NavbarToggler onClick={toggleMobileNav} aria-label="Toggle navigation" />
        <NavbarBrand tag="button" className="brandButton ms-2" onClick={goHome}>
          Royal Auto
        </NavbarBrand>
      </Navbar>

      {/* Offcanvas menu */}
      <Offcanvas isOpen={mobileNavOpen} toggle={toggleMobileNav} direction="start">
        <OffcanvasHeader toggle={toggleMobileNav}>Menu</OffcanvasHeader>
        <OffcanvasBody>
          <Nav vertical className="gap-1">
            <NavItem>
              <RouterNavLink className="nav-link" to="/" onClick={closeAll}>
                Home
              </RouterNavLink>
            </NavItem>

            <NavItem>
              <RouterNavLink className="nav-link" to="/login" onClick={closeAll}>
                Account
              </RouterNavLink>
            </NavItem>

            <NavItem>
              <RouterNavLink className="nav-link" to="/appointments" onClick={closeAll}>
                Appointments
              </RouterNavLink>
            </NavItem>

            <NavItem>
              <RouterNavLink className="nav-link" to="/news" onClick={closeAll}>
                News
              </RouterNavLink>
            </NavItem>

            <hr />

            <div className="fw-bold mb-1">Services</div>

            <NavItem>
              <RouterNavLink className="nav-link" to="/services" onClick={closeAll}>
                View all services
              </RouterNavLink>
            </NavItem>

            {serviceLinks.map((s) => (
              <NavItem key={s.id}>
                <RouterNavLink
                  className="nav-link"
                  to={`/service/${s.id}`}
                  onClick={closeAll}
                >
                  {s.label}
                </RouterNavLink>
              </NavItem>
            ))}
          </Nav>
        </OffcanvasBody>
      </Offcanvas>
    </>
  );
};

export default Header;
