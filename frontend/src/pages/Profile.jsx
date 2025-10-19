import { useSelector } from 'react-redux'
import { UserIcon } from '@heroicons/react/24/outline'

const Profile = () => {
  const { profile } = useSelector((state) => state.auth)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="text-gray-600 capitalize">{profile?.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{profile?.email || 'Not provided'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <p className="mt-1 text-gray-900">{profile?.phone || 'Not provided'}</p>
          </div>

          <div className="pt-4">
            <button className="btn btn-primary">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile