import { useEffect, useMemo, useState } from "react";

type MenuEditorProps = {
  buildApiUrl: (path: string) => string;
  onBack: () => void;
};

type MenuEditorItem = {
  id: number;
  itemName: string;
  type: string;
  featured: boolean;
  price: number;
  description: string;
  nutrition: string;
  imageUrl: string;
};

type MenuItemFormState = {
  itemName: string;
  type: string;
  featured: boolean;
  price: string;
  description: string;
  nutrition: string;
  imageUrl: string;
};

const emptyForm: MenuItemFormState = {
  itemName: "",
  type: "Drink",
  featured: false,
  price: "",
  description: "",
  nutrition: "",
  imageUrl: "",
};

export default function MenuEditor({
  buildApiUrl,
  onBack,
}: MenuEditorProps) {
  const [items, setItems] = useState<MenuEditorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<MenuItemFormState>(emptyForm);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(buildApiUrl("/api/menuitems"), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to load menu items (${response.status})`);
      }

      const data = (await response.json()) as Array<{
        id: number;
        itemName: string;
        type: string;
        featured: boolean;
        price: number;
        description: string;
        nutrition: string;
        imageUrl?: string | null;
      }>;

      const mapped: MenuEditorItem[] = data.map((item) => ({
        id: item.id,
        itemName: item.itemName,
        type: item.type,
        featured: item.featured,
        price: item.price,
        description: item.description,
        nutrition: item.nutrition ?? "",
        imageUrl: item.imageUrl ?? "",
      }));

      setItems(mapped);
    } catch (err) {
      console.error(err);
      setError("Could not load menu items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMenuItems();
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.itemName.localeCompare(b.itemName));
  }, [items]);

  const updateForm = <K extends keyof MenuItemFormState>(
    key: K,
    value: MenuItemFormState[K],
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const startAddNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccessMessage("");
  };

  const startEdit = (item: MenuEditorItem) => {
    setEditingId(item.id);
    setForm({
      itemName: item.itemName,
      type: item.type,
      featured: item.featured,
      price: item.price.toFixed(2),
      description: item.description,
      nutrition: item.nutrition,
      imageUrl: item.imageUrl,
    });
    setError("");
    setSuccessMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccessMessage("");
  };

  const handleSave = async () => {
    if (!form.itemName.trim()) {
      setError("Item name is required.");
      return;
    }

    if (!form.type.trim()) {
      setError("Type is required.");
      return;
    }

    const parsedPrice = Number.parseFloat(form.price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setError("Enter a valid price.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        itemName: form.itemName.trim(),
        type: form.type.trim(),
        featured: form.featured,
        price: parsedPrice,
        description: form.description.trim(),
        nutrition: form.nutrition.trim(),
        imageUrl: form.imageUrl.trim(),
      };

      const url =
        editingId === null
          ? buildApiUrl("/api/menuitems")
          : buildApiUrl(`/api/menuitems/${editingId}`);

      const method = editingId === null ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Save failed (${response.status})`);
      }

      setSuccessMessage(
        editingId === null ? "Menu item added." : "Menu item updated.",
      );
      setEditingId(null);
      setForm(emptyForm);
      await loadMenuItems();
    } catch (err) {
      console.error(err);
      setError("Could not save menu item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?",
    );
    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");

      const response = await fetch(buildApiUrl(`/api/menuitems/${id}`), {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Delete failed (${response.status})`);
      }

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }

      setSuccessMessage("Menu item deleted.");
      await loadMenuItems();
    } catch (err) {
      console.error(err);
      setError("Could not delete menu item.");
    }
  };

  return (
    <main className="menu-editor-page">
      <section className="menu-editor-header-card">
        <div>
          <h1>Menu Editor</h1>
          <p>Manage menu items, pictures, descriptions, and nutrition info.</p>
        </div>

        <div className="menu-editor-header-actions">
          <button
            type="button"
            className="employee-tool-btn"
            onClick={startAddNew}
          >
            Add New Item
          </button>
          <button
            type="button"
            className="employee-tool-btn"
            onClick={onBack}
          >
            Back to Dashboard
          </button>
        </div>
      </section>

      <section className="menu-editor-layout">
        <article className="menu-editor-form-card">
          <div className="menu-editor-form-header">
            <div>
              <h2>{editingId === null ? "Add Menu Item" : "Edit Menu Item"}</h2>
              <p>
                Add pricing, description, picture URL, and nutritional facts.
              </p>
            </div>
          </div>

          <div className="menu-editor-form-grid">
            <label className="menu-editor-field">
              <span>Item Name</span>
              <input
                type="text"
                value={form.itemName}
                onChange={(event) => updateForm("itemName", event.target.value)}
                placeholder="Iced Latte"
              />
            </label>

            <label className="menu-editor-field">
              <span>Type</span>
              <select
                value={form.type}
                onChange={(event) => updateForm("type", event.target.value)}
              >
                <option value="Drink">Drink</option>
                <option value="Food">Food</option>
              </select>
            </label>

            <label className="menu-editor-field">
              <span>Price</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(event) => updateForm("price", event.target.value)}
                placeholder="5.50"
              />
            </label>

            <label className="menu-editor-field menu-editor-checkbox-field">
              <span>Featured Item</span>
              <div className="menu-editor-checkbox-wrap">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    updateForm("featured", event.target.checked)
                  }
                />
                <small>Show in featured section</small>
              </div>
            </label>

            <label className="menu-editor-field menu-editor-field-full">
              <span>Picture URL</span>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(event) => updateForm("imageUrl", event.target.value)}
                placeholder="https://example.com/image.png"
              />
            </label>

            <label className="menu-editor-field menu-editor-field-full">
              <span>Description</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  updateForm("description", event.target.value)
                }
                placeholder="Short item description..."
              />
            </label>

            <label className="menu-editor-field menu-editor-field-full">
              <span>Nutritional Facts</span>
              <textarea
                rows={5}
                value={form.nutrition}
                onChange={(event) =>
                  updateForm("nutrition", event.target.value)
                }
                placeholder="Calories, sugar, protein, allergens, etc."
              />
            </label>
          </div>

          {form.imageUrl ? (
            <div className="menu-editor-image-preview-wrap">
              <p>Image Preview</p>
              <img
                src={form.imageUrl}
                alt={form.itemName || "Menu preview"}
                className="menu-editor-image-preview"
              />
            </div>
          ) : null}

          {error ? <p className="menu-editor-error">{error}</p> : null}
          {successMessage ? (
            <p className="menu-editor-success">{successMessage}</p>
          ) : null}

          <div className="menu-editor-form-actions">
            <button
              type="button"
              className="employee-tool-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId === null
                  ? "Add Item"
                  : "Save Changes"}
            </button>

            <button
              type="button"
              className="employee-clear-btn"
              onClick={cancelEdit}
              disabled={saving}
            >
              Clear
            </button>
          </div>
        </article>

        <article className="menu-editor-list-card">
          <div className="menu-editor-list-header">
            <h2>Current Menu Items</h2>
            <p>{sortedItems.length} items</p>
          </div>

          {loading ? <p>Loading menu items...</p> : null}

          <div className="menu-editor-card-grid">
            {sortedItems.map((item) => (
              <article className="menu-editor-item-card" key={item.id}>
                <div className="menu-editor-item-card-top">
                  <div>
                    <h3>{item.itemName}</h3>
                    <p className="menu-editor-item-type">{item.type}</p>
                  </div>

                  <span className="menu-editor-item-price">
                    ${item.price.toFixed(2)}
                  </span>
                </div>

                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.itemName}
                    className="menu-editor-item-image"
                  />
                ) : (
                  <div className="menu-editor-item-image-placeholder">
                    No Image
                  </div>
                )}

                <div className="menu-editor-item-details">
                  <p>
                    <strong>Featured:</strong> {item.featured ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Description:</strong> {item.description || "N/A"}
                  </p>
                  <p>
                    <strong>Nutrition:</strong> {item.nutrition || "N/A"}
                  </p>
                </div>

                <div className="menu-editor-item-actions">
                  <button
                    type="button"
                    className="employee-tool-btn"
                    onClick={() => startEdit(item)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="employee-clear-btn"
                    onClick={() => void handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}