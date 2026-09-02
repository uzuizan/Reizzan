import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import styles from "./App.module.css";

const BODY_TYPES = ["Electric", "Acoustic", "Bass", "Classical"];
const ROLES = ["Merchant", "Consumer"];

const starterItems = [
  {
    id: 1,
    model: "Stratocaster Player",
    bodyType: "Electric",
    brand: "Fender",
    stock: 12,
    manufacturer: "Fender Musical Instruments",
    role: "Merchant",
  },
  {
    id: 2,
    model: "DR-100",
    bodyType: "Acoustic",
    brand: "Epiphone",
    stock: 8,
    manufacturer: "Gibson Brands",
    role: "Consumer",
  },
  {
    id: 3,
    model: "TRBX174",
    bodyType: "Bass",
    brand: "Yamaha",
    stock: 15,
    manufacturer: "Yamaha Corporation",
    role: "Merchant",
  },
];

const emptyForm = {
  model: "",
  bodyType: "",
  brand: "",
  stock: "",
  manufacturer: "",
  role: "",
};

function App() {
  const [items, setItems] = useState(starterItems);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [activeId, setActiveId] = useState(starterItems[0].id);
  const [activeItem, setActiveItem] = useState(starterItems[0]);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);
  const [search, setSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !term ||
        item.model.toLowerCase().includes(term) ||
        item.brand.toLowerCase().includes(term) ||
        item.bodyType.toLowerCase().includes(term) ||
        item.manufacturer.toLowerCase().includes(term);

      const matchesStock = !showOnlyInStock || item.stock > 0;

      return matchesSearch && matchesStock;
    });
  }, [items, search, showOnlyInStock]);

  useEffect(() => {
    const selected = items.find((item) => item.id === activeId);
    setActiveItem(selected || null);
  }, [activeId, items]);

  const validate = () => {
    const nextErrors = {};

    if (!form.model.trim() || form.model.trim().length < 3) {
      nextErrors.model = "Guitar model must be at least 3 characters.";
    }
    if (!BODY_TYPES.includes(form.bodyType)) {
      nextErrors.bodyType = "Please select a body type.";
    }
    if (!form.brand.trim()) {
      nextErrors.brand = "Brand name is required.";
    }

    const stock = Number(form.stock);
    if (form.stock === "" || !Number.isInteger(stock) || stock < 1 || stock > 100) {
      nextErrors.stock = "Stock quantity must be a whole number from 1 to 100.";
    }
    if (!form.manufacturer.trim()) {
      nextErrors.manufacturer = "Manufacturer name is required.";
    }
    if (!ROLES.includes(form.role)) {
      nextErrors.role = "Please select a user role.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    const newItem = {
      id: Date.now(),
      model: form.model.trim(),
      bodyType: form.bodyType,
      brand: form.brand.trim(),
      stock: Number(form.stock),
      manufacturer: form.manufacturer.trim(),
      role: form.role,
    };

    setItems((current) => [...current, newItem]);
    setActiveId(newItem.id);
    setForm(emptyForm);
    setErrors({});
    setSubmitted(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "model",
        header: "Guitar Model",
      },
      {
        accessorKey: "bodyType",
        header: "Body Type",
        cell: ({ getValue }) => (
          <span className={styles["type-badge"]}>{getValue()}</span>
        ),
      },
      {
        accessorKey: "brand",
        header: "Brand",
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ getValue }) => (
          <span className={getValue() <= 5 ? styles["low-stock"] : ""}>
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: "manufacturer",
        header: "Manufacturer",
      },
      {
        accessorKey: "role",
        header: "Role",
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 4,
      },
    },
  });

  const errorFor = (name) =>
    errors[name] ? <small className={styles.error}>{errors[name]}</small> : null;

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles["hero-icon"]}>🎸</div>
        <div>
          <p className={styles.eyebrow}>SET B • PRACTICAL EXAM</p>
          <h1>Guitar Store Inventory Manager</h1>
          <p className={styles.subtitle}>
            Register guitars, validate inventory details, browse the registry,
            and inspect the selected guitar profile.
          </p>
        </div>
      </header>

      <section className={styles.layout}>
        <div className={`${styles.card} ${styles["form-card"]}`}>
          <div className={styles["card-heading"]}>
            <div>
              <p className={styles["section-label"]}>PHASE 1</p>
              <h2>Register Guitar</h2>
            </div>
            <span className={styles["required-note"]}>* Required</span>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label>
              Guitar Model *
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="e.g. Player Stratocaster"
              />
              {errorFor("model")}
            </label>

            <label>
              Body Type *
              <select name="bodyType" value={form.bodyType} onChange={handleChange}>
                <option value="">Select body type</option>
                {BODY_TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
              {errorFor("bodyType")}
            </label>

            <label>
              Brand Name *
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="e.g. Fender"
              />
              {errorFor("brand")}
            </label>

            <label>
              Stock Quantity (1–100) *
              <input
                name="stock"
                type="number"
                min="1"
                max="100"
                value={form.stock}
                onChange={handleChange}
                placeholder="e.g. 20"
              />
              {errorFor("stock")}
            </label>

            <label>
              Manufacturer Name *
              <input
                name="manufacturer"
                value={form.manufacturer}
                onChange={handleChange}
                placeholder="e.g. Fender Musical Instruments"
              />
              {errorFor("manufacturer")}
            </label>

            <fieldset>
              <legend>User Role *</legend>
              <div className={styles["radio-row"]}>
                {ROLES.map((role) => (
                  <label className={styles["radio-label"]} key={role}>
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={form.role === role}
                      onChange={handleChange}
                    />
                    <span>{role}</span>
                  </label>
                ))}
              </div>
              {errorFor("role")}
            </fieldset>

            <button className={styles["primary-btn"]} type="submit">
              + Add Guitar to Registry
            </button>

            {submitted && (
              <div className={styles.success}>Guitar successfully added to the registry.</div>
            )}
          </form>
        </div>

        <div className={styles.card}>
          <div className={styles["card-heading"]}>
            <div>
              <p className={styles["section-label"]}>PHASE 2</p>
              <h2>Guitar Registry</h2>
            </div>
            <span className={styles.count}>{filteredItems.length} records</span>
          </div>

          <div className={styles.toolbar}>
            <input
              className={styles.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search model, brand, body type..."
            />
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={showOnlyInStock}
                onChange={(e) => setShowOnlyInStock(e.target.checked)}
              />
              <span>In-stock only</span>
            </label>
          </div>

          <div className={styles["table-wrap"]}>
            <table>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={row.original.id === activeId ? styles["selected-row"] : ""}
                      onClick={() => setActiveId(row.original.id)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext()) ||
                            cell.getValue()}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className={styles.empty}>
                      No guitars match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {Math.max(table.getPageCount(), 1)}
            </span>
            <div>
              <button
                className={styles["secondary-btn"]}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                ← Previous
              </button>
              <button
                className={styles["secondary-btn"]}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles["profile-card"]}`}>
          <div className={styles["profile-top"]}>
            <div>
              <p className={styles["section-label"]}>PHASE 3 • ACTIVE ITEM</p>
              <h2>Guitar Profile</h2>
            </div>
            {activeItem && (
              <span className={`${styles["role-badge"]} ${styles[activeItem.role.toLowerCase()]}`}>
                {activeItem.role}
              </span>
            )}
          </div>

          {activeItem ? (
            <div className={styles["profile-content"]}>
              <div className={styles["guitar-art"]}>🎸</div>
              <div className={styles["profile-main"]}>
                <h3>{activeItem.model}</h3>
                <p>{activeItem.brand} • {activeItem.bodyType}</p>
                <div className={styles["detail-grid"]}>
                  <div><span>Stock</span><strong>{activeItem.stock}</strong></div>
                  <div><span>Body Type</span><strong>{activeItem.bodyType}</strong></div>
                  <div><span>Brand</span><strong>{activeItem.brand}</strong></div>
                  <div><span>Manufacturer</span><strong>{activeItem.manufacturer}</strong></div>
                </div>
              </div>
            </div>
          ) : (
            <p className={styles["empty-profile"]}>Select a row to view its full details.</p>
          )}

          <div className={styles["hook-note"]}>
            <strong>useEffect sync:</strong> The selected row updates the active
            profile card automatically.
          </div>
        </div>
      </section>

      <footer>
        Set B • React + Vite • TanStack Table • useState • useEffect
      </footer>
    </main>
  );
}

export default App;
