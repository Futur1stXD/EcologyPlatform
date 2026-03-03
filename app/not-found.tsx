import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-[#e5e5e5] mb-4">404</p>
      <h1 className="text-2xl font-bold text-[#0a0a0a] mb-2">Page not found</h1>
      <p className="text-sm text-[#6b6b6b] mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
}
