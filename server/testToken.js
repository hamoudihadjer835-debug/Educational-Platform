const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDkwYTM1YmVkMTBhNjM1Mjk0OWM1Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQ1NDI5MDAzLCJleHAiOjE3NDgwMjEwMDN9.db6idcnkraaEg_I3aylPo6p4V_rjNCVLz8LViHsb1eY';

async function testAPI() {
  try {
    console.log('Testing API with token...');
    const response = await axios.get('http://localhost:5000/api/admin/modules', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    }
  }
}

testAPI();
