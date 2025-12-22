export function SiteFooter() {
  return (
    <footer id="contact" className="border-t bg-acent/40">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-black flex flex-col md:flex-row items-center justify-between gap-3">
        <p>&copy; {new Date().getFullYear()} Hafrin Coffee</p>
        <div className="flex items-center gap-6 text-black">
          <a href="https://www.instagram.com/hafrin.coffeee/" aria-label="@hafrin.coffee on Instagram" className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-instagram size-5"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            @hafrin.coffeee
          </a>
          <a href="https://www.tiktok.com/@hafrin.coffee" aria-label="@hafrin.coffee on Tiktok" className="flex items-center gap-1">
            <img
              src="/tik-tok.png"
              alt="TikTok Icon"
              className="size-5"
            />
            @hafrin.coffee
          </a>
        </div>
      </div>
    </footer>
  )
}