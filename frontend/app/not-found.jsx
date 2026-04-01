import { Button } from "antd";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-8xl md:text-9xl font-bold">
            404
          </h1>
          <p className="text-2xl md:text-3xl font-semibold">
            Page not found
          </p>
        </div>

        <Link
          href="/"
          className="inline-block px-8 py-3 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors"
        >
          <Button>Return to home</Button>
        </Link>
      </div>
    </div>
  );
}
