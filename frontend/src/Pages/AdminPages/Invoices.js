import AdminSideBar from "../../Components/AdminSideBar";
import { Row, Col, Button, Form, FormGroup, Label, Input } from "reactstrap";
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

function filterInvoices(invoices, searchValue, status) {
  const lowerCaseSearch = String(searchValue).toLowerCase();
  const lowerCaseStatus = String(status).toLowerCase();

  return invoices.filter((item) => {
    const matchesStatus = String(item.status).toLowerCase() === lowerCaseStatus;

    const formattedDate = item.date
      ? new Date(item.date)
        .toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        .toLowerCase()
      : "";

    const rawValues = Object.values(item).map((value) =>
      String(value ?? "").toLowerCase(),
    );

    const matchesSearch =
      rawValues.some((value) => value.includes(lowerCaseSearch)) ||
      formattedDate.includes(lowerCaseSearch);

    return matchesStatus && matchesSearch;
  });
}

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

  const [invoices, setInvoices] = useState([]);
  const [searchValue1, setValue1] = useState("");
  const [searchValue2, setValue2] = useState("");
  const [filteredList1, setFilteredList1] = useState(
    filterInvoices(invoices, searchValue1, "Pending"),
  );
  const [filteredList2, setFilteredList2] = useState(
    filterInvoices(invoices, searchValue2, "Paid"),
  );
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [paidInvoices, setPaidInvoices] = useState([]);

  const [pendingSearch, setPendingSearch] = useState("");
  const [paidSearch, setPaidSearch] = useState("");

  const [pendingPage, setPendingPage] = useState(1);
  const [paidPage, setPaidPage] = useState(1);

  const ITEMS_PER_PAGE = 4;

  const [pendingCount, setPendingCount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);

  const fetchPendingInvoices = async (page = 1, search = "") => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/invoices/?status=pending&page=${page}&page_size=${ITEMS_PER_PAGE}&search=${encodeURIComponent(search)}`,
      );
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
      const res = await fetch(
        `${API_BASE_URL}/api/invoices/?status=paid&page=${page}&page_size=${ITEMS_PER_PAGE}&search=${encodeURIComponent(search)}`,
      );
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
                  value={searchValue1}
                  onChange={(e) => setValue1(e.target.value)}
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
                value={searchValue2}
                onChange={(e) => setValue2(e.target.value)}
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
