// Simple test to isolate wishlist issue
const https = require('https');

async function testWishlistAPI() {
  console.log('Testing wishlist API...');
  
  try {
    const response = await https.fetch('http://localhost:3000/api/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test-session'
      },
      body: JSON.stringify({ productId: 123 })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Wishlist API working correctly');
    } else {
      console.log('❌ Wishlist API failed:', data);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testWishlistAPI();
