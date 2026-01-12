import CameraModule from "@/components/CameraModule";
import HamburgerMenu from "@/components/HamburgerMenu";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <div className="w-full max-w-md mt-10">
        <header className="mb-8 flex flex-col items-center relative">
          <div className="absolute right-0 top-0">
            <HamburgerMenu />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Next.js Cam</h1>
          <p className="text-gray-500">Demo truy cập Camera an toàn</p>
        </header>

        {/* Gọi Client Component ở đây */}
        <CameraModule />

        <footer className="mt-10 text-center text-sm text-gray-400">
          Yêu cầu kết nối HTTPS để hoạt động
        </footer>
      </div>
    </main>
  );
}
