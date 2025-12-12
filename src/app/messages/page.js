"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
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
  Trash2,
  MoreVertical,
  Archive
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

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

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    fetchThreads(token);
  }, [router]);

  const fetchThreads = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/api/messages/threads`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads || []);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
      // Demo data for development
      setThreads([
        {
          id: '1',
          participant: { id: 'seller1', username: 'ClassicDiecast', avatar: null },
          listing: { id: 'listing1', title: '1967 Ford Mustang GT 1:18', image: null },
          lastMessage: { text: 'Yes, it\'s still available! Would you like more photos?', timestamp: new Date().toISOString(), read: false },
          unreadCount: 1
        },
        {
          id: '2',
          participant: { id: 'buyer1', username: 'ModelCollector99', avatar: null },
          listing: { id: 'listing2', title: 'Hot Wheels Collection (50 cars)', image: null },
          lastMessage: { text: 'Thank you for the quick shipping!', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true },
          unreadCount: 0
        },
        {
          id: '3',
          participant: { id: 'seller2', username: 'VintageWheels', avatar: null },
          listing: { id: 'listing3', title: 'Maisto BMW M3 1:24', image: null },
          lastMessage: { text: 'I can do $45 shipped, let me know.', timestamp: new Date(Date.now() - 172800000).toISOString(), read: true },
          unreadCount: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (threadId) => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(`${API_BASE}/api/messages/threads/${threadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Demo messages
      setMessages([
        { id: '1', sender: 'other', text: 'Hi! Is this still available?', timestamp: new Date(Date.now() - 3600000).toISOString(), read: true },
        { id: '2', sender: 'me', text: 'Yes, it\'s still available! Would you like more photos?', timestamp: new Date().toISOString(), read: true }
      ]);
    }
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
    const token = localStorage.getItem('auth_token');
    
    try {
      const response = await fetch(`${API_BASE}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          thread_id: selectedThread.id,
          recipient_id: selectedThread.participant.id,
          listing_id: selectedThread.listing?.id,
          message: newMessage
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          id: data.message_id || Date.now().toString(),
          sender: 'me',
          text: newMessage,
          timestamp: new Date().toISOString(),
          read: false
        }]);
        setNewMessage('');
        
        // Update thread preview
        setThreads(prev => prev.map(t => 
          t.id === selectedThread.id
            ? { ...t, lastMessage: { text: newMessage, timestamp: new Date().toISOString(), read: true } }
            : t
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Still add message for demo
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'me',
        text: newMessage,
        timestamp: new Date().toISOString(),
        read: false
      }]);
      setNewMessage('');
    } finally {
      setSending(false);
    }
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
              <Link href="/wishlist">Wishlist</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="relative">
              <Link href="/messages">
                Messages
                {totalUnread > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {totalUnread}
                  </Badge>
                )}
              </Link>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        <div className="container mx-auto flex h-[calc(100vh-4rem)]">
          {/* Thread List */}
          <div className={`w-full md:w-80 lg:w-96 border-r flex flex-col ${selectedThread ? 'hidden md:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
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
                  <p>No messages yet</p>
                  <p className="text-sm mt-1">Start a conversation from a listing</p>
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
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-medium truncate ${thread.unreadCount > 0 ? 'text-foreground' : ''}`}>
                              {thread.participant.username}
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                              {formatTime(thread.lastMessage.timestamp)}
                            </span>
                          </div>
                          {thread.listing && (
                            <p className="text-xs text-muted-foreground truncate mb-1 flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {thread.listing.title}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <p className={`text-sm truncate ${thread.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                              {thread.lastMessage.text}
                            </p>
                            {thread.unreadCount > 0 && (
                              <Badge className="ml-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs">
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

          {/* Message View */}
          <div className={`flex-1 flex flex-col ${selectedThread ? 'flex' : 'hidden md:flex'}`}>
            {selectedThread ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setSelectedThread(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="font-medium">{selectedThread.participant.username}</h2>
                      {selectedThread.listing && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {selectedThread.listing.title}
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
                      <DropdownMenuItem>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete conversation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {/* Listing Preview */}
                    {selectedThread.listing && (
                      <Card className="mb-6">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Car className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="font-medium">{selectedThread.listing.title}</h3>
                              <p className="text-sm text-muted-foreground">View listing →</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Messages */}
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            message.sender === 'me'
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                          <div className={`flex items-center gap-1 mt-1 ${
                            message.sender === 'me' ? 'justify-end' : ''
                          }`}>
                            <span className={`text-xs ${
                              message.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {formatTime(message.timestamp)}
                            </span>
                            {message.sender === 'me' && (
                              <CheckCheck className={`h-3 w-3 ${
                                message.read ? 'text-primary-foreground' : 'text-primary-foreground/50'
                              }`} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2 max-w-2xl mx-auto">
                    <Textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[44px] max-h-32 resize-none"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
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
