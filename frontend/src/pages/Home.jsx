import { Link } from 'react-router-dom'
import { 
  TruckIcon, 
  ShieldCheckIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  MapPinIcon,
  StarIcon,
  UsersIcon,
  CheckCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline'

const Home = () => {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Safe & Secure',
      description: 'All drivers are verified with background checks and vehicle inspections'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Affordable Rates',
      description: 'Transparent pricing with no hidden fees and competitive rates'
    },
    {
      icon: ClockIcon,
      title: '24/7 Available',
      description: 'Get rides anytime, anywhere in the city with our round-the-clock service'
    }
  ]

  const stats = [
    { value: '50K+', label: 'Happy Riders' },
    { value: '5K+', label: 'Verified Drivers' },
    { value: '100K+', label: 'Rides Completed' },
    { value: '4.9★', label: 'Average Rating' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-white/20 backdrop-blur-lg rounded-full p-4">
                <TruckIcon className="h-16 w-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              Your Journey
              <br />
              <span className="text-primary-200">Starts Here</span>
            </h1>
            <p className="text-xl text-primary-100 mb-12 max-w-3xl mx-auto">
              Experience safe, reliable, and affordable rides with RideShare. 
              Connect with verified drivers in your area and get to your destination hassle-free.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 shadow-lg"
              >
                <UserIcon className="h-5 w-5 mr-2" />
                Get Started
              </Link>
              <Link
                to="/login"
                className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 bg-white/10 rounded-full"></div>
        </div>
        <div className="absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2">
          <div className="w-64 h-64 bg-white/5 rounded-full"></div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RideShare?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing the best ride-sharing experience with safety, 
              reliability, and affordability at the core of everything we do.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors duration-300">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting a ride is simple and straightforward
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 text-lg font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Book Your Ride
              </h3>
              <p className="text-gray-600">
                Enter your pickup and drop-off locations to request a ride
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 text-lg font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Get Matched
              </h3>
              <p className="text-gray-600">
                We'll connect you with a verified driver nearby
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6 text-lg font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Enjoy Your Ride
              </h3>
              <p className="text-gray-600">
                Sit back and enjoy a safe, comfortable journey
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied riders and drivers on our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100"
            >
              Sign Up as Rider
            </Link>
            <Link
              to="/driver/register"
              className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600"
            >
              Become a Driver
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home