"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  Shield, 
  GitBranch, 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Crown,
  UserPlus,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock data for enterprise features
interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'creator' | 'viewer'
  status: 'active' | 'pending' | 'inactive'
  lastActive: string
  promptsCreated: number
}

interface PromptVersion {
  id: string
  version: number
  content: string
  author: string
  timestamp: string
  status: 'draft' | 'review' | 'approved' | 'rejected'
  changes: string
}

interface AuditLog {
  id: string
  user: string
  action: string
  resource: string
  timestamp: string
  details: string
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@company.com',
    role: 'admin',
    status: 'active',
    lastActive: '2024-01-15T10:30:00Z',
    promptsCreated: 45
  },
  {
    id: '2', 
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'creator',
    status: 'active',
    lastActive: '2024-01-15T09:15:00Z',
    promptsCreated: 32
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike@company.com',
    role: 'viewer',
    status: 'pending',
    lastActive: '',
    promptsCreated: 0
  }
]

const mockVersionHistory: PromptVersion[] = [
  {
    id: '1',
    version: 3,
    content: 'Write a comprehensive marketing strategy for [PRODUCT]. Include target audience analysis, competitive landscape, key messaging, and implementation timeline.',
    author: 'Sarah Johnson',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'approved',
    changes: 'Added implementation timeline'
  },
  {
    id: '2',
    version: 2,
    content: 'Write a marketing strategy for [PRODUCT]. Include target audience, competition analysis, and key messaging.',
    author: 'John Smith',
    timestamp: '2024-01-15T09:15:00Z',
    status: 'approved',
    changes: 'Enhanced target audience section'
  },
  {
    id: '3',
    version: 1,
    content: 'Write a marketing strategy for [PRODUCT].',
    author: 'Sarah Johnson',
    timestamp: '2024-01-14T16:45:00Z',
    status: 'approved',
    changes: 'Initial version'
  }
]

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    user: 'Sarah Johnson',
    action: 'Created',
    resource: 'Marketing Strategy Prompt v3',
    timestamp: '2024-01-15T10:30:00Z',
    details: 'Added new marketing strategy template'
  },
  {
    id: '2',
    user: 'John Smith',
    action: 'Approved',
    resource: 'Marketing Strategy Prompt v2',
    timestamp: '2024-01-15T09:15:00Z',
    details: 'Approved prompt for team use'
  },
  {
    id: '3',
    user: 'Mike Davis',
    action: 'Viewed',
    resource: 'Product Description Template',
    timestamp: '2024-01-15T08:45:00Z',
    details: 'Accessed template from shared library'
  }
]

export default function EnterprisePage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers)
  const [versionHistory, setVersionHistory] = useState<PromptVersion[]>(mockVersionHistory)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberRole, setNewMemberRole] = useState<'creator' | 'viewer'>('viewer')
  const { toast } = useToast()

  const handleInviteTeamMember = () => {
    if (!newMemberEmail) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      })
      return
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: newMemberRole,
      status: 'pending',
      lastActive: '',
      promptsCreated: 0
    }

    setTeamMembers([...teamMembers, newMember])
    setNewMemberEmail("")
    setNewMemberRole('viewer')

    // Add to audit log
    const auditEntry: AuditLog = {
      id: Date.now().toString(),
      user: 'Current User',
      action: 'Invited',
      resource: `Team Member: ${newMemberEmail}`,
      timestamp: new Date().toISOString(),
      details: `Invited new team member with ${newMemberRole} role`
    }
    setAuditLogs([auditEntry, ...auditLogs])

    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${newMemberEmail}`,
    })
  }

  const handleRemoveTeamMember = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return

    setTeamMembers(teamMembers.filter(m => m.id !== memberId))

    // Add to audit log
    const auditEntry: AuditLog = {
      id: Date.now().toString(),
      user: 'Current User',
      action: 'Removed',
      resource: `Team Member: ${member.email}`,
      timestamp: new Date().toISOString(),
      details: `Removed team member from organization`
    }
    setAuditLogs([auditEntry, ...auditLogs])

    toast({
      title: "Team Member Removed",
      description: `${member.name} has been removed from the team`,
    })
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700'
      case 'creator': return 'bg-blue-100 text-blue-700'
      case 'viewer': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'inactive': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getVersionStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />
      case 'review': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'draft': return <Edit className="h-4 w-4 text-gray-600" />
      default: return <Edit className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Crown className="h-8 w-8 text-yellow-500" />
          Enterprise Features
        </h1>
        <p className="text-gray-600">Manage your team, collaborate on prompts, and track performance</p>
      </div>

      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-gray-600">
              {teamMembers.filter(m => m.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prompt Versions</CardTitle>
            <GitBranch className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{versionHistory.length}</div>
            <p className="text-xs text-gray-600">
              {versionHistory.filter(v => v.status === 'approved').length} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-gray-600">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Controls</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-gray-600">Role-based security</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="team" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="team">Team Management</TabsTrigger>
          <TabsTrigger value="versions">Version Control</TabsTrigger>
          <TabsTrigger value="roles">Role & Access</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* Team Management */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Invite New Member */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Invite Team Member</h3>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={newMemberRole} onValueChange={(value: 'creator' | 'viewer') => setNewMemberRole(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="creator">Creator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleInviteTeamMember}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                </div>
              </div>

              {/* Team Members List */}
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600">{member.email}</div>
                        <div className="text-sm text-gray-500">
                          {member.promptsCreated} prompts created
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleColor(member.role)}>
                        {member.role}
                      </Badge>
                      <Badge className={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                      <div className="text-sm text-gray-500">
                        {member.lastActive ? formatTimestamp(member.lastActive) : 'Never'}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveTeamMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Version Control */}
        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Prompt Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {versionHistory.map((version) => (
                  <div key={version.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">v{version.version}</Badge>
                        <span className="font-medium">{version.author}</span>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(version.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getVersionStatusIcon(version.status)}
                        <Badge className={getStatusColor(version.status)}>
                          {version.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Content:</div>
                      <div className="text-sm bg-gray-50 p-3 rounded">
                        {version.content}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Changes:</div>
                      <div className="text-sm text-gray-600">{version.changes}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role & Access */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role-Based Access Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {/* Admin Role */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Crown className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-lg">Administrator</h3>
                    <Badge className="bg-red-100 text-red-700">Full Access</Badge>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Manage team members and invitations</li>
                    <li>• Create, edit, and delete all prompts</li>
                    <li>• Approve/reject prompt versions</li>
                    <li>• Access all analytics and audit logs</li>
                    <li>• Configure organization settings</li>
                  </ul>
                </div>

                {/* Creator Role */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Edit className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">Creator</h3>
                    <Badge className="bg-blue-100 text-blue-700">Content Access</Badge>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Create and edit own prompts</li>
                    <li>• Submit prompts for review</li>
                    <li>• View team prompt library</li>
                    <li>• Access personal analytics</li>
                    <li>• Comment on team prompts</li>
                  </ul>
                </div>

                {/* Viewer Role */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Eye className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold text-lg">Viewer</h3>
                    <Badge className="bg-gray-100 text-gray-700">Read Only</Badge>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• View approved prompt library</li>
                    <li>• Use existing prompt templates</li>
                    <li>• Generate prompts with templates</li>
                    <li>• View basic usage analytics</li>
                    <li>• Export approved prompts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Audit Trail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {log.user} {log.action.toLowerCase()} {log.resource}
                        </div>
                        <div className="text-sm text-gray-600">{log.details}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 