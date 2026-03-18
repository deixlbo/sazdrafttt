'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'axl';
  timestamp: Date;
};

type FAQItem = {
  question: string;
  answer: string;
  keywords: string[];
};

// Resident-specific FAQs
const residentFaqData: FAQItem[] = [
  // General Information
  {
    question: 'What are the office hours of the barangay hall?',
    answer: 'The Barangay Santiago Hall is open Monday to Friday from 8:00 AM to 5:00 PM, and Saturday from 8:00 AM to 12:00 PM. We are closed on Sundays and holidays.',
    keywords: ['office', 'hours', 'open', 'time', 'schedule'],
  },
  {
    question: 'Where is the barangay hall located?',
    answer: 'The Barangay Santiago Hall is located at the heart of Barangay Santiago, near the covered court. You can reach us via the main road from the municipal center.',
    keywords: ['location', 'where', 'address', 'hall', 'place'],
  },
  {
    question: 'What is the contact number of the barangay office?',
    answer: 'You can reach us at 0912-345-6789 (Barangay Office) or email us at info@santiago.gov. For emergencies, please call our hotline.',
    keywords: ['contact', 'number', 'phone', 'call', 'email'],
  },
  {
    question: 'Who is the Barangay Captain?',
    answer: 'The current Barangay Captain is Hon. Roberto Cruz. The Kagawads are Ana Garcia, Carlos Mendoza (Secretary), and Elena Flores (Treasurer).',
    keywords: ['captain', 'official', 'kagawad', 'who', 'leader'],
  },
  // Document Requests
  {
    question: 'How do I get a Barangay Clearance?',
    answer: 'To request a Barangay Clearance:\n\n1. Go to the Documents section in this portal\n2. Click "Request Document"\n3. Select "Barangay Clearance"\n4. Fill in the required information\n5. Submit your request\n\nRequirements: Valid ID, proof of residency\nFee: PHP 50\nProcessing: 1 working day',
    keywords: ['clearance', 'document', 'get', 'request', 'apply'],
  },
  {
    question: 'What are the requirements for a Certificate of Residency?',
    answer: 'Requirements for Certificate of Residency:\n\n- Valid government ID\n- Proof of address (utility bill or rental contract)\n- Completed application form\n\nFee: PHP 30\nProcessing: 1 working day\n\nYou can apply through the Documents section of this portal.',
    keywords: ['residency', 'certificate', 'requirements', 'need'],
  },
  {
    question: 'How long does it take to process documents?',
    answer: 'Processing times:\n\n- Barangay Clearance: 1 working day\n- Certificate of Residency: 1 working day\n- Certificate of Indigency: 1 working day\n- Business Permit: 3 working days\n- Building Permit: 5 working days\n\nYou will receive a notification when your document is ready.',
    keywords: ['process', 'long', 'time', 'day', 'wait'],
  },
  {
    question: 'What are the fees for barangay documents?',
    answer: 'Document Fees:\n\n- Barangay Clearance: PHP 50\n- Certificate of Residency: PHP 30\n- Certificate of Indigency: FREE (for qualified)\n- Business Permit: PHP 200-500\n- Building Permit: Varies by project',
    keywords: ['fee', 'cost', 'price', 'pay', 'much'],
  },
  // Emergency Information
  {
    question: 'What is the barangay emergency hotline?',
    answer: 'Emergency Hotlines:\n\n- Barangay Office: 0912-345-6789\n- Police Station: 911\n- Fire Department: 160\n- Medical Emergency: 143\n- BDRRMO: 0987-654-3210\n\nSave these numbers for emergencies!',
    keywords: ['emergency', 'hotline', 'urgent', 'help', '911'],
  },
  {
    question: 'Where is the evacuation center?',
    answer: 'The designated evacuation centers are:\n\n1. Santiago Elementary School (Primary)\n2. Santiago Covered Court (Secondary)\n\nDuring disasters, follow barangay announcements for instructions. Bring essential items and documents.',
    keywords: ['evacuation', 'evacuate', 'shelter', 'disaster', 'flood'],
  },
  {
    question: 'Where is the nearest health center?',
    answer: 'The Barangay Health Center is located beside the barangay hall. Services include:\n\n- Basic medical consultations\n- Immunizations\n- Pre-natal care\n- Family planning\n\nOpen: Mon-Fri, 8 AM - 5 PM',
    keywords: ['health', 'center', 'clinic', 'doctor', 'medical'],
  },
  // Programs and Services
  {
    question: 'What community programs are available?',
    answer: 'Current Barangay Programs:\n\n- Feeding Program (for children)\n- Senior Citizen Support\n- Livelihood Training\n- Youth Development\n- Clean & Green Initiative\n\nCheck the Programs section for schedules and registration.',
    keywords: ['program', 'activity', 'event', 'community', 'service'],
  },
  {
    question: 'How do I report a complaint or incident?',
    answer: 'To report a complaint:\n\n1. Go to the Blotter section in this portal\n2. Click "File a Report"\n3. Fill in the incident details\n4. Submit the report\n\nFor emergencies, call 0912-345-6789 immediately.',
    keywords: ['complaint', 'report', 'incident', 'blotter', 'noise'],
  },
  {
    question: 'How do I check my document request status?',
    answer: 'To check your document status:\n\n1. Go to the Documents section\n2. View "My Requests"\n3. You\'ll see the status (Pending, Processing, Approved, Ready for Pickup)\n\nYou\'ll also receive notifications when the status changes.',
    keywords: ['status', 'check', 'track', 'request', 'document'],
  },
];

