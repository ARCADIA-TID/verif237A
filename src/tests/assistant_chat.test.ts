import { assistantChatService } from '../server/services/AssistantChatService';
import { 
  getAssistantConversations, 
  getAssistantConversation, 
  saveAssistantConversation, 
  deleteAssistantConversation, 
  renameAssistantConversation 
} from '../server/db';

async function runAssistantTests() {
  console.log('🧪 Starting AssistantChatService & DB tests...');

  // 1. Test database conversation operations
  console.log('1. Testing conversation storage operations...');
  const testConvId = `test-conv-${Date.now()}`;
  saveAssistantConversation({
    id: testConvId,
    title: 'Vérification CNI Yaoundé',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Comment refaire ma CNI à Yaoundé ?',
        timestamp: new Date().toISOString()
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: 'Pour établir ou renouveler votre CNI au Cameroun, rendez-vous dans un poste d’identification DGSN...',
        timestamp: new Date().toISOString()
      }
    ]
  });

  const retrieved = getAssistantConversation(testConvId);
  if (!retrieved || retrieved.id !== testConvId) {
    throw new Error('Failed to retrieve saved assistant conversation');
  }
  if (retrieved.messages.length !== 2) {
    throw new Error('Message count mismatch in saved conversation');
  }
  console.log('  ✓ Conversation created and retrieved successfully.');

  // 2. Test renaming
  console.log('2. Testing conversation rename...');
  const renameOk = renameAssistantConversation(testConvId, 'Procédure CNI DGSN');
  if (!renameOk) {
    throw new Error('Failed to execute rename assistant conversation');
  }
  const afterRename = getAssistantConversation(testConvId);
  if (!afterRename || afterRename.title !== 'Procédure CNI DGSN') {
    throw new Error('Failed to rename assistant conversation title');
  }
  console.log('  ✓ Conversation renamed successfully.');

  // 3. Test listing
  console.log('3. Testing conversation list...');
  const allConvs = getAssistantConversations();
  const exists = allConvs.some(c => c.id === testConvId);
  if (!exists) {
    throw new Error('Conversation not found in list');
  }
  console.log('  ✓ Conversation found in all conversations list.');

  // 4. Test AssistantChatService processMessage (covers civic fallback or gemini API)
  console.log('4. Testing assistantChatService.processMessage...');
  const response = await assistantChatService.processMessage({
    message: 'J’ai reçu un message disant que j’ai gagné 500 000 FCFA par Orange Money avec un code à renvoyer'
  });

  if (!response || !response.message || !response.message.content) {
    throw new Error('Assistant response message content is empty');
  }
  const replyText = response.message.content;
  if (typeof replyText !== 'string' || replyText.trim().length === 0) {
    throw new Error('Assistant reply is invalid string');
  }
  if (!replyText.toLowerCase().includes('arnaque') && !replyText.toLowerCase().includes('vigilance') && !replyText.toLowerCase().includes('orange money')) {
    console.warn('  ⚠️ Note: Reply does not explicitly mention expected keywords, but content is:', replyText.slice(0, 80));
  } else {
    console.log('  ✓ Response accurately detected scam warning context.');
  }

  // Check sources
  if (response.sources && Array.isArray(response.sources)) {
    console.log(`  ✓ Sources returned: ${response.sources.length} sources`);
  }
  console.log(`  ✓ Generated title: "${response.title}"`);

  // 5. Test deletion
  console.log('5. Testing conversation delete...');
  deleteAssistantConversation(testConvId);
  const deleted = getAssistantConversation(testConvId);
  if (deleted) {
    throw new Error('Conversation was not deleted');
  }
  console.log('  ✓ Conversation deleted successfully.');

  console.log('🎉 All AssistantChatService tests passed successfully!');
}

runAssistantTests().catch(err => {
  console.error('❌ Assistant tests failed:', err);
  process.exit(1);
});
