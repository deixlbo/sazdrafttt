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
    answer: 'To create an announcement:\n\n1. Go to Announcements\n2. Click "Create Announcement"\n3. Enter the title and content\n4. Set the priority level (Normal, Important, Urgent)\n5. Click Publish\n\nAll residents will see the announcement on their dashboard.',
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
    answer: 'To create a barangay program:\n\n1. Go to Programs\n2. Click "Create Program"\n3. Fill in program details:\n   - Program name\n   - Description\n   - Schedule/Date\n   - Location\n   - Maximum participants\n4. Click Save\n\nResidents can view and register for programs.',
    keywords: ['program', 'create', 'new', 'activity', 'event'],
  },
  {
    question: 'How do I manage program registrations?',
    answer: 'To manage program registrations:\n\n1. Go to Programs\n2. Click on the program\n3. View the list of registered participants\n4. You can approve or remove registrations\n5. Export the list if needed\n\nSend reminders to participants before the event.',
    keywords: ['registration', 'participant', 'manage', 'program', 'list'],
  },
  // Blotter Management
  {
    question: 'How do I handle blotter reports?',
    answer: 'To handle blotter reports:\n\n1. Go to Blotter Management\n2. Review pending reports\n3. Click on a report to view details\n4. Update the status:\n   - Under Investigation\n   - Resolved\n   - Escalated\n5. Add notes or actions taken\n\nKeep records updated for transparency.',
    keywords: ['blotter', 'report', 'handle', 'incident', 'complaint'],
  },
  {
    question: 'How do I escalate a blotter case?',
    answer: 'To escalate a blotter case:\n\n1. Open the blotter report\n2. Change status to "Escalated"\n3. Add notes explaining the reason\n4. Specify which authority to escalate to:\n   - PNP (Police)\n   - Barangay Captain\n   - Municipal Office\n\nDocument all actions for legal purposes.',
    keywords: ['escalate', 'blotter', 'police', 'serious', 'authority'],
  },
  // Resident Management
  {
    question: 'How do I view resident information?',
    answer: 'To view resident information:\n\n1. Go to Residents\n2. Search by name or filter by zone\n3. Click on a resident to view full profile\n4. View their:\n   - Personal information\n   - Document history\n   - Blotter reports\n\nResident data is confidential.',
    keywords: ['resident', 'information', 'view', 'profile', 'search'],
  },
  {
    question: 'How do I verify a resident?',
    answer: 'To verify a new resident:\n\n1. Go to Residents\n2. Find unverified registrations\n3. Review the submitted information\n4. Check supporting documents\n5. Approve or reject the registration\n\nVerified residents can access all portal features.',
    keywords: ['verify', 'resident', 'registration', 'approve', 'new'],
  },
  // Business Management
  {
    question: 'How do I manage business permits?',
    answer: 'To manage business permits:\n\n1. Go to Business section\n2. Review pending applications\n3. Verify business information:\n   - Business name and type\n   - Owner details\n   - Location\n4. Approve or reject with notes\n5. Generate permit for approved applications\n\nBusiness permits require additional verification.',
    keywords: ['business', 'permit', 'manage', 'application', 'approve'],
  },
  {
    question: 'How do I renew a business permit?',
    answer: 'To process business permit renewals:\n\n1. Go to Business section\n2. Find renewal applications\n3. Verify the business is still operating\n4. Check for any violations\n5. Approve and generate new permit\n\nRenewals are processed annually.',
    keywords: ['renew', 'business', 'permit', 'annual', 'renewal'],
  },
  // Audit Logs
  {
    question: 'How do I view audit logs?',
    answer: 'To view audit logs:\n\n1. Go to Audit Logs\n2. Filter by:\n   - Date range\n   - User\n   - Action type\n3. Review system activities:\n   - Document approvals\n   - User logins\n   - Data changes\n\nAudit logs help track all system activities for transparency and accountability.',
    keywords: ['audit', 'log', 'history', 'track', 'activity'],
  },
  {
    question: 'How do I export audit reports?',
    answer: 'To export audit reports:\n\n1. Go to Audit Logs\n2. Set your filters (date, user, action)\n3. Click "Export"\n4. Choose format (PDF or Excel)\n5. Download the report\n\nUse exported reports for compliance and record-keeping.',
    keywords: ['export', 'audit', 'report', 'download', 'pdf'],
  },
  // Dashboard
  {
    question: 'What do the dashboard statistics mean?',
    answer: 'Dashboard Statistics:\n\n- Total Residents: Registered residents count\n- Pending Requests: Documents awaiting review\n- Active Programs: Current running programs\n- Blotter Reports: Incident reports filed\n- Business Permits: Active permits count\n\nClick on any stat to view detailed information.',
    keywords: ['dashboard', 'statistics', 'stats', 'overview', 'summary'],
  },
  // System
  {
    question: 'How do I update my official profile?',
    answer: 'To update your profile:\n\n1. Go to Profile section\n2. Edit your information\n3. Change password if needed\n4. Click Save Changes\n\nKeep your information up to date for system records.',
    keywords: ['profile', 'update', 'account', 'password', 'settings'],
  },
  {
    question: 'How do I add a new official user?',
    answer: 'To add a new official user:\n\n1. Contact your system administrator\n2. Provide the new user details:\n   - Full name\n   - Email address\n   - Role/Position\n3. Admin will create the account\n4. New user will receive login credentials\n\nOnly authorized administrators can create official accounts.',
    keywords: ['add', 'user', 'official', 'new', 'account'],
  },
];

const suggestedQuestions = [
  'How do I approve documents?',
  'How do I print certificates?',
  'How do I create an announcement?',
  'How do I handle blotter reports?',
  'How do I view audit logs?',
  'How do I manage business permits?',
];

export function AxlChatbotOfficial() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm AXL, your administrative assistant. I can help you with document management, announcements, programs, blotter handling, and other official tasks. How can I help you today?",
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
    
    let bestMatch: FAQItem | null = null;
    let highestScore = 0;

    for (const faq of officialFaqData) {
      let score = 0;
      
      for (const keyword of faq.keywords) {
        if (lowerQuestion.includes(keyword.toLowerCase())) {
          score += 2;
        }
      }
      
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

    return "I don't have specific information about that topic. Please try:\n\n- Rephrasing your question\n- Checking the relevant section in the sidebar\n- Contacting the system administrator\n\nFor technical issues, please report to your IT support.";
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
              <p className="text-xs text-primary-foreground/80">Official Assistant</p>
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
