import { useEffect, useMemo, useState } from "react";

type EmployeeDashboardProps = {
  userName: string;
  roles: string[];
  buildApiUrl: (path: string) => string;
};

type OrderRow = {
  id: number;
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
  const [orderStatuses, setOrderStatuses] = useState<Record<number, string>>({});
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
        });

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
          id: order.orderNumber,
          lastName: order.lastName,
          firstName: order.firstName,
          phone: order.phone,
          location: order.location,
          pickupMethod: order.pickupMethod,
          orderStatus: order.orderStatus,
          viewOrder: `Order #${order.orderNumber}`,
        }));

        const initialStatuses: Record<number, string> = {};
        mappedOrders.forEach((order) => {
          initialStatuses[order.id] = order.orderStatus;
        });

        setOrders(mappedOrders);
        setOrderStatuses(initialStatuses);
      } catch (err) {
        setError("Could not load orders.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [buildApiUrl]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const currentStatus = orderStatuses[order.id] ?? order.orderStatus;

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
        orderStatusFilter === "" || currentStatus === orderStatusFilter;

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
    orderStatuses,
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
  setPickupMethodFilter("");
  setOrderStatusFilter("");
};

const handleStatusChange = async (orderId: number, newStatus: string) => {
  setOrderStatuses((previous) => ({
    ...previous,
    [orderId]: newStatus,
  }));

  try {
    const response = await fetch(buildApiUrl(`/api/orders/${orderId}/status`), {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Failed to update status (${response.status})`);
    }
  } catch (err) {
    console.error("Failed to update status", err);
    setError("Could not save order status.");
  }
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

            <button
              type="button"
              className="employee-tool-btn"
              onClick={() => handleToolClick("Assign Employee")}
            >
              Assign Employee
            </button>
          </div>
        </article>

        <article className="employee-card">
          <h2>Location Selector</h2>

          <select
            className="employee-search employee-top-location-filter"
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
          >
            <option value="">All locations</option>
            <option value="123 Main St">123 Main St</option>
            <option value="456 Oak Ave">456 Oak Ave</option>
            <option value="789 Pine Ln">789 Pine Ln</option>
          </select>

          <p className="employee-location-helper-text">
            Please make sure you are on the right location.
          </p>
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
          <p>123 Main St: 2</p>
          <p>456 Oak Ave: 1</p>
          <p>789 Pine Ln: 1</p>
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
            <option value="Received">Received</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
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

        <div className="employee-orders-grid">
          {!loading && filteredOrders.length === 0 ? (
            <div className="employee-empty-card">
              No orders match those filters.
            </div>
          ) : null}

          {filteredOrders.map((order) => {
            const currentStatus = orderStatuses[order.id] ?? order.orderStatus;

            return (
              <article className="employee-order-card" key={order.id}>
                <div className="employee-order-card-top">
                  <h3>{order.viewOrder}</h3>

                  <select
                    className="employee-order-status-select"
                    value={currentStatus}
                    onChange={(event) =>
                      handleStatusChange(order.id, event.target.value)
                    }
                  >
                    <option value="Received">Received</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="employee-order-card-body">
                  <p>
                    <strong>Name:</strong> {order.firstName} {order.lastName}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Location:</strong> {order.location}
                  </p>
                  <p>
                    <strong>Pickup:</strong> {order.pickupMethod}
                  </p>
                </div>

                <div className="employee-order-card-actions">
                  <button type="button" className="employee-view-order-btn">
                    View Order
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}