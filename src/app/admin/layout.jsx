import PageBackground from "@/app/components/ui/PageBackground";

/**
 * AdminLayout — shared wrapper for every /admin/* page.
 * The default `data-navbar-theme` is "dark" because every admin page starts
 * with an AdminHero dark-espresso band at the top. Individual subpages can
 * override by placing their own data-navbar-theme attribute deeper in the tree.
 */
export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen relative" data-navbar-theme="dark">
      <PageBackground />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