// Official-specific FAQs
const officialFaqData: FAQItem[] = [
  // Document Management
  {
    question: 'How do I approve document requests?',
    answer: 'To approve document requests:\n\n1. Go to Documents Management\n2. Click on the pending request\n3. Review the resident information\n4. Click "Approve" to process\n5. Use the Print button to generate the document\n\nApproved documents will notify the resident automatically.',
    keywords: ['approve', 'document', 'request', 'process', 'accept'],
  },
  {
    question: 'How do I reject a document request?',
    answer: 'To reject a document request:\n\n1. Go to Documents Management\n2. Click on the pending request\n3. Select "Reject"\n4. Enter the reason for rejection\n5. Click Confirm\n\nThe resident will be notified with the reason.',
    keywords: ['reject', 'deny', 'decline', 'refuse', 'document'],
  },
  {
    question: 'How do I print approved documents?',
    answer: 'To print an approved document:\n\n1. Go to Documents Management\n2. Find the approved document\n3. Click the Print icon in the Action column\n4. The document will open with resident details filled in\n5. Click Print or use Ctrl+P\n\nMake sure your printer is connected.',
    keywords: ['print', 'document', 'clearance', 'certificate', 'generate'],
  },
  // Announcements
  {
    question: 'How do I create an announcement?',
    answer: 'To create an announcement:\n\n1. Go to Announcements\n2. Click "Create Announcement"\n3. Enter the title and content\n4. Set the priority level\n5. Click Publish\n\nAll residents will see the announcement on their dashboard.',
    keywords: ['announcement', 'create', 'post', 'publish', 'news'],
  },
  {
    question: 'How do I edit or delete an announcement?',
    answer: 'To edit or delete announcements:\n\n1. Go to Announcements\n2. Find the announcement\n3. Click Edit to modify or Delete to remove\n4. Confirm your action\n\nDeleted announcements cannot be recovered.',
    keywords: ['edit', 'delete', 'announcement', 'modify', 'remove'],
  },
  // Programs
  {
    question: 'How do I create a new program?',
    answer: 'To create a barangay program:\n\n1. Go to Programs\n2. Click "Create Program"\n3. Fill in program details:\n   - Program name\n   - Description\n   - Schedule/Date\n   - Location\n4. Click Save\n\nResidents can view and register for programs.',
    keywords: ['program', 'create', 'new', 'activity', 'event'],
  },
  // Blotter Management
  {
    question: 'How do I handle blotter reports?',
    answer: 'To handle blotter reports:\n\n1. Go to Blotter Management\n2. Review pending reports\n3. Click on a report to view details\n4. Update the status:\n   - Under Investigation\n   - Resolved\n   - Escalated\n5. Add notes or actions taken\n\nKeep records updated for transparency.',
    keywords: ['blotter', 'report', 'handle', 'incident', 'complaint'],
  },
  // Resident Management
  {
    question: 'How do I view resident information?',
    answer: 'To view resident information:\n\n1. Go to Residents\n2. Search by name or filter by zone\n3. Click on a resident to view full profile\n4. View their:\n   - Personal information\n   - Document history\n   - Blotter reports\n\nResident data is confidential.',
    keywords: ['resident', 'information', 'view', 'profile', 'search'],
  },
  // Business Management
  {
    question: 'How do I manage business permits?',
    answer: 'To manage business permits:\n\n1. Go to Business section\n2. Review pending applications\n3. Verify business information\n4. Approve or reject with notes\n5. Generate permit for approved applications\n\nBusiness permits require additional verification.',
    keywords: ['business', 'permit', 'manage', 'application', 'approve'],
  },
  // Audit Logs
  {
    question: 'How do I view audit logs?',
    answer: 'To view audit logs:\n\n1. Go to Audit Logs\n2. Filter by date, user, or action\n3. Review system activities:\n   - Document approvals\n   - User logins\n   - Data changes\n\nAudit logs help track all system activities for transparency.',
    keywords: ['audit', 'log', 'history', 'track', 'activity'],
  },
  // Dashboard
  {
    question: 'What do the dashboard statistics mean?',
    answer: 'Dashboard Statistics:\n\n- Total Residents: Registered residents count\n- Pending Requests: Documents awaiting review\n- Active Programs: Current running programs\n- Blotter Reports: Incident reports filed\n\nClick on any stat to view detailed information.',
    keywords: ['dashboard', 'statistics', 'stats', 'overview', 'summary'],
  },
  // System
  {
    question: 'How do I update my official profile?',
    answer: 'To update your profile:\n\n1. Go to Profile section\n2. Edit your information\n3. Change password if needed\n4. Click Save Changes\n\nKeep your information up to date for system records.',
    keywords: ['profile', 'update', 'account', 'password', 'settings'],
  },
];

