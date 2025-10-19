const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, ratingSchema } = require('../middleware/validation');

// Create rating
router.post('/', 
  authenticate, 
  validate(ratingSchema), 
  ratingController.createRating
);

// Get ratings for a user
router.get('/user/:userId', 
  ratingController.getRatingsForUser
);

// Get ratings for a specific ride
router.get('/ride/:rideId', 
  authenticate, 
  ratingController.getRatingForRide
);

// Update rating
router.put('/:ratingId', 
  authenticate, 
  validate(ratingSchema), 
  ratingController.updateRating
);

// Delete rating
router.delete('/:ratingId', 
  authenticate, 
  ratingController.deleteRating
);

module.exports = router;