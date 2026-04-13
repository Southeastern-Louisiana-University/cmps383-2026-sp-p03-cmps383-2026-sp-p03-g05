import { useEffect, useMemo, useState } from "react";

type EmployeeDashboardProps = {
  userName: string;
  roles: string[];
  buildApiUrl: (path: string) => string;
};

type OrderRow = {
  lastName: string;
  firstName: string;
  phone: string;
  location: string;
  pickupMethod: string;
  orderStatus: string;
  viewOrder: string;
};

export default function EmployeeDashboard({
  userName,
  roles,
  buildApiUrl,
}: EmployeeDashboardProps) {
  const isAdmin = roles.some((role) => role.toLowerCase() === "admin");

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [lastNameFilter, setLastNameFilter] = useState("");
  const [firstNameFilter, setFirstNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [pickupMethodFilter, setPickupMethodFilter] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");

useEffect(() => {
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      type ApiOrder = {
        lastName: string;
        firstName: string;
        phone: string;
        location: string;
        pickupMethod: string;
        orderStatus: string;
        orderNumber: number;
      };

      const response = await fetch(buildApiUrl("/api/orders"), {
  credentials: "include",
});;

      if (!response.ok) {
        if (response.status === 401) {
          setError("You are not logged in.");
          return;
        }

        if (response.status === 403) {
          setError("You do not have permission to view orders.");
          return;
        }

        throw new Error(`Failed to load orders (${response.status})`);
      }

      const data: ApiOrder[] = await response.json();

      const mappedOrders: OrderRow[] = data.map((order) => ({
        lastName: order.lastName,
        firstName: order.firstName,
        phone: order.phone,
        location: order.location,
        pickupMethod: order.pickupMethod,
        orderStatus: order.orderStatus,
        viewOrder: `Order #${order.orderNumber}`,
      }));

      setOrders(mappedOrders);
    } catch (err) {
      setError("Could not load orders.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadOrders();
}, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesLastName = order.lastName
        .toLowerCase()
        .includes(lastNameFilter.toLowerCase());

      const matchesFirstName = order.firstName
        .toLowerCase()
        .includes(firstNameFilter.toLowerCase());

      const matchesPhone = order.phone
        .toLowerCase()
        .includes(phoneFilter.toLowerCase());

      const matchesLocation =
        locationFilter === "" || order.location === locationFilter;

      const matchesPickupMethod =
        pickupMethodFilter === "" || order.pickupMethod === pickupMethodFilter;

      const matchesOrderStatus =
        orderStatusFilter === "" || order.orderStatus === orderStatusFilter;

      return (
        matchesLastName &&
        matchesFirstName &&
        matchesPhone &&
        matchesLocation &&
        matchesPickupMethod &&
        matchesOrderStatus
      );
    });
  }, [
    orders,
    lastNameFilter,
    firstNameFilter,
    phoneFilter,
    locationFilter,
    pickupMethodFilter,
    orderStatusFilter,
  ]);

  const clearFilters = () => {
    setLastNameFilter("");
    setFirstNameFilter("");
    setPhoneFilter("");
    setLocationFilter("");
    setPickupMethodFilter("");
    setOrderStatusFilter("");
  };

  const handleToolClick = (toolName: string) => {
    alert(`${toolName} clicked`);
  };

  return (
    <main className="employee-dashboard">
      <section className="employee-top-grid">
        <article className="employee-card employee-tools-card">
          <h2>{userName}&apos;s Dashboard</h2>
          <p>{isAdmin ? "Administrator Access" : "Employee Access"}</p>

          <div className="employee-tools-grid">
            <button
              type="button"
              className="employee-tool-btn"
              onClick={() => handleToolClick("Edit Menu")}
            >
              Edit Menu
            </button>

            <button
              type="button"
              className="employee-tool-btn"
              onClick={() => handleToolClick("Refund Orders")}
            >
              Refund Orders
            </button>

            <button
              type="button"
              className="employee-tool-btn"
              onClick={() => handleToolClick("Sales Report")}
            >
              Sales Report
            </button>
          </div>
        </article>

        <article className="employee-card">
          <h2>Needs Attention</h2>
          <div className="employee-card-number danger">2</div>
          <p>Orders needing review soon</p>
        </article>

        <article className="employee-card">
          <h2>Status</h2>
          <p>No Thanks: 1</p>
          <p>In Progress: 1</p>
          <p>Complete: 1</p>
          <p>Client Pending: 1</p>
        </article>

        <article className="employee-card">
          <h2>Locations</h2>
          <p>Downtown: 2</p>
          <p>Northside: 1</p>
          <p>West End: 1</p>
        </article>
      </section>

      <section className="employee-table-wrap">
        <div className="employee-filter-grid">
          <input
            type="text"
            placeholder="Filter last name"
            className="employee-search"
            value={lastNameFilter}
            onChange={(event) => setLastNameFilter(event.target.value)}
          />

          <input
            type="text"
            placeholder="Filter first name"
            className="employee-search"
            value={firstNameFilter}
            onChange={(event) => setFirstNameFilter(event.target.value)}
          />

          <input
            type="text"
            placeholder="Filter phone"
            className="employee-search"
            value={phoneFilter}
            onChange={(event) => setPhoneFilter(event.target.value)}
          />

          <select
            className="employee-search"
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
          >
            <option value="">All locations</option>
            <option value="Downtown">Downtown</option>
            <option value="Northside">Northside</option>
            <option value="West End">West End</option>
          </select>

          <select
            className="employee-search"
            value={pickupMethodFilter}
            onChange={(event) => setPickupMethodFilter(event.target.value)}
          >
            <option value="">All pickup methods</option>
            <option value="In Store">In Store</option>
            <option value="Drive Through">Drive Through</option>
          </select>

          <select
            className="employee-search"
            value={orderStatusFilter}
            onChange={(event) => setOrderStatusFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Client Pending">Client Pending</option>
            <option value="Complete">Complete</option>
            <option value="No Thanks">No Thanks</option>
          </select>

          <button
            type="button"
            className="employee-clear-btn"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        {loading ? <p>Loading orders...</p> : null}
        {error ? <p>{error}</p> : null}

        <table className="employee-table">
          <thead>
            <tr>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Pick Up Method</th>
              <th>Order Status</th>
              <th>Order Number</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={index}>
                <td>{order.lastName}</td>
                <td>{order.firstName}</td>
                <td>{order.phone}</td>
                <td>{order.location}</td>
                <td>{order.pickupMethod}</td>
                <td>{order.orderStatus}</td>
                <td>
                  <button type="button">{order.viewOrder}</button>
                </td>
              </tr>
            ))}

            {!loading && filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="employee-empty-row">
                  No orders match those filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </main>
  );
}