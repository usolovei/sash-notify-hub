export interface Notification {
  id: number;
  group: "Mentions" | "Assigned to Me" | "Task Updates" | "Unanswered" | "Approval";
  module: "Tasks" | "CRM Requests" | "Care Service" | "Knowledge Base";
  status: "read" | "unread";
  name: string;
  description: string;
  timestamp: string;
  viewed?: boolean;
  originalGroup?: "Mentions" | "Assigned to Me" | "Task Updates" | "Approval";
  pinned?: boolean;
  priority: "high" | "medium" | "low";
  createdAt: Date;
}

export const notificationsData: Notification[] = [
  // Mentions (5)
  {
    id: 1,
    group: "Mentions",
    module: "Tasks",
    status: "unread",
    name: "Alia Tarek",
    description: "mentioned you in 'Q4 Budget Planning'",
    timestamp: "2m ago",
    priority: "high",
    createdAt: new Date(Date.now() - 2 * 60 * 1000)
  },
  {
    id: 2,
    group: "Mentions",
    module: "CRM Requests",
    status: "unread",
    name: "John Smith",
    description: "tagged you on Lead 'TechCorp'",
    timestamp: "15m ago",
    priority: "medium",
    createdAt: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: 3,
    group: "Mentions",
    module: "Tasks",
    status: "unread",
    name: "Sarah Connor",
    description: "mentioned you in 'Marketing Campaign Review'",
    timestamp: "1h ago",
    priority: "high",
    createdAt: new Date(Date.now() - 60 * 60 * 1000)
  },
  {
    id: 4,
    group: "Mentions",
    module: "Knowledge Base",
    status: "unread",
    name: "Mike Chen",
    description: "tagged you in article 'API Documentation Updates'",
    timestamp: "2h ago",
    priority: "low",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 5,
    group: "Mentions",
    module: "Care Service",
    status: "unread",
    name: "Emma Wilson",
    description: "mentioned you in ticket discussion #445",
    timestamp: "3h ago",
    priority: "medium",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  
  // Assigned to Me (5)
  {
    id: 6,
    group: "Assigned to Me",
    module: "Tasks",
    status: "unread",
    name: "Project Bot",
    description: "New task 'Draft newsletter copy'",
    timestamp: "22m ago",
    priority: "high",
    createdAt: new Date(Date.now() - 22 * 60 * 1000)
  },
  {
    id: 7,
    group: "Assigned to Me",
    module: "CRM Requests",
    status: "unread",
    name: "Salesforce Sync",
    description: "New opportunity 'Globex Inc.' assigned",
    timestamp: "45m ago",
    priority: "medium",
    createdAt: new Date(Date.now() - 45 * 60 * 1000)
  },
  {
    id: 8,
    group: "Assigned to Me",
    module: "Care Service",
    status: "unread",
    name: "Support System",
    description: "Ticket #882-A assigned to you",
    timestamp: "1h ago",
    priority: "high",
    createdAt: new Date(Date.now() - 60 * 60 * 1000)
  },
  {
    id: 9,
    group: "Assigned to Me",
    module: "Tasks",
    status: "unread",
    name: "Project Bot",
    description: "Task 'Finalize slide deck' assigned",
    timestamp: "2h ago",
    priority: "low",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 10,
    group: "Assigned to Me",
    module: "CRM Requests",
    status: "unread",
    name: "Salesforce Sync",
    description: "Lead 'Acme Corp' requires follow-up",
    timestamp: "4h ago",
    priority: "medium",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
  },
  
  // Task Updates (5)
  {
    id: 11,
    group: "Task Updates",
    module: "Tasks",
    status: "unread",
    name: "Mike Johnson",
    description: "completed 'User Research Synthesis'",
    timestamp: "5m ago",
    priority: "low",
    createdAt: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: 12,
    group: "Task Updates",
    module: "Knowledge Base",
    status: "unread",
    name: "Content Bot",
    description: "New article 'API V2 Guide' published",
    timestamp: "30m ago",
    priority: "medium",
    createdAt: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: 13,
    group: "Task Updates",
    module: "Tasks",
    status: "unread",
    name: "Lisa Anderson",
    description: "updated status on 'Website Redesign'",
    timestamp: "1h ago",
    priority: "high",
    createdAt: new Date(Date.now() - 60 * 60 * 1000)
  },
  {
    id: 14,
    group: "Task Updates",
    module: "Care Service",
    status: "unread",
    name: "Jane Doe",
    description: "commented on Ticket #880-C",
    timestamp: "2h ago",
    priority: "low",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 15,
    group: "Task Updates",
    module: "Tasks",
    status: "unread",
    name: "Tom Bradley",
    description: "moved 'Sprint Planning' to In Progress",
    timestamp: "5h ago",
    priority: "medium",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
  
  // Some already read (for Seen group)
  {
    id: 16,
    group: "Task Updates",
    module: "Tasks",
    status: "read",
    name: "Alex Murphy",
    description: "completed 'Database Migration'",
    timestamp: "1d ago",
    priority: "high",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: 17,
    group: "Assigned to Me",
    module: "Tasks",
    status: "read",
    name: "Project Bot",
    description: "Task 'Review wireframes' assigned",
    timestamp: "1d ago",
    priority: "medium",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  
  // Approval (2)
  {
    id: 18,
    group: "Approval",
    module: "Tasks",
    status: "unread",
    name: "System",
    description: "Budget proposal #2024-Q4 requires approval",
    timestamp: "10m ago",
    priority: "high",
    createdAt: new Date(Date.now() - 10 * 60 * 1000)
  },
  {
    id: 19,
    group: "Approval",
    module: "CRM Requests",
    status: "unread",
    name: "Workflow Bot",
    description: "Contract 'Enterprise Deal' awaiting approval",
    timestamp: "35m ago",
    priority: "high",
    createdAt: new Date(Date.now() - 35 * 60 * 1000)
  },
];
