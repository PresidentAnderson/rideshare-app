import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Menu, Transition } from '@headlessui/react'
import { 
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserCircleIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  TruckIcon,
  UserIcon,
  HomeIcon,
  MapIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { signOut } from '../store/slices/authSlice'
import StatusBadge from './StatusBadge'
import { Fragment } from 'react'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useSelector((state) => state.auth)

  const handleSignOut = async () => {
    await dispatch(signOut())
    navigate('/')
  }

  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon }
    ]

    if (profile?.role === 'rider') {
      return [
        ...baseItems,
        { name: 'Request Ride', href: '/request-ride', icon: MapIcon },
        { name: 'My Rides', href: '/rides', icon: ClockIcon }
      ]
    }

    if (profile?.role === 'driver') {
      return [
        ...baseItems,
        { name: 'My Rides', href: '/rides', icon: ClockIcon }
      ]
    }

    if (profile?.role === 'admin') {
      return [
        ...baseItems,
        { name: 'Admin Panel', href: '/admin', icon: CogIcon }
      ]
    }

    return baseItems
  }

  const navItems = getNavItems()

  const isActiveLink = (href) => {
    return location.pathname === href
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-primary-600 rounded-lg p-2">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">RideShare</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:items-center md:space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                      ${isActiveLink(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Role Badge */}
            {profile?.role && (
              <StatusBadge 
                status={profile.role} 
                type="verification" 
                size="sm"
              />
            )}

            {/* User Dropdown */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 text-sm rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <UserCircleIcon className="h-8 w-8" />
                <div className="text-left">
                  <div className="font-medium">{profile?.full_name || 'User'}</div>
                  <div className="text-xs text-gray-500">{profile?.email}</div>
                </div>
                <ChevronDownIcon className="h-4 w-4" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex items-center space-x-2 px-4 py-2 text-sm text-gray-700`}
                        >
                          <UserIcon className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      )}
                    </Menu.Item>
                    {profile?.role === 'rider' && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/driver/register"
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex items-center space-x-2 px-4 py-2 text-sm text-gray-700`}
                          >
                            <TruckIcon className="h-4 w-4" />
                            <span>Become a Driver</span>
                          </Link>
                        )}
                      </Menu.Item>
                    )}
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleSignOut}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex w-full items-center space-x-2 px-4 py-2 text-sm text-gray-700`}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Transition
        show={isMobileMenuOpen}
        enter="transition ease-out duration-100 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium
                    ${isActiveLink(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            
            {/* Mobile user section */}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="px-3 space-y-3">
                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  <div>
                    <div className="text-base font-medium text-gray-800">
                      {profile?.full_name || 'User'}
                    </div>
                    <div className="text-sm text-gray-500">{profile?.email}</div>
                  </div>
                </div>
                
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    handleSignOut()
                  }}
                  className="flex w-full items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  )
}

export default Navbar