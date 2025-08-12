const express = require('express');
const router = express.Router();
const db = require('../config/db');
const clerkAuth = require('../middleware/clerkAuth');
const { clerkClient } = require('@clerk/clerk-sdk-node');
const { sign } = require('../utils/jwt');

// Sync Clerk user with our database
router.post('/sync-user', clerkAuth, async (req, res) => {
  console.log('Received sync-user request');
  const startTime = Date.now();
  
  try {
    const clerkUser = req.auth;
    console.log('Raw Clerk user data:', JSON.stringify(clerkUser, null, 2));
    
    // Get the user ID from the session
    const userId = clerkUser.userId || clerkUser.sub;
    if (!userId) {
      console.error('No user ID found in Clerk session');
      return res.status(400).json({ 
        success: false, 
        error: 'No user ID found in session'
      });
    }
    
    // Fetch the complete user data from Clerk
    console.log('Fetching user data for ID:', userId);
    const fullUser = await clerkClient.users.getUser(userId);
    console.log('Full Clerk user data:', JSON.stringify(fullUser, null, 2));
    
    // Extract email from the full user data
    let email = fullUser.emailAddresses?.[0]?.emailAddress || 
               fullUser.primaryEmailAddress?.emailAddress ||
               fullUser.emailAddresses?.[0]?.email_address ||
               fullUser.primaryEmailAddress?.email_address;
               
    // Log the extracted email for debugging
    console.log('Extracted email:', email);
    
    if (!email) {
      console.error('No email found in Clerk user data');
      return res.status(400).json({ 
        success: false, 
        error: 'No email found in user data',
        debug: {
          emailAddresses: fullUser.emailAddresses,
          primaryEmail: fullUser.primaryEmailAddress,
          fullUser: fullUser
        }
      });
    }
    
    // Extract name from different possible locations
    let fullName = '';
    if (fullUser.firstName || fullUser.lastName) {
      fullName = `${fullUser.firstName || ''} ${fullUser.lastName || ''}`.trim();
    } else if (fullUser.username) {
      fullName = fullUser.username;
    } else if (fullUser.emailAddresses?.[0]?.emailAddress) {
      // Use email prefix as fallback
      fullName = fullUser.emailAddresses[0].emailAddress.split('@')[0];
    }
    
    // Check if user exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log('Existing user data from DB:', existingUser[0]);
    
    if (existingUser.length === 0) {
      // Create new user
      const [result] = await db.query(
        'INSERT INTO users (fullName, email, role, state, auth_provider) VALUES (?, ?, ?, ?, ?)',
        [fullName, email, 'student', 'active', 'google']
      );
      
      // Generate JWT token for the new user
      const jwtToken = sign({
        id: result.insertId,
        email: email,
        role: 'student',
        auth_provider: 'google'
      });
      
      return res.json({
        success: true,
        userId: result.insertId,
        isNewUser: true,
        email: email,
        jwtToken: jwtToken
      });
    }
    
    // User exists, return their info
    // Generate JWT token for the existing user
    const jwtToken = sign({
      id: existingUser[0].id,
      email: email,
      role: existingUser[0].role,
      auth_provider: 'google'
    });
    
    res.json({
      success: true,
      userId: existingUser[0].id,
      isNewUser: false,
      email: email,
      role: existingUser[0].role,
      jwtToken: jwtToken,
      isvalidated: existingUser[0].isValidated || 0
    });
    
  } catch (error) {
    console.error('Error syncing Google user:', error);
    
    // Check if it's a Clerk API error
    if (error.errors && error.errors.length > 0) {
      console.error('Clerk API errors:', error.errors);
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to sync user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      clerkErrors: error.errors || []
    });
  }
});

// Update user role endpoint
router.post('/update-role', clerkAuth, async (req, res) => {
  console.log('Received update-role request');
  
  try {
    const { role } = req.body;
    const clerkUser = req.auth;
    
    if (!role || !['eleve', 'moniteur'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be "eleve" or "moniteur"'
      });
    }
    
    // Get the user ID from the Clerk session
    const userId = clerkUser.userId || clerkUser.sub;
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'No user ID found in session'
      });
    }
    
    // Fetch the complete user data from Clerk to get the email
    const fullUser = await clerkClient.users.getUser(userId);
    const email = fullUser.emailAddresses?.[0]?.emailAddress || 
                 fullUser.primaryEmailAddress?.emailAddress;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'No email found in user data'
      });
    }
    
    // Update the user's role in the database using their email
    const [result] = await db.query(
      'UPDATE users SET role = ? WHERE email = ?',
      [role, email]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found in database'
      });
    }
    
    // Get the updated user data to generate a new JWT token
    const [updatedUser] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (updatedUser.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Failed to retrieve updated user data'
      });
    }
    
    console.log('Updated user data from DB:', updatedUser[0]);
    
    // Generate new JWT token with updated role
    const jwtToken = sign({
      id: updatedUser[0].id,
      email: email,
      role: role,
      auth_provider: 'google'
    });
    
    console.log(`Successfully updated user ${email} role to ${role}`);
    
    res.json({
      success: true,
      message: 'Role updated successfully',
      jwtToken: jwtToken,
      role: role,
      isvalidated: updatedUser[0].isValidated || 0
    });
    
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update role',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
