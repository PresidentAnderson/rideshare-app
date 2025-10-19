import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import { store } from '../store';
import { 
  updateCurrentRideStatus, 
  setNearbyDrivers, 
  updateDriverLocation 
} from '../store/slices/rideSlice';
import { 
  setOnlineStatus, 
  updateNearbyDriver, 
  removeNearbyDriver, 
  addNearbyDriver 
} from '../store/slices/driverSlice';
import { updatePaymentStatus } from '../store/slices/paymentSlice';
import { addNotification } from '../store/slices/uiSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
  }

  connect() {
    const token = Cookies.get('authToken');
    if (!token) {
      console.log('No auth token found, skipping WebSocket connection');
      return;
    }

    this.socket = io(process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:3000', {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      
      store.dispatch(addNotification({
        type: 'success',
        title: 'Connected',
        message: 'Real-time updates enabled',
      }));
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleConnectionError();
    });

    this.socket.on('connected', (data) => {
      console.log('WebSocket authentication successful:', data);
    });

    // Ride events
    this.socket.on('new_ride_request', (data) => {
      console.log('New ride request:', data);
      
      store.dispatch(addNotification({
        type: 'info',
        title: 'New Ride Request',
        message: `Ride request from ${data.pickup.address} to ${data.destination.address}`,
        action: {
          type: 'VIEW_RIDE',
          rideId: data.rideId,
        },
      }));
    });

    this.socket.on('ride_accepted', (data) => {
      console.log('Ride accepted:', data);
      
      store.dispatch(updateCurrentRideStatus({
        status: 'accepted',
        driver: data.driver,
      }));

      store.dispatch(addNotification({
        type: 'success',
        title: 'Ride Accepted',
        message: `${data.driver.name} is on the way!`,
      }));
    });

    this.socket.on('ride_status_updated', (data) => {
      console.log('Ride status updated:', data);
      
      store.dispatch(updateCurrentRideStatus({
        status: data.status,
      }));

      const statusMessages = {
        'driver_arrived': 'Your driver has arrived',
        'in_progress': 'Your ride is in progress',
        'completed': 'Ride completed successfully',
        'cancelled_by_driver': 'Ride was cancelled by driver',
        'cancelled_by_rider': 'Ride was cancelled',
      };

      if (statusMessages[data.status]) {
        store.dispatch(addNotification({
          type: data.status.includes('cancelled') ? 'warning' : 'info',
          title: 'Ride Update',
          message: statusMessages[data.status],
        }));
      }
    });

    this.socket.on('ride_cancelled', (data) => {
      console.log('Ride cancelled:', data);
      
      store.dispatch(updateCurrentRideStatus({
        status: data.cancelledBy === 'rider' ? 'cancelled_by_rider' : 'cancelled_by_driver',
      }));

      store.dispatch(addNotification({
        type: 'warning',
        title: 'Ride Cancelled',
        message: data.reason || 'Ride was cancelled',
      }));
    });

    this.socket.on('driver_arrived', (data) => {
      console.log('Driver arrived:', data);
      
      store.dispatch(addNotification({
        type: 'success',
        title: 'Driver Arrived',
        message: 'Your driver has arrived at the pickup location',
      }));
    });

    this.socket.on('ride_completed', (data) => {
      console.log('Ride completed:', data);
      
      store.dispatch(addNotification({
        type: 'success',
        title: 'Ride Completed',
        message: `Total fare: $${data.totalFare}`,
        action: {
          type: 'RATE_RIDE',
          rideId: data.rideId,
        },
      }));
    });

    // Driver events
    this.socket.on('driver_status_updated', (data) => {
      console.log('Driver status updated:', data);
      
      store.dispatch(updateNearbyDriver({
        driverId: data.driverId,
        updates: { isOnline: data.isOnline },
      }));

      if (!data.isOnline) {
        store.dispatch(removeNearbyDriver(data.driverId));
      }
    });

    this.socket.on('driver_location_updated', (data) => {
      console.log('Driver location updated:', data);
      
      store.dispatch(updateDriverLocation({
        driverId: data.driverId,
        location: data.location,
      }));
    });

    // Payment events
    this.socket.on('payment_completed', (data) => {
      console.log('Payment completed:', data);
      
      store.dispatch(updatePaymentStatus({
        paymentId: data.paymentId,
        status: 'completed',
      }));

      store.dispatch(addNotification({
        type: 'success',
        title: 'Payment Completed',
        message: `Payment of $${data.amount} was successful`,
      }));
    });

    this.socket.on('payment_failed', (data) => {
      console.log('Payment failed:', data);
      
      store.dispatch(updatePaymentStatus({
        paymentId: data.paymentId,
        status: 'failed',
      }));

      store.dispatch(addNotification({
        type: 'error',
        title: 'Payment Failed',
        message: data.reason || 'Payment could not be processed',
      }));
    });

    // Emergency events
    this.socket.on('emergency_alert', (data) => {
      console.log('Emergency alert:', data);
      
      store.dispatch(addNotification({
        type: 'error',
        title: 'Emergency Alert',
        message: `Emergency reported: ${data.message}`,
        persistent: true,
      }));
    });

    // Message events
    this.socket.on('new_message', (data) => {
      console.log('New message:', data);
      
      store.dispatch(addNotification({
        type: 'info',
        title: 'New Message',
        message: data.message,
      }));
    });
  }

  handleConnectionError() {
    this.reconnectAttempts++;
    
    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      store.dispatch(addNotification({
        type: 'warning',
        title: 'Connection Issue',
        message: 'Trying to reconnect...',
      }));
    } else {
      console.log('Max reconnection attempts reached');
      
      store.dispatch(addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: 'Could not establish real-time connection',
      }));
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Emit events
  joinRide(rideId) {
    if (this.socket) {
      this.socket.emit('join_ride', rideId);
    }
  }

  leaveRide(rideId) {
    if (this.socket) {
      this.socket.emit('leave_ride', rideId);
    }
  }

  updateDriverStatus(isOnline) {
    if (this.socket) {
      this.socket.emit('driver_status_change', { isOnline });
    }
  }

  updateDriverLocation(lat, lng) {
    if (this.socket) {
      this.socket.emit('driver_location_update', { lat, lng });
    }
  }

  sendMessage(rideId, message) {
    if (this.socket) {
      this.socket.emit('send_message', { rideId, message });
    }
  }

  reportEmergency(rideId, location, message) {
    if (this.socket) {
      this.socket.emit('emergency', { rideId, location, message });
    }
  }

  updateRideStatus(rideId, status) {
    if (this.socket) {
      this.socket.emit('ride_status_update', { rideId, status });
    }
  }

  // Check if connected
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;