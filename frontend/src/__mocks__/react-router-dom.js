const React = require('react');

function MemoryRouter({ children }) {
  return React.createElement(React.Fragment, null, children);
}

function Link({ children, to, ...rest }) {
  return React.createElement('a', { href: to, ...rest }, children);
}

const NavLink = Link;

function useNavigate() {
  return () => {};
}

function useLocation() {
  return { pathname: '/' };
}

function useParams() {
  return {};
}

module.exports = {
  MemoryRouter,
  Link,
  NavLink,
  useNavigate,
  useLocation,
  useParams,
};
