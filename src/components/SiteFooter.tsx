export function SiteFooter() {
  return (
    <footer className="bg-navy-deep text-cream pt-14 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-10 pb-10 border-b border-cream/10">
          <div>
            <p className="font-serif text-xl font-bold">Dr. Jimrise Ochwach, PhD</p>
            <p className="text-gold text-sm mt-1 tracking-wider uppercase">Lecturer, Applied Mathematics</p>
            <p className="text-cream/65 text-sm mt-4 leading-relaxed">Applied Mathematics · Research · Teaching</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">Quick Links</p>
            <ul className="grid grid-cols-2 gap-y-2 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About" },
                { to: "/research", label: "Research" },
                { to: "/resources", label: "Resources" },
                { to: "/blogs", label: "Insights" },
                { to: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.to}>
                  <a href={l.to} className="text-cream/75 hover:text-gold transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-4">Institution</p>
            <p className="text-cream/75 text-sm leading-relaxed">
              Mama Ngina University College<br />
              Dept. of Computing & IT<br />
              Kenya
            </p>
          </div>
        </div>
        <p className="text-xs text-cream/55 pt-6 text-center">
          © 2024 – 2025 Dr. Jimrise Ochwach, PhD | Mama Ngina University College
        </p>
      </div>
    </footer>
  );
}
