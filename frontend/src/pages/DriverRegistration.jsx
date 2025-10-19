import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  UserIcon, 
  TruckIcon, 
  DocumentTextIcon,
  CameraIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { registerDriver } from '../store/slices/driverSlice'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const DriverRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadedDocs, setUploadedDocs] = useState({})
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state) => state.driver)
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger
  } = useForm()

  const steps = [
    { id: 1, name: 'Personal Info', icon: UserIcon },
    { id: 2, name: 'Vehicle Details', icon: TruckIcon },
    { id: 3, name: 'Documents', icon: DocumentTextIcon },
    { id: 4, name: 'Review', icon: CheckCircleIcon }
  ]

  const requiredDocuments = [
    { id: 'license', name: 'Driver\'s License', required: true },
    { id: 'insurance', name: 'Vehicle Insurance', required: true },
    { id: 'registration', name: 'Vehicle Registration', required: true },
    { id: 'background', name: 'Background Check', required: false }
  ]

  const handleFileUpload = (docType, file) => {
    // In real app, upload to cloud storage
    setUploadedDocs(prev => ({
      ...prev,
      [docType]: file.name
    }))
    toast.success(`${requiredDocuments.find(d => d.id === docType)?.name} uploaded successfully`)
  }

  const nextStep = async () => {
    const isValid = await trigger()
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data) => {
    try {
      const driverData = {
        ...data,
        documents: uploadedDocs,
        status: 'pending_verification'
      }

      const result = await dispatch(registerDriver(driverData))
      if (result.type === 'driver/register/fulfilled') {
        toast.success('Driver application submitted successfully!')
        navigate('/dashboard')
      } else {
        toast.error(result.payload || 'Registration failed')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date of Birth *
          </label>
          <input
            {...register('dateOfBirth', {
              required: 'Date of birth is required',
            })}
            type="date"
            className={`input mt-1 ${errors.dateOfBirth ? 'border-red-500' : ''}`}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Driver's License Number *
          </label>
          <input
            {...register('licenseNumber', {
              required: 'License number is required',
              minLength: {
                value: 8,
                message: 'License number must be at least 8 characters'
              }
            })}
            type="text"
            className={`input mt-1 ${errors.licenseNumber ? 'border-red-500' : ''}`}
            placeholder="Enter license number"
          />
          {errors.licenseNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.licenseNumber.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Emergency Contact Name *
        </label>
        <input
          {...register('emergencyContactName', {
            required: 'Emergency contact name is required',
          })}
          type="text"
          className={`input mt-1 ${errors.emergencyContactName ? 'border-red-500' : ''}`}
          placeholder="Enter emergency contact name"
        />
        {errors.emergencyContactName && (
          <p className="mt-1 text-sm text-red-600">{errors.emergencyContactName.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Emergency Contact Phone *
        </label>
        <input
          {...register('emergencyContactPhone', {
            required: 'Emergency contact phone is required',
            pattern: {
              value: /^[+]?[(]?[\d\s\-\(\)]{10,}$/,
              message: 'Invalid phone number'
            }
          })}
          type="tel"
          className={`input mt-1 ${errors.emergencyContactPhone ? 'border-red-500' : ''}`}
          placeholder="+1 (555) 123-4567"
        />
        {errors.emergencyContactPhone && (
          <p className="mt-1 text-sm text-red-600">{errors.emergencyContactPhone.message}</p>
        )}
      </div>
    </div>
  )

  const renderVehicleDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Make *
          </label>
          <input
            {...register('vehicleMake', {
              required: 'Vehicle make is required',
            })}
            type="text"
            className={`input mt-1 ${errors.vehicleMake ? 'border-red-500' : ''}`}
            placeholder="Toyota, Honda, etc."
          />
          {errors.vehicleMake && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleMake.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Model *
          </label>
          <input
            {...register('vehicleModel', {
              required: 'Vehicle model is required',
            })}
            type="text"
            className={`input mt-1 ${errors.vehicleModel ? 'border-red-500' : ''}`}
            placeholder="Camry, Civic, etc."
          />
          {errors.vehicleModel && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleModel.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Year *
          </label>
          <select
            {...register('vehicleYear', {
              required: 'Vehicle year is required',
            })}
            className={`input mt-1 ${errors.vehicleYear ? 'border-red-500' : ''}`}
          >
            <option value="">Select year</option>
            {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {errors.vehicleYear && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleYear.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Color *
          </label>
          <input
            {...register('vehicleColor', {
              required: 'Vehicle color is required',
            })}
            type="text"
            className={`input mt-1 ${errors.vehicleColor ? 'border-red-500' : ''}`}
            placeholder="White, Black, etc."
          />
          {errors.vehicleColor && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleColor.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          License Plate *
        </label>
        <input
          {...register('vehiclePlate', {
            required: 'License plate is required',
          })}
          type="text"
          className={`input mt-1 ${errors.vehiclePlate ? 'border-red-500' : ''}`}
          placeholder="ABC-123"
        />
        {errors.vehiclePlate && (
          <p className="mt-1 text-sm text-red-600">{errors.vehiclePlate.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Number of Seats *
        </label>
        <select
          {...register('vehicleSeats', {
            required: 'Number of seats is required',
          })}
          className={`input mt-1 ${errors.vehicleSeats ? 'border-red-500' : ''}`}
        >
          <option value="">Select seats</option>
          <option value="2">2 seats</option>
          <option value="4">4 seats</option>
          <option value="5">5 seats</option>
          <option value="7">7 seats</option>
          <option value="8">8+ seats</option>
        </select>
        {errors.vehicleSeats && (
          <p className="mt-1 text-sm text-red-600">{errors.vehicleSeats.message}</p>
        )}
      </div>
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Please upload clear photos of the following documents. All images should be legible and current.
      </p>
      
      {requiredDocuments.map((doc) => (
        <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium text-gray-900">{doc.name}</h3>
              {doc.required && <span className="text-red-500 text-sm">* Required</span>}
            </div>
            {uploadedDocs[doc.id] && (
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files[0] && handleFileUpload(doc.id, e.target.files[0])}
              />
              <CameraIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-primary-600 hover:text-primary-500">
                {uploadedDocs[doc.id] ? 'Replace' : 'Upload'}
              </span>
            </label>
            {uploadedDocs[doc.id] && (
              <span className="text-sm text-gray-600">{uploadedDocs[doc.id]}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderReview = () => {
    const watchedValues = watch()
    return (
      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Personal Information</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div><span className="font-medium">Date of Birth:</span> {watchedValues.dateOfBirth}</div>
            <div><span className="font-medium">License Number:</span> {watchedValues.licenseNumber}</div>
            <div><span className="font-medium">Emergency Contact:</span> {watchedValues.emergencyContactName} ({watchedValues.emergencyContactPhone})</div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-3">Vehicle Information</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div><span className="font-medium">Vehicle:</span> {watchedValues.vehicleYear} {watchedValues.vehicleMake} {watchedValues.vehicleModel}</div>
            <div><span className="font-medium">Color:</span> {watchedValues.vehicleColor}</div>
            <div><span className="font-medium">License Plate:</span> {watchedValues.vehiclePlate}</div>
            <div><span className="font-medium">Seats:</span> {watchedValues.vehicleSeats}</div>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-3">Documents Uploaded</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {Object.keys(uploadedDocs).length === 0 ? (
              <p className="text-sm text-gray-500">No documents uploaded</p>
            ) : (
              <div className="space-y-1 text-sm">
                {Object.entries(uploadedDocs).map(([docId, fileName]) => (
                  <div key={docId} className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <span>{requiredDocuments.find(d => d.id === docId)?.name}: {fileName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Your application will be reviewed within 24-48 hours</li>
            <li>• You'll receive an email notification about your approval status</li>
            <li>• Once approved, you can start accepting ride requests</li>
            <li>• Background check may take additional 2-3 business days</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  <step.icon className="h-4 w-4" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step.id ? 'text-primary-600' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {steps[currentStep - 1].name}
            </h2>
            
            {currentStep === 1 && renderPersonalInfo()}
            {currentStep === 2 && renderVehicleDetails()}
            {currentStep === 3 && renderDocuments()}
            {currentStep === 4 && renderReview()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary flex items-center space-x-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <span>Submit Application</span>
                    <CheckCircleIcon className="h-5 w-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default DriverRegistration