const residentSuggestedQuestions = [
  'How do I get a Barangay Clearance?',
  'What are the office hours?',
  'What is the emergency hotline?',
  'How do I check my document status?',
  'What programs are available?',
  'How do I report an incident?',
];

const officialSuggestedQuestions = [
  'How do I approve documents?',
  'How do I print certificates?',
  'How do I create an announcement?',
  'How do I handle blotter reports?',
  'How do I view audit logs?',
  'How do I manage business permits?',
];

interface AxlChatbotProps {
  type: 'resident' | 'official';
}

export function AxlChatbot({ type }: AxlChatbotProps) {
  const [open, setOpen] = useState(false);
  const faqData = type === 'resident' ? residentFaqData : officialFaqData;
  const suggestedQuestions = type === 'resident' ? residentSuggestedQuestions : officialSuggestedQuestions;
  const welcomeMessage = type === 'resident' 
    ? "Hello! I'm AXL, your AI assistant for Barangay Santiago. I can help you with document requests, barangay information, and services. How can I assist you today?"
    : "Hello! I'm AXL, your administrative assistant. I can help you with document management, announcements, programs, and other official tasks. How can I help you today?";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: welcomeMessage,
      sender: 'axl',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findAnswer = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Search through FAQ data for matching answers
    let bestMatch: FAQItem | null = null;
    let highestScore = 0;

    for (const faq of faqData) {
      let score = 0;
      
      // Check keyword matches
      for (const keyword of faq.keywords) {
        if (lowerQuestion.includes(keyword.toLowerCase())) {
          score += 2;
        }
      }
      
      // Check question similarity
      const faqWords = faq.question.toLowerCase().split(' ').filter(word => word.length > 3);
      for (const word of faqWords) {
        if (lowerQuestion.includes(word)) {
          score += 1;
        }
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    }

    if (bestMatch && highestScore >= 2) {
      return bestMatch.answer;
    }

    // Default response based on type
    if (type === 'resident') {
      return "I'm sorry, I don't have specific information about that. Please try:\n\n- Rephrasing your question\n- Using the suggested questions above\n- Contacting the barangay office at 0912-345-6789\n\nOffice hours: Mon-Fri 8AM-5PM, Sat 8AM-12PM";
    } else {
      return "I don't have specific information about that topic. Please try:\n\n- Rephrasing your question\n- Checking the relevant section in the sidebar\n- Contacting the system administrator\n\nFor technical issues, please report to your IT support.";
    }
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowSuggestions(false);
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const answer = findAnswer(text);
      const axlMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: answer,
        sender: 'axl',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, axlMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 400);
  };

  const handleSuggestedClick = (question: string) => {
    handleSend(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all z-50 ${
          open ? 'scale-0' : 'scale-100'
        }`}
        aria-label="Open chat assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 w-[360px] sm:w-[400px] h-[600px] max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 animate-in zoom-in-95 duration-200 overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-primary rounded-full" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">AXL</h3>
              <p className="text-xs text-primary-foreground/80">
                {type === 'resident' ? 'Resident Assistant' : 'Official Assistant'}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 hover:bg-primary-foreground/10 rounded-lg transition"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {message.sender === 'axl' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-card border border-border rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-card border border-border p-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {showSuggestions && (
            <div className="px-4 py-3 bg-card border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedClick(question)}
                    className="text-xs px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-foreground transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-card border-t border-border">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-muted border-0 rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                size="icon"
                className="rounded-full w-10 h-10"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
