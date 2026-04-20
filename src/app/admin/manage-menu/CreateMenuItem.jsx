"use client";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { supabase } from "@/util/supabase/client";
import { Loader2 } from "lucide-react";

const inputCls = `w-full px-4 py-3 rounded-xl text-sm text-[#2c1810] placeholder-[#9a7a62]
  bg-[#faf6f2] border border-[#e8ddd3]
  focus:outline-none focus:border-[#ff914d]/60 focus:ring-1 focus:ring-[#ff914d]/30
  transition-all duration-200`;

const labelCls = "block text-xs font-medium text-[#9a7a62] mb-2 tracking-wide";

export default function CreateMenuItem() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_categories").select("id, name, order").order("order");
      if (error) throw error;
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories");
    }
  };

  const onSubmitCategory = async (data) => {
    setLoading(true); setError(null);
    try {
      const { error: supabaseError } = await supabase
        .from("menu_categories")
        .insert([{ name: data.categoryName, description: data.categoryDescription, order: parseInt(data.categoryOrder) }]);
      if (supabaseError) throw supabaseError;
      await fetchCategories();
      setSuccess(true); reset(); setShowCategoryForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitMenuItem = async (data) => {
    setLoading(true); setError(null); setSuccess(false);
    try {
      const { error: supabaseError } = await supabase
        .from("menu_items")
        .insert([{
          name: data.name, description: data.description,
          price: parseInt(data.price), category_id: data.category_id,
          order: parseInt(data.order),
        }]);
      if (supabaseError) throw supabaseError;
      setSuccess(true); reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1.5px solid #f0e6d8",
        boxShadow: "0 2px 14px rgba(60,30,10,0.07)",
      }}>
      <div className="h-[1.5px]" style={{ background: "linear-gradient(to right, rgba(255,145,77,0.4), transparent 60%)" }} />
      <div className="p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-cormorant italic text-[#2c1810] text-2xl font-light">
            {showCategoryForm ? "Add Category" : "Add Menu Item"}
          </h2>
          <button onClick={() => setShowCategoryForm(!showCategoryForm)}
            className="px-4 py-2 text-xs font-medium rounded-xl transition-all"
            style={showCategoryForm
              ? { background: "rgba(255,107,107,0.08)", color: "#ff8080", border: "1px solid rgba(255,107,107,0.15)" }
              : { background: "#faf6f2", border: "1px solid #e8ddd3", color: "#ff914d" }
            }>
            {showCategoryForm ? "Cancel" : "+ New Category"}
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl px-4 py-3 text-sm text-[#ff8080]"
            style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.15)" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 rounded-xl px-4 py-3 text-sm text-[#ff914d]"
            style={{ background: "rgba(255,145,77,0.08)", border: "1px solid rgba(255,145,77,0.2)" }}>
            {showCategoryForm ? "Category created!" : "Menu item created!"}
          </div>
        )}

        {showCategoryForm ? (
          <form onSubmit={handleSubmit(onSubmitCategory)} className="space-y-5">
            <div>
              <label className={labelCls}>Category name</label>
              <input {...register("categoryName", { required: "Category name is required" })}
                type="text" className={inputCls} />
              {errors.categoryName && <p className="mt-1 text-xs text-[#ff8080]">{errors.categoryName.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea {...register("categoryDescription")}
                className={inputCls} rows="3" style={{ resize: "none" }} />
            </div>
            <div>
              <label className={labelCls}>Display order</label>
              <input {...register("categoryOrder", {
                required: "Display order is required",
                pattern: { value: /^\d+$/, message: "Order must be a whole number" },
              })} type="number" placeholder="1, 2, 3…" className={inputCls} />
              {errors.categoryOrder && <p className="mt-1 text-xs text-[#ff8080]">{errors.categoryOrder.message}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: "#ff914d", color: "#000" }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</> : "Create Category"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onSubmitMenuItem)} className="space-y-5">
            <div>
              <label className={labelCls}>Category</label>
              <select {...register("category_id", { required: "Please select a category" })}
                className={inputCls}>
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="mt-1 text-xs text-[#ff8080]">{errors.category_id.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Name</label>
              <input {...register("name", { required: "Name is required" })}
                type="text" className={inputCls} />
              {errors.name && <p className="mt-1 text-xs text-[#ff8080]">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea {...register("description", { required: "Description is required" })}
                rows="4" className={inputCls} style={{ resize: "none" }} />
              {errors.description && <p className="mt-1 text-xs text-[#ff8080]">{errors.description.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Price (ISK)</label>
              <div className="relative">
                <input {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                  pattern: { value: /^\d+$/, message: "Price must be a whole number" },
                })} type="number" step="1" className={`${inputCls} pr-12`} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#5a4a40]">ISK</span>
              </div>
              {errors.price && <p className="mt-1 text-xs text-[#ff8080]">{errors.price.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Display order</label>
              <input {...register("order", {
                required: "Display order is required",
                pattern: { value: /^\d+$/, message: "Order must be a whole number" },
              })} type="number" placeholder="1, 2, 3…" className={inputCls} />
              {errors.order && <p className="mt-1 text-xs text-[#ff8080]">{errors.order.message}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: "#ff914d", color: "#000" }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating…</> : "Create Menu Item"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
