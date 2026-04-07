#!/bin/bash

# Demo script for testing Ghast Chat API

BASE_URL="http://localhost:8090"
USER_ID="demo-user-$(date +%s)"

echo "🧪 Ghast Chat API Testing"
echo "========================="
echo ""
echo "Using User ID: $USER_ID"
echo ""

# Test 1: Get conversations
echo "1️⃣  Fetching conversations..."
curl -s -H "X-User-ID: $USER_ID" \
  -X GET "$BASE_URL/api/v1/conversations" | jq . || echo "No conversations yet"
echo ""

# Test 2: Create a conversation
echo "2️⃣  Creating a new conversation..."
CONV_ID=$(curl -s -H "X-User-ID: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Chat",
    "description": "Test conversation",
    "is_group": false,
    "member_ids": ["other-user-123"]
  }' \
  -X POST "$BASE_URL/api/v1/conversations/create" | jq -r '.conversation.id')

echo "Created conversation: $CONV_ID"
echo ""

# Test 3: Send a message
echo "3️⃣  Sending a message..."
curl -s -H "X-User-ID: $USER_ID" \
  -H "Content-Type: application/json" \
  -d "{
    \"conversation_id\": \"$CONV_ID\",
    \"content\": \"Hello from CLI! 👋\",
    \"type\": \"text\"
  }" \
  -X POST "$BASE_URL/api/v1/messages/send" | jq .
echo ""

# Test 4: Get messages
echo "4️⃣  Fetching messages..."
curl -s -H "X-User-ID: $USER_ID" \
  -X GET "$BASE_URL/api/v1/messages?conversation_id=$CONV_ID" | jq .
echo ""

# Test 5: WebSocket Info
echo "5️⃣  WebSocket Connection String:"
echo "ws://localhost:8090/ws?user_id=$USER_ID&conversation_id=$CONV_ID"
echo ""
echo "💡 To test WebSocket, you can use:"
echo "   - wscat: wscat -c \"ws://localhost:8090/ws?user_id=$USER_ID&conversation_id=$CONV_ID\""
echo "   - Web UI: http://localhost:3100"
echo ""

echo "✅ API Test Complete!"
