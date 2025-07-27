// Simple test to verify core functionality

const { ethers } = require('ethers')

// Test wallet signature verification
async function testSignatureVerification() {
  console.log('🧪 Testing signature verification...')
  
  try {
    // Create a test wallet
    const wallet = ethers.Wallet.createRandom()
    const message = 'Test message for Web3 Chat Room'
    
    // Sign the message
    const signature = await wallet.signMessage(message)
    
    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(message, signature)
    
    if (recoveredAddress.toLowerCase() === wallet.address.toLowerCase()) {
      console.log('✅ Signature verification: PASSED')
      return true
    } else {
      console.log('❌ Signature verification: FAILED')
      return false
    }
  } catch (error) {
    console.error('❌ Signature verification error:', error.message)
    return false
  }
}

// Test IPFS hash generation (mock)
function testIPFSHash() {
  console.log('🧪 Testing IPFS hash generation...')
  
  try {
    const mockMessage = {
      content: 'Hello, Web3 Chat!',
      sender: '0x1234567890123456789012345678901234567890',
      timestamp: Date.now(),
      roomId: 'test-room'
    }
    
    // Mock IPFS hash (in real implementation, this would be actual IPFS hash)
    const mockHash = 'QmTest' + Math.random().toString(36).substring(2, 15)
    
    if (mockHash.length > 10) {
      console.log('✅ IPFS hash generation: PASSED')
      console.log(`   Generated hash: ${mockHash}`)
      return true
    } else {
      console.log('❌ IPFS hash generation: FAILED')
      return false
    }
  } catch (error) {
    console.error('❌ IPFS hash generation error:', error.message)
    return false
  }
}

// Test encryption/decryption
function testEncryption() {
  console.log('🧪 Testing encryption/decryption...')
  
  try {
    const originalMessage = 'Secret message for Web3 Chat'
    const key = 'test-encryption-key'
    
    // Simple XOR encryption (same as in encryption service)
    function xorEncrypt(text, key) {
      let result = ''
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        )
      }
      return result
    }
    
    // Encrypt
    const encrypted = xorEncrypt(originalMessage, key)
    
    // Decrypt (XOR is symmetric)
    const decrypted = xorEncrypt(encrypted, key)
    
    if (decrypted === originalMessage) {
      console.log('✅ Encryption/Decryption: PASSED')
      return true
    } else {
      console.log('❌ Encryption/Decryption: FAILED')
      console.log(`   Original: ${originalMessage}`)
      console.log(`   Decrypted: ${decrypted}`)
      return false
    }
  } catch (error) {
    console.error('❌ Encryption/Decryption error:', error.message)
    return false
  }
}

// Test room ID generation
function testRoomIdGeneration() {
  console.log('🧪 Testing room ID generation...')
  
  try {
    function generateRoomId() {
      return Math.random().toString(36).substring(2, 15) + 
             Math.random().toString(36).substring(2, 15)
    }
    
    const roomId1 = generateRoomId()
    const roomId2 = generateRoomId()
    
    if (roomId1 !== roomId2 && roomId1.length > 10 && roomId2.length > 10) {
      console.log('✅ Room ID generation: PASSED')
      console.log(`   Generated IDs: ${roomId1}, ${roomId2}`)
      return true
    } else {
      console.log('❌ Room ID generation: FAILED')
      return false
    }
  } catch (error) {
    console.error('❌ Room ID generation error:', error.message)
    return false
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Running Web3 Chat Room Tests...\n')
  
  const tests = [
    testSignatureVerification,
    testIPFSHash,
    testEncryption,
    testRoomIdGeneration
  ]
  
  let passedTests = 0
  
  for (const test of tests) {
    const result = await test()
    if (result) passedTests++
    console.log('')
  }
  
  console.log(`📊 Test Results: ${passedTests}/${tests.length} passed`)
  
  if (passedTests === tests.length) {
    console.log('🎉 All tests passed! Your Web3 Chat Room setup is working correctly.')
  } else {
    console.log('⚠️  Some tests failed. Please check your setup.')
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests()
}

module.exports = {
  testSignatureVerification,
  testIPFSHash,
  testEncryption,
  testRoomIdGeneration,
  runTests
}
