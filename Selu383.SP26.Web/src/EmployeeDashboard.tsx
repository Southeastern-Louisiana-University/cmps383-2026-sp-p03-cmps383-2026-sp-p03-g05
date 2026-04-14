import {
  BanknoteX,
  CalendarDays,
  Car,
  Eraser,
  FileChartLine,
  MapPin,
  Pen,
  Store,
  UserPlus,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type EmployeeDashboardProps = {
  roles: string[];
  buildApiUrl: (path: string) => string;
  onOpenMenuEditor: () => void;
  onOpenReports: () => void;
};

type ApiOrder = {
  lastName: string;
  firstName: string;
  phone: string;
  location: string;
  pickupMethod: string;
  orderStatus: string;
  orderNumber: number;
  orderedAt: string;
  itemCount?: number;
};

type OrderRow = {
  id: number;
  lastName: string;
  firstName: string;
  phone: string;
  location: string;
  pickupMethod: string;
  orderStatus: string;
  orderedAt: string;
  itemCount: number;
};

type LocationDto = {
  id: number;
  name: string;
  address: string;
  tableCount: number;
  managerId?: number | null;
};

type ApiReservation = {
  id: number;
  userId: number;
  userName?: string;
  firstName?: string;
  lastName?: string;
  orderId?: number | null;
  tableId: number;
  locationId: number;
  date: string;
  time: string;
};

type ApiStaffOrderDetailItem = {
  menuItemId: number;
  name: string;
  quantity: number;
  unitPrice: number;
};

type ApiStaffOrderDetail = {
  orderNumber: number;
  orderedAt: string;
  lastName: string;
  firstName: string;
  phone: string;
  location: string;
  pickupMethod: string;
  orderStatus: string;
  total: number;
  items: ApiStaffOrderDetailItem[];
};

type ApiUser = {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  roles: string[];
};

type CreateUserPayload = {
  userName: string;
  password: string;
  roles: string[];
  firstName: string;
  lastName: string;
  pridePoints: number;
  hasAgreedToPolicies: boolean;
};

const orderStatusOptions = [
  "Received",
  "In Progress",
  "Modified",
  "Ready for Pickup",
  "Client in Drive Through",
  "Client in Store",
  "Completed",
  "Cancelled",
] as const;

const pickupMethodOptions = ["In Store", "Drive Through"] as const;
const closedStatuses = new Set(["completed", "cancelled"]);
const filterableOrderStatusOptions = orderStatusOptions.filter(
  (status) => !closedStatuses.has(status.toLowerCase()),
);

function formatCentralDateTime(value: string): string {
  const timestamp = parseOrderTimestamp(value);
  if (Number.isNaN(timestamp)) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Chicago",
    timeZoneName: "short",
  }).format(new Date(timestamp));
}

function parseOrderTimestamp(value: string): number {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return Number.NaN;
  }

  // API dates are stored as UTC; when the payload omits timezone info,
  // force UTC parsing to avoid local-time drift.
  const hasTimezone = /(?:[zZ]|[+\-]\d{2}:\d{2})$/.test(trimmed);
  const normalized = hasTimezone ? trimmed : `${trimmed}Z`;
  return Date.parse(normalized);
}

function parseReservationTimestamp(dateValue: string, timeValue: string): number {
  const datePart = dateValue.trim().split("T")[0];
  const [hourToken, minuteToken, secondToken] = timeValue.trim().split(":");
  if (!datePart) {
    return Number.NaN;
  }

  const hour = Number.parseInt(hourToken ?? "", 10);
  const minute = Number.parseInt(minuteToken ?? "0", 10);
  const second = Number.parseInt(secondToken ?? "0", 10);
  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    Number.isNaN(second)
  ) {
    return Number.NaN;
  }

  return Date.parse(
    `${datePart}T${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0",
    )}:${String(second).padStart(2, "0")}`,
  );
}

function formatReservationDateTime(dateValue: string, timeValue: string): string {
  const timestamp = parseReservationTimestamp(dateValue, timeValue);
  if (Number.isNaN(timestamp)) {
    return `${dateValue} ${timeValue}`;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
    timeZoneName: "short",
  }).format(new Date(timestamp));
}

function formatElapsed(milliseconds: number): string {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    return "00:00:00";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (days > 0) {
    return `${days}d ${hh}:${mm}:${ss}`;
  }

  return `${hh}:${mm}:${ss}`;
}

