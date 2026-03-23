import AdminSideBar from "../../Components/AdminSideBar";
import {
  Button,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { useState, useEffect } from "react";
// import AuthErrorPage from "../../Components/AuthErrorPage/AuthErrorPage";
import { API_BASE_URL } from "../../config";

const DisplayInvoice = ({ invoice }) => {
  return (
    <div className="invoice-card">
      <p style={{ color: "#2F6DAB" }}>{invoice.customer}</p>
      <p>
        Vehicle:
        <br />
        {invoice.vehicle}
      </p>
      <p>
        Date:
        <br />
        {new Date(invoice.date).toLocaleDateString()}
      </p>
      <p>
        Services:
        <br />
        {invoice.services}
      </p>
      <p>
        Status:
        <br />
        {invoice.status}
      </p>
    </div>
  );
};

const Invoices = () => {
  // determine authorization from stored user object
  const parseStoredUser = () => {
    try {
      const raw =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  const storedUser = parseStoredUser();

  const isAuthorized = (user) => {
    // if a token exists assume authenticated and allow; stored user may not be saved by login flow
    const token =
      sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
    if (!user && token) return true;
    if (!user) return false;
    if (user.is_employee || user.is_staff || user.is_admin || user.is_superuser)
      return true;
    if (user.role && (user.role === "employee" || user.role === "admin"))
      return true;
    if (
      Array.isArray(user.roles) &&
      (user.roles.includes("employee") || user.roles.includes("admin"))
    )
      return true;
    return false;
  };

  const [pendingSearch, setPendingSearch] = useState("");
  const [paidSearch, setPaidSearch] = useState("");

  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [paidInvoices, setPaidInvoices] = useState([]);

  const [pendingPage, setPendingPage] = useState(1);
  const [paidPage, setPaidPage] = useState(1);

  const ITEMS_PER_PAGE = 4;

  const [pendingCount, setPendingCount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);

  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const toggleMonthDropdown = () =>
    setMonthDropdownOpen((prevState) => !prevState);
  const toggleYearDropdown = () =>
    setYearDropdownOpen((prevState) => !prevState);

  const fetchPendingInvoices = async (page = 1, search = "") => {
    try {
      let url = `${API_BASE_URL}/api/invoices/?status=pending&page=${page}&page_size=${ITEMS_PER_PAGE}`;

      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      if (monthFilter) {
        url += `&month=${monthFilter}`;
      }

      if (yearFilter) {
        url += `&year=${yearFilter}`;
      }

      const res = await fetch(url);

      if (!res.ok) throw new Error("Failed to fetch pending invoices");

      const data = await res.json();
      setPendingInvoices(data.results || []);
      setPendingCount(data.count || 0);
    } catch (err) {
      console.error("Failed to fetch pending invoices:", err);
    }
  };

  const fetchPaidInvoices = async (page = 1, search = "") => {
    try {
      let url = `${API_BASE_URL}/api/invoices/?status=paid&page=${page}&page_size=${ITEMS_PER_PAGE}`;

      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      if (monthFilter) {
        url += `&month=${monthFilter}`;
      }

      if (yearFilter) {
        url += `&year=${yearFilter}`;
      }

      const res = await fetch(url);

      if (!res.ok) throw new Error("Failed to fetch paid invoices");

      const data = await res.json();
      setPaidInvoices(data.results || []);
      setPaidCount(data.count || 0);
    } catch (err) {
      console.error("Failed to fetch paid invoices:", err);
    }
  };

  useEffect(() => {
    fetchPendingInvoices(pendingPage, pendingSearch);
  }, [pendingPage]);

  useEffect(() => {
    fetchPaidInvoices(paidPage, paidSearch);
  }, [paidPage]);

  useEffect(() => {
    setPendingPage(1);
    setPaidPage(1);
    fetchPendingInvoices(1, pendingSearch);
    fetchPaidInvoices(1, paidSearch);
  }, [monthFilter, yearFilter]);

  const handleSearch1 = async (e) => {
    e.preventDefault();
    setPendingPage(1);
    fetchPendingInvoices(1, pendingSearch);
  };

  const handleSearch2 = async (e) => {
    e.preventDefault();
    setPaidPage(1);
    fetchPaidInvoices(1, paidSearch);
  };

  //  if (!isAuthorized(storedUser)) return <AuthErrorPage />;

  return (
    <div className="invoice-adminLayout">
      <AdminSideBar />
      <div className="invoices">
        <div className="invoice-page-header">
          <h1>Invoices</h1>
        </div>
        <div className="dropdown">
          <Dropdown isOpen={monthDropdownOpen} toggle={toggleMonthDropdown}>
            <DropdownToggle
              caret
              style={{ backgroundColor: "#2f6dab", color: "white" }}
            >
              {monthFilter
                ? [
                  "",
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ][Number(monthFilter)]
                : "Month"}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => setMonthFilter("")}>
                All Months
              </DropdownItem>
              <DropdownItem onClick={() => setMonthFilter("1")}>
                January
              </DropdownItem>
              <DropdownItem onClick={() => setMonthFilter("2")}>
                February
              </DropdownItem>
              <DropdownItem onClick={() => setMonthFilter("3")}>
                March
              </DropdownItem>
              <DropdownItem onClick={() => setMonthFilter("4")}>
                April
              </DropdownItem>
              <DropdownItem onClick={() => setMonthFilter("5")}>
                May
              </DropdownItem>
              <DropdownItem onClick={() => setMonthFilter("6")}>
                June
              </DropdownItem>
              <DropdownItem onClick={() => setMonthFilter("7")}>
                July
              </DropdownItem>
              <DropdownItem onClick={() => setMonthFilter("8")}>
                August
              </DropdownItem>
              <DropdownItem onClick={() => setMonthFilter("9")}>
                September
              </DropdownItem>
              <DropdownItem onClick={() => setMonthFilter("10")}>
                October
              </DropdownItem>
              <DropdownItem onClick={() => setMonthFilter("11")}>
                November
              </DropdownItem>
              <DropdownItem onClick={() => setMonthFilter("12")}>
                December
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Dropdown isOpen={yearDropdownOpen} toggle={toggleYearDropdown}>
            <DropdownToggle
              caret
              style={{ backgroundColor: "#2f6dab", color: "white" }}
            >
              {yearFilter || "Year"}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => setYearFilter("")}>
                All Years
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2050")}>
                2050
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2049")}>
                2049
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2048")}>
                2048
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2047")}>
                2047
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2046")}>
                2046
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2045")}>
                2045
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2044")}>
                2044
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2043")}>
                2043
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2042")}>
                2042
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2041")}>
                2041
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2040")}>
                2040
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2039")}>
                2039
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2038")}>
                2038
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2037")}>
                2037
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2036")}>
                2036
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2035")}>
                2035
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2034")}>
                2034
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2034")}>
                2034
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2033")}>
                2033
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2032")}>
                2032
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2031")}>
                2031
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2030")}>
                2030
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2029")}>
                2029
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2028")}>
                2028
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2027")}>
                2027
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2026")}>
                2026
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2025")}>
                2025
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2024")}>
                2024
              </DropdownItem>
              <DropdownItem onClick={() => setYearFilter("2023")}>
                2023
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="invoice-table">
          <div className="invoice-table-columns">
            <div className="invoice-table-content">
              <div className="invoice-table-content-search">
                <Input
                  id="value1"
                  name="value1"
                  placeholder={"Search Pending Invoices"}
                  type="text"
                  style={{ width: "70vh", height: "50px" }}
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                />
                <Button type="button" className="btn" onClick={handleSearch1}>
                  Search
                </Button>
              </div>
              {pendingInvoices.map((invoice) => (
                <DisplayInvoice key={invoice.invoice_id} invoice={invoice} />
              ))}
            </div>
            <div className="invoice-pagination">
              <Button
                type="button"
                disabled={pendingPage === 1}
                onClick={() => setPendingPage((prev) => prev - 1)}
              >
                Prev
              </Button>
              <span>
                {" "}
                Page {pendingPage} of{" "}
                {Math.max(1, Math.ceil(pendingCount / ITEMS_PER_PAGE))}{" "}
              </span>
              <Button
                type="button"
                disabled={
                  pendingPage >= Math.ceil(pendingCount / ITEMS_PER_PAGE)
                }
                onClick={() => setPendingPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
        <div className="invoice-table-columns" style={{ marginTop: "40px" }}>
          <div className="invoice-table-content">
            <div className="invoice-table-content-search">
              <Input
                id="value2"
                name="value2"
                placeholder={"Search Paid Invoices"}
                type="text"
                style={{ width: "70vh", height: "50px" }}
                value={paidSearch}
                onChange={(e) => setPaidSearch(e.target.value)}
              />
              <Button type="button" className="btn" onClick={handleSearch2}>
                Search
              </Button>
            </div>
            {paidInvoices.map((invoice) => (
              <DisplayInvoice key={invoice.invoice_id} invoice={invoice} />
            ))}
          </div>
        </div>
        <div className="invoice-pagination">
          <Button
            type="button"
            disabled={paidPage === 1}
            onClick={() => setPaidPage((prev) => prev - 1)}
          >
            Prev
          </Button>
          <span>
            {" "}
            Page {paidPage} of{" "}
            {Math.max(1, Math.ceil(paidCount / ITEMS_PER_PAGE))}{" "}
          </span>
          <Button
            type="button"
            disabled={paidPage >= Math.ceil(paidCount / ITEMS_PER_PAGE)}
            onClick={() => setPaidPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
