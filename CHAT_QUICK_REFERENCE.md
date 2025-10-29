# Chat Assistant - Quick Reference Guide

## API Usage

### Endpoint
`POST /api/chat`

### Request Body
```javascript
{
  message: string,              // Required: The user's current message
  hasImage: boolean,            // Optional: Whether message includes image (default: false)
  messageHistory: [             // Optional: Previous conversation messages
    {
      text: string,             // The message content
      sender: 'user' | 'assistant'  // Who sent the message
    }
  ]
}
```

### Response
```javascript
{
  success: boolean,
  response: string,             // AI's response text
  error?: string                // Error message if success is false
}
```

## Frontend Implementation

### Sending a Message with Context
```javascript
const handleSendMessage = async () => {
  // Prepare message history (exclude initial greeting)
  const messageHistory = chatMessages
    .filter(msg => msg.id !== 1)
    .map(msg => ({
      text: msg.text,
      sender: msg.sender
    }));

  // Send to API
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: currentMessage,
      hasImage: false,
      messageHistory: messageHistory
    }),
  });
};
```

### Managing localStorage
```javascript
// Save chat history
useEffect(() => {
  if (chatMessages.length > 1) {
    localStorage.setItem('chatHistory', JSON.stringify(chatMessages));
  }
}, [chatMessages]);

// Load chat history
useEffect(() => {
  const savedMessages = localStorage.getItem('chatHistory');
  if (savedMessages) {
    const parsedMessages = JSON.parse(savedMessages);
    const messagesWithDates = parsedMessages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
    setChatMessages(messagesWithDates);
  }
}, []);

// Clear chat history
const handleClearHistory = () => {
  setChatMessages([initialMessage]);
  localStorage.removeItem('chatHistory');
};
```

## Incomplete Message Patterns

The API automatically detects these patterns as incomplete:

| Pattern | Example | Context Needed |
|---------|---------|----------------|
| Ends with `...` | "What about..." | Yes |
| Starts with "and" | "and what about salary?" | Yes |
| Starts with "but" | "but is it difficult?" | Yes |
| Starts with "or" | "or should I learn Python?" | Yes |
| Starts with "also" | "also what skills?" | Yes |
| Starts with "because" | "because I'm interested" | Yes |
| Starts with "so" | "so how do I start?" | Yes |
| Starts with "that" | "that sounds interesting" | Yes |
| Starts with "which" | "which one is better?" | Yes |
| Starts with "how about" | "how about data science?" | Yes |
| Starts with "what about" | "what about other options?" | Yes |

## Storage Keys

| Component | localStorage Key | Purpose |
|-----------|-----------------|---------|
| Dashboard Chat | `chatHistory` | Main chat assistant conversations |
| Industry Insights | `chatHistory_insights` | Industry-specific chat conversations |

## Configuration

### Maximum Context Messages
Currently set to 10 messages. To change:

In `/app/api/chat/route.js`:
```javascript
// Change the slice parameter
const recentMessages = messageHistory.slice(-10);  // Last 10 messages
```

### localStorage Key Naming
To use a different storage key:

```javascript
// Save
localStorage.setItem('your_custom_key', JSON.stringify(chatMessages));

// Load
const savedMessages = localStorage.getItem('your_custom_key');

// Clear
localStorage.removeItem('your_custom_key');
```

## Testing Commands

### Test Incomplete Message Detection
```javascript
// In browser console
const testMessage = "and what about that?";
const isIncomplete = /^(and|but|or|also|additionally|furthermore|because|so|then|that|which|where|when|why)\s+/i.test(testMessage);
console.log(isIncomplete); // Should be true
```

### View Stored Chat History
```javascript
// In browser console
const history = localStorage.getItem('chatHistory');
console.log(JSON.parse(history));
```

### Clear All Chat Data
```javascript
// In browser console
localStorage.removeItem('chatHistory');
localStorage.removeItem('chatHistory_insights');
console.log('Chat history cleared');
```

## Common Issues & Solutions

### Issue: Chat history not persisting
**Solution**: Check if localStorage is enabled in browser settings

### Issue: Context not being used
**Solution**: Verify that `messageHistory` is included in the API request

### Issue: Token limit exceeded
**Solution**: Reduce the number of messages sent (currently capped at 10)

### Issue: Timestamps display incorrectly
**Solution**: Ensure timestamp conversion on load:
```javascript
timestamp: new Date(msg.timestamp)
```

## Performance Tips

1. **Optimize History Size**: Keep only essential messages (currently 10)
2. **Debounce Saves**: Consider debouncing localStorage writes for very active chats
3. **Clean Old Data**: Periodically clean localStorage if needed
4. **Monitor Token Usage**: Check API responses for token usage warnings

## Security Notes

1. **Client-Side Storage**: Chat history is stored in browser localStorage (client-side only)
2. **No Encryption**: localStorage data is not encrypted by default
3. **Sensitive Data**: Avoid storing sensitive information in chat history
4. **API Keys**: API keys are server-side only, not exposed to client

## Debugging

### Enable API Logging
The API already logs errors. To add more logging:

```javascript
// In route.js
console.log('Message History:', messageHistory);
console.log('Is Incomplete:', messageIsIncomplete);
console.log('Contextual Message:', contextualMessage);
```

### Check Network Requests
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Send a chat message
4. Click on the `/api/chat` request
5. View "Payload" to see what was sent
6. View "Response" to see AI's response

## Example Conversations

### Basic Context Retention
```
User: "What is data science?"
AI: "Data science is the field of extracting insights from data..."

User: "What skills do I need for it?"
       ↑ "it" refers to data science from previous message
AI: "For data science, you'll need Python, statistics, ML..."
```

### Incomplete Message Handling
```
User: "Tell me about software engineering"
AI: "Software engineering involves designing and building..."

User: "and the average salary?"
       ↑ Detected as incomplete (starts with "and")
AI: "Software engineers typically earn between $80k-150k..."
```

### Multi-Turn Context
```
User: "I'm interested in AI careers"
AI: "AI careers include ML engineer, data scientist..."

User: "which one is best for beginners?"
       ↑ Refers to AI careers mentioned earlier
AI: "For beginners, I'd recommend starting with..."

User: "and how long to learn?"
       ↑ Incomplete + refers to the recommended path
AI: "To become proficient in that path typically takes..."
```
