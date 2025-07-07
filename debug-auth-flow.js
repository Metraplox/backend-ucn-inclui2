// Debug exact auth flow simulation
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

async function simulateAuthFlow() {
  console.log('🔍 Starting exact auth flow simulation...');
  
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('ucn_inclui2_prod');
    const users = db.collection('users');
    
    // Test data
    const testEmail = 'coordinadora@ucn.cl';
    const testPassword = 'password123';
    
    console.log(`\n🔍 Simulating AuthService.validateUser(${testEmail}, ${testPassword})`);
    
    // Step 1: Find user by email (exactly like usersService.findByEmail)
    console.log('Step 1: Finding user by email...');
    const userDoc = await users.findOne({ email: testEmail });
    
    if (!userDoc) {
      console.log('❌ User not found - this would return null');
      return;
    }
    
    console.log('✅ User found:', {
      email: userDoc.email,
      hasPasswordHash: !!userDoc.password_hash,
      isActive: userDoc.isActive
    });
    
    // Step 2: Check if password_hash exists
    console.log('\nStep 2: Checking password_hash...');
    if (!userDoc.password_hash) {
      console.log('❌ No password_hash - this would return null');
      return;
    }
    
    console.log('✅ password_hash exists');
    
    // Step 3: bcrypt.compare (exactly like in AuthService)
    console.log('\nStep 3: Running bcrypt.compare...');
    const isPasswordMatch = await bcrypt.compare(testPassword, userDoc.password_hash);
    
    console.log(`bcrypt.compare result: ${isPasswordMatch}`);
    
    if (!isPasswordMatch) {
      console.log('❌ Password mismatch - this would return null');
      return;
    }
    
    console.log('✅ Password matches!');
    
    // Step 4: Return user without password_hash (like AuthService does)
    console.log('\nStep 4: Preparing return object...');
    const { password_hash, ...result } = userDoc;
    
    console.log('✅ Auth would succeed with user:', {
      email: result.email,
      nombreCompleto: result.nombreCompleto,
      roles: result.roles,
      isActive: result.isActive
    });
    
    console.log('\n🎉 Authentication simulation SUCCESSFUL!');
    
    // Now let's also test if the user object structure matches what's expected
    console.log('\n🔍 Testing toObject() method simulation...');
    
    // This simulates the userDoc.toObject() call
    const userObject = { ...userDoc };
    console.log('userObject type check:', {
      hasToObject: typeof userDoc.toObject === 'function',
      isPlainObject: typeof userObject === 'object'
    });
    
  } catch (error) {
    console.error('❌ Error in simulation:', error);
  } finally {
    await client.close();
    console.log('\n🔍 Simulation completed');
  }
}

simulateAuthFlow();
