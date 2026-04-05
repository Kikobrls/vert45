import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex overflow-x-auto">
              <div className="flex-shrink-0 flex items-center mr-4">
                <span className="text-xl font-bold text-blue-600">HRIS</span>
              </div>
              <div className="flex space-x-4 sm:space-x-8">
                <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap">
                  Absen
                </Link>
                <Link href="/dashboard/leave" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap">
                  Cuti
                </Link>
                <Link href="/dashboard/overtime" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap">
                  Lembur
                </Link>
                <Link href="/dashboard/payslips" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap">
                  Slip Gaji
                </Link>
              </div>
            </div>
            <div className="flex items-center ml-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main>
        {children}
      </main>
    </div>
  );
}