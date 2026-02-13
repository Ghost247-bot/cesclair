const testProductAPI = async () => {
  try {
    console.log('Testing product API with ID 750...');
    
    const response = await fetch('http://localhost:3000/api/products/750');
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.status === 200) {
      console.log('✅ Product API working correctly');
    } else {
      console.log('❌ Product API error:', data.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testProductAPI();
