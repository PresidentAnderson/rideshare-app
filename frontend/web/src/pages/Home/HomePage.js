import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  CarIcon, 
  MapPinIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  StarIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const features = [
    {
      icon: MapPinIcon,
      title: 'Easy Booking',
      description: 'Book rides in seconds with our intuitive interface'
    },
    {
      icon: ClockIcon,
      title: 'Fast Pickup',
      description: 'Get matched with nearby drivers for quick pickup times'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Safe & Secure',
      description: 'All drivers are background checked and verified'
    },
    {
      icon: StarIcon,
      title: 'Highly Rated',
      description: 'Quality service with 4.8+ average rating'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '50K+' },
    { label: 'Cities', value: '25+' },
    { label: 'Drivers', value: '10K+' },
    { label: 'Rides Completed', value: '1M+' }
  ];

  return (
    <>
      <Helmet>
        <title>RideShare - Your Reliable Ride Partner</title>
        <meta name="description" content="Get reliable rides with RideShare. Book instantly, track in real-time, and enjoy safe transportation." />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <CarIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">RideShare</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Your Ride, <span className="text-primary-200">Your Way</span>
              </h1>
              <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
                Experience seamless transportation with our reliable ridesharing platform. 
                Quick bookings, safe rides, and competitive pricing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="btn bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-3"
                >
                  Book Your First Ride
                </Link>
                <Link 
                  to="/register" 
                  className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3"
                >
                  Drive & Earn
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose RideShare?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We make transportation simple, safe, and affordable for everyone
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-primary-200">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Getting around has never been easier
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Request
                </h3>
                <p className="text-gray-600">
                  Open the app and enter your destination
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Match
                </h3>
                <p className="text-gray-600">
                  Get matched with a nearby driver
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ride
                </h3>
                <p className="text-gray-600">
                  Enjoy your ride and pay securely
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of users who trust RideShare for their daily transportation needs
            </p>
            <Link 
              to="/register" 
              className="btn bg-primary-600 text-white hover:bg-primary-700 text-lg px-8 py-3"
            >
              Join RideShare Today
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <CarIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">RideShare</span>
                </div>
                <p className="text-gray-400">
                  Making transportation accessible and affordable for everyone.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">For Riders</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cities</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">For Drivers</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Start Driving</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Requirements</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 RideShare. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;