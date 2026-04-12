import { useMemo, useState } from "react";

type EmployeeDashboardProps = {
  userName: string;
  roles: string[];
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

const demoOrders: OrderRow[] = [
  {
    lastName: "Epps",
    firstName: "Raymond",
    phone: "985-555-1001",
    location: "Downtown",
    pickupMethod: "In Store",
    orderStatus: "In Progress",
    viewOrder: "Order #1001",
  },
  {
    lastName: "Domingue",
    firstName: "Dominick",
    phone: "985-555-1002",
    location: "Northside",
    pickupMethod: "Drive Through",
    orderStatus: "Client Pending",
    viewOrder: "Order #1002",
  },
  {
    lastName: "Smith",
    firstName: "Jordan",
    phone: "985-555-1003",
    location: "Downtown",
    pickupMethod: "In Store",
    orderStatus: "Complete",
    viewOrder: "Order #1003",
  },
  {
    lastName: "Johnson",
    firstName: "Taylor",
    phone: "985-555-1004",
    location: "West End",
    pickupMethod: "Drive Through",
    orderStatus: "No Thanks",
    viewOrder: "Order #1004",
  },
];

export default function EmployeeDashboard({
  userName,
  roles,
}: EmployeeDashboardProps) {
  const isAdmin = roles.some((role) => role.toLowerCase() === "admin");

  const [lastNameFilter, setLastNameFilter] = useState("");
  const [firstNameFilter, setFirstNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [pickupMethodFilter, setPickupMethodFilter] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");

  const filteredOrders = useMemo(() => {
    return demoOrders.filter((order) => {
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

  return (
    <main className="employee-dashboard">
      <section className="employee-hero">
        <h1>{userName}&apos;s Dashboard</h1>
        <p>{isAdmin ? "Administrator Access" : "Employee Access"}</p>
      </section>

      <section className="employee-cards">
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

        <table className="employee-table">
          <thead>
            <tr>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Phone</th>
              <th>Location</th>
              <th>Pick Up Method</th>
              <th>Order Status</th>
              <th>View Order</th>
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

            {filteredOrders.length === 0 ? (
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