"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { organizationMembersApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { validateRequired, validateNumber } from "@/lib/validation"
import { showSuccessAlert, showErrorAlert } from "@/lib/sweet-alert"

interface OrganizationMemberFormProps {
    memberId?: string
    onClose: () => void
}

interface OrganizationMember {
    id: string
    name: string
    position: string
    position_order: number
    order_index: number
    is_active: boolean
}

export function OrganizationMemberForm({ memberId, onClose }: OrganizationMemberFormProps) {
    const [formData, setFormData] = useState<OrganizationMember>({
        id: "",
        name: "",
        position: "",
        position_order: 1,
        order_index: 1,
        is_active: true,
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (memberId) {
            const load = async () => {
                try {
                    const data = await organizationMembersApi.getById(memberId)
                    setFormData(data)
                } catch {
                    setError("Failed to load member")
                }
            }
            load()
        }
    }, [memberId])

    const validateForm = () => {
        const nameError = validateRequired(formData.name, "Name")
        if (nameError) {
            setError(nameError.message)
            return false
        }

        const posError = validateRequired(formData.position, "Position")
        if (posError) {
            setError(posError.message)
            return false
        }

        const orderErr = validateNumber(formData.position_order, "Position Order", 1)
        if (orderErr) {
            setError(orderErr.message)
            return false
        }

        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        if (!validateForm()) return

        setLoading(true)
        try {
            if (memberId) {
                await organizationMembersApi.update(memberId, formData)
                await showSuccessAlert("Success", "Member updated successfully")
            } else {
                await organizationMembersApi.create(formData)
                await showSuccessAlert("Success", "Member created successfully")
            }
            onClose()
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to save member"
            setError(msg)
            await showErrorAlert("Error", msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Button variant="outline" onClick={onClose} className="border-border/50 gap-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                Back
            </Button>

            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle>{memberId ? "Edit Organization Member" : "Add Organization Member"}</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Position *</label>
                                <Input
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Position Order</label>
                                <Input
                                    type="number"
                                    value={formData.position_order}
                                    onChange={(e) =>
                                        setFormData({ ...formData, position_order: Number.parseInt(e.target.value) })
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Order Index</label>
                                <Input
                                    type="number"
                                    value={formData.order_index}
                                    onChange={(e) =>
                                        setFormData({ ...formData, order_index: Number.parseInt(e.target.value) })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            <label htmlFor="is_active" className="text-sm font-medium">
                                Active
                            </label>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                            >
                                {loading ? "Saving..." : "Save Member"}
                            </Button>

                            <Button variant="outline" onClick={onClose} className="border-border/50 bg-transparent">
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
