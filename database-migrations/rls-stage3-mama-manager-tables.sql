-- RLS stage 3 — apply ONLY AFTER both are deployed:
--   • mama-manager with the /api/db proxy (utils/supabaseClient.js)
--   • mama.is with the admin menu proxy (lib/api/adminDbClient.js)
-- After this the public key can no longer read or change staff, payroll,
-- bank, invoice, supplier, recipe or menu data.

-- 1. Tables with RLS off → on, no policies (public key denied; service role unaffected)
do $$
declare t text;
begin
  foreach t in array array[
    'manage_bank_notes','manage_electronic_suppliers','manage_invoices',
    'manage_monthly_costs','manage_monthly_salaries','manage_order_items',
    'manage_orders','manage_product_prices','manage_product_subnames',
    'manage_products','manage_recipe_ingredients','manage_recipes',
    'manage_staff_feedback','manage_staff_feedback_products','manage_suppliers',
    'manage_users','manager_bank_statements','manager_bank_transactions',
    'manager_staff','manager_transaction_categories',
    'manager_transaction_categorization_rules','menu_categories',
    'menu_ingredients','menu_item_ingredients','menu_items','n8n_transactions',
    'payday_export_employees','profiles - old','roles'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- 2. Remove "open to everyone" policies on mama-manager tables
drop policy if exists "Allow all operations on clock_employees" on public.clock_employees;
drop policy if exists "Allow all operations on clock_records" on public.clock_records;
drop policy if exists "Allow read on clock_admin_config" on public.clock_admin_config;
drop policy if exists "Allow all for manage_supplier_order_support" on public.manage_supplier_order_support;
drop policy if exists "Allow all for manage_supplier_order_support_items" on public.manage_supplier_order_support_items;
drop policy if exists "Allow all for recipe_ingredient_cost_links" on public.recipe_ingredient_cost_links;
drop policy if exists "Allow anon insert manage_checklist_signoffs" on public.manage_checklist_signoffs;
drop policy if exists "Allow anon select manage_checklist_signoffs" on public.manage_checklist_signoffs;
drop policy if exists "Allow anon insert manage_gm_weekly_reports" on public.manage_gm_weekly_reports;
drop policy if exists "Allow anon select manage_gm_weekly_reports" on public.manage_gm_weekly_reports;
drop policy if exists "Allow anon update manage_gm_weekly_reports" on public.manage_gm_weekly_reports;
drop policy if exists "Allow anon insert manage_needs_fixing" on public.manage_needs_fixing;
drop policy if exists "Allow anon select manage_needs_fixing" on public.manage_needs_fixing;
drop policy if exists "Allow anon update manage_needs_fixing" on public.manage_needs_fixing;
drop policy if exists "Allow anon insert manage_shift_logs" on public.manage_shift_logs;
drop policy if exists "Allow anon select manage_shift_logs" on public.manage_shift_logs;
drop policy if exists "Allow anon select role_checklist_links" on public.role_checklist_links;
drop policy if exists "Allow anon select role_defs" on public.role_defs;
drop policy if exists "Allow anon select role_item_links" on public.role_item_links;
drop policy if exists "Allow anon select role_items" on public.role_items;
drop policy if exists "Allow anon select checklist_templates" on public.checklist_templates;
drop policy if exists "Allow anon select checklist_template_items" on public.checklist_template_items;
drop policy if exists "Allow anon select checklist_items" on public.checklist_items;

-- 3. The clock-in kiosk's live "who's in" list uses realtime on clock_records,
--    which needs read access for the public key. Read-only; no employee details.
create policy "Kiosk realtime read clock_records" on public.clock_records
  for select to anon using (true);
