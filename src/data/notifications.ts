export interface Notification {
  id: number;
  group: "Mentions" | "Assigned to Me" | "Task Updates";
  module: "Tasks" | "CRM Requests" | "Care Service" | "Knowledge Base";
  status: "read" | "unread";
  name: string;
  description: string;
  timestamp: string;
}

export const notificationsData: Notification[] = [
  {
    id: 1,
    group: "Mentions",
    module: "Tasks",
    status: "unread",
    name: "Alia Tarek",
    description: "mentioned you in 'Q4 Budget Planning'",
    timestamp: "2m ago"
  },
  {
    id: 2,
    group: "Mentions",
    module: "CRM Requests",
    status: "unread",
    name: "John Smith",
    description: "tagged you on Lead 'TechCorp'",
    timestamp: "15m ago"
  },
  {
    id: 3,
    group: "Mentions",
    module: "Tasks",
    status: "read",
    name: "Alia Tarek",
    description: "RE: Project Phoenix kickoff",
    timestamp: "1h ago"
  },
  {
    id: 4,
    group: "Assigned to Me",
    module: "Tasks",
    status: "unread",
    name: "Project Bot",
    description: "New task 'Draft newsletter copy'",
    timestamp: "22m ago"
  },
  {
    id: 5,
    group: "Assigned to Me",
    module: "CRM Requests",
    status: "unread",
    name: "Salesforce Sync",
    description: "New opportunity 'Globex Inc.' assigned",
    timestamp: "45m ago"
  },
  {
    id: 6,
    group: "Assigned to Me",
    module: "Care Service",
    status: "unread",
    name: "Support System",
    description: "Ticket #882-A assigned to you",
    timestamp: "1h ago"
  },
  {
    id: 7,
    group: "Assigned to Me",
    module: "Tasks",
    status: "unread",
    name: "Project Bot",
    description: "Task 'Finalize slide deck' assigned",
    timestamp: "2h ago"
  },
  {
    id: 8,
    group: "Assigned to Me",
    module: "Tasks",
    status: "read",
    name: "Project Bot",
    description: "Task 'Review wireframes' assigned",
    timestamp: "3h ago"
  },
  {
    id: 9,
    group: "Task Updates",
    module: "Tasks",
    status: "unread",
    name: "Mike Johnson",
    description: "completed 'User Research Synthesis'",
    timestamp: "5m ago"
  },
  {
    id: 10,
    group: "Task Updates",
    module: "Knowledge Base",
    status: "unread",
    name: "Content Bot",
    description: "New article 'API V2 Guide' published",
    timestamp: "2d ago"
  },
  {
    id: 11,
    group: "Task Updates",
    module: "Care Service",
    status: "read",
    name: "Jane Doe",
    description: "commented on Ticket #880-C",
    timestamp: "3d ago"
  }
];
