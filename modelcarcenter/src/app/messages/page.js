"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Car,
  MessageCircle,
  Search,
  Send,
  ArrowLeft,
  User,
  Clock,
  CheckCheck,
  Package,
  MoreVertical,
  Smile,
  Heart,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isLoggedIn, getUserData, getAuthHeaders, clearSession } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

// Auto-responses for demo
const AUTO_RESPONSES = [
  "Thanks for your message! I'll get back to you shortly.",
  "Yes, the item is still available! Would you like to proceed?",
  "I can offer free shipping if you're interested in multiple items.",
  "Great question! Let me check and get back to you.",
  "The condition is mint, never removed from the box.",
  "I can do a small discount if you buy today!",
];

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    
    setUser(getUserData());
    fetchThreads();
  }, [router]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/messages/conversations`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        // API returns an array of conversations
        if (Array.isArray(data) && data.length > 0) {
          // Transform API response to match our thread format
          const transformedThreads = data.map(conv => ({
            id: conv.id,
            participant: {
              id: conv.other_user?.id,
              username: conv.other_user?.username || 'Unknown User',
              avatar: conv.other_user?.avatar_url
            },
            listing: null, // Conversations don't necessarily have listings
            lastMessage: conv.last_message ? {
              text: conv.last_message.content,
              timestamp: conv.last_message.created_at,
              read: conv.unread_count === 0
            } : { text: 'No messages yet', timestamp: conv.created_at, read: true },
            unreadCount: conv.unread_count || 0,
            isDemo: false
          }));
          setThreads(transformedThreads);
        } else {
          // No conversations, use demo data
          setThreads(getDemoThreads());
        }
      } else {
        // API returned error, use demo data
        setThreads(getDemoThreads());
      }
    } catch (error) {
      // Network error or API unreachable - use demo threads silently
      console.log('Messages API unavailable, using demo data');
      setThreads(getDemoThreads());
    } finally {
      setLoading(false);
    }
  };

  const getDemoThreads = () => [
    {
      id: 'demo1',
      participant: { id: 'seller1', username: 'ClassicDiecast', avatar: null },
      listing: { id: 'listing1', title: '1967 Ford Mustang GT 1:18 Scale', price: 89.99 },
      lastMessage: { text: 'Yes, it\'s still available! Would you like more photos?', timestamp: new Date().toISOString(), read: false },
      unreadCount: 1,
      isDemo: true
    },
    {
      id: 'demo2',
      participant: { id: 'seller2', username: 'HotWheelsKing', avatar: null },
      listing: { id: 'listing2', title: 'Hot Wheels Super Treasure Hunt Collection', price: 249.99 },
      lastMessage: { text: 'Thank you for your interest!', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true },
      unreadCount: 0,
      isDemo: true
    },
    {
      id: 'demo3',
      participant: { id: 'seller3', username: 'VintageWheels', avatar: null },
      listing: { id: 'listing3', title: 'Maisto BMW M3 E30 1:24', price: 34.99 },
      lastMessage: { text: 'I can do $30 shipped if you\'re interested.', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true },
      unreadCount: 0,
      isDemo: true
    }
  ];

  const fetchMessages = async (threadId) => {
    // For demo threads, return demo messages
    if (threadId.startsWith('demo')) {
      setMessages(getDemoMessages(threadId));
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/messages/conversations/${threadId}/messages`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform messages from API format
        const transformedMessages = (data.messages || []).map(msg => ({
          id: msg.id,
          sender: msg.sender?.id === user?.id ? 'me' : 'other',
          text: msg.content,
          timestamp: msg.created_at,
          read: !!msg.read_at
        })).reverse(); // Reverse since API returns newest first
        setMessages(transformedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const getDemoMessages = (threadId) => {
    if (threadId === 'demo1') {
      return [
        { id: '1', sender: 'me', text: 'Hi! Is the Mustang still available?', timestamp: new Date(Date.now() - 7200000).toISOString(), read: true },
        { id: '2', sender: 'other', text: 'Yes, it\'s still available! Would you like more photos?', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true },
      ];
    } else if (threadId === 'demo2') {
      return [
        { id: '1', sender: 'me', text: 'What\'s the condition of the collection?', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true },
        { id: '2', sender: 'other', text: 'All items are in mint condition, still in original packaging!', timestamp: new Date(Date.now() - 172000000).toISOString(), read: true },
        { id: '3', sender: 'me', text: 'Great! Can you do any discount?', timestamp: new Date(Date.now() - 100000000).toISOString(), read: true },
        { id: '4', sender: 'other', text: 'Thank you for your interest!', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true },
      ];
    }
    return [
      { id: '1', sender: 'other', text: 'I can do $30 shipped if you\'re interested.', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true },
    ];
  };

  const handleSelectThread = (thread) => {
    setSelectedThread(thread);
    fetchMessages(thread.id);
    
    // Mark as read
    setThreads(prev => prev.map(t => 
      t.id === thread.id 
        ? { ...t, unreadCount: 0, lastMessage: { ...t.lastMessage, read: true } }
        : t
    ));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread) return;
    
    setSending(true);
    const messageText = newMessage;
    setNewMessage('');

    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      sender: 'me',
      text: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, userMessage]);

    // Update thread preview
    setThreads(prev => prev.map(t => 
      t.id === selectedThread.id
        ? { ...t, lastMessage: { text: messageText, timestamp: new Date().toISOString(), read: true } }
        : t
    ));

    // If demo thread, simulate auto-response
    if (selectedThread.isDemo) {
      setTimeout(() => {
        const autoResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'other',
          text: AUTO_RESPONSES[Math.floor(Math.random() * AUTO_RESPONSES.length)],
          timestamp: new Date().toISOString(),
          read: true
        };
        setMessages(prev => [...prev, autoResponse]);
        
        // Update thread with auto-response
        setThreads(prev => prev.map(t => 
          t.id === selectedThread.id
            ? { ...t, lastMessage: { text: autoResponse.text, timestamp: autoResponse.timestamp, read: false }, unreadCount: 1 }
            : t
        ));
      }, 1500 + Math.random() * 2000);
    } else {
      // Real API call - use the correct endpoint
      try {
        await fetch(`${API_BASE}/messages/conversations/${selectedThread.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            content: messageText
          })
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }

    setSending(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredThreads = threads.filter(thread =>
    thread.participant.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.listing?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <span className="font-semibold text-xl hidden sm:inline">ModelCarCenter</span>
          </Link>
          
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/search">Browse</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/wishlist">
                <Heart className="h-4 w-4 mr-1" />
                Wishlist
              </Link>
            </Button>
            <ThemeToggle />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden sm:inline">{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.username}</span>
                      <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="cursor-pointer">
                      <Heart className="h-4 w-4 mr-2" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="cursor-pointer">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  {user.account_type === 'shop' ? (
                    <DropdownMenuItem asChild>
                      <Link href="/sell" className="cursor-pointer">
                        <Package className="h-4 w-4 mr-2" />
                        My Listings
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/sell" className="cursor-pointer">
                          <Package className="h-4 w-4 mr-2" />
                          Open Sell Account
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => { clearSession(); window.location.href = '/'; }} 
                    className="cursor-pointer text-red-500"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        <div className="container mx-auto flex h-[calc(100vh-4rem)]">
          {/* Thread List */}
          <div className={`w-full md:w-80 lg:w-96 border-r flex flex-col ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-4 border-b">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages
                {totalUnread > 0 && (
                  <Badge className="ml-auto">{totalUnread} new</Badge>
                )}
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            {/* Threads */}
            <ScrollArea className="flex-1">
              {filteredThreads.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm mt-1">Start a conversation from a listing</p>
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href="/search">Browse Listings</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredThreads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => handleSelectThread(thread)}
                      className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                        selectedThread?.id === thread.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-semibold text-primary">
                            {thread.participant.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-medium truncate flex-1 ${thread.unreadCount > 0 ? 'text-foreground' : ''}`}>
                              {thread.participant.username}
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                              {formatTime(thread.lastMessage.timestamp)}
                            </span>
                          </div>
                          {thread.listing && (
                            <p className="text-xs text-primary truncate mb-1 flex items-center gap-1">
                              <Package className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{thread.listing.title}</span>
                            </p>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm line-clamp-1 flex-1 ${thread.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                              {thread.lastMessage.text}
                            </p>
                            {thread.unreadCount > 0 && (
                              <Badge className="h-5 min-w-[20px] flex items-center justify-center px-1.5 text-xs flex-shrink-0">
                                {thread.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat View */}
          <div className={`flex-1 flex flex-col ${selectedThread ? 'flex' : 'hidden md:flex'}`}>
            {selectedThread ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between bg-background">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSelectedThread(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {selectedThread.participant.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-medium">{selectedThread.participant.username}</h2>
                      {selectedThread.listing && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {selectedThread.listing.title}
                          <span className="text-primary font-medium ml-1">${selectedThread.listing.price}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Listing</DropdownMenuItem>
                      <DropdownMenuItem>View Seller Profile</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Block User</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {/* Listing Card */}
                    {selectedThread.listing && messages.length === 0 && (
                      <Card className="mb-6">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Car className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{selectedThread.listing.title}</h3>
                              <p className="text-lg font-bold text-primary">${selectedThread.listing.price}</p>
                              <p className="text-sm text-muted-foreground mt-1">Ask about this item below</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Chat Messages */}
                    {messages.map((message, index) => {
                      const isMe = message.sender === 'me';
                      const showAvatar = index === 0 || messages[index - 1].sender !== message.sender;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                            {!isMe && showAvatar && (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-primary">
                                  {selectedThread.participant.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            {!isMe && !showAvatar && <div className="w-8" />}
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                isMe
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-muted rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                              <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                                <span className={`text-xs ${
                                  isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                }`}>
                                  {formatTime(message.timestamp)}
                                </span>
                                {isMe && (
                                  <CheckCheck className={`h-3 w-3 ${
                                    message.read ? 'text-primary-foreground' : 'text-primary-foreground/50'
                                  }`} />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t bg-background">
                  <form onSubmit={handleSendMessage} className="flex gap-2 max-w-2xl mx-auto">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="pr-10"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                      >
                        <Smile className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                  {selectedThread.isDemo && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Demo mode: Messages have auto-responses
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
                  <p className="text-muted-foreground max-w-sm">
                    Select a conversation to view messages or start a new one from a listing page
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
