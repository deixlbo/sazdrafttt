"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Eye, UserPlus, Users, UserCheck, UserX, Pencil, Trash2 } from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

type CivilStatus = "Single" | "Married" | "Widowed" | "Separated"
type Gender = "Male" | "Female" | "Other"
type ResidentStatus = "active" | "inactive"

interface Resident {
  id: string
  name: string
  email: string
  phone: string
  address: string
  birthDate: string
  gender: Gender
  civilStatus: CivilStatus
  status: ResidentStatus
  avatar?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const generateId = () =>
  `RES-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

const emptyForm = (): Omit<Resident, "id"> => ({
  name: "",
  email: "",
  phone: "",
  address: "",
  birthDate: "",
  gender: "Male",
  civilStatus: "Single",
  status: "active",
  avatar: "",
})

// ─── Form Component ───────────────────────────────────────────────────────────

interface ResidentFormProps {
  data: Omit<Resident, "id">
  onChange: (field: keyof Omit<Resident, "id">, value: string) => void
  errors: Partial<Record<keyof Omit<Resident, "id">, string>>
}

function ResidentForm({ data, onChange, errors }: ResidentFormProps) {
  return (
    <div className="grid gap-4 py-2">
      {/* Name */}
      <div className="grid gap-1.5">
        <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Juan Dela Cruz"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="juan@email.com"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="09XXXXXXXXX"
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>
      </div>

      {/* Address */}
      <div className="grid gap-1.5">
        <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
        <Input
          id="address"
          value={data.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="123 Rizal St., Barangay X"
        />
        {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
      </div>

      {/* Birth Date + Gender */}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="birthDate">Birth Date <span className="text-destructive">*</span></Label>
          <Input
            id="birthDate"
            type="date"
            value={data.birthDate}
            onChange={(e) => onChange("birthDate", e.target.value)}
          />
          {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate}</p>}
        </div>
        <div className="grid gap-1.5">
          <Label>Gender</Label>
          <Select value={data.gender} onValueChange={(v) => onChange("gender", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Civil Status + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Civil Status</Label>
          <Select value={data.civilStatus} onValueChange={(v) => onChange("civilStatus", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Single">Single</SelectItem>
              <SelectItem value="Married">Married</SelectItem>
              <SelectItem value="Widowed">Widowed</SelectItem>
              <SelectItem value="Separated">Separated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Status</Label>
          <Select value={data.status} onValueChange={(v) => onChange("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(data: Omit<Resident, "id">): Partial<Record<keyof Omit<Resident, "id">, string>> {
  const errs: Partial<Record<keyof Omit<Resident, "id">, string>> = {}
  if (!data.name.trim()) errs.name = "Name is required."
  if (!data.email.trim()) errs.email = "Email is required."
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "Invalid email."
  if (!data.phone.trim()) errs.phone = "Phone is required."
  if (!data.address.trim()) errs.address = "Address is required."
  if (!data.birthDate) errs.birthDate = "Birth date is required."
  return errs
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OfficialResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Dialog states
  const [viewResident, setViewResident] = useState<Resident | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editResident, setEditResident] = useState<Resident | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Resident | null>(null)

  // Form state
  const [formData, setFormData] = useState<Omit<Resident, "id">>(emptyForm())
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof Omit<Resident, "id">, string>>>({})

  // ── Filtering ──
  const filteredResidents = residents.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ── Stats ──
  const stats = [
    { label: "Total Residents", value: residents.length, icon: Users, color: "text-primary" },
    { label: "Active", value: residents.filter((r) => r.status === "active").length, icon: UserCheck, color: "text-green-600" },
    { label: "Inactive", value: residents.filter((r) => r.status === "inactive").length, icon: UserX, color: "text-red-600" },
  ]

  // ── Field change handler ──
  const handleFieldChange = (field: keyof Omit<Resident, "id">, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
    }
  }

  // ── Open Create ──
  const openCreate = () => {
    setFormData(emptyForm())
    setFormErrors({})
    setIsCreateOpen(true)
  }

  // ── Create Submit ──
  const handleCreate = () => {
    const errs = validate(formData)
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    const newResident: Resident = { id: generateId(), ...formData }
    setResidents((prev) => [newResident, ...prev])
    setIsCreateOpen(false)
  }

  // ── Open Edit ──
  const openEdit = (resident: Resident) => {
    setEditResident(resident)
    const { id, ...rest } = resident
    setFormData(rest)
    setFormErrors({})
  }

  // ── Edit Submit ──
  const handleEdit = () => {
    if (!editResident) return
    const errs = validate(formData)
    if (Object.keys(errs).length) { setFormErrors(errs); return }
    setResidents((prev) =>
      prev.map((r) => (r.id === editResident.id ? { id: editResident.id, ...formData } : r))
    )
    // If currently viewing this resident, refresh the view
    if (viewResident?.id === editResident.id) {
      setViewResident({ id: editResident.id, ...formData })
    }
    setEditResident(null)
  }

  // ── Delete ──
  const handleDelete = () => {
    if (!deleteTarget) return
    setResidents((prev) => prev.filter((r) => r.id !== deleteTarget.id))
    if (viewResident?.id === deleteTarget.id) setViewResident(null)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6 animate-fadeSlideIn">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resident Records</h1>
          <p className="text-muted-foreground">View and manage resident profiles and data</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <UserPlus className="h-4 w-4" />
          Add Resident
        </Button>
      </div>

      {/* Stats */}
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

      {/* Table */}
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
                {filteredResidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      {residents.length === 0
                        ? 'No residents yet. Click "Add Resident" to get started.'
                        : "No residents match your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResidents.map((resident) => (
                    <TableRow key={resident.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {resident.avatar && <AvatarImage src={resident.avatar} alt={resident.name} />}
                            <AvatarFallback>{getInitials(resident.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{resident.name}</p>
                            <p className="text-xs text-muted-foreground">{resident.id}</p>
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
                        <div className="flex items-center gap-1">
                          {/* View */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View"
                            onClick={() => setViewResident(resident)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit"
                            onClick={() => openEdit(resident)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(resident)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── View Dialog ── */}
      <Dialog open={!!viewResident} onOpenChange={(open) => !open && setViewResident(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resident Profile</DialogTitle>
            <DialogDescription>Detailed information about the resident</DialogDescription>
          </DialogHeader>
          {viewResident && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {viewResident.avatar && <AvatarImage src={viewResident.avatar} alt={viewResident.name} />}
                  <AvatarFallback className="text-lg">{getInitials(viewResident.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{viewResident.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewResident.id}</p>
                </div>
              </div>
              <div className="grid gap-3 text-sm">
                {(
                  [
                    ["Email", viewResident.email],
                    ["Phone", viewResident.phone],
                    ["Address", viewResident.address],
                    ["Birth Date", viewResident.birthDate],
                    ["Gender", viewResident.gender],
                    ["Civil Status", viewResident.civilStatus],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-right max-w-[220px]">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={viewResident.status === "active" ? "default" : "secondary"}>
                    {viewResident.status}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    openEdit(viewResident)
                    setViewResident(null)
                  }}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setDeleteTarget(viewResident)
                    setViewResident(null)
                  }}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Create Dialog ── */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => !open && setIsCreateOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Resident</DialogTitle>
            <DialogDescription>Fill in the details to register a new resident.</DialogDescription>
          </DialogHeader>
          <ResidentForm data={formData} onChange={handleFieldChange} errors={formErrors} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>
              <UserPlus className="mr-1.5 h-4 w-4" />
              Create Resident
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editResident} onOpenChange={(open) => !open && setEditResident(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Resident</DialogTitle>
            <DialogDescription>Update the resident's information.</DialogDescription>
          </DialogHeader>
          <ResidentForm data={formData} onChange={handleFieldChange} errors={formErrors} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditResident(null)}>Cancel</Button>
            <Button onClick={handleEdit}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resident?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-semibold">{deleteTarget?.name}</span> from the records. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}