const testProduct823 = async () => {
  try {
    console.log('Testing product API with ID 823...');
    
    const response = await fetch('http://localhost:3000/api/products/823');
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (response.status === 200) {
      console.log('✅ Product 823 API working correctly');
    } else {
      console.log('❌ Product 823 API error:', data.error);
      console.log('❌ Error code:', data.code);
      console.log('❌ Received ID:', data.receivedId);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testProduct823();
