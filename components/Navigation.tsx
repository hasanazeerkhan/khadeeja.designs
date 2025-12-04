export default function Navigation() {
  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 bg-neutral-900/80 backdrop-blur-lg rounded-full p-2 shadow-xl z-50">
      <ul className="flex items-center gap-1">
        <li>
          <a
            href="#about"
            className="nav-link flex items-center gap-2 px-5 py-2.5 rounded-full text-neutral-200 hover:bg-neutral-700 transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            About
          </a>
        </li>
        <li>
          <a
            href="#portfolio"
            className="nav-link flex items-center gap-2 px-5 py-2.5 rounded-full text-neutral-200 hover:bg-neutral-700 transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5m-16.5 4.5h16.5m-16.5 4.5H12" />
            </svg>
            Work
          </a>
        </li>
        <li>
          <a
            href="/blog"
            className="nav-link flex items-center gap-2 px-5 py-2.5 rounded-full text-neutral-200 hover:bg-neutral-700 transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18V7.875c0-.621.504-1.125 1.125-1.125H6.75M16.5 6.75h-9v-3c0-.621.504-1.125 1.125-1.125h6.75C15.996 2.625 16.5 3.129 16.5 3.75v3Z" />
            </svg>
            Blog
          </a>
        </li>
        <li>
          <a
            href="#contact"
            className="nav-link flex items-center gap-2 px-5 py-2.5 rounded-full text-neutral-200 hover:bg-neutral-700 transition-colors text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <circle cx="12" cy="7" r="4" />
              <path d="M5 21c0-4 3-7 7-7s7 3 7 7" />
            </svg>
            Contact
          </a>
        </li>
      </ul>
    </nav>
  );
}
