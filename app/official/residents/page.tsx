"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Eye, UserPlus, Users, UserCheck, UserX } from "lucide-react"
import { mockResidents } from "@/lib/mock-data"

export default function OfficialResidentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedResident, setSelectedResident] = useState<typeof mockResidents[0] | null>(null)

  const filteredResidents = mockResidents.filter(
    (resident) =>
      resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = [
    { label: "Total Residents", value: mockResidents.length, icon: Users, color: "text-primary" },
    { label: "Active", value: mockResidents.filter(r => r.status === "active").length, icon: UserCheck, color: "text-green-600" },
    { label: "Inactive", value: mockResidents.filter(r => r.status === "inactive").length, icon: UserX, color: "text-red-600" },
  ]

  return (
    <div className="space-y-6 animate-fadeSlideIn">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resident Records</h1>
          <p className="text-muted-foreground">View and manage resident profiles and data</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Resident
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-full bg-muted p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Residents</CardTitle>
          <CardDescription>Complete list of registered residents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resident</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResidents.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={resident.avatar} alt={resident.name} />
                          <AvatarFallback>{resident.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{resident.name}</p>
                          <p className="text-xs text-muted-foreground">ID: {resident.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{resident.email}</p>
                        <p className="text-muted-foreground">{resident.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{resident.address}</TableCell>
                    <TableCell>
                      <Badge variant={resident.status === "active" ? "default" : "secondary"}>
                        {resident.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedResident(resident)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Resident Profile</DialogTitle>
                            <DialogDescription>Detailed information about the resident</DialogDescription>
                          </DialogHeader>
                          {selectedResident && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={selectedResident.avatar} alt={selectedResident.name} />
                                  <AvatarFallback>{selectedResident.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold">{selectedResident.name}</h3>
                                  <p className="text-sm text-muted-foreground">Resident ID: {selectedResident.id}</p>
                                </div>
                              </div>
                              <div className="grid gap-3 text-sm">
                                <div className="flex justify-between border-b pb-2">
                                  <span className="text-muted-foreground">Email</span>
                                  <span>{selectedResident.email}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="text-muted-foreground">Phone</span>
                                  <span>{selectedResident.phone}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="text-muted-foreground">Address</span>
                                  <span className="text-right max-w-[200px]">{selectedResident.address}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="text-muted-foreground">Birth Date</span>
                                  <span>{selectedResident.birthDate}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="text-muted-foreground">Gender</span>
                                  <span>{selectedResident.gender}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                  <span className="text-muted-foreground">Civil Status</span>
                                  <span>{selectedResident.civilStatus}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Status</span>
                                  <Badge variant={selectedResident.status === "active" ? "default" : "secondary"}>
                                    {selectedResident.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
