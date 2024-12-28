import Link from "next/link";
import { 
  FaYoutube, 
  FaHandHoldingHeart,
  FaArrowRight,
  FaDiscord,
  FaTiktok,
  FaGithub
} from "react-icons/fa";
import { getLatestVersion } from "@/lib/github";

const socialLinks = [
  { name: "discord", url: "https://instagram.com", icon: <FaDiscord className="h-5 w-5 text-blue-700" /> },
  { name: "youtube", url: "https://youtube.com", icon: <FaYoutube className="h-5 w-5 text-red-600" /> },
  { name: "twitter", url: "https://twitter.com", icon: <FaTiktok className="h-5 w-5 text-gray-800" /> },
  { name: "patronite", url: "https://patronite.pl", icon: <FaHandHoldingHeart className="h-5 w-5 text-primary" /> },
  { name: "github", url: "https://github.com/miskibin/sejmofront", icon: <FaGithub className="h-5 w-5 text-gray-800" /> },
];

const navLinks = [
  { name: "Procesy Sejmowe", url: "/procesy" },
  { name: "Posłowie", url: "/poslowie" },
  { name: "Posiedzenia sejmu", url: "/posiedzenia" },
];

export async function Footer() {
  const version = await getLatestVersion();
  
  return (
    <footer className="py-8 sm:py-16 px-4 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo and About Section */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <div className="text-primary text-2xl sm:text-3xl font-bold">Sejmofil</div>
            </Link>
            <p className="text-sm sm:text-base max-w-xs text-gray-600">
              Ustawa o bezpieczeństwie danych w sieciach społecznościowych
            </p>
            <Link 
              href="/patronite" 
              className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity text-sm sm:text-base"
            >
              <FaHandHoldingHeart className="h-5 w-5" />
              <span>Wspomóż nas na Patronite</span>
              <FaArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mission Section - Hidden on mobile */}
          <div className="hidden md:block space-y-4">
            <h3 className="text-primary font-semibold">Nasza Misja</h3>
            <p className="text-sm text-gray-600">Znajduję wspólny grunt z różnymi</p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-primary font-semibold">Odkryj</h3>
            <ul className="space-y-2">
              {navLinks.map(({ name, url }) => (
                <li key={url}>
                  <Link href={url} className="text-sm text-gray-600 hover:text-primary transition-colors">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-primary font-semibold">Śledź nas</h3>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map(({ name, url, icon }) => (
                <Link
                  key={url}
                  href={url}
                  target="_blank"
                  className="text-gray-600 hover:text-primary transition-colors"
                  title={name}
                >
                  {icon}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 sm:mt-16 pt-4 sm:pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <p>© Wszelkie prawa zastrzeżone {new Date().getFullYear()}</p>
              <span className="hidden sm:inline">•</span>
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                {version}
              </span>
            </div>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Polityka Prywatności
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
