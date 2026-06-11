import { Outlet } from 'react-router';

/** App shell: centered card layout carried over from the prototype. */
export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg overflow-hidden min-h-[600px] flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