export default function EmployeeDashboard({
  roles,
  buildApiUrl,
  onOpenMenuEditor,
  onOpenReports,
}: EmployeeDashboardProps) {
  const isAdmin = roles.some((role) => role.toLowerCase() === "admin");

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [locations, setLocations] = useState<LocationDto[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState("");
  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsError, setReservationsError] = useState("");

  const [lastNameFilter, setLastNameFilter] = useState("");
  const [firstNameFilter, setFirstNameFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [pickupMethodFilter, setPickupMethodFilter] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");

  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [pendingCompleteOrderId, setPendingCompleteOrderId] = useState<number | null>(
    null,
  );
  const [isViewOrderModalOpen, setIsViewOrderModalOpen] = useState(false);
  const [viewOrderLoading, setViewOrderLoading] = useState(false);
  const [viewOrderError, setViewOrderError] = useState("");
  const [selectedOrderDetail, setSelectedOrderDetail] =
    useState<ApiStaffOrderDetail | null>(null);
  const [isReservationsModalOpen, setIsReservationsModalOpen] = useState(false);
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [timerNow, setTimerNow] = useState(() => Date.now());
  const [orderTimerStoppedAt, setOrderTimerStoppedAt] = useState<
    Record<number, number>
  >({});
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isManageEmployeesModalOpen, setIsManageEmployeesModalOpen] =
    useState(false);
  const [isLoadingStaffUsers, setIsLoadingStaffUsers] = useState(false);
  const [staffUsersError, setStaffUsersError] = useState("");
  const [staffUsers, setStaffUsers] = useState<ApiUser[]>([]);
  const [isAddEmployeeFormOpen, setIsAddEmployeeFormOpen] = useState(false);
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);
  const [createEmployeeError, setCreateEmployeeError] = useState("");
  const [newEmployeeFirstName, setNewEmployeeFirstName] = useState("");
  const [newEmployeeLastName, setNewEmployeeLastName] = useState("");
  const [newEmployeeUserName, setNewEmployeeUserName] = useState("");
  const [newEmployeePassword, setNewEmployeePassword] = useState("");
  const [newEmployeeRole, setNewEmployeeRole] = useState<"Admin" | "Employee">(
    "Employee",
  );

  const loadOrders = useCallback(
    async (showLoader = false) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

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
          orderedAt: order.orderedAt,
          itemCount: typeof order.itemCount === "number" ? order.itemCount : 0,
        }));

        setOrders(mappedOrders);
        setOrderStatuses(() => {
          const next: Record<number, string> = {};
          mappedOrders.forEach((order) => {
            next[order.id] = order.orderStatus;
          });
          return next;
        });
      } catch (err) {
        setError("Could not load orders.");
        console.error(err);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [buildApiUrl],
  );

  const loadLocations = useCallback(async () => {
    try {
      setLocationsLoading(true);
      setLocationsError("");

      const response = await fetch(buildApiUrl("/api/locations"), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to load locations (${response.status})`);
      }

      const data: LocationDto[] = await response.json();
      setLocations(data);
      setLocationFilter((previous) => {
        if (previous === "") {
          return previous;
        }

        const exists = data.some((location) => location.address === previous);
        return exists ? previous : "";
      });
    } catch (err) {
      console.error(err);
      setLocationsError("Could not load locations.");
    } finally {
      setLocationsLoading(false);
    }
  }, [buildApiUrl]);

  const loadReservations = useCallback(
    async (showLoader = false) => {
      try {
        if (showLoader) {
          setReservationsLoading(true);
        }
        setReservationsError("");

        const response = await fetch(buildApiUrl("/api/reservations"), {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            setReservationsError("You are not logged in.");
            setReservations([]);
            return;
          }

          if (response.status === 403) {
            setReservationsError("You do not have permission to view reservations.");
            setReservations([]);
            return;
          }

          throw new Error(`Failed to load reservations (${response.status})`);
        }

        const data: ApiReservation[] = await response.json();
        setReservations(data);
      } catch (err) {
        console.error(err);
        setReservationsError("Could not load reservations.");
        setReservations([]);
      } finally {
        if (showLoader) {
          setReservationsLoading(false);
        }
      }
    },
    [buildApiUrl],
  );

  const loadStaffUsers = useCallback(async () => {
    try {
      setIsLoadingStaffUsers(true);
      setStaffUsersError("");

      const response = await fetch(buildApiUrl("/api/users"), {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setStaffUsersError("You are not logged in.");
          setStaffUsers([]);
          return;
        }

        if (response.status === 403) {
          setStaffUsersError("You do not have permission to manage employees.");
          setStaffUsers([]);
          return;
        }

        throw new Error(`Failed to load users (${response.status})`);
      }

      const data = (await response.json()) as ApiUser[];
      setStaffUsers(data);
    } catch (err) {
      console.error(err);
      setStaffUsersError("Could not load employees.");
      setStaffUsers([]);
    } finally {
      setIsLoadingStaffUsers(false);
    }
  }, [buildApiUrl]);

  useEffect(() => {
    void loadOrders(true);
    void loadLocations();
    void loadReservations(true);

    const intervalId = window.setInterval(() => {
      void loadOrders(false);
      void loadReservations(false);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [loadLocations, loadOrders, loadReservations]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTimerNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const now = Date.now();

    setOrderTimerStoppedAt((previous) => {
      const next: Record<number, number> = { ...previous };
      let hasChanges = false;

      const liveOrderIds = new Set<number>(orders.map((order) => order.id));

      for (const order of orders) {
        const status = (orderStatuses[order.id] ?? order.orderStatus).toLowerCase();
        const isClosed = closedStatuses.has(status);
        const hasStopTime = next[order.id] !== undefined;

        if (isClosed && !hasStopTime) {
          next[order.id] = now;
          hasChanges = true;
        }

        if (!isClosed && hasStopTime) {
          delete next[order.id];
          hasChanges = true;
        }
      }

      for (const rawId of Object.keys(next)) {
        const orderId = Number(rawId);
        if (!liveOrderIds.has(orderId)) {
          delete next[orderId];
          hasChanges = true;
        }
      }

      return hasChanges ? next : previous;
    });
  }, [orders, orderStatuses]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const currentStatus = orderStatuses[order.id] ?? order.orderStatus;

      if (closedStatuses.has(currentStatus.toLowerCase())) {
        return false;
      }

      const matchesLastName = order.lastName
        .toLowerCase()
        .includes(lastNameFilter.toLowerCase());

      const matchesFirstName = order.firstName
        .toLowerCase()
        .includes(firstNameFilter.toLowerCase());

      const matchesPhone = order.phone.toLowerCase().includes(phoneFilter.toLowerCase());

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
    firstNameFilter,
    lastNameFilter,
    locationFilter,
    orderStatusFilter,
    orderStatuses,
    orders,
    phoneFilter,
    pickupMethodFilter,
  ]);

  const currentOrderCounts = useMemo(() => {
    return orders.reduce(
      (counts, order) => {
        const currentStatus =
          (orderStatuses[order.id] ?? order.orderStatus).toLowerCase();

        if (closedStatuses.has(currentStatus)) {
          return counts;
        }

        if (locationFilter !== "" && order.location !== locationFilter) {
          return counts;
        }

        const pickupMethod = order.pickupMethod.toLowerCase();
        if (pickupMethod === "in store") {
          counts.inStoreCount += 1;
        } else if (pickupMethod === "drive through") {
          counts.driveThroughCount += 1;
        }

        return counts;
      },
      { inStoreCount: 0, driveThroughCount: 0 },
    );
  }, [locationFilter, orderStatuses, orders]);

  const locationsById = useMemo(
    () =>
      new Map<number, LocationDto>(locations.map((location) => [location.id, location])),
    [locations],
  );

  const filteredReservations = useMemo(() => {
    const selectedLocationIds =
      locationFilter === ""
        ? null
        : locations
            .filter((location) => location.address === locationFilter)
            .map((location) => location.id);

    return reservations
      .filter((reservation) => {
        if (!selectedLocationIds) {
          return true;
        }

        return selectedLocationIds.includes(reservation.locationId);
      })
      .slice()
      .sort((a, b) => {
        const aTime = parseReservationTimestamp(a.date, a.time);
        const bTime = parseReservationTimestamp(b.date, b.time);

        if (Number.isNaN(aTime) && Number.isNaN(bTime)) {
          return a.id - b.id;
        }

        if (Number.isNaN(aTime)) {
          return 1;
        }

        if (Number.isNaN(bTime)) {
          return -1;
        }

        return aTime - bTime;
      });
  }, [locationFilter, locations, reservations]);
  const reservationScopeLabel =
    locationFilter === "" ? "All locations" : locationFilter;

  const dashboardStaffUsers = useMemo(() => {
    return staffUsers
      .filter((user) =>
        user.roles.some((role) => {
          const normalizedRole = role.toLowerCase();
          return normalizedRole === "admin" || normalizedRole === "employee";
        }),
      )
      .sort((a, b) => a.id - b.id);
  }, [staffUsers]);

  const clearFilters = () => {
    setLastNameFilter("");
    setFirstNameFilter("");
    setPhoneFilter("");
    setLocationFilter("");
    setPickupMethodFilter("");
    setOrderStatusFilter("");
  };

  const applyOrderStatusUpdate = async (
    orderId: number,
    nextStatus: string,
    failureMessage: string,
  ) => {
    const previousStatus =
      orderStatuses[orderId] ??
      orders.find((order) => order.id === orderId)?.orderStatus ??
      "";

    setOrderStatuses((previous) => ({
      ...previous,
      [orderId]: nextStatus,
    }));

    try {
      const response = await fetch(buildApiUrl(`/api/orders/${orderId}/status`), {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Failed to update status (${response.status})`);
      }

      await loadOrders(false);
    } catch (err) {
      console.error("Failed to update status", err);
      setOrderStatuses((previous) => ({
        ...previous,
        [orderId]: previousStatus,
      }));
      setError(failureMessage);
    }
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    if (newStatus === "Completed") {
      setPendingCompleteOrderId(orderId);
      setShowCompleteConfirm(true);
      return;
    }

    void applyOrderStatusUpdate(orderId, newStatus, "Could not save order status.");
  };

  const confirmCompleteOrder = () => {
    if (pendingCompleteOrderId === null) {
      return;
    }

    const orderId = pendingCompleteOrderId;
    setShowCompleteConfirm(false);
    setPendingCompleteOrderId(null);
    void applyOrderStatusUpdate(orderId, "Completed", "Could not complete order.");
  };

  const cancelCompleteOrder = () => {
    setShowCompleteConfirm(false);
    setPendingCompleteOrderId(null);
  };

  const ensureAdminAccess = () => {
    if (!isAdmin) {
      alert("Admin Access Required");
      return false;
    }

    return true;
  };

  const resetNewEmployeeForm = () => {
    setNewEmployeeFirstName("");
    setNewEmployeeLastName("");
    setNewEmployeeUserName("");
    setNewEmployeePassword("");
    setNewEmployeeRole("Employee");
    setCreateEmployeeError("");
  };

  const handleOpenRefundModal = () => {
    if (!ensureAdminAccess()) {
      return;
    }

    setIsRefundModalOpen(true);
  };

  const handleOpenReportsClick = () => {
    if (!ensureAdminAccess()) {
      return;
    }

    onOpenReports();
  };

  const handleManageEmployeesClick = () => {
    if (!ensureAdminAccess()) {
      return;
    }

    setIsManageEmployeesModalOpen(true);
    setIsAddEmployeeFormOpen(false);
    resetNewEmployeeForm();
    void loadStaffUsers();
  };

  const handleOpenMenuEditorClick = () => {
    if (!ensureAdminAccess()) {
      return;
    }

    onOpenMenuEditor();
  };

  const closeRefundModal = () => {
    setIsRefundModalOpen(false);
  };

  const closeManageEmployeesModal = () => {
    setIsManageEmployeesModalOpen(false);
    setIsAddEmployeeFormOpen(false);
    resetNewEmployeeForm();
    setIsSavingEmployee(false);
  };

  const handleCreateEmployeeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const firstName = newEmployeeFirstName.trim();
    const lastName = newEmployeeLastName.trim();
    const userName = newEmployeeUserName.trim();
    const password = newEmployeePassword.trim();

    if (!firstName || !lastName || !userName || !password) {
      setCreateEmployeeError(
        "First name, last name, username, and password are required.",
      );
      return;
    }

    setIsSavingEmployee(true);
    setCreateEmployeeError("");

    const payload: CreateUserPayload = {
      userName,
      password,
      roles: [newEmployeeRole],
      firstName,
      lastName,
      pridePoints: 0,
      hasAgreedToPolicies: true,
    };

    try {
      const response = await fetch(buildApiUrl("/api/users"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let message = `Failed to create user (${response.status})`;
        try {
          const responseText = await response.text();
          if (responseText.trim().length > 0) {
            message = responseText;
          }
        } catch {
          // Keep fallback error message.
        }

        throw new Error(message);
      }

      resetNewEmployeeForm();
      setIsAddEmployeeFormOpen(false);
      await loadStaffUsers();
    } catch (err) {
      console.error(err);
      setCreateEmployeeError(
        err instanceof Error ? err.message : "Could not create employee.",
      );
    } finally {
      setIsSavingEmployee(false);
    }
  };

  const closeViewOrderModal = () => {
    setIsViewOrderModalOpen(false);
    setViewOrderLoading(false);
    setViewOrderError("");
    setSelectedOrderDetail(null);
  };

  const closeReservationsModal = () => {
    setIsReservationsModalOpen(false);
  };

  const openAddLocationModal = () => {
    setIsAddLocationModalOpen(true);
  };

  const closeAddLocationModal = () => {
    setIsAddLocationModalOpen(false);
  };

  const openViewOrderModal = async (orderId: number) => {
    setIsViewOrderModalOpen(true);
    setViewOrderLoading(true);
    setViewOrderError("");
    setSelectedOrderDetail(null);

    try {
      const response = await fetch(buildApiUrl(`/api/orders/${orderId}`), {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setViewOrderError("You are not logged in.");
          return;
        }

        if (response.status === 403) {
          setViewOrderError("You do not have permission to view order details.");
          return;
        }

        if (response.status === 404) {
          setViewOrderError("Order details were not found.");
          return;
        }

        throw new Error(`Failed to load order details (${response.status})`);
      }

      const data: ApiStaffOrderDetail = await response.json();
      setSelectedOrderDetail(data);
    } catch (err) {
      console.error(err);
      setViewOrderError("Could not load order details.");
    } finally {
      setViewOrderLoading(false);
    }
  };

  return (
    <main className="employee-dashboard">
      <section className="employee-top-grid">
        <article className="employee-card employee-tools-card">
          <h2>Administrator Tools</h2>

          <div className="employee-tools-grid">
            <button
              type="button"
              className="employee-tool-btn"
              onClick={handleOpenMenuEditorClick}
            >
              <Pen size={20} />
              <span>Edit Menu</span>
            </button>

            <button
              type="button"
              className="employee-tool-btn"
              onClick={handleOpenRefundModal}
            >
              <BanknoteX size={20} />
              <span>Refund an Order</span>
            </button>

            <button
              type="button"
              className="employee-tool-btn"
              onClick={handleOpenReportsClick}
            >
              <FileChartLine size={20} />
              <span>Reports</span>
            </button>

            <button
              type="button"
              className="employee-tool-btn"
              onClick={handleManageEmployeesClick}
            >
              <UserPlus size={20} />
              <span>Manage Employees</span>
            </button>
          </div>
        </article>

        <article className="employee-card">
          <h2>Location Selector</h2>

          <select
            className="employee-search employee-top-location-filter"
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
            disabled={locationsLoading && locations.length === 0}
          >
            <option value="">All locations</option>
            {locations.map((location) => (
              <option key={location.id} value={location.address}>
                {location.address}
              </option>
            ))}
          </select>

          <p className="employee-location-helper-text">
            Please make sure you are on the right location.
          </p>

          <button
            type="button"
            className="employee-reservations-launch-btn"
            onClick={() => setIsReservationsModalOpen(true)}
          >
            <span className="employee-reservations-launch-icon" aria-hidden="true">
              <CalendarDays size={18} />
            </span>
            <span>
              Reservations: <strong>{filteredReservations.length}</strong>
            </span>
          </button>

          <button
            type="button"
            className="employee-add-location-btn"
            onClick={openAddLocationModal}
          >
            <span className="employee-add-location-icon" aria-hidden="true">
              <MapPin size={18} />
            </span>
            <span>Add Location</span>
          </button>

          {locationsLoading ? (
            <p className="employee-meta-text">Loading locations...</p>
          ) : null}
          {locationsError ? <p className="employee-error-text">{locationsError}</p> : null}
          {reservationsLoading ? (
            <p className="employee-meta-text">Loading reservations...</p>
          ) : null}
          {reservationsError ? (
            <p className="employee-error-text">{reservationsError}</p>
          ) : null}
        </article>

        <article className="employee-card employee-current-orders-card">
          <h2>Current Orders</h2>

          <div className="employee-current-order-list">
            <div className="employee-current-order-item">
              <span className="employee-current-order-icon" aria-hidden="true">
                <Store size={18} />
              </span>
              <div className="employee-current-order-meta">
                <p>In Store</p>
                <strong>{currentOrderCounts.inStoreCount}</strong>
              </div>
            </div>

            <div className="employee-current-order-item">
              <span className="employee-current-order-icon" aria-hidden="true">
                <Car size={18} />
              </span>
              <div className="employee-current-order-meta">
                <p>Drive Through</p>
                <strong>{currentOrderCounts.driveThroughCount}</strong>
              </div>
            </div>
          </div>
        </article>

        <article className="employee-card employee-settings-card">
          <h2>Order View Settings</h2>

          <div className="employee-settings-two-col">
            <select
              className="employee-search"
              value={orderStatusFilter}
              onChange={(event) => setOrderStatusFilter(event.target.value)}
            >
              <option value="">Filter Status</option>
              {filterableOrderStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              className="employee-search"
              value={pickupMethodFilter}
              onChange={(event) => setPickupMethodFilter(event.target.value)}
            >
              <option value="">Filter Pickup Method</option>
              {pickupMethodOptions.map((pickupMethod) => (
                <option key={pickupMethod} value={pickupMethod}>
                  {pickupMethod}
                </option>
              ))}
            </select>
          </div>

          <div className="employee-settings-two-col">
            <input
              type="text"
              placeholder="Search first name"
              className="employee-search"
              value={firstNameFilter}
              onChange={(event) => setFirstNameFilter(event.target.value)}
            />

            <input
              type="text"
              placeholder="Search last name"
              className="employee-search"
              value={lastNameFilter}
              onChange={(event) => setLastNameFilter(event.target.value)}
            />
          </div>

          <div className="employee-filter-grid">
            <input
              type="text"
              placeholder="Search phone number"
              className="employee-search"
              value={phoneFilter}
              onChange={(event) => setPhoneFilter(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="employee-clear-btn employee-settings-clear-btn"
            onClick={clearFilters}
          >
            <Eraser size={16} />
            <span>Clear Filters</span>
          </button>
        </article>
      </section>

      <section className="employee-orders-section">
        <p className="employee-meta-text">Auto-refreshing every 5 seconds...</p>

        {loading ? <p className="employee-meta-text">Loading orders...</p> : null}
        {error ? <p className="employee-error-text">{error}</p> : null}

        <div className="employee-orders-grid">
          {!loading && filteredOrders.length === 0 ? (
            <div className="employee-empty-card">No orders match those filters.</div>
          ) : null}

          {filteredOrders.map((order) => {
            const currentStatus = orderStatuses[order.id] ?? order.orderStatus;
            const orderedTimestamp = parseOrderTimestamp(order.orderedAt);
            const isOrderTimeValid = !Number.isNaN(orderedTimestamp);
            const isClosed = closedStatuses.has(currentStatus.toLowerCase());
            const timerEnd = isClosed
              ? (orderTimerStoppedAt[order.id] ?? timerNow)
              : timerNow;
            const elapsed = isOrderTimeValid
              ? formatElapsed(Math.max(0, timerEnd - orderedTimestamp))
              : "00:00:00";

            return (
              <article className="employee-order-card" key={order.id}>
                <div className="employee-order-card-top">
                  <h3>Order #{order.id}</h3>

                  <select
                    className="employee-order-status-select"
                    value={currentStatus}
                    onChange={(event) =>
                      handleStatusChange(order.id, event.target.value)
                    }
                  >
                    {orderStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="employee-order-card-body">
                  <div className="employee-order-card-meta-grid">
                    <p>
                      <strong>Name:</strong> {order.firstName} {order.lastName}
                    </p>
                    <p>
                      <strong>Phone:</strong> {order.phone || "N/A"}
                    </p>
                  </div>
                  <p>
                    <strong>Location:</strong> {order.location}
                  </p>
                  <p>
                    <strong>Pickup:</strong> {order.pickupMethod}
                  </p>
                  <p>
                    <strong>Order Received:</strong> {formatCentralDateTime(order.orderedAt)}
                  </p>
                  <p>
                    <strong>Order Timer:</strong> {elapsed}
                  </p>
                  <p>
                    <strong>Number of Items in Order:</strong> {order.itemCount}
                  </p>
                </div>

                <div className="employee-order-card-actions">
                  <button
                    type="button"
                    className="employee-view-order-btn"
                    onClick={() => void openViewOrderModal(order.id)}
                  >
                    View Order
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {isViewOrderModalOpen ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Order details"
          onClick={closeViewOrderModal}
        >
          <div
            className="checkout-modal employee-order-details-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-modal-header">
              <h2>
                {selectedOrderDetail
                  ? `Order #${selectedOrderDetail.orderNumber}`
                  : "Order Details"}
              </h2>
              <button
                type="button"
                className="cart-modal-close"
                aria-label="Close order details"
                onClick={closeViewOrderModal}
              >
                <X size={18} />
              </button>
            </div>

            {viewOrderLoading ? (
              <p className="employee-meta-text">Loading order details...</p>
            ) : null}

            {!viewOrderLoading && viewOrderError ? (
              <p className="checkout-error">{viewOrderError}</p>
            ) : null}

            {!viewOrderLoading && !viewOrderError && selectedOrderDetail ? (
              <>
                <div className="employee-order-detail-meta">
                  <p>
                    <strong>Customer:</strong> {selectedOrderDetail.firstName}{" "}
                    {selectedOrderDetail.lastName}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedOrderDetail.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Location:</strong> {selectedOrderDetail.location}
                  </p>
                  <p>
                    <strong>Pickup:</strong> {selectedOrderDetail.pickupMethod}
                  </p>
                </div>

                {selectedOrderDetail.items.length === 0 ? (
                  <p className="cart-empty-state">
                    No items were found for this order.
                  </p>
                ) : (
                  <div className="cart-summary-list">
                    {selectedOrderDetail.items.map((item) => (
                      <article
                        className="cart-summary-item employee-order-line-item"
                        key={`${item.menuItemId}-${item.name}`}
                      >
                        <div className="cart-summary-body">
                          <div className="cart-summary-head">
                            <h3>{item.name}</h3>
                          </div>

                          <p>
                            Qty: {item.quantity} x ${item.unitPrice.toFixed(2)}
                          </p>

                          <div className="cart-summary-meta">
                            <span>
                              {item.quantity} item{item.quantity === 1 ? "" : "s"}
                            </span>
                            <strong>
                              ${(item.quantity * item.unitPrice).toFixed(2)}
                            </strong>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                <div className="checkout-total-row employee-order-total-row">
                  <span>Order total:</span>
                  <strong>${selectedOrderDetail.total.toFixed(2)}</strong>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {isReservationsModalOpen ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Reservation details"
          onClick={closeReservationsModal}
        >
          <div
            className="checkout-modal employee-reservations-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-modal-header">
              <h2>Reservations</h2>
              <button
                type="button"
                className="cart-modal-close"
                aria-label="Close reservations details"
                onClick={closeReservationsModal}
              >
                <X size={18} />
              </button>
            </div>

            <p className="employee-meta-text">
              Showing reservations for: <strong>{reservationScopeLabel}</strong>
            </p>

            {reservationsLoading ? (
              <p className="employee-meta-text">Loading reservations...</p>
            ) : null}

            {!reservationsLoading && reservationsError ? (
              <p className="checkout-error">{reservationsError}</p>
            ) : null}

            {!reservationsLoading && !reservationsError ? (
              filteredReservations.length === 0 ? (
                <p className="cart-empty-state">
                  No reservations found for this location selection.
                </p>
              ) : (
                <div className="employee-reservations-list">
                  {filteredReservations.map((reservation) => {
                    const locationLabel =
                      locationsById.get(reservation.locationId)?.address ??
                      `Location ${reservation.locationId}`;
                    const customerNameParts = [
                      reservation.firstName?.trim() ?? "",
                      reservation.lastName?.trim() ?? "",
                    ].filter((part) => part.length > 0);
                    const customerName =
                      customerNameParts.length > 0
                        ? customerNameParts.join(" ")
                        : reservation.userName?.trim() || "N/A";

                    return (
                      <article
                        className="employee-reservation-card"
                        key={reservation.id}
                      >
                        <div className="employee-reservation-card-top">
                          <h3>Reservation #{reservation.id}</h3>
                        </div>

                        <div className="employee-order-detail-meta">
                          <p>
                            <strong>Date/Time:</strong>{" "}
                            {formatReservationDateTime(
                              reservation.date,
                              reservation.time,
                            )}
                          </p>
                          <p>
                            <strong>Location:</strong> {locationLabel}
                          </p>
                          <p>
                            <strong>Table:</strong> {reservation.tableId}
                          </p>
                          <p>
                            <strong>Customer:</strong> {customerName}
                          </p>
                          <p>
                            <strong>Linked Order:</strong>{" "}
                            {reservation.orderId ?? "N/A"}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )
            ) : null}
          </div>
        </div>
      ) : null}

      {isAddLocationModalOpen ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Add location"
          onClick={closeAddLocationModal}
        >
          <div
            className="checkout-modal employee-add-location-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-modal-header">
              <h2>Add Location</h2>
              <button
                type="button"
                className="cart-modal-close"
                aria-label="Close add location modal"
                onClick={closeAddLocationModal}
              >
                <X size={18} />
              </button>
            </div>

            <p className="employee-meta-text">
              add location process will take place here.
            </p>
          </div>
        </div>
      ) : null}

      {isRefundModalOpen ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Refund order"
          onClick={closeRefundModal}
        >
          <div
            className="checkout-modal employee-refund-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-modal-header">
              <h2>Refund an Order</h2>
              <button
                type="button"
                className="cart-modal-close"
                aria-label="Close refund modal"
                onClick={closeRefundModal}
              >
                <X size={18} />
              </button>
            </div>

            <p className="employee-meta-text">refund process will take place here.</p>
          </div>
        </div>
      ) : null}

      {isManageEmployeesModalOpen ? (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Manage employees"
          onClick={closeManageEmployeesModal}
        >
          <div
            className="checkout-modal employee-manage-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-modal-header">
              <h2>Manage Employees</h2>
              <button
                type="button"
                className="cart-modal-close"
                aria-label="Close manage employees modal"
                onClick={closeManageEmployeesModal}
              >
                <X size={18} />
              </button>
            </div>

            <button
              type="button"
              className="employee-add-employee-btn"
              onClick={() => setIsAddEmployeeFormOpen((previous) => !previous)}
            >
              <UserPlus size={16} />
              <span>Add Employee</span>
            </button>

            {isAddEmployeeFormOpen ? (
              <form
                className="employee-add-employee-form"
                onSubmit={(event) => {
                  void handleCreateEmployeeSubmit(event);
                }}
              >
                <div className="employee-manage-two-col">
                  <input
                    type="text"
                    className="employee-search"
                    placeholder="First name"
                    value={newEmployeeFirstName}
                    onChange={(event) => setNewEmployeeFirstName(event.target.value)}
                    disabled={isSavingEmployee}
                  />
                  <input
                    type="text"
                    className="employee-search"
                    placeholder="Last name"
                    value={newEmployeeLastName}
                    onChange={(event) => setNewEmployeeLastName(event.target.value)}
                    disabled={isSavingEmployee}
                  />
                </div>

                <div className="employee-manage-two-col">
                  <input
                    type="text"
                    className="employee-search"
                    placeholder="Username"
                    value={newEmployeeUserName}
                    onChange={(event) => setNewEmployeeUserName(event.target.value)}
                    disabled={isSavingEmployee}
                  />
                  <input
                    type="password"
                    className="employee-search"
                    placeholder="Password"
                    value={newEmployeePassword}
                    onChange={(event) => setNewEmployeePassword(event.target.value)}
                    disabled={isSavingEmployee}
                  />
                </div>

                <select
                  className="employee-search"
                  value={newEmployeeRole}
                  onChange={(event) =>
                    setNewEmployeeRole(event.target.value as "Admin" | "Employee")
                  }
                  disabled={isSavingEmployee}
                >
                  <option value="Admin">Admin</option>
                  <option value="Employee">Employee</option>
                </select>

                <button
                  type="submit"
                  className="employee-confirm-btn employee-manage-submit-btn"
                  disabled={isSavingEmployee}
                >
                  {isSavingEmployee ? "Provisioning..." : "Provision User"}
                </button>
              </form>
            ) : null}

            {isAddEmployeeFormOpen && createEmployeeError ? (
              <p className="checkout-error">{createEmployeeError}</p>
            ) : null}

            <div className="employee-manage-list-header">
              <h3>Employees</h3>
            </div>

            {isLoadingStaffUsers ? (
              <p className="employee-meta-text">Loading employees...</p>
            ) : null}

            {!isLoadingStaffUsers && staffUsersError ? (
              <p className="checkout-error">{staffUsersError}</p>
            ) : null}

            {!isLoadingStaffUsers && !staffUsersError ? (
              dashboardStaffUsers.length === 0 ? (
                <p className="cart-empty-state">No employee records were found.</p>
              ) : (
                <div className="employee-manage-list">
                  {dashboardStaffUsers.map((user) => (
                    <article className="employee-manage-row" key={user.id}>
                      <p>
                        <strong>ID:</strong> {user.id}
                      </p>
                      <p>
                        <strong>Name:</strong>{" "}
                        {[user.firstName, user.lastName]
                          .filter((part) => part && part.trim().length > 0)
                          .join(" ") || "N/A"}
                      </p>
                    </article>
                  ))}
                </div>
              )
            ) : null}
          </div>
        </div>
      ) : null}

      {showCompleteConfirm ? (
        <div className="employee-modal-overlay">
          <div className="employee-confirm-modal">
            <h3>Confirm Completed Order</h3>
            <p>
              Are you sure you want to mark this order as completed? Once
              completed, it will be removed from the main order cards.
            </p>

            <div className="employee-confirm-actions">
              <button
                type="button"
                className="employee-confirm-btn"
                onClick={confirmCompleteOrder}
              >
                Yes, Complete Order
              </button>

              <button
                type="button"
                className="employee-cancel-btn"
                onClick={cancelCompleteOrder}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